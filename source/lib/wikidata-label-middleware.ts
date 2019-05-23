import {promises as fsPromises} from 'fs'

import {EntitySimplified} from 'wikidata-sdk'

import {WikidataItemReader} from './wikidata-item-reader'
import loadYaml from './load-yaml'
import WikidataItemStore from './wikidata-item-store'

export default class WikidataLabel {
	constructor(
		public readonly itemStore: WikidataItemStore,
		public readonly qNumberFilePath: string
	) {}

	async load(): Promise<void> {
		console.time('wikidata label cache load')
		const contentString = await fsPromises.readFile(this.qNumberFilePath, 'utf8')

		const content = loadYaml(contentString)
		await this.itemStore.addResourceKeyDict(content)

		console.timeEnd('wikidata label cache load')
	}

	availableResourceKeys(): ReadonlyArray<string> {
		return this.itemStore.availableResourceKeys()
	}

	availableLocales(filter: (o: number) => boolean = () => true): ReadonlyArray<string> {
		return this.itemStore.availableLocales(filter)
	}

	translationProgress(languageCode: string): number {
		return this.itemStore.translationProgress(languageCode)
	}

	entity(key: string): EntitySimplified {
		return this.itemStore.entity(key)
	}

	reader(key: string, defaultLanguageCode?: string): WikidataItemReader {
		return new WikidataItemReader(this.entity(key), defaultLanguageCode)
	}

	infoMissing(key: string, defaultLanguageCode?: string): boolean {
		// TODO: think about removing / moving it out
		// This is kinda specific and more apropriate in the logic of the user, not the middleware, not the store, not the reader
		const reader = this.reader(key, defaultLanguageCode)
		return reader.qNumber() === reader.label() ||
			!reader.description()
	}

	middleware(): (ctx: any, next: any) => void {
		return (ctx, next): void => {
			const lang = ctx.session.wikidataLanguageCode || ctx.from.language_code || 'en'
			const readerFunc = (key: string): WikidataItemReader => this.reader(key, lang)

			ctx.wd = {
				reader: readerFunc,
				r: readerFunc,
				entity: (key: string) => this.entity(key),
				infoMissing: (key: string) => this.infoMissing(key, lang),
				locale: (code?: string) => {
					if (code) {
						ctx.session.wikidataLanguageCode = code
						return code
					}

					return lang
				},
				description: (key: string) => readerFunc(key).description(),
				label: (key: string) => readerFunc(key).label(),
				url: (key: string) => readerFunc(key).url(),
				itemStore: this.itemStore,
				wikidata: this
			}

			return next()
		}
	}
}
