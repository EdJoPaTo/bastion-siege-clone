import {EntitySimplified, Property} from 'wikidata-sdk'
import {getEntitiesSimplified} from 'wikidata-sdk-got'

type Dictionary<T> = {[key: string]: T}

export default class WikidataItemStore {
	private readonly _resourceKeys: Dictionary<string> = {}

	private readonly _entities: Dictionary<EntitySimplified> = {}

	private readonly _properties: Property[]

	constructor(
		...properties: Property[]
	) {
		this._properties = properties
	}

	async addResourceKeyDict(resourceKeys: Dictionary<string>): Promise<void> {
		const entries = Object.keys(resourceKeys).map(o => ({key: o, qNumber: resourceKeys[o]}))
		return this.addResourceKeyArr(entries)
	}

	async addResourceKeyArr(entries: ReadonlyArray<{key: string; qNumber: string}>): Promise<void> {
		const keys = entries.map(o => o.key)
		const qNumbers = entries.map(o => o.qNumber)

		const existingKeys = this.availableResourceKeys()
		for (const key of keys) {
			if (key in existingKeys) {
				throw new Error(`key already existing: ${key}`)
			}
		}

		await this.preloadQNumbers(...qNumbers)

		for (const {key, qNumber} of entries) {
			this._resourceKeys[key] = qNumber
		}
	}

	async preloadQNumbers(...qNumbers: string[]): Promise<void> {
		const existingQNumbers = this.availableEntities()

		const neededQNumbers = qNumbers
			.filter(o => !existingQNumbers.includes(o))

		return this.forceloadQNumbers(...neededQNumbers)
	}

	// Ensures the qNumbers are load even when they were already loaded
	async forceloadQNumbers(...qNumbers: string[]): Promise<void> {
		if (qNumbers.length === 0) {
			return
		}

		const entities = await getEntitiesSimplified({
			ids: qNumbers,
			props: this._properties
		})

		for (const qNumber of Object.keys(entities)) {
			this._entities[qNumber] = entities[qNumber]
		}
	}

	availableResourceKeys(): ReadonlyArray<string> {
		return Object.keys(this._resourceKeys)
	}

	availableEntities(): ReadonlyArray<string> {
		return Object.keys(this._entities)
	}

	availableLocales(filter: (o: number) => boolean = () => true): ReadonlyArray<string> {
		const allProgress = this._allLocaleProgress()

		return Object.keys(allProgress)
			.filter(o => filter(allProgress[o]))
			.sort((a, b) => a.localeCompare(b))
	}

	translationProgress(languageCode: string): number {
		return this._allLocaleProgress()[languageCode] || 0
	}

	qNumber(keyOrQNumber: string): string {
		if (keyOrQNumber in this._resourceKeys) {
			return this._resourceKeys[keyOrQNumber]
		}

		// TODO: check if this is a qNumber

		return keyOrQNumber
	}

	entity(keyOrQNumber: string): EntitySimplified {
		const qNumber = this.qNumber(keyOrQNumber)

		const fallback: EntitySimplified = {
			id: qNumber,
			type: 'item'
		}

		return this._entities[qNumber] || fallback
	}

	private _allLocaleProgress(): Dictionary<number> {
		const entries = Object.keys(this._entities).length

		const localeProgress = Object.keys(this._entities)
			.map(o => this._entities[o])
			.flatMap(o => Object.keys(o.labels || {}))
			.reduce((coll: {[key: string]: number}, add) => {
				if (!coll[add]) {
					coll[add] = 0
				}

				coll[add] += 1 / entries
				return coll
			}, {})

		return localeProgress
	}
}
