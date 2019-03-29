import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
	calcBarracksCapacity,
	calcBuildingCost,
	calcGoldCapacity,
	calcGoldIncome,
	calcGoldIncomePerPerson,
	calcHousesCapacity,
	calcMinutesNeeded,
	calcProduction,
	calcProductionFood,
	calcResourcesAfterConstruction,
	calcStorageCapacity,
	calcWallArcherCapacity,
	ConstructionName,
	Constructions,
	EMOJI,
	ResourceName,
	Resources
} from 'bastion-siege-logic'

import {infoHeader} from '../lib/interface/construction'
import {constructionResources} from '../lib/interface/resource'

const menu = new TelegrafInlineMenu(constructionText)

function constructionFromCtx(ctx: any): {construction: ConstructionName; level: number} {
	const construction: ConstructionName = ctx.match[1]
	const constructions = ctx.session.constructions as Constructions
	const level = constructions[construction]

	return {construction, level}
}

function incomeString(ctx: any, income: number | string, unit: string) {
	return `${ctx.wd.label('action.income')} ${income} ${unit} / ${ctx.wd.label('bs.day')}`
}

function storageCapacityString(ctx: any, capacity: number, unit: ResourceName) {
	return `${ctx.wd.label('bs.storageCapacity')} ${capacity} ${EMOJI[unit]}`
}

function constructionText(ctx: any): string {
	const constructions = ctx.session.constructions as Constructions
	const {construction, level} = constructionFromCtx(ctx)

	const requiredResources = calcBuildingCost(construction, level)
	const currentResources = ctx.session.resources as Resources

	const textParts = []
	textParts.push(infoHeader(ctx, construction, level))

	if (construction === 'townhall') {
		const lines = []
		lines.push(storageCapacityString(ctx, calcGoldCapacity(level), 'gold'))
		lines.push(incomeString(ctx, calcGoldIncomePerPerson(level).toFixed(1), `${EMOJI.gold} / ${ctx.wd.label('bs.inhabitant')}`))
		lines.push(incomeString(ctx, calcGoldIncome(level, constructions.houses), EMOJI.gold))

		textParts.push(lines.join('\n'))
	}

	if (construction === 'storage') {
		const units: ResourceName[] = ['wood', 'stone', 'food']
		const lines = units
			.map(o => storageCapacityString(ctx, calcStorageCapacity(level), o))

		textParts.push(lines.join('\n'))
	}

	if (construction === 'houses') {
		const lines = []
		lines.push(`${ctx.wd.label('bs.people')} ${calcHousesCapacity(level)} ${EMOJI.people}`)
		lines.push(incomeString(ctx, calcGoldIncome(constructions.townhall, level), EMOJI.gold))

		textParts.push(lines.join('\n'))
	}

	if (construction === 'farm') {
		textParts.push(incomeString(ctx, calcProductionFood(level, constructions.houses), EMOJI.food))
	}

	if (construction === 'sawmill') {
		textParts.push(incomeString(ctx, calcProduction(level), EMOJI.wood))
	}

	if (construction === 'mine') {
		textParts.push(incomeString(ctx, calcProduction(level), EMOJI.stone))
	}

	if (construction === 'barracks') {
		textParts.push(`${ctx.wd.label('bs.army')} ${calcBarracksCapacity(level)} ${EMOJI.army}`)
	}

	if (construction === 'wall') {
		textParts.push(`${ctx.wd.label('bs.archer')} ${calcWallArcherCapacity(level)} ${EMOJI.army}`)
	}

	textParts.push(constructionResources(ctx, requiredResources, currentResources))

	return textParts.join('\n\n')
}

menu.button((ctx: any) => `⬆️ ${ctx.wd.label('action.upgrade')}`, 'upgrade', {
	hide: (ctx: any) => {
		const constructions = ctx.session.constructions as Constructions
		const {construction, level} = constructionFromCtx(ctx)
		const requiredResources = calcBuildingCost(construction, level)
		const currentResources = ctx.session.resources as Resources

		const minutes = calcMinutesNeeded(requiredResources, constructions, currentResources)
		return minutes > 0
	},
	doFunc: (ctx: any) => {
		const {construction, level} = constructionFromCtx(ctx)
		const requiredResources = calcBuildingCost(construction, level)
		const currentResources = ctx.session.resources as Resources

		ctx.session.resources = calcResourcesAfterConstruction(currentResources, requiredResources)
		ctx.session.constructions[construction] = level + 1
	}
})

menu.urlButton((ctx: any) => `ℹ️ ${ctx.wd.label('menu.wikidataItem')}`, (ctx: any) => {
	const {construction} = constructionFromCtx(ctx)
	const wdKey = `construction.${construction}`
	return ctx.wd.url(wdKey)
})

export default menu
