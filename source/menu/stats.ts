import {MenuTemplate, Body} from 'telegraf-inline-menu'
import {
	ConstructionName,
	EMOJI
} from 'bastion-siege-logic'

import {Context, Session, backButtons} from '../lib/context'
import * as userSessions from '../lib/user-sessions'

import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

async function menuBody(ctx: Context): Promise<Body> {
	const allSessions = userSessions.getRaw()
	const allSessionData = allSessions.map(o => o.data)

	let text = ''
	text += wikidataInfoHeader(await ctx.wd.reader('menu.statistics'), {titlePrefix: outEmoji.statistics})
	text += '\n\n'

	const statLines: string[] = []

	statLines.push(`${allSessions.length} ${EMOJI.people} (${allSessionData.filter(o => !o.blocked && o.name).length} ${outEmoji.activeUser})`)

	statLines.push(await maxConstructionLevelLine(ctx, allSessionData, 'townhall'))
	statLines.push(await maxConstructionLevelLine(ctx, allSessionData, 'barracks'))

	text += statLines.join('\n')

	return {text, parse_mode: 'Markdown'}
}

async function maxConstructionLevelLine(ctx: Context, sessions: ReadonlyArray<Session>, construction: ConstructionName): Promise<string> {
	return `${EMOJI[construction]} ≤${Math.max(...sessions.map(o => o.constructions[construction]))} ${(await ctx.wd.reader(`construction.${construction}`)).label()}`
}

export const menu = new MenuTemplate(menuBody)

menu.url(
	async ctx => `ℹ️ ${(await ctx.wd.reader('menu.wikidataItem')).label()}`,
	async ctx => (await ctx.wd.reader('menu.statistics')).url()
)

menu.manualRow(backButtons)
