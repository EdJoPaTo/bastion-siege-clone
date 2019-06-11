import {EMOJI} from 'bastion-siege-logic'
import TelegrafInlineMenu from 'telegraf-inline-menu'
import WikidataEntityReader from 'wikidata-entity-reader'

import {formatNumberShort} from '../lib/interface/format-number'
import {getCurrentMystical} from '../mystics-attacking'
import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

async function menuText(ctx: any): Promise<string> {
	const {qNumber, current, max, gold} = getCurrentMystical()

	let text = ''
	text += wikidataInfoHeader(ctx.wd.r('menu.mystical'), {titlePrefix: EMOJI.dragon})
	text += '\n\n'
	text += wikidataInfoHeader(ctx.wd.r(qNumber))
	text += '\n\n'

	text += Math.round(Math.max(1, current))
	text += outEmoji.health
	text += ' / '
	text += Math.round(max)
	text += outEmoji.health

	text += '\n'
	text += formatNumberShort(gold, true)
	text += EMOJI.gold

	return text
}

function menuPhoto(ctx: any): string | undefined {
	const {qNumber} = getCurrentMystical()
	const reader = ctx.wd.r(qNumber) as WikidataEntityReader
	const images = reader.images(800)
	return images[0]
}

const menu = new TelegrafInlineMenu(menuText, {
	photo: menuPhoto
})

menu.urlButton(async (ctx: any) => `ℹ️ ${await ctx.wd.r('menu.wikidataItem').label()} ${await ctx.wd.r('menu.mystical').label()}`, (ctx: any) => ctx.wd.r('menu.mystical').url())

menu.urlButton(async (ctx: any) => {
	const {qNumber} = getCurrentMystical()
	return `ℹ️ ${await ctx.wd.r('menu.wikidataItem').label()} ${ctx.wd.r(qNumber).label()}`
}, async (ctx: any) => {
	const {qNumber} = getCurrentMystical()
	return ctx.wd.r(qNumber).url()
})

export default menu
