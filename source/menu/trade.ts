import {MenuTemplate, Body} from 'telegraf-inline-menu'
import {
	calcStorageCapacity,
	EMOJI,
	ResourceName,
	Resources
} from 'bastion-siege-logic'

import {Context, backButtons} from '../lib/context'

import {formatNumberShort} from '../lib/interface/format-number'
import {resources} from '../lib/interface/resource'
import {wikidataInfoHeader} from '../lib/interface/generals'

function buy(currentResources: Resources, resource: ResourceName, amount: number): Resources {
	const result = {...currentResources}
	result.gold -= amount * 2
	result[resource] += amount
	return result
}

function tradeMenuBody(ctx: Context): Body {
	let text = ''
	text += wikidataInfoHeader(ctx.wd.r('action.buy'), {titlePrefix: EMOJI.trade})
	text += '\n\n'
	text += resources(ctx, ctx.session.resources)
	return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate(tradeMenuBody)

function resourceFromCtx(ctx: Context): ResourceName {
	return ctx.match![1] as ResourceName
}

function tradeResourceMenuBody(ctx: Context): Body {
	const resource = resourceFromCtx(ctx)
	const currentResources = ctx.session.resources
	const {constructions} = ctx.session
	const storageCapacity = calcStorageCapacity(constructions.storage)

	let text = ''
	text += wikidataInfoHeader(ctx.wd.r(`resource.${resource}`), {titlePrefix: EMOJI[resource]})

	text += '\n\n'
	text += `${EMOJI.gold} ${ctx.wd.r('resource.gold').label()} ${formatNumberShort(currentResources.gold, true)}${EMOJI.gold}\n`
	text += `${EMOJI[resource]} ${ctx.wd.r(`resource.${resource}`).label()} ${formatNumberShort(currentResources[resource], true)}${EMOJI[resource]}\n`
	text += `${ctx.wd.r('bs.storageCapacity').label()} ${formatNumberShort(storageCapacity, true)}${EMOJI[resource]}\n`
	text += '\n'
	text += `200${EMOJI.gold} / 100${EMOJI[resource]}\n`
	return {text, parse_mode: 'Markdown'}
}

const resourceMenu = new MenuTemplate(tradeResourceMenuBody)

menu.chooseIntoSubmenu('', ['wood', 'stone', 'food'], resourceMenu, {
	buttonText: (ctx, key) => `${EMOJI[key as ResourceName]} ${ctx.wd.r(`resource.${key}`).label()}`
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
		.map(o => String(o))
}

resourceMenu.choose('buy', buyOptions, {
	columns: 3,
	buttonText: (ctx, key) => {
		const resource = resourceFromCtx(ctx)
		const numberText = formatNumberShort(Number(key), true)
		return `${numberText}${EMOJI[resource]}`
	},
	do: (ctx, key) => {
		const resource = resourceFromCtx(ctx)
		const currentResources = ctx.session.resources
		ctx.session.resources = buy(currentResources, resource, Number(key))
		return '.'
	}
})

resourceMenu.url(ctx => `ℹ️ ${ctx.wd.r('menu.wikidataItem').label()}`, ctx => {
	const resource = resourceFromCtx(ctx)
	const wdKey = `resource.${resource}`
	return ctx.wd.r(wdKey).url()
})

resourceMenu.manualRow(backButtons)
