import * as randomItem from 'random-item'
import {sparqlQuerySimplifiedMinified} from 'wikidata-sdk-got'

export type Query = 'spies'

const queries: Record<Query, string> = {
	spies: `SELECT DISTINCT ?item WHERE {
?item wdt:P279+ wd:Q729.
?item wdt:P487 ?emoji.
}`,
}

const entities: Record<Query, string[]> = {
	spies: [],
}

export async function build(): Promise<void> {
	console.time('wikidata-sets')
	await Promise.all(
		Object.keys(queries)
			.map(async key => loadQNumbersOfKey(key as Query)),
	)

	const qNumbers = Object.values(entities).flat()
	console.timeLog('wikidata-sets', 'preloadQNumbers', qNumbers.length)
	console.timeEnd('wikidata-sets')
}

async function loadQNumbersOfKey(key: Query): Promise<void> {
	try {
		const results = await sparqlQuerySimplifiedMinified(queries[key])
		const qNumbers = results as string[]
		entities[key] = qNumbers
	} catch (error: unknown) {
		console.error('wikidata-set query failed', key, error)
	}
}

export function get(key: Query): readonly string[] {
	return entities[key] || []
}

export function getRandom(key: Query): string {
	return randomItem(get(key))
}
