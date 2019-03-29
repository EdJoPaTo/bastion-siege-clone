import TelegrafInlineMenu from 'telegraf-inline-menu'

import {getGivenNames, getFamilyNames} from '../lib/name-options'

const FALLBACK = '🔮'

export function nameNeeded(ctx: any): boolean {
	return !ctx.session.name
}

async function menuText(ctx: any): Promise<string> {
	let text = ''

	text += '*'
	text += ctx.i18n.t('name.question')
	text += '*'

	text += '\n\n'

	text += ctx.i18n.t('name.want')

	return text
}

export const menu = new TelegrafInlineMenu(menuText)

function randomEntry<T>(possibilities: ReadonlyArray<T>): T {
	const rand = Math.floor(Math.random() * possibilities.length)
	return possibilities[rand]
}

menu.button((ctx: any) => ctx.session.createFirst || FALLBACK, 'first', {
	doFunc: (ctx: any) => {
		const possible = getGivenNames()
		ctx.session.createFirst = randomEntry(possible)
	}
})

menu.button((ctx: any) => ctx.session.createLast || FALLBACK, 'last', {
	joinLastRow: true,
	doFunc: (ctx: any) => {
		const possible = getFamilyNames()
		ctx.session.createLast = randomEntry(possible)
	}
})

menu.button((ctx: any) => ctx.i18n.t('name.take'), 'take', {
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
