import {MenuTemplate, Body} from 'telegraf-inline-menu'
import {
	ConstructionName,
	EMOJI
} from 'bastion-siege-logic'

import {Context, Session, backButtons} from '../lib/context'
import * as userSessions from '../lib/user-sessions'

import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

function menuBody(ctx: Context): Body {
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

	return {text, parse_mode: 'Markdown'}
}

function maxConstructionLevelLine(ctx: Context, sessions: ReadonlyArray<Session>, construction: ConstructionName): string {
	return `${EMOJI[construction]} ≤${Math.max(...sessions.map(o => o.constructions[construction]))} ${ctx.wd.r(`construction.${construction}`).label()}`
}

export const menu = new MenuTemplate(menuBody)

menu.url(
	ctx => `ℹ️ ${ctx.wd.reader('menu.wikidataItem').label()}`,
	ctx => ctx.wd.reader('menu.statistics').url()
)

menu.manualRow(backButtons)
