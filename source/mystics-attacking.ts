import {Constructions, calcGoldIncome, EMOJI} from 'bastion-siege-logic'
import {Extra, Telegram} from 'telegraf'
import WikidataEntityReader from 'wikidata-entity-reader'
import WikidataEntityStore from 'wikidata-entity-store'

import {formatNumberShort} from './lib/interface/format-number'
import {Session} from './lib/context'
import {wikidataInfoHeader, outEmoji} from './lib/interface/generals'
import * as userSessions from './lib/user-sessions'
import * as wdSets from './lib/wikidata-sets'

const ATTACK_INTERVAL = 1000 * 60 * 30 // 30 Minutes
let currentMysticQNumber: string | undefined
let currentHealth = 0
let currentGoldStored = 0

let wdEntityStore: WikidataEntityStore

export function start(telegram: Readonly<Telegram>, entityStore: WikidataEntityStore): void {
	wdEntityStore = entityStore

	setInterval(tryAttack, ATTACK_INTERVAL, telegram)
}

function calcMysticStrenght(mystic: string): number {
	const numbersOfQNumber = mystic
		.split('')
		.slice(1)
		.map(o => Number(o))

	const baseStrength = numbersOfQNumber.reduce((a, b) => a + b, 0)
	return baseStrength
}

export function getCurrentMystical(): {qNumber: string; current: number; max: number; gold: number} {
	if (!currentMysticQNumber || currentHealth <= 0) {
		// Reset Mystic
		currentMysticQNumber = wdSets.getRandom('mystics')
		if (!currentMysticQNumber) {
			throw new Error('mystics not yet initialized')
		}

		currentHealth = calcMysticStrenght(currentMysticQNumber)
		currentGoldStored = 0
	}

	return {
		qNumber: currentMysticQNumber,
		current: Math.round(currentHealth),
		max: calcMysticStrenght(currentMysticQNumber),
		gold: currentGoldStored
	}
}

export function calcBallistaDamage(constructions: Constructions): number {
	const {townhall, ballista} = constructions
	const attackStrength = ballista * 20 / townhall
	return attackStrength
}

async function tryAttack(telegram: Readonly<Telegram>): Promise<void> {
	const {user, data: session} = userSessions.getRandomUser(o => Boolean(o.data.name && !o.data.blocked))

	try {
		const {qNumber, max} = getCurrentMystical()

		const languageCode = session.wikidataLanguageCode || 'en'

		const battleResult = calcBattle(qNumber, session)
		if (process.env.NODE_ENV !== 'production') {
			console.log('after mystics battle', user, max, currentHealth, calcBallistaDamage(session.constructions))
		}

		const {won, gold, townhall} = battleResult

		let text = ''
		text += wikidataInfoHeader(new WikidataEntityReader(wdEntityStore.entity('construction.ballista'), languageCode), {
			titlePrefix: won ? outEmoji.win : outEmoji.lose
		})

		text += '\n\n'
		text += wikidataInfoHeader(new WikidataEntityReader(wdEntityStore.entity(qNumber), languageCode), {
			titlePrefix: won ? outEmoji.lose : outEmoji.win
		})
		text += '\n'

		if (won) {
			text += '\n'
			text += formatNumberShort(gold, true)
			text += EMOJI.gold
		}

		if (Math.abs(townhall) > 0) {
			text += '\n'
			if (townhall < 0) {
				text += outEmoji.fire
			}

			text += EMOJI.townhall
			text += ' '
			if (townhall > 0) {
				text += '+'
			}

			text += townhall
			text += ' '
			text += new WikidataEntityReader(wdEntityStore.entity('construction.townhall'), languageCode).label()
		}

		await telegram.sendMessage(user, text, Extra.markdown() as any)
	} catch (error) {
		session.blocked = true
		console.log('mystics attack error', user, error.message)
	}
}

interface BattleResult {
	won: boolean;
	gold: number;
	townhall: number;
}

function calcBattle(mystic: string, session: Session): BattleResult {
	const {constructions} = session

	const attackStrength = calcBallistaDamage(constructions)
	currentHealth -= attackStrength

	const won = currentHealth <= 0

	const {townhall} = constructions
	const townhallChange = calcTownhallChange(mystic, won)
	session.constructions = {
		...session.constructions,
		townhall: Math.max(1, townhall + townhallChange)
	}

	if (won) {
		session.resources = {
			...session.resources,
			gold: session.resources.gold + currentGoldStored
		}
	} else {
		const income = calcGoldIncome(constructions.townhall, constructions.houses)
		currentGoldStored += income * 60 * 6 // 6 hours of income

		session.resources = {
			gold: 0,
			wood: 0,
			stone: 0,
			food: 0
		}
	}

	session.resourcesTimestamp = Date.now() / 1000

	return {
		won,
		gold: won ? currentGoldStored : 0,
		townhall: townhallChange
	}
}

function calcTownhallChange(mystic: string, won: boolean): number {
	const mysticStrength = calcMysticStrenght(mystic)

	if (!won) {
		// The average of strength is 27.3
		// Less then the average deals more dmg but dies faster
		return mysticStrength < 27 ? -2 : -1
	}

	const townhallChange = Math.floor(mysticStrength * 0.5)
	return townhallChange
}
