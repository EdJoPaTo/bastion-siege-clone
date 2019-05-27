import * as wdkGot from 'wikidata-sdk-got'
import WikidataEntityStore from 'wikidata-entity-store'

const mystics: string[] = []

export async function buildCache(store: WikidataEntityStore): Promise<void> {
	try {
		console.time('build mystics cache')

		const result = await loadMystics()
		await store.preloadQNumbers(...result)

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
	return results as string[]
}

export function getRandomMystic(): string {
	const pickedIndex = Math.floor(Math.random() * mystics.length)
	return mystics[pickedIndex]
}
