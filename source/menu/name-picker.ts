import randomItem from 'random-item'
import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {Context, backButtons} from '../lib/context'
import {getGivenNames, getFamilyNames} from '../lib/name-options'
import {outEmoji} from '../lib/interface/generals'

export function nameNeeded(ctx: Context): boolean {
	return !ctx.session.name
}

function menuBody(ctx: Context): Body {
	let text = ''

	text += outEmoji.name
	text += ' '
	text += '*'
	text += ctx.i18n.t('name.question')
	text += '*'

	return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate<Context>(menuBody)

menu.interact(ctx => ctx.session.createFirst ?? outEmoji.nameFallback, 'first', {
	do: ctx => {
		ctx.session.createFirst = randomItem(getGivenNames())
		return '.'
	}
})

menu.interact(ctx => ctx.session.createLast ?? outEmoji.nameFallback, 'last', {
	joinLastRow: true,
	do: ctx => {
		ctx.session.createLast = randomItem(getFamilyNames())
		return '.'
	}
})

menu.interact(ctx => `😍 ${ctx.i18n.t('name.take')}`, 'take', {
	hide: ctx => !ctx.session.createFirst || !ctx.session.createLast,
	do: ctx => {
		const {createFirst, createLast} = ctx.session
		ctx.session.name = {
			first: createFirst!,
			last: createLast!
		}

		delete ctx.session.createFirst
		delete ctx.session.createLast

		return '..'
	}
})

menu.manualRow(backButtons)
