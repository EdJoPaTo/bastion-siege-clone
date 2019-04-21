import {Constructions, Resources, calcGoldIncome, EMOJI} from 'bastion-siege-logic'
import {Extra, Telegram} from 'telegraf'

import {buildCache, getRandomMystic} from './lib/mystics'
import {formatNumberShort} from './lib/interface/format-number'
import {wikidataInfoHeaderV2, outEmoji} from './lib/interface/generals'
import * as userSessions from './lib/user-sessions'
import WikidataItemStore from './lib/wikidata-item-store'

const ATTACK_INTERVAL = 1000 * 60 * 30 // 30 Minutes
let currentMysticQNumber: string | undefined
let currentHealth = 0
let currentGoldStored = 0

let wdItemStore: WikidataItemStore

export async function start(telegram: Telegram, itemStore: WikidataItemStore): Promise<void> {
	await buildCache(itemStore)
	wdItemStore = itemStore

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
		currentMysticQNumber = getRandomMystic()
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

async function tryAttack(telegram: Telegram): Promise<void> {
	try {
		const {qNumber} = getCurrentMystical()

		const {user, data: session} = userSessions.getRandomUser(o => o.data.name)
		const languageCode = session.wikidataLanguageCode || 'en'

		const battleResult = calcBattle(qNumber, session)
		const {won, gold, townhall} = battleResult

		let text = ''
		text += wikidataInfoHeaderV2(wdItemStore.reader(qNumber, languageCode), {
			titlePrefix: won ? outEmoji.win : outEmoji.lose
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
			text += wdItemStore.reader('construction.townhall', languageCode).label()
		}

		await telegram.sendMessage(user, text, Extra.markdown() as any)
	} catch (error) {
		console.log('mystics attack error', error.message)
	}
}

interface RequiredSession {
	constructions: Constructions;
	resources: Resources;
	resourcesTimestamp: number;
	wikidataLanguageCode: string;
}

interface BattleResult {
	won: boolean;
	gold: number;
	townhall: number;
}

function calcBattle(mystic: string, session: RequiredSession): BattleResult {
	const {constructions} = session

	const attackStrength = calcBallistaDamage(constructions)
	currentHealth -= attackStrength

	const won = currentHealth <= 0

	const {townhall} = constructions
	const townhallChange = calcTownhallChange(mystic, constructions, won)
	session.constructions.townhall = Math.max(1, townhall + townhallChange)

	if (won) {
		session.resources.gold += currentGoldStored
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

function calcTownhallChange(mystic: string, constructions: Constructions, won: boolean): number {
	const {townhall} = constructions
	const mysticStrength = calcMysticStrenght(mystic)
	const townhallBaseChange = Math.floor(mysticStrength * 0.2)
	const maxChange = Math.floor(townhall / 20)
	const townhallChange = Math.min(townhallBaseChange, maxChange) * (won ? 2 : -1)

	return townhallChange
}