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

export async function wikidataInfoHeader(ctx: any, wdKey: string, options: InfoHeaderOptions = {}): Promise<string> {
	const {titlePrefix, titleSuffix} = options
	const label = await ctx.wd.label(wdKey)
	const description = await ctx.wd.description(wdKey)

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

	text += '\n'
	text += `${description}`

	if (await ctx.wd.infoMissing(wdKey)) {
		text += '\n\n'
		const wdItem = await ctx.wd.label('menu.wikidataItem')
		text += ctx.i18n.t('menu.infoMissing', {wdItem})
	}

	return text
}
