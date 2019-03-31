import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
	calcBarracksCapacity,
	calcHousesCapacity,
	calcGoldIncome,
	Constructions,
	EMOJI
} from 'bastion-siege-logic'

import {PeopleInConstructions} from '../types'

import * as userSessions from '../lib/user-sessions'

import {formatNumberShort} from '../lib/interface/format-number'
import {peopleString} from '../lib/interface/construction'
import {wikidataInfoHeader} from '../lib/interface/generals'

function getLoot(constructions: Constructions): number {
	return calcGoldIncome(constructions.townhall, constructions.houses) * 60
}

function getWinChance(constructions: Constructions, people: PeopleInConstructions, attack: boolean): number {
	const {wall, trebuchet} = constructions
	const {barracks} = people
	let chance = barracks * 40 / 100

	if (attack) {
		chance += trebuchet / 2
	} else {
		chance += wall / 2
	}

	return chance
}

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
		const {name, constructions} = attackTarget
		text += `${ctx.wd.label('other.target')}\n`
		text += `${name.first} ${name.last}\n`
		text += `~${formatNumberShort(getLoot(constructions), true)}${EMOJI.gold}\n`
		text += '\n\n'
	}

	return text
}

const menu = new TelegrafInlineMenu(menuText)

menu.simpleButton((ctx: any) => `${EMOJI.war} ${ctx.wd.label('action.attack')}`, 'attack', {
	hide: (ctx: any) => !ctx.session.attackTarget,
	doFunc: (ctx: any) => {
		const now = Date.now() / 1000

		const attacker = ctx.session
		const attackerNameString = `${attacker.name.first} ${attacker.name.last}`
		const attackerConstructions = attacker.constructions as Constructions
		const attackerPeople = attacker.people as PeopleInConstructions

		const targetId = ctx.session.attackTarget
		const target = userSessions.getUser(targetId)
		const targetNameString = `${target.name.first} ${target.name.last}`
		const targetConstructions = target.constructions as Constructions
		const targetPeople = target.people as PeopleInConstructions

		const attackerWinChance = getWinChance(attackerConstructions, attackerPeople, true)
		const targetWinChance = getWinChance(targetConstructions, targetPeople, false)

		const possibleLootFromAttacker = getLoot(attackerConstructions)
		const possibleLootFromTarget = getLoot(targetConstructions)

		const attackerWins = attackerWinChance > targetWinChance

		delete ctx.session.attackTarget
		ctx.session.people.barracks = 0

		if (targetId === ctx.from.id) {
			ctx.session.people.houses = 0
			ctx.session.people.wall = 0

			// Easter egg: attack yourself duplicates gold
			ctx.session.resources.gold *= 2

			return ctx.editMessageText(ctx.i18n.t('battle.attack.yourself'))
		}

		if (attackerWins) {
			const loot = possibleLootFromTarget
			ctx.session.resources.gold += loot
			targetPeople.houses = 0
			targetPeople.barracks = 0
			targetPeople.wall = 0
			target.peopleTimestamp = now

			return Promise.all([
				ctx.editMessageText(ctx.i18n.t('battle.attack.won', {name: targetNameString, loot: `${formatNumberShort(loot, true)}${EMOJI.gold}`})),
				ctx.tg.sendMessage(targetId, ctx.i18n.t('battle.defence.lost', {name: attackerNameString}))
			])
		}

		const loot = possibleLootFromAttacker
		target.resources.gold += loot

		return Promise.all([
			ctx.editMessageText(ctx.i18n.t('battle.attack.lost', {name: targetNameString})),
			ctx.tg.sendMessage(targetId, ctx.i18n.t('battle.defence.won', {name: attackerNameString, loot: `${formatNumberShort(loot, true)}${EMOJI.gold}`}))
		])
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
