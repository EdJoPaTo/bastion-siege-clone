import {promises as fsPromises} from 'fs'

import {getEntitiesSimplified} from 'wikidata-sdk-got'
import {EntitySimplified} from 'wikidata-sdk'

import loadYaml from './load-yaml'

type Dictionary<T> = {[key: string]: T}

export default class WikidataLabel {
	private readonly _qNumbers: Dictionary<string> = {}

	private readonly _entities: Dictionary<EntitySimplified> = {}

	constructor(
		public qNumberFilePath: string
	) {}

	async load(): Promise<void> {
		const contentString = await fsPromises.readFile(this.qNumberFilePath, 'utf8')

		const content = loadYaml(contentString)
		for (const key of Object.keys(content)) {
			this._qNumbers[key] = content[key]
		}

		const qNumbers = Object.values(this._qNumbers)
		const entities: Dictionary<EntitySimplified> = await getEntitiesSimplified({
			ids: qNumbers,
			props: ['labels', 'descriptions']
		})

		for (const key of Object.keys(entities)) {
			this._entities[key] = entities[key]
		}
	}

	entityByQNumber(qNumber: string): EntitySimplified {
		const fallback: EntitySimplified = {
			id: qNumber,
			type: 'item'
		}

		return this._entities[qNumber] || fallback
	}

	entity(key: string): EntitySimplified {
		const qNumber = this._qNumbers[key]
		return this.entityByQNumber(qNumber)
	}

	entityLanguageDictEntry(key: string, dictKey: keyof EntitySimplified, language: string): string {
		const entity = this.entity(key)

		const dict = entity[dictKey] as Dictionary<string>
		if (!dict) {
			return entity.id
		}

		return dict[language] || entity.id
	}

	label(key: string, language = 'en'): string {
		return this.entityLanguageDictEntry(key, 'labels', language)
	}

	description(key: string, language = 'en'): string {
		return this.entityLanguageDictEntry(key, 'descriptions', language)
	}

	url(key: string): string | undefined {
		const qNumber = this._qNumbers[key]
		if (!qNumber) {
			return undefined
		}

		return `https://www.wikidata.org/wiki/${qNumber}`
	}

	infoMissing(key: string, language = 'en'): boolean {
		const qNumber = this._qNumbers[key]

		if (qNumber === this.label(key, language)) {
			return true
		}

		if (qNumber === this.description(key, language)) {
			return true
		}

		return false
	}

	middleware(): (ctx: any, next: any) => void {
		return (ctx, next) => {
			// TODO: get language from a settings menu
			const language = ctx.from.language_code || 'de'

			ctx.wd = {
				description: (key: string) => this.description(key, language),
				entity: (key: string) => this.entity(key),
				infoMissing: (key: string) => this.infoMissing(key, language),
				label: (key: string) => this.label(key, language),
				url: (key: string) => this.url(key)
			}

			return next()
		}
	}
}
