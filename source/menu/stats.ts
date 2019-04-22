import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
	ConstructionName,
	EMOJI
} from 'bastion-siege-logic'

import * as userSessions from '../lib/user-sessions'

import {outEmoji, wikidataInfoHeaderFromContext} from '../lib/interface/generals'

async function menuText(ctx: any): Promise<string> {
	const allSessions = userSessions.getRaw()
	const allSessionData = allSessions.map(o => o.data)

	let text = ''
	text += await wikidataInfoHeaderFromContext(ctx, 'menu.statistics', {titlePrefix: outEmoji.statistics})
	text += '\n\n'

	const statLines = []

	statLines.push(`${allSessions.length} ${EMOJI.people} (${allSessionData.filter(o => !o.blocked && o.name).length} ${outEmoji.activeUser})`)

	statLines.push(maxConstructionLevelLine(ctx, allSessionData, 'townhall'))
	statLines.push(maxConstructionLevelLine(ctx, allSessionData, 'barracks'))

	text += statLines.join('\n')

	return text
}

function maxConstructionLevelLine(ctx: any, sessions: ReadonlyArray<userSessions.Session>, construction: ConstructionName): string {
	return `${EMOJI[construction]} ≤${Math.max(...sessions.map(o => o.constructions[construction]))} ${ctx.wd.label(`construction.${construction}`)}`
}

const menu = new TelegrafInlineMenu(menuText)

menu.urlButton(async (ctx: any) => `ℹ️ ${await ctx.wd.label('menu.wikidataItem')}`, (ctx: any) => ctx.wd.url('menu.statistics'))

export default menu
