import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
	calcStorageCapacity,
	Constructions,
	EMOJI,
	ResourceName,
	Resources
} from 'bastion-siege-logic'

import {formatNumberShort} from '../lib/interface/format-number'
import {resources} from '../lib/interface/resource'
import {wikidataInfoHeader} from '../lib/interface/generals'

function buy(currentResources: Resources, resource: ResourceName, amount: number): Resources {
	const result: Resources = {...currentResources}
	result.gold -= amount * 2
	result[resource] += amount
	return result
}

async function tradeMenuText(ctx: any): Promise<string> {
	const currentResources = ctx.session.resources as Resources

	let text = ''
	text += wikidataInfoHeader(ctx.wd.r('action.buy'), {titlePrefix: EMOJI.trade})
	text += '\n\n'
	text += await resources(ctx, currentResources)
	return text
}

const menu = new TelegrafInlineMenu(tradeMenuText)

function resourceFromCtx(ctx: any): ResourceName {
	return ctx.match[1]
}

async function tradeResourceMenuText(ctx: any): Promise<string> {
	const resource = resourceFromCtx(ctx)
	const currentResources = ctx.session.resources as Resources
	const constructions = ctx.session.constructions as Constructions
	const storageCapacity = calcStorageCapacity(constructions.storage)

	let text = ''
	text += wikidataInfoHeader(ctx.wd.r(`resource.${resource}`), {titlePrefix: EMOJI[resource]})

	text += '\n\n'
	text += `${EMOJI.gold} ${await ctx.wd.label('resource.gold')} ${formatNumberShort(currentResources.gold, true)}${EMOJI.gold}\n`
	text += `${EMOJI[resource]} ${await ctx.wd.label(`resource.${resource}`)} ${formatNumberShort(currentResources[resource], true)}${EMOJI[resource]}\n`
	text += `${await ctx.wd.label('bs.storageCapacity')} ${formatNumberShort(storageCapacity, true)}${EMOJI[resource]}\n`
	text += '\n'
	text += `200${EMOJI.gold} / 100${EMOJI[resource]}\n`
	return text
}

const resourceMenu = new TelegrafInlineMenu(tradeResourceMenuText)

menu.selectSubmenu('', ['wood', 'stone', 'food'], resourceMenu, {
	textFunc: async (ctx: any, key) => `${EMOJI[key]} ${await ctx.wd.label(`resource.${key}`)}`
})

function buyOptions(ctx: any): string[] {
	const resource = resourceFromCtx(ctx)
	const currentResources = ctx.session.resources as Resources
	const constructions = ctx.session.constructions as Constructions
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

resourceMenu.select('buy', buyOptions, {
	columns: 3,
	textFunc: (ctx: any, key: string) => {
		const resource = resourceFromCtx(ctx)
		const numberText = formatNumberShort(Number(key), true)
		return `${numberText}${EMOJI[resource]}`
	},
	setFunc: (ctx: any, key: string) => {
		const resource = resourceFromCtx(ctx)
		const currentResources = ctx.session.resources as Resources
		ctx.session.resources = buy(currentResources, resource, Number(key))
	}
})

resourceMenu.urlButton(async (ctx: any) => `ℹ️ ${await ctx.wd.label('menu.wikidataItem')}`, (ctx: any) => {
	const resource = resourceFromCtx(ctx)
	const wdKey = `resource.${resource}`
	return ctx.wd.url(wdKey)
})

export default menu
