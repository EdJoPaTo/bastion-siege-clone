import WikidataEntityReader from 'wikidata-entity-reader'

export const outEmoji = {
	activeUser: '💙',
	chat: '💭',
	fire: '🔥',
	health: '❤️',
	language: '🏳️‍🌈',
	lose: '😭',
	name: '👋',
	nameFallback: '🔮',
	possibleNo: '⛔️',
	possibleYes: '✅',
	statistics: '📊',
	suicide: '😵',
	win: '🎉'
}

export function possibleEmoji(condition: boolean): string {
	return condition ? outEmoji.possibleYes : outEmoji.possibleNo
}

interface InfoHeaderOptions {
	titlePrefix?: string;
	titleSuffix?: string;
}

export function wikidataInfoHeader(wdr: WikidataEntityReader, options: InfoHeaderOptions = {}): string {
	const {titlePrefix, titleSuffix} = options
	const label = wdr.label()
	const description = wdr.description()

	let text = ''

	if (titlePrefix) {
		text += titlePrefix
		text += ' '
	}

	text += `*${label}*`

	if (titleSuffix) {
		text += ' '
		text += titleSuffix
	}

	if (description) {
		text += '\n'
		text += `${description}`
	}

	return text
}
