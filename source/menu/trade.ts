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
	const result = {...currentResources}
	result.gold -= amount * 2
	result[resource] += amount
	return result
}

function tradeMenuText(ctx: any): string {
	const currentResources = ctx.session.resources as Resources

	let text = ''
	text += wikidataInfoHeader(ctx.wd.r('action.buy'), {titlePrefix: EMOJI.trade})
	text += '\n\n'
	text += resources(ctx, currentResources)
	return text
}

const menu = new TelegrafInlineMenu(tradeMenuText)

function resourceFromCtx(ctx: any): ResourceName {
	return ctx.match[1]
}

function tradeResourceMenuText(ctx: any): string {
	const resource = resourceFromCtx(ctx)
	const currentResources = ctx.session.resources as Resources
	const constructions = ctx.session.constructions as Constructions
	const storageCapacity = calcStorageCapacity(constructions.storage)

	let text = ''
	text += wikidataInfoHeader(ctx.wd.r(`resource.${resource}`), {titlePrefix: EMOJI[resource]})

	text += '\n\n'
	text += `${EMOJI.gold} ${ctx.wd.r('resource.gold').label()} ${formatNumberShort(currentResources.gold, true)}${EMOJI.gold}\n`
	text += `${EMOJI[resource]} ${ctx.wd.r(`resource.${resource}`).label()} ${formatNumberShort(currentResources[resource], true)}${EMOJI[resource]}\n`
	text += `${ctx.wd.r('bs.storageCapacity').label()} ${formatNumberShort(storageCapacity, true)}${EMOJI[resource]}\n`
	text += '\n'
	text += `200${EMOJI.gold} / 100${EMOJI[resource]}\n`
	return text
}

const resourceMenu = new TelegrafInlineMenu(tradeResourceMenuText)

menu.selectSubmenu('', ['wood', 'stone', 'food'], resourceMenu, {
	textFunc: (ctx: any, key) => `${EMOJI[key as ResourceName]} ${ctx.wd.r(`resource.${key}`).label()}`
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

resourceMenu.urlButton((ctx: any) => `ℹ️ ${ctx.wd.r('menu.wikidataItem').label()}`, (ctx: any) => {
	const resource = resourceFromCtx(ctx)
	const wdKey = `resource.${resource}`
	return ctx.wd.r(wdKey).url()
})

export default menu
