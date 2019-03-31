import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
	calcBarracksCapacity,
	calcHousesCapacity,
	Constructions,
	EMOJI
} from 'bastion-siege-logic'

import {PeopleInConstructions} from '../types'

import * as userSessions from '../lib/user-sessions'

import {formatNumberShort} from '../lib/interface/format-number'
import {peopleString} from '../lib/interface/construction'
import {wikidataInfoHeader} from '../lib/interface/generals'

function menuText(ctx: any): string {
	const constructions = ctx.session.constructions as Constructions
	const people = ctx.session.people as PeopleInConstructions
	const attackTargetId = ctx.session.attackTarget as number
	const attackTarget = attackTargetId && userSessions.getUser(attackTargetId)

	let text = ''
	text += wikidataInfoHeader(ctx, 'bs.war', {titlePrefix: EMOJI.war})
	text += '\n\n'
	text += peopleString(ctx.wd.label('bs.army'), people.barracks, calcBarracksCapacity(constructions.barracks), EMOJI.army)
	text += '\n'
	text += peopleString(ctx.wd.label('bs.people'), people.houses, calcHousesCapacity(constructions.houses), EMOJI.people)
	text += '\n'

	text += '\n'

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
		const attackArmy = ctx.session.people.barracks
		delete ctx.session.attackTarget
		ctx.session.people.barracks = 0

		// TODO: do something useful
		console.log('attack', targetId, ctx.session.people, attackArmy)
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
