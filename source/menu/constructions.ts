import TelegrafInlineMenu from 'telegraf-inline-menu'
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

import {constructionLine} from '../lib/interface/construction'
import {wikidataInfoHeader} from '../lib/interface/generals'

import entryMenu from './construction'

function canUpgrade(constructions: Constructions, construction: ConstructionName, currentResources: Resources): boolean {
	const cost = calcBuildingCost(construction, constructions[construction])
	const minutesNeeded = calcMinutesNeeded(cost, constructions, currentResources)
	return minutesNeeded === 0
}

function constructionMenuText(ctx: any, key: 'buildings' | 'workshop', entries: readonly ConstructionName[]): string {
	const wdKey = `bs.${key}`
	const currentResources = ctx.session.resources as Resources
	const constructions = ctx.session.constructions as Constructions

	let text = ''
	text += wikidataInfoHeader(ctx.wd.r(wdKey), {titlePrefix: EMOJI[key]})

	text += '\n\n'

	text += entries
		.map(o => constructionLine(ctx, o, constructions[o], canUpgrade(constructions, o, currentResources)))
		.join('\n')

	return text
}

function constructionButtonTextFunc(ctx: any, key: string): string {
	const wdKey = `construction.${key}`
	return `${EMOJI[key as ConstructionName]} ${ctx.wd.r(wdKey).label()}`
}

export const buildingsMenu = new TelegrafInlineMenu(ctx => constructionMenuText(ctx, 'buildings', BUILDINGS))

buildingsMenu.selectSubmenu('', BUILDINGS, entryMenu, {
	columns: 2,
	textFunc: constructionButtonTextFunc
})

export const workshopMenu = new TelegrafInlineMenu(ctx => constructionMenuText(ctx, 'workshop', WORKSHOP))

workshopMenu.selectSubmenu('', WORKSHOP, entryMenu, {
	columns: 2,
	textFunc: constructionButtonTextFunc
})
