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

import entryMenu from './construction'

function canUpgrade(constructions: Constructions, construction: ConstructionName, currentResources: Resources): boolean {
	const cost = calcBuildingCost(construction, constructions[construction])
	const minutesNeeded = calcMinutesNeeded(cost, constructions, currentResources)
	return minutesNeeded === 0
}

function constructionMenuText(ctx: any, key: string, entries: ConstructionName[]): string {
	const wdKey = `bs.${key}`
	const currentResources = ctx.session.resources as Resources
	const constructions = ctx.session.constructions as Constructions

	let text = ''
	text += `${EMOJI[key]} *${ctx.wd.label(wdKey)}*\n`

	text += '\n'

	text += entries
		.map(o => constructionLine(ctx, o, constructions[o], canUpgrade(constructions, o, currentResources)))
		.join('\n')

	return text
}

function constructionButtonTextFunc(ctx: any, key: string): string {
	const wdKey = `construction.${key}`
	return `${EMOJI[key]} ${ctx.wd.label(wdKey)}`
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
