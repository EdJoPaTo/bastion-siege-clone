import {MenuTemplate, Body} from 'telegraf-inline-menu'
import {
	calcBuildingCost,
	calcMinutesNeeded,
	calcResourcesAfterConstruction,
	ConstructionName
} from 'bastion-siege-logic'

import {Context, backButtons} from '../lib/context'

import {infoHeader, constructionPropertyString} from '../lib/interface/construction'
import {constructionResources} from '../lib/interface/resource'

export const menu = new MenuTemplate<Context>(constructionBody)

function constructionFromCtx(ctx: Context): {construction: ConstructionName; level: number} {
	const construction = ctx.match![1] as ConstructionName
	const {constructions} = ctx.session
	const level = constructions[construction]

	return {construction, level}
}

function constructionBody(ctx: Context): Body {
	const {constructions, people} = ctx.session
	const {construction, level} = constructionFromCtx(ctx)

	const requiredResources = calcBuildingCost(construction, level)
	const currentResources = ctx.session.resources

	const textParts = []
	textParts.push(infoHeader(ctx, construction, level))

	const properties = constructionPropertyString(ctx, constructions, people, construction)
	if (properties) {
		textParts.push(properties)
	}

	textParts.push(constructionResources(ctx, requiredResources, currentResources))
	const text = textParts.join('\n\n')

	return {text, parse_mode: 'Markdown'}
}

menu.interact(ctx => `⬆️ ${ctx.wd.r('action.upgrade').label()}`, 'upgrade', {
	hide: ctx => {
		const {constructions} = ctx.session
		const {construction, level} = constructionFromCtx(ctx)
		const requiredResources = calcBuildingCost(construction, level)
		const currentResources = ctx.session.resources

		const minutes = calcMinutesNeeded(requiredResources, constructions, currentResources)
		return minutes > 0
	},
	do: ctx => {
		const {construction, level} = constructionFromCtx(ctx)
		const requiredResources = calcBuildingCost(construction, level)
		const currentResources = ctx.session.resources

		ctx.session.resources = calcResourcesAfterConstruction(currentResources, requiredResources)
		const constructions = {...ctx.session.constructions}
		constructions[construction] = level + 1
		ctx.session.constructions = constructions

		return '.'
	}
})

menu.url(ctx => `ℹ️ ${ctx.wd.r('menu.wikidataItem').label()}`, ctx => {
	const {construction} = constructionFromCtx(ctx)
	const wdKey = `construction.${construction}`
	return ctx.wd.r(wdKey).url()
})

menu.manualRow(backButtons)
