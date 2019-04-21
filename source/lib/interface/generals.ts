import {WikidataItemReader} from '../wikidata-item-reader'

export const outEmoji: {[key: string]: string} = {
	name: '👋',
	nameFallback: '🔮',
	language: '🏳️‍🌈',
	chat: '💭',
	win: '🎉',
	lose: '😭',
	suicide: '😵',
	possibleNo: '⛔️',
	possibleYes: '✅'
}

export function possibleEmoji(condition: boolean): string {
	return condition ? outEmoji.possibleYes : outEmoji.possibleNo
}

interface InfoHeaderOptions {
	titlePrefix?: string;
	titleSuffix?: string;
}

export async function wikidataInfoHeaderFromContext(ctx: any, wdKey: string, options: InfoHeaderOptions = {}): Promise<string> {
	let text = ''
	text += wikidataInfoHeaderV2(ctx.wd.r(wdKey), options)

	if (await ctx.wd.infoMissing(wdKey)) {
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
