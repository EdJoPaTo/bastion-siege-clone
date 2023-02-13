import {type Body, MenuTemplate} from 'grammy-inline-menu'
import {
	BUILDINGS,
	calcBuildingCost,
	calcMinutesNeeded,
	type ConstructionName,
	type Constructions,
	EMOJI,
	type Resources,
	WORKSHOP,
} from 'bastion-siege-logic'

import {backButtons, type Context} from '../lib/context.js'

import {constructionLine} from '../lib/interface/construction.js'
import {wikidataInfoHeader} from '../lib/interface/generals.js'

import {menu as entryMenu} from './construction.js'

function canUpgrade(
	constructions: Constructions,
	construction: ConstructionName,
	currentResources: Resources,
): boolean {
	const cost = calcBuildingCost(construction, constructions[construction])
	const minutesNeeded = calcMinutesNeeded(cost, constructions, currentResources)
	return minutesNeeded === 0
}

async function constructionMenuBody(
	ctx: Context,
	key: 'buildings' | 'workshop',
	entries: readonly ConstructionName[],
): Promise<Body> {
	const wdKey = `bs.${key}`
	const currentResources = ctx.session.resources
	const {constructions} = ctx.session

	let text = ''
	text += wikidataInfoHeader(await ctx.wd.reader(wdKey), {titlePrefix: EMOJI[key]})

	text += '\n\n'

	const constructionLines = await Promise.all(entries
		.map(async o => constructionLine(ctx, o, constructions[o], canUpgrade(constructions, o, currentResources))),
	)
	text += constructionLines.join('\n')

	return {text, parse_mode: 'Markdown'}
}

async function constructionButtonTextFunc(
	ctx: Context,
	key: string,
): Promise<string> {
	const wdKey = `construction.${key}`
	return `${EMOJI[key as ConstructionName]} ${(await ctx.wd.reader(wdKey)).label()}`
}

export const buildingsMenu = new MenuTemplate<Context>(async ctx => constructionMenuBody(ctx, 'buildings', BUILDINGS))

buildingsMenu.chooseIntoSubmenu('', BUILDINGS, entryMenu, {
	columns: 2,
	buttonText: constructionButtonTextFunc,
})

buildingsMenu.manualRow(backButtons)

export const workshopMenu = new MenuTemplate<Context>(async ctx => constructionMenuBody(ctx, 'workshop', WORKSHOP))

workshopMenu.chooseIntoSubmenu('', WORKSHOP, entryMenu, {
	columns: 2,
	buttonText: constructionButtonTextFunc,
})

workshopMenu.manualRow(backButtons)
