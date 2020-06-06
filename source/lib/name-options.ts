import * as wdkGot from 'wikidata-sdk-got'

const cache = new Map()

const givenNames: string[] = []
const familyNames: string[] = []

export async function buildCache(): Promise<void> {
	try {
		console.time('build name cache')
		const [first, second] = await Promise.all([
			// Unisex given names
			instancesOfLabels('Q3409032'),
			instancesOfLabels('Q101352')
		])

		for (const name of first) {
			if (!(name in givenNames)) {
				givenNames.push(name)
			}
		}

		for (const name of second) {
			if (!(name in familyNames)) {
				familyNames.push(name)
			}
		}

		console.timeEnd('build name cache')
	} catch (error) {
		console.error('build name cache failed', error)
	}
}

function buildQuery(category: string): string {
	return `SELECT DISTINCT ?label WHERE {
  ?item wdt:P31 wd:${category}.
  ?item rdfs:label ?label.
  FILTER(LANG(?label) = "en")
}
LIMIT 5000`
}

async function instancesOfLabels(category: string): Promise<string[]> {
	console.time(`instancesOfLabels ${category}`)
	const query = buildQuery(category)
	const results = await wdkGot.sparqlQuerySimplifiedMinified(query, {cache}) as string[]
	const sorted = results
		.sort((a, b) => a.localeCompare(b))

	console.timeEnd(`instancesOfLabels ${category}`)
	return sorted
}

export function getGivenNames(): readonly string[] {
	return givenNames
}

export function getFamilyNames(): readonly string[] {
	return familyNames
}
