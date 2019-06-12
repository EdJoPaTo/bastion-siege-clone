import WikidataEntityReader from 'wikidata-entity-reader'
import WikidataEntityStore from 'wikidata-entity-store'

export default class WikidataLabel {
	constructor(
		public readonly entityStore: WikidataEntityStore
	) {}

	availableResourceKeys(): ReadonlyArray<string> {
		return this.entityStore.availableResourceKeys()
	}

	availableLocales(percentageOfLabelsRequired = 0.1): readonly string[] {
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
			.filter(o => localeProgress[o] > percentageOfLabelsRequired)
			.sort((a, b) => a.localeCompare(b))
	}

	reader(key: string, defaultLanguageCode?: string): WikidataEntityReader {
		return new WikidataEntityReader(this.entityStore.entity(key), defaultLanguageCode)
	}

	middleware(): (ctx: any, next: any) => void {
		const lang = (ctx: any): string => ctx.session.wikidataLanguageCode || ctx.from.language_code || 'en'

		return (ctx, next): void => {
			const readerFunc = (key: string): WikidataEntityReader => this.reader(key, lang(ctx))

			ctx.wd = {
				reader: readerFunc,
				r: readerFunc,
				locale: (code?: string) => {
					if (code) {
						ctx.session.wikidataLanguageCode = code
						return code
					}

					return lang(ctx)
				},
				entityStore: this.entityStore,
				availableLocales: (percentageOfLabelsRequired = 0.1) => this.availableLocales(percentageOfLabelsRequired),
				wikidata: this
			}

			return next()
		}
	}
}
