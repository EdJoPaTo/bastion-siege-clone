import {EMOJI} from 'bastion-siege-logic'
import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {Context, backButtons} from '../lib/context'
import {formatNumberShort} from '../lib/interface/format-number'
import {getCurrentMystical} from '../mystics-attacking'
import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

function menuBody(ctx: Context): Body {
	const {qNumber, current, max, gold} = getCurrentMystical()
	const reader = ctx.wd.r(qNumber)
	const images = reader.images(800)

	let text = ''
	text += wikidataInfoHeader(ctx.wd.r('menu.mystical'), {titlePrefix: EMOJI.dragon})
	text += '\n\n'
	text += wikidataInfoHeader(reader)
	text += '\n\n'

	text += Math.round(Math.max(1, current))
	text += outEmoji.health
	text += ' / '
	text += Math.round(max)
	text += outEmoji.health

	text += '\n'
	text += formatNumberShort(gold, true)
	text += EMOJI.gold

	return {text, parse_mode: 'Markdown', media: images[0], type: 'photo'}
}

export const menu = new MenuTemplate(menuBody)

menu.url(ctx => `ℹ️ ${ctx.wd.r('menu.wikidataItem').label()} ${ctx.wd.r('menu.mystical').label()}`, ctx => ctx.wd.r('menu.mystical').url())

menu.url(ctx => {
	const {qNumber} = getCurrentMystical()
	return `ℹ️ ${ctx.wd.r('menu.wikidataItem').label()} ${ctx.wd.r(qNumber).label()}`
}, ctx => {
	const {qNumber} = getCurrentMystical()
	return ctx.wd.r(qNumber).url()
})

menu.manualRow(backButtons)
