import {EMOJI} from 'bastion-siege-logic'
import TelegrafInlineMenu from 'telegraf-inline-menu'

import {Context} from '../lib/context'
import {formatNumberShort} from '../lib/interface/format-number'
import {getCurrentMystical} from '../mystics-attacking'
import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

function menuText(ctx: Context): string {
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

function menuPhoto(ctx: Context): string | undefined {
	const {qNumber} = getCurrentMystical()
	const reader = ctx.wd.r(qNumber)
	const images = reader.images(800)
	return images[0]
}

const menu = new TelegrafInlineMenu((ctx: any) => menuText(ctx), {
	photo: (ctx: any) => menuPhoto(ctx)
})

menu.urlButton((ctx: any) => `ℹ️ ${ctx.wd.r('menu.wikidataItem').label()} ${ctx.wd.r('menu.mystical').label()}`, (ctx: any) => ctx.wd.r('menu.mystical').url())

menu.urlButton((ctx: any) => {
	const {qNumber} = getCurrentMystical()
	return `ℹ️ ${ctx.wd.r('menu.wikidataItem').label()} ${ctx.wd.r(qNumber).label()}`
}, (ctx: any) => {
	const {qNumber} = getCurrentMystical()
	return ctx.wd.r(qNumber).url()
})

export default menu
