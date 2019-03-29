import {
	ConstructionName,
	EMOJI
} from 'bastion-siege-logic'

import {
	possibleEmoji
} from './generals'

export function constructionLine(ctx: any, construction: ConstructionName, level: number, canUpgrade: boolean): string {
	const parts: string[] = []

	parts.push(possibleEmoji(canUpgrade))
	parts.push(EMOJI[construction])
	parts.push(String(level))
	parts.push(
		`*${ctx.wd.label(`construction.${construction}`)}*`
	)

	return parts.join(' ')
}

export function infoHeader(ctx: any, construction: ConstructionName, currentLevel: number): string {
	const wdKey = `construction.${construction}`

	let text = ''
	text += `${EMOJI[construction]} *${ctx.wd.label(wdKey)}* ${currentLevel}`
	text += '\n'
	text += ctx.wd.description(wdKey)

	if (ctx.wd.infoMissing(wdKey)) {
		text += '\n\n'
		const wdItem = ctx.wd.label('menu.wikidataItem')
		// TODO: i18n
		text += `Some info is missing in the ${wdItem}. Consider updating :)`
	}

	return text
}
