import {
	ConstructionName,
	EMOJI
} from 'bastion-siege-logic'

export function infoHeader(ctx: any, construction: ConstructionName, currentLevel: number): string {
	const wdKey = `construction.${construction}`

	let text = ''
	text += `${EMOJI[construction]} *${ctx.wd.label(wdKey)}* ${currentLevel}`
	text += '\n'
	text += ctx.wd.description(wdKey)

	if (ctx.wd.infoMissing(wdKey)) {
		text += '\n\n'
		const wdItem = ctx.wd.label('wikidataItem')
		// TODO: i18n
		text += `Some info is missing in the ${wdItem}. Consider updating :)`
	}

	return text
}
