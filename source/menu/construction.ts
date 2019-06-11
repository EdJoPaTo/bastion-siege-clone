import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
	calcBuildingCost,
	calcMinutesNeeded,
	calcResourcesAfterConstruction,
	ConstructionName,
	Constructions,
	Resources
} from 'bastion-siege-logic'

import {PeopleInConstructions} from '../types'

import {infoHeader, constructionPropertyString} from '../lib/interface/construction'
import {constructionResources} from '../lib/interface/resource'

const menu = new TelegrafInlineMenu(constructionText)

function constructionFromCtx(ctx: any): {construction: ConstructionName; level: number} {
	const construction: ConstructionName = ctx.match[1]
	const constructions = ctx.session.constructions as Constructions
	const level = constructions[construction]

	return {construction, level}
}

function constructionText(ctx: any): string {
	const constructions = ctx.session.constructions as Constructions
	const people = ctx.session.people as PeopleInConstructions
	const {construction, level} = constructionFromCtx(ctx)

	const requiredResources = calcBuildingCost(construction, level)
	const currentResources = ctx.session.resources as Resources

	const textParts = []
	textParts.push(infoHeader(ctx, construction, level))

	const properties = constructionPropertyString(ctx, constructions, people, construction)
	if (properties) {
		textParts.push(properties)
	}

	textParts.push(constructionResources(ctx, requiredResources, currentResources))

	return textParts.join('\n\n')
}

menu.button((ctx: any) => `⬆️ ${ctx.wd.r('action.upgrade').label()}`, 'upgrade', {
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

menu.urlButton((ctx: any) => `ℹ️ ${ctx.wd.r('menu.wikidataItem').label()}`, (ctx: any) => {
	const {construction} = constructionFromCtx(ctx)
	const wdKey = `construction.${construction}`
	return ctx.wd.r(wdKey).url()
})

export default menu
