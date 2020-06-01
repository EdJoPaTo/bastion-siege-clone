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

async function constructionMenuBody(ctx: Context, key: 'buildings' | 'workshop', entries: readonly ConstructionName[]): Promise<Body> {
	const wdKey = `bs.${key}`
	const currentResources = ctx.session.resources
	const {constructions} = ctx.session

	await ctx.wd.preload([wdKey, ...entries.map(o => `construction.${o}`)])

	let text = ''
	text += wikidataInfoHeader(await ctx.wd.reader(wdKey), {titlePrefix: EMOJI[key]})

	text += '\n\n'

	const constructionLines = await Promise.all(entries
		.map(async o => constructionLine(ctx, o, constructions[o], canUpgrade(constructions, o, currentResources)))
	)
	text += constructionLines.join('\n')

	return {text, parse_mode: 'Markdown'}
}

async function constructionButtonTextFunc(ctx: Context, key: string): Promise<string> {
	const wdKey = `construction.${key}`
	return `${EMOJI[key as ConstructionName]} ${(await ctx.wd.reader(wdKey)).label()}`
}

export const buildingsMenu = new MenuTemplate<Context>(async ctx => constructionMenuBody(ctx, 'buildings', BUILDINGS))

buildingsMenu.chooseIntoSubmenu('', BUILDINGS, entryMenu, {
	columns: 2,
	buttonText: constructionButtonTextFunc
})

buildingsMenu.manualRow(backButtons)

export const workshopMenu = new MenuTemplate<Context>(async ctx => constructionMenuBody(ctx, 'workshop', WORKSHOP))

workshopMenu.chooseIntoSubmenu('', WORKSHOP, entryMenu, {
	columns: 2,
	buttonText: constructionButtonTextFunc
})

workshopMenu.manualRow(backButtons)
