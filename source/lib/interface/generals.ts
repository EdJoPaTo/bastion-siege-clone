export const outEmoji: {[key: string]: string} = {
	name: '👋',
	nameFallback: '🔮',
	language: '🏳️‍🌈',
	win: '🎉',
	lose: '😭',
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

export function wikidataInfoHeader(ctx: any, wdKey: string, options: InfoHeaderOptions = {}): string {
	const {titlePrefix, titleSuffix} = options
	const label = ctx.wd.label(wdKey)
	const description = ctx.wd.description(wdKey)

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

	if (ctx.wd.infoMissing(wdKey)) {
		text += '\n\n'
		const wdItem = ctx.wd.label('menu.wikidataItem')
		text += ctx.i18n.t('menu.infoMissing', {wdItem})
	}

	return text
}
