import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
	EMOJI
} from 'bastion-siege-logic'

import {formatNumberShort} from '../lib/interface/format-number'
import {wikidataInfoHeader} from '../lib/interface/generals'
import * as userSessions from '../lib/user-sessions'

function menuText(ctx: any): string {
	const attackTargetId = ctx.session.attackTarget as number
	const attackTarget = attackTargetId && userSessions.getUser(attackTargetId)

	let text = ''
	text += wikidataInfoHeader(ctx, 'bs.war', {titlePrefix: EMOJI.war})
	text += '\n\n'

	if (attackTarget) {
		const {name, resources} = attackTarget
		text += `${ctx.wd.label('other.target')}\n`
		text += `${name.first} ${name.last}\n`
		text += `${formatNumberShort(resources.gold, true)}${EMOJI.gold}\n`
		text += '\n\n'
	}

	return text
}

const menu = new TelegrafInlineMenu(menuText)

menu.button((ctx: any) => `${EMOJI.war} ${ctx.wd.label('action.attack')}`, 'attack', {
	hide: (ctx: any) => !ctx.session.attackTarget,
	doFunc: (ctx: any) => {
		const targetId = ctx.session.attackTarget
		delete ctx.session.attackTarget

		// TODO: do something useful
		console.log('attack', targetId, ctx.session.attackTarget)
		return ctx.answerCbQuery('Your army lost to a TODO')
	}
})

menu.button((ctx: any) => `${EMOJI.search} ${ctx.wd.label('action.search')}`, 'search', {
	doFunc: (ctx: any) => {
		const possibleSessions = userSessions.getRaw()
			.filter(o => o.data.name)
			.filter(o => o.user !== ctx.session.attackTarget)

		const pickId = Math.floor(Math.random() * possibleSessions.length)
		ctx.session.attackTarget = possibleSessions[pickId].user
	}
})

export default menu
