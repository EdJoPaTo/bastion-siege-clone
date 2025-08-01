import randomItem from 'random-item';
import {simplifySparqlResults, type SparqlResults} from 'wikibase-sdk';
import {wdk} from 'wikibase-sdk/wikidata.org';

const headers = new Headers();
headers.set('user-agent', 'github.com/EdJoPaTo/bastion-siege-clone');

const queries = {
	spies: `SELECT DISTINCT ?item WHERE {
?item wdt:P279+ wd:Q729.
?item wdt:P487 ?emoji.
}`,
} as const;

type Query = keyof typeof queries;

const entities: Record<Query, string[]> = {
	spies: [],
};

export async function build(): Promise<void> {
	console.time('wikidata-sets');
	await Promise.all(Object.keys(queries).map(async key => loadQNumbersOfKey(key as Query)));

	const qNumbers = Object.values(entities).flat();
	console.timeLog('wikidata-sets', 'preloadQNumbers', qNumbers.length);
	console.timeEnd('wikidata-sets');
}

async function loadQNumbersOfKey(key: Query): Promise<void> {
	try {
		const url = wdk.sparqlQuery(queries[key]);
		const response = await fetch(url, {headers});
		const json = (await response.json()) as SparqlResults;
		const qNumbers = simplifySparqlResults(json, {
			minimize: true,
		}) as string[];
		entities[key] = qNumbers;
	} catch (error) {
		console.error('wikidata-set query failed', key, error);
	}
}

function get(key: Query): readonly string[] {
	return entities[key] || [];
}

export function getRandom(key: Query): string {
	return randomItem(get(key));
}
