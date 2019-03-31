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

export function constructionLine(ctx: any, construction: ConstructionName, level: number, canUpgrade: boolean): string {
	const parts: string[] = []

	parts.push(possibleEmoji(canUpgrade))
	parts.push(EMOJI[construction])
	parts.push(String(level))
	parts.push(
		`*${ctx.wd.label(`construction.${construction}`)}*`
	)

	return parts.join(' ')
}

export function infoHeader(ctx: any, construction: ConstructionName, currentLevel: number): string {
	const wdKey = `construction.${construction}`
	return wikidataInfoHeader(ctx, wdKey, {titlePrefix: EMOJI[construction], titleSuffix: String(currentLevel)})
}

function simpleLineString(...args: (string | number)[]): string {
	return args.join(' ')
}

function incomeString(ctx: any, income: number | string, unit: string): string {
	return simpleLineString(ctx.wd.label('other.income'), income, `${unit} / ${ctx.wd.label('bs.day')}`)
}

function storageCapacityString(ctx: any, capacity: number, unit: ResourceName): string {
	return simpleLineString(ctx.wd.label('bs.storageCapacity'), formatNumberShort(capacity, true), EMOJI[unit])
}

export function peopleString(label: string, available: number, capacity: number, unit: string): string {
	return simpleLineString(label, formatNumberShort(available, true) + unit, '/', formatNumberShort(capacity, true) + unit)
}

export function constructionPropertyString(ctx: any, constructions: Constructions, people: PeopleInConstructions, construction: ConstructionName): string | undefined {
	if (construction === 'townhall') {
		const lines = []
		lines.push(storageCapacityString(ctx, calcGoldCapacity(constructions.townhall), 'gold'))
		lines.push(incomeString(ctx, calcGoldIncomePerPerson(constructions.townhall).toFixed(1), `${EMOJI.gold} / ${ctx.wd.label('bs.inhabitant')}`))
		lines.push(incomeString(ctx, calcGoldIncome(constructions.townhall, constructions.houses), EMOJI.gold))

		return lines.join('\n')
	}

	if (construction === 'storage') {
		const units: ResourceName[] = ['wood', 'stone', 'food']
		const lines = units
			.map(o => storageCapacityString(ctx, calcStorageCapacity(constructions.storage), o))

		return lines.join('\n')
	}

	if (construction === 'houses') {
		const lines = []
		lines.push(peopleString(ctx.wd.label('bs.people'), people.houses, calcHousesCapacity(constructions.houses), EMOJI.people))
		lines.push(incomeString(ctx, calcHousesPeopleIncome(constructions.houses), EMOJI.people))
		lines.push(incomeString(ctx, calcProductionFood(constructions.farm, constructions.houses), EMOJI.food))

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
		return peopleString(ctx.wd.label('bs.army'), people.barracks, calcBarracksCapacity(constructions.barracks), EMOJI.army)
	}

	if (construction === 'wall') {
		return peopleString(ctx.wd.label('bs.archer'), people.wall, calcWallArcherCapacity(constructions.wall), EMOJI.archer)
	}

	return undefined
}
