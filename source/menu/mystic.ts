import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
	EMOJI
} from 'bastion-siege-logic'

import {formatNumberShort} from '../lib/interface/format-number'
import {getCurrentMystical} from '../mystics-attacking'
import {outEmoji, wikidataInfoHeaderFromContext} from '../lib/interface/generals'
import {WikidataItemReader} from '../lib/wikidata-item-reader'

async function menuText(ctx: any): Promise<string> {
	const {qNumber, current, max, gold} = getCurrentMystical()

	let text = ''
	text += await wikidataInfoHeaderFromContext(ctx, 'menu.mystical', {titlePrefix: EMOJI.dragon})
	text += '\n\n'
	text += await wikidataInfoHeaderFromContext(ctx, qNumber)
	text += '\n\n'

	text += Math.round(current)
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
	const reader = ctx.wd.r(qNumber) as WikidataItemReader
	const images = reader.images(800)
	return images[0]
}

const menu = new TelegrafInlineMenu(menuText, {
	photo: menuPhoto
})

menu.urlButton(async (ctx: any) => `ℹ️ ${await ctx.wd.label('menu.wikidataItem')} ${await ctx.wd.label('menu.mystical')}`, (ctx: any) => ctx.wd.url('menu.mystical'))

menu.urlButton(async (ctx: any) => {
	const {qNumber} = getCurrentMystical()
	return `ℹ️ ${await ctx.wd.label('menu.wikidataItem')} ${ctx.wd.label(qNumber)}`
}, async (ctx: any) => {
	const {qNumber} = getCurrentMystical()
	return ctx.wd.url(qNumber)
})

export default menu
