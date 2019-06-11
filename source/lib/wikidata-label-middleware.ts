import {promises as fsPromises} from 'fs'

import {EntitySimplified} from 'wikidata-sdk'
import WikidataEntityReader from 'wikidata-entity-reader'
import WikidataEntityStore from 'wikidata-entity-store'

export default class WikidataLabel {
	constructor(
		public readonly entityStore: WikidataEntityStore,
		public readonly qNumberFilePath: string
	) {}

	async load(): Promise<void> {
		console.time('wikidata label cache load')
		const contentString = await fsPromises.readFile(this.qNumberFilePath, 'utf8')
		await this.entityStore.addResourceKeyYaml(contentString)

		console.timeEnd('wikidata label cache load')
	}

	availableResourceKeys(): ReadonlyArray<string> {
		return this.entityStore.availableResourceKeys()
	}

	availableLocales(filter: (o: number) => boolean = () => true): ReadonlyArray<string> {
		const allEntries = this.entityStore.allEntities()

		const localeProgress = allEntries
			.flatMap(o => Object.keys(o.labels || {}))
			.reduce((coll: {[key: string]: number}, add) => {
				if (!coll[add]) {
					coll[add] = 0
				}

				coll[add] += 1 / allEntries.length
				return coll
			}, {}) as {[key: string]: number}

		return Object.keys(localeProgress)
			.filter(o => filter(localeProgress[o]))
			.sort((a, b) => a.localeCompare(b))
	}

	entity(key: string): EntitySimplified {
		return this.entityStore.entity(key)
	}

	reader(key: string, defaultLanguageCode?: string): WikidataEntityReader {
		return new WikidataEntityReader(this.entity(key), defaultLanguageCode)
	}

	middleware(): (ctx: any, next: any) => void {
		const lang = (ctx: any): string => ctx.session.wikidataLanguageCode || ctx.from.language_code || 'en'

		return (ctx, next): void => {
			const readerFunc = (key: string): WikidataEntityReader => this.reader(key, lang(ctx))

			ctx.wd = {
				reader: readerFunc,
				r: readerFunc,
				entity: (key: string) => this.entity(key),
				locale: (code?: string) => {
					if (code) {
						ctx.session.wikidataLanguageCode = code
						return code
					}

					return lang(ctx)
				},
				entityStore: this.entityStore,
				wikidata: this
			}

			return next()
		}
	}
}
