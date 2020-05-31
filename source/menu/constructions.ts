import {MenuTemplate, Body} from 'telegraf-inline-menu'
import {
	BUILDINGS,
	calcBuildingCost,
	calcMinutesNeeded,
	ConstructionName,
	Constructions,
	EMOJI,
	Resources,
	WORKSHOP
} from 'bastion-siege-logic'

import {Context, backButtons} from '../lib/context'

import {constructionLine} from '../lib/interface/construction'
import {wikidataInfoHeader} from '../lib/interface/generals'

import {menu as entryMenu} from './construction'

function canUpgrade(constructions: Constructions, construction: ConstructionName, currentResources: Resources): boolean {
	const cost = calcBuildingCost(construction, constructions[construction])
	const minutesNeeded = calcMinutesNeeded(cost, constructions, currentResources)
	return minutesNeeded === 0
}

function constructionMenuBody(ctx: Context, key: 'buildings' | 'workshop', entries: readonly ConstructionName[]): Body {
	const wdKey = `bs.${key}`
	const currentResources = ctx.session.resources
	const {constructions} = ctx.session

	let text = ''
	text += wikidataInfoHeader(ctx.wd.r(wdKey), {titlePrefix: EMOJI[key]})

	text += '\n\n'

	text += entries
		.map(o => constructionLine(ctx, o, constructions[o], canUpgrade(constructions, o, currentResources)))
		.join('\n')

	return {text, parse_mode: 'Markdown'}
}

function constructionButtonTextFunc(ctx: Context, key: string): string {
	const wdKey = `construction.${key}`
	return `${EMOJI[key as ConstructionName]} ${ctx.wd.r(wdKey).label()}`
}

export const buildingsMenu = new MenuTemplate<Context>(ctx => constructionMenuBody(ctx, 'buildings', BUILDINGS))

buildingsMenu.chooseIntoSubmenu('', BUILDINGS, entryMenu, {
	columns: 2,
	buttonText: (ctx, key) => constructionButtonTextFunc(ctx, key)
})

buildingsMenu.manualRow(backButtons)

export const workshopMenu = new MenuTemplate<Context>(ctx => constructionMenuBody(ctx, 'workshop', WORKSHOP))

workshopMenu.chooseIntoSubmenu('', WORKSHOP, entryMenu, {
	columns: 2,
	buttonText: (ctx, key) => constructionButtonTextFunc(ctx, key)
})

workshopMenu.manualRow(backButtons)
