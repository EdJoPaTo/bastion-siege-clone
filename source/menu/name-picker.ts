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

function randomEntry<T>(possibilities: ReadonlyArray<T>): T {
	const rand = Math.floor(Math.random() * possibilities.length)
	return possibilities[rand]
}

menu.button((ctx: any) => ctx.session.createFirst || outEmoji.nameFallback, 'first', {
	doFunc: (ctx: any) => {
		const possible = getGivenNames()
		ctx.session.createFirst = randomEntry(possible)
	}
})

menu.button((ctx: any) => ctx.session.createLast || outEmoji.nameFallback, 'last', {
	joinLastRow: true,
	doFunc: (ctx: any) => {
		const possible = getFamilyNames()
		ctx.session.createLast = randomEntry(possible)
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
