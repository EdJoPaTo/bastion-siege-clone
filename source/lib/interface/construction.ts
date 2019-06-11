import {
	calcBarracksCapacity,
	calcGoldCapacity,
	calcGoldIncome,
	calcGoldIncomePerPerson,
	calcHousesCapacity,
	calcHousesPeopleIncome,
	calcProduction,
	calcProductionFood,
	calcStorageCapacity,
	calcWallArcherCapacity,
	ConstructionName,
	Constructions,
	EMOJI,
	ResourceName
} from 'bastion-siege-logic'

import {PeopleInConstructions} from '../../types'

import {formatNumberShort} from './format-number'
import {possibleEmoji, wikidataInfoHeader} from './generals'

export async function constructionLine(ctx: any, construction: ConstructionName, level: number, canUpgrade: boolean): Promise<string> {
	const parts: string[] = []

	parts.push(possibleEmoji(canUpgrade))
	parts.push(EMOJI[construction])
	parts.push(String(level))
	parts.push(
		`*${await ctx.wd.label(`construction.${construction}`)}*`
	)

	return parts.join(' ')
}

export async function infoHeader(ctx: any, construction: ConstructionName, currentLevel: number): Promise<string> {
	const wdKey = `construction.${construction}`
	return wikidataInfoHeader(ctx.wd.r(wdKey), {titlePrefix: EMOJI[construction], titleSuffix: String(currentLevel)})
}

function simpleLineString(...args: (string | number)[]): string {
	return args.join(' ')
}

async function incomeString(ctx: any, income: number | string, unit: string): Promise<string> {
	return simpleLineString(await ctx.wd.label('other.income'), income, `${unit} / ${await ctx.wd.label('bs.day')}`)
}

async function storageCapacityString(ctx: any, capacity: number, unit: ResourceName): Promise<string> {
	return simpleLineString(await ctx.wd.label('bs.storageCapacity'), formatNumberShort(capacity, true), EMOJI[unit])
}

export function peopleString(label: string, available: number, capacity: number, unit: string): string {
	return simpleLineString(label, formatNumberShort(available, true) + unit, '/', formatNumberShort(capacity, true) + unit)
}

export async function constructionPropertyString(ctx: any, constructions: Constructions, people: PeopleInConstructions, construction: ConstructionName): Promise<string | undefined> {
	if (construction === 'townhall') {
		const linePromises = []
		linePromises.push(storageCapacityString(ctx, calcGoldCapacity(constructions.townhall), 'gold'))
		linePromises.push(incomeString(ctx, calcGoldIncomePerPerson(constructions.townhall).toFixed(1), `${EMOJI.gold} / ${await ctx.wd.label('bs.inhabitant')}`))
		linePromises.push(incomeString(ctx, calcGoldIncome(constructions.townhall, constructions.houses), EMOJI.gold))

		const lines = await Promise.all(linePromises)
		return lines.join('\n')
	}

	if (construction === 'storage') {
		const units: ResourceName[] = ['wood', 'stone', 'food']
		const linePromises = units
			.map(o => storageCapacityString(ctx, calcStorageCapacity(constructions.storage), o))

		const lines = await Promise.all(linePromises)
		return lines.join('\n')
	}

	if (construction === 'houses') {
		const lines = []
		lines.push(peopleString(await ctx.wd.label('bs.people'), people.houses, calcHousesCapacity(constructions.houses), EMOJI.people))
		lines.push(await incomeString(ctx, calcHousesPeopleIncome(constructions.houses), EMOJI.people))
		lines.push(await incomeString(ctx, calcProductionFood(constructions.farm, constructions.houses), EMOJI.food))

		return lines.join('\n')
	}

	if (construction === 'farm') {
		return incomeString(ctx, calcProductionFood(constructions.farm, constructions.houses), EMOJI.food)
	}

	if (construction === 'sawmill') {
		return incomeString(ctx, calcProduction(constructions.sawmill), EMOJI.wood)
	}

	if (construction === 'mine') {
		return incomeString(ctx, calcProduction(constructions.mine), EMOJI.stone)
	}

	if (construction === 'barracks') {
		return peopleString(await ctx.wd.label('bs.army'), people.barracks, calcBarracksCapacity(constructions.barracks), EMOJI.army)
	}

	if (construction === 'wall') {
		return peopleString(await ctx.wd.label('bs.archer'), people.wall, calcWallArcherCapacity(constructions.wall), EMOJI.archer)
	}

	return undefined
}
