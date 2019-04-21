import * as wdkGot from 'wikidata-sdk-got'

import WikidataItemStore from './wikidata-item-store'

const mystics: string[] = []

export async function buildCache(itemStore: WikidataItemStore): Promise<void> {
	try {
		console.time('build mystics cache')

		const result = await loadMystics()
		await itemStore.preloadQNumbers(...result)

		for (const qNumber of result) {
			if (!(qNumber in mystics)) {
				mystics.push(qNumber)
			}
		}

		console.timeEnd('build mystics cache')
	} catch (error) {
		console.error('build mystics cache failed', error)
	}
}

function buildQuery(): string {
	return `SELECT DISTINCT ?item WHERE {
  ?item wdt:P31*/wdt:P279* wd:Q2239243.
  ?item rdfs:label ?label.
  ?item wdt:P18 ?image.
  FILTER(LANG(?label) = "en")
}`
}

async function loadMystics(): Promise<string[]> {
	console.time('loadMystics')
	const query = buildQuery()
	const results = await wdkGot.sparqlQuerySimplifiedMinified(query)
	console.timeEnd('loadMystics')

	console.log('mystics found', results.length)
	// TODO: support more than 50 entries with wikidata-sdk-got
	return results.slice(0, 50) as string[]
}

export function getRandomMystic(): string {
	const pickedIndex = Math.floor(Math.random() * mystics.length)
	return mystics[pickedIndex]
}
