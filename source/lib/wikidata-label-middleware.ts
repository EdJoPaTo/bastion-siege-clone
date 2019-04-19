import {promises as fsPromises} from 'fs'

import {getEntitiesSimplified} from 'wikidata-sdk-got'
import {EntitySimplified} from 'wikidata-sdk'

import loadYaml from './load-yaml'

type Dictionary<T> = {[key: string]: T}

export default class WikidataLabel {
	private readonly _qNumbers: Dictionary<string> = {}

	private readonly _entities: Dictionary<EntitySimplified> = {}

	private readonly _languageCodes: {[key: string]: number} = {}

	constructor(
		public qNumberFilePath: string
	) {}

	async load(): Promise<void> {
		console.time('wikidata label cache load')
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

		const entryAmount = Object.keys(this._entities).length
		console.log('entities', entryAmount)

		const languages = Object.values(this._entities)
			.flatMap(o => Object.keys(o.labels || {}))
			.reduce<{[key: string]: number}>((coll, add) => {
				if (!coll[add]) {
					coll[add] = 0
				}

				coll[add] += 1 / entryAmount
				return coll
			}, {})

		const languageCodes = Object.keys(languages)
			.sort((a, b) => a.localeCompare(b))

		for (const lang of languageCodes) {
			this._languageCodes[lang] = languages[lang]
		}

		console.log('languages', Object.keys(this._languageCodes).length)
		console.timeEnd('wikidata label cache load')
	}

	availableResourceKeys(): string[] {
		return Object.keys(this._qNumbers)
	}

	availableLocales(filter: (o: number) => boolean = () => true): ReadonlyArray<string> {
		return Object.keys(this._languageCodes)
			.filter(o => filter(this._languageCodes[o]))
	}

	translationProgress(languageCode: string): number {
		return this._languageCodes[languageCode] || 0
	}

	qNumberOfKey(key: string): string {
		return this._qNumbers[key]
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
		function lang(ctx: any): string {
			return ctx.session.wikidataLanguageCode || ctx.from.language_code || 'en'
		}

		return (ctx, next): void => {
			ctx.wd = {
				description: (key: string) => this.description(key, lang(ctx)),
				entity: (key: string) => this.entity(key),
				infoMissing: (key: string) => this.infoMissing(key, lang(ctx)),
				locale: (code?: string) => {
					if (code) {
						ctx.session.wikidataLanguageCode = code
					}

					return lang(ctx)
				},
				label: (key: string) => this.label(key, lang(ctx)),
				url: (key: string) => this.url(key),
				wikidata: this
			}

			return next()
		}
	}
}
