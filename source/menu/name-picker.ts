import randomItem from 'random-item'
import TelegrafInlineMenu from 'telegraf-inline-menu'

import {getGivenNames, getFamilyNames} from '../lib/name-options'
import {outEmoji} from '../lib/interface/generals'

export function nameNeeded(ctx: any): boolean {
	return !ctx.session.name
}

async function menuText(ctx: any): Promise<string> {
	let text = ''

	text += outEmoji.name
	text += ' '
	text += '*'
	text += ctx.i18n.t('name.question')
	text += '*'

	return text
}

export const menu = new TelegrafInlineMenu(menuText)

menu.button((ctx: any) => ctx.session.createFirst || outEmoji.nameFallback, 'first', {
	doFunc: (ctx: any) => {
		ctx.session.createFirst = randomItem(getGivenNames())
	}
})

menu.button((ctx: any) => ctx.session.createLast || outEmoji.nameFallback, 'last', {
	joinLastRow: true,
	doFunc: (ctx: any) => {
		ctx.session.createLast = randomItem(getFamilyNames())
	}
})

menu.button((ctx: any) => `😍 ${ctx.i18n.t('name.take')}`, 'take', {
	setParentMenuAfter: true,
	hide: (ctx: any) => !ctx.session.createFirst || !ctx.session.createLast,
	doFunc: (ctx: any) => {
		const {createFirst, createLast} = ctx.session
		ctx.session.name = {
			first: createFirst,
			last: createLast
		}

		delete ctx.session.createFirst
		delete ctx.session.createLast
	}
})
