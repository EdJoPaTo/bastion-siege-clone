import {MenuTemplate, Body} from 'telegraf-inline-menu'
import {
	calcStorageCapacity,
	EMOJI,
	ResourceName,
	Resources,
} from 'bastion-siege-logic'

import {Context, backButtons} from '../lib/context.js'

import {formatNumberShort} from '../lib/interface/format-number.js'
import {resources} from '../lib/interface/resource.js'
import {wikidataInfoHeader} from '../lib/interface/generals.js'

function buy(currentResources: Resources, resource: ResourceName, amount: number): Resources {
	const result = {...currentResources}
	result.gold -= amount * 2
	result[resource] += amount
	return result
}

async function tradeMenuBody(ctx: Context): Promise<Body> {
	let text = ''
	text += wikidataInfoHeader(await ctx.wd.reader('action.buy'), {titlePrefix: EMOJI.trade})
	text += '\n\n'
	text += await resources(ctx, ctx.session.resources)
	return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate(tradeMenuBody)

function resourceFromCtx(ctx: Context): ResourceName {
	return ctx.match![1] as ResourceName
}

async function tradeResourceMenuBody(ctx: Context): Promise<Body> {
	const resource = resourceFromCtx(ctx)
	const currentResources = ctx.session.resources
	const {constructions} = ctx.session
	const storageCapacity = calcStorageCapacity(constructions.storage)

	let text = ''
	text += wikidataInfoHeader(await ctx.wd.reader(`resource.${resource}`), {titlePrefix: EMOJI[resource]})

	text += '\n\n'
	text += `${EMOJI.gold} ${(await ctx.wd.reader('resource.gold')).label()} ${formatNumberShort(currentResources.gold, true)}${EMOJI.gold}\n`
	text += `${EMOJI[resource]} ${(await ctx.wd.reader(`resource.${resource}`)).label()} ${formatNumberShort(currentResources[resource], true)}${EMOJI[resource]}\n`
	text += `${(await ctx.wd.reader('bs.storageCapacity')).label()} ${formatNumberShort(storageCapacity, true)}${EMOJI[resource]}\n`
	text += '\n'
	text += `200${EMOJI.gold} / 100${EMOJI[resource]}\n`
	return {text, parse_mode: 'Markdown'}
}

const resourceMenu = new MenuTemplate(tradeResourceMenuBody)

menu.chooseIntoSubmenu('', ['wood', 'stone', 'food'], resourceMenu, {
	buttonText: async (ctx, key) => `${EMOJI[key as ResourceName]} ${(await ctx.wd.reader(`resource.${key}`)).label()}`,
})

menu.manualRow(backButtons)

function buyOptions(ctx: Context): string[] {
	const resource = resourceFromCtx(ctx)
	const currentResources = ctx.session.resources
	const {constructions} = ctx.session
	const storageCapacity = calcStorageCapacity(constructions.storage)

	const upperLimitResource = storageCapacity - currentResources[resource]
	const upperLimitGold = currentResources.gold / 2
	const upperLimitExact = Math.min(upperLimitResource, upperLimitGold)

	const exp = Math.floor(Math.log10(upperLimitExact))
	const magnitude = 10 ** exp

	const options = [1 / 40, 1 / 20, 1 / 10, 1 / 4, 1 / 2, 1, 2.5, 5]

	return options
		.map(o => o * magnitude)
		.filter(o => !(o < 100 || o > upperLimitExact))
		.slice(-6)
		.map(String)
}

resourceMenu.choose('buy', buyOptions, {
	columns: 3,
	buttonText(ctx, key) {
		const resource = resourceFromCtx(ctx)
		const numberText = formatNumberShort(Number(key), true)
		return `${numberText}${EMOJI[resource]}`
	},
	do(ctx, key) {
		const resource = resourceFromCtx(ctx)
		const currentResources = ctx.session.resources
		ctx.session.resources = buy(currentResources, resource, Number(key))
		return '.'
	},
})

resourceMenu.url(async ctx => `ℹ️ ${(await ctx.wd.reader('menu.wikidataItem')).label()}`, async ctx => {
	const resource = resourceFromCtx(ctx)
	const wdKey = `resource.${resource}`
	const reader = await ctx.wd.reader(wdKey)
	return reader.url()
})

resourceMenu.manualRow(backButtons)
