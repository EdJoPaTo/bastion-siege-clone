import {EMOJI} from 'bastion-siege-logic'
import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {Context, backButtons, Session} from '../lib/context'
import {randomFamilyEmoji} from '../lib/interface/generals'
import {getRaw} from '../lib/user-sessions'

function getFamilyMembers(lastName: string): Session[] {
	return getRaw()
		.map(o => o.data)
		.filter(o => o.name?.last === lastName)
}

async function menuBody(ctx: Context): Promise<Body> {
	let text = ''

	text += randomFamilyEmoji()
	text += ' '
	text += '*'
	text += ctx.session.name!.last!
	text += '*'

	if (ctx.session.name?.last) {
		const familyMembers = getFamilyMembers(ctx.session.name.last)

		const lines = familyMembers
			.sort((a, b) => b.constructions.barracks - a.constructions.barracks)
			.map(o => `${o.constructions.barracks}${EMOJI.barracks}  ${o.name!.first}`)

		text += '\n\n'
		text += lines.join('\n')
	}

	return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate<Context>(menuBody)

menu.manualRow(backButtons)
