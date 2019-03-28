import * as wdkGot from 'wikidata-sdk-got'

const countryEmojiCache: {[key: string]: Promise<ReadonlyArray<string>>} = {}

export async function countryEmojisOfLanguage(langCode: string): Promise<ReadonlyArray<string>> {
	if (!countryEmojiCache[langCode]) {
		countryEmojiCache[langCode] = countryEmojisOfLanguageWithoutCache(langCode)
	}

	return countryEmojiCache[langCode]
}

async function countryEmojisOfLanguageWithoutCache(langCode: string): Promise<ReadonlyArray<string>> {
	const query = `SELECT DISTINCT ?emoji WHERE {
	?lang wdt:P218 "${langCode}".
	?country wdt:P37/wdt:P279* ?lang.
	?country wdt:P31 wd:Q3624078.
	?country wdt:P1082 ?pop.
	?country wdt:P487 ?emoji.
}
ORDER BY DESC(?pop)
LIMIT 2`
	const result = await wdkGot.sparqlQuerySimplifiedMinified(query)
	return result as string[]
}
