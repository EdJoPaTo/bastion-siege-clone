import {type Body, MenuTemplate} from 'telegraf-inline-menu'
import {
	calcBarracksCapacity,
	calcGoldIncome,
	calcHousesCapacity,
	type Constructions,
	EMOJI,
} from 'bastion-siege-logic'

import {type PeopleInConstructions} from '../types.js'

import * as userSessions from '../lib/user-sessions.js'

import {backButtons, type Context, type Name} from '../lib/context.js'
import {formatNamePlain} from '../lib/interface/name.js'
import {formatNumberShort} from '../lib/interface/format-number.js'
import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals.js'
import {peopleString} from '../lib/interface/construction.js'

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

function afterBattleMessageText(attack: boolean, win: boolean, name: Name, loot: number): string {
	const lines: string[] = []

	let headline = ''
	headline += attack ? EMOJI.attack : EMOJI.defence
	headline += win ? outEmoji.win : outEmoji.lose
	headline += ' '
	headline += '*'
	headline += formatNamePlain(name)
	headline += '*'
	lines.push(headline)

	if (loot > 0) {
		lines.push(`${formatNumberShort(loot, true)}${EMOJI.gold}`)
	}

	return lines.join('\n')
}

async function menuBody(ctx: Context): Promise<Body> {
	const {constructions, people} = ctx.session
	const attackTargetId = ctx.session.attackTarget
	const attackTarget = attackTargetId && userSessions.getUser(attackTargetId)

	let text = ''
	text += wikidataInfoHeader(await ctx.wd.reader('bs.war'), {titlePrefix: EMOJI.war})
	text += '\n\n'
	text += peopleString(
		(await ctx.wd.reader('bs.army')).label(),
		people.barracks,
		calcBarracksCapacity(constructions.barracks),
		EMOJI.army,
	)
	text += '\n'
	text += peopleString(
		(await ctx.wd.reader('bs.people')).label(),
		people.houses,
		calcHousesCapacity(constructions.houses),
		EMOJI.people,
	)
	text += '\n'

	text += '\n'

	// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
	if (attackTarget && attackTarget.name) {
		const {name, constructions} = attackTarget
		text += (await ctx.wd.reader('battle.target')).label()
		text += '\n'
		text += formatNamePlain(name)
		text += '\n'
		text += `~${formatNumberShort(getLoot(constructions), true)}${EMOJI.gold}\n`
		text += '\n\n'
	}

	return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate(menuBody)

menu.interact(async ctx => `${EMOJI.war} ${(await ctx.wd.reader('action.attack')).label()}`, 'attack', {
	hide: ctx => !ctx.session.attackTarget,
	async do(ctx) {
		const now = Date.now() / 1000

		const attacker = ctx.session

		const targetId = ctx.session.attackTarget!
		const target = userSessions.getUser(targetId)!

		const attackerWinChance = getAttackerWinChance(attacker.constructions, attacker.people)
		const targetWinChance = getDefenderWinChance(target.constructions)

		const possibleLootFromAttacker = getLoot(attacker.constructions)
		const possibleLootFromTarget = getLoot(target.constructions)

		const attackerWins = attackerWinChance > targetWinChance

		delete ctx.session.attackTarget
		ctx.session.people = {
			...ctx.session.people,
			barracks: 0,
		}

		if (targetId === ctx.from!.id) {
			ctx.session.people = {
				barracks: 0,
				houses: 0,
				wall: 0,
			}

			// Easter egg: attack yourself duplicates gold
			if (ctx.session.resources.gold > 0) {
				ctx.session.resources = {
					...ctx.session.resources,
					gold: ctx.session.resources.gold * 2,
				}
			}

			await ctx.replyWithMarkdown(
				wikidataInfoHeader(await ctx.wd.reader('battle.suicide'), {titlePrefix: outEmoji.suicide}),
			)
			return '.'
		}

		const attackerLoot = attackerWins ? possibleLootFromTarget : 0
		const targetLoot = attackerWins ? 0 : possibleLootFromAttacker

		ctx.session.resources = {
			...ctx.session.resources,
			gold: ctx.session.resources.gold + attackerLoot,
		}

		target.resources = {
			...target.resources,
			gold: target.resources.gold + targetLoot,
		}

		if (attackerWins) {
			target.people = {
				barracks: 0,
				houses: 0,
				wall: 0,
			}
			target.peopleTimestamp = now
		}

		await ctx.replyWithMarkdown(afterBattleMessageText(true, attackerWins, target.name!, attackerLoot))

		const isBetrayal = attacker.name?.last && attacker.name.last === target.name?.last
		if (isBetrayal) {
			attacker.name = {
				...attacker.name!,
				last: undefined,
				lastChangeLast: now,
			}

			await ctx.replyWithMarkdown(
				wikidataInfoHeader(await ctx.wd.reader('battle.betrayal'), {titlePrefix: outEmoji.betrayal}),
			)
		}

		if (!target.blocked) {
			try {
				await ctx.telegram.sendMessage(targetId, afterBattleMessageText(false, !attackerWins, attacker.name!, targetLoot), {parse_mode: 'Markdown'})
			} catch (error: unknown) {
				console.error('send defender battlereport failed', targetId, error instanceof Error ? error.message : error)
				target.blocked = true
			}
		}

		return '.'
	},
})

menu.interact(async ctx => `${EMOJI.search} ${(await ctx.wd.reader('action.search')).label()}`, 'search', {
	do(ctx) {
		const chosen = userSessions.getRandomUser(o => Boolean(o.data.name && o.user !== ctx.session.attackTarget))
		ctx.session.attackTarget = chosen.user
		return '.'
	},
})

menu.manualRow(backButtons)
