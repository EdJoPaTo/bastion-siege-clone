import {WikidataItemReader} from '../wikidata-item-reader'

export const outEmoji: {[key: string]: string} = {
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

export async function wikidataInfoHeaderFromContext(ctx: any, wdKey: string, options: InfoHeaderOptions = {}): Promise<string> {
	const reader = ctx.wd.r(wdKey) as WikidataItemReader

	let text = ''
	text += wikidataInfoHeaderV2(reader, options)

	if (reader.label() === reader.qNumber() || !reader.description()) {
		text += '\n\n'
		const wdItem = await ctx.wd.r('menu.wikidataItem').label()
		text += ctx.i18n.t('menu.infoMissing', {wdItem})
	}

	return text
}

export function wikidataInfoHeaderV2(wdr: WikidataItemReader, options: InfoHeaderOptions = {}): string {
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
