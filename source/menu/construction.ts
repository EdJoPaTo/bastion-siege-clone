import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
	calcBuildingCost,
	calcGoldIncome,
	calcMinutesNeeded,
	calcProduction,
	calcProductionFood,
	calcResourcesAfterConstruction,
	ConstructionName,
	Constructions,
	EMOJI,
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

function incomeString(ctx: any, income: number, emoji: string) {
	return `${ctx.wd.label('action.income')} ${income} ${emoji} / ${ctx.wd.label('bs.day')}`
}

function constructionText(ctx: any): string {
	const constructions = ctx.session.constructions as Constructions
	const {construction, level} = constructionFromCtx(ctx)

	const requiredResources = calcBuildingCost(construction, level)
	const currentResources = ctx.session.resources as Resources

	const textParts = []
	textParts.push(infoHeader(ctx, construction, level))

	if (construction === 'townhall') {
		textParts.push(incomeString(ctx, calcGoldIncome(level, constructions.houses), EMOJI.gold))
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
