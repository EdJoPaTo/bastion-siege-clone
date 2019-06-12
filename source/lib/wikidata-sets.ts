import randomItem from 'random-item'
import WikidataEntityStore from 'wikidata-entity-store'
import {sparqlQuerySimplifiedMinified} from 'wikidata-sdk-got'

type Dictionary<T> = {[key: string]: T}

const queries: Dictionary<string> = {
	mystics: `SELECT DISTINCT ?item WHERE {
?item wdt:P31*/wdt:P279* wd:Q2239243.
?item rdfs:label ?label.
?item wdt:P18 ?image.
FILTER(LANG(?label) = "en")
}`,
	spies: `SELECT DISTINCT ?item WHERE {
?item wdt:P279+ wd:Q729.
?item wdt:P487 ?emoji.
}`
}

const entities: Dictionary<string[]> = {}

export async function build(store: WikidataEntityStore): Promise<void> {
	console.time('wikidata-sets')
	await Promise.all(
		Object.keys(queries)
			.map(key => loadQNumbersOfKey(key))
	)

	const qNumbers = Object.values(entities).flat()
	console.timeLog('wikidata-sets', 'preloadQNumbers', qNumbers.length)
	await store.preloadQNumbers(...qNumbers)
	console.timeEnd('wikidata-sets')
}

async function loadQNumbersOfKey(key: string): Promise<void> {
	try {
		const results = await sparqlQuerySimplifiedMinified(queries[key])
		const qNumbers = results as string[]
		entities[key] = qNumbers
	} catch (error) {
		console.error('wikidata-set query failed', key, error)
	}
}

export function get(key: string): readonly string[] {
	return entities[key] || []
}

export function getRandom(key: string): string {
	return randomItem(get(key))
}
