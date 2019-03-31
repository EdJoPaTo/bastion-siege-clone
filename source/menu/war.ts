import {Extra} from 'telegraf'
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
import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

function getLoot(constructions: Constructions): number {
	return calcGoldIncome(constructions.townhall, constructions.houses) * 60
}

function getAttackerWinChance(constructions: Constructions, people: PeopleInConstructions): number {
	const {trebuchet} = constructions
	const {barracks} = people

	let chance = barracks / 100
	chance += trebuchet / 2
	return chance
}

function getDefenderWinChance(constructions: Constructions): number {
	const {barracks, wall} = constructions

	let chance = barracks * 40 / 100
	chance += wall / 2
	return chance
}

function afterBattleMessageText(ctx: any, attack: boolean, win: boolean, name: {first: string, last: string}, loot: number) {
	let lines = []

	let headline = ''
	headline += attack ? EMOJI.attack : EMOJI.defence
	headline += win ? outEmoji.win : outEmoji.lose
	headline += ' '
	headline += '*'
	headline += win ? ctx.wd.label('battle.win') : ctx.wd.label('battle.lose')
	headline += '*'
	lines.push(headline)

	let enemyLine = ''
	enemyLine += '*'
	enemyLine += attack ? ctx.wd.label('battle.target') : ctx.wd.label('battle.attacker')
	enemyLine += '*'
	enemyLine += ' '
	enemyLine += `${name.first} ${name.last}`
	lines.push(enemyLine)

	if (loot > 0) {
		lines.push(`${formatNumberShort(loot, true)}${EMOJI.gold}`)
	}

	return lines.join('\n')
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
		text += `${ctx.wd.label('battle.target')}\n`
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
		const attackerConstructions = attacker.constructions as Constructions
		const attackerPeople = attacker.people as PeopleInConstructions

		const targetId = ctx.session.attackTarget
		const target = userSessions.getUser(targetId)
		const targetConstructions = target.constructions as Constructions
		const targetPeople = target.people as PeopleInConstructions

		const attackerWinChance = getAttackerWinChance(attackerConstructions, attackerPeople)
		const targetWinChance = getDefenderWinChance(targetConstructions)

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

			return ctx.editMessageText(ctx.i18n.t('battle.yourself'))
		}

		const attackerLoot = attackerWins ? possibleLootFromTarget : 0
		const targetLoot = attackerWins ? 0 : possibleLootFromAttacker

		ctx.session.resources.gold += attackerLoot
		target.resources.gold += targetLoot

		if (attackerWins) {
			targetPeople.houses = 0
			targetPeople.barracks = 0
			targetPeople.wall = 0
			target.peopleTimestamp = now
		}

		const extra = Extra.markdown()

		return Promise.all([
			ctx.editMessageText(afterBattleMessageText(ctx, true, attackerWins, target.name, attackerLoot), extra),
			ctx.tg.sendMessage(targetId, afterBattleMessageText(ctx, false, !attackerWins, attacker.name, targetLoot), extra)
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
