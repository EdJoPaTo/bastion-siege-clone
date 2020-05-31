import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
	ConstructionName,
	EMOJI
} from 'bastion-siege-logic'

import {Context, Session} from '../lib/context'
import * as userSessions from '../lib/user-sessions'

import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

function menuText(ctx: Context): string {
	const allSessions = userSessions.getRaw()
	const allSessionData = allSessions.map(o => o.data)

	let text = ''
	text += wikidataInfoHeader(ctx.wd.r('menu.statistics'), {titlePrefix: outEmoji.statistics})
	text += '\n\n'

	const statLines = []

	statLines.push(`${allSessions.length} ${EMOJI.people} (${allSessionData.filter(o => !o.blocked && o.name).length} ${outEmoji.activeUser})`)

	statLines.push(maxConstructionLevelLine(ctx, allSessionData, 'townhall'))
	statLines.push(maxConstructionLevelLine(ctx, allSessionData, 'barracks'))

	text += statLines.join('\n')

	return text
}

function maxConstructionLevelLine(ctx: Context, sessions: ReadonlyArray<Session>, construction: ConstructionName): string {
	return `${EMOJI[construction]} ≤${Math.max(...sessions.map(o => o.constructions[construction]))} ${ctx.wd.r(`construction.${construction}`).label()}`
}

const menu = new TelegrafInlineMenu((ctx: any) => menuText(ctx))

menu.urlButton((ctx: any) => `ℹ️ ${ctx.wd.r('menu.wikidataItem').label()}`, (ctx: any) => ctx.wd.r('menu.statistics').url())

export default menu
