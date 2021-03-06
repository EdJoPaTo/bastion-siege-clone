import {MenuTemplate, Body} from 'telegraf-inline-menu'
import {UNISEX} from 'wikidata-person-names'
import * as randomItem from 'random-item'

import {Context, Name} from '../../lib/context'
import {DAY, MINUTE} from '../../lib/unix-time'
import {formatNamePlain} from '../../lib/interface/name'
import {outEmoji} from '../../lib/interface/generals'

const CHANGE_EACH_SECONDS = DAY * 7

function getNextChange(name: Name | undefined): number {
	const lastChange = name?.lastChangeFirst ?? 0
	return lastChange + CHANGE_EACH_SECONDS
}

function canChangeFirstName(name: Name | undefined): boolean {
	const now = Date.now() / 1000
	const nextChange = getNextChange(name)
	return now > nextChange
}

async function menuBody(ctx: Context): Promise<Body> {
	let text = ''

	text += outEmoji.name
	text += ' '
	text += '*'
	text += ctx.i18n.t('name.question.first')
	text += '*'

	text += '\n\n'
	text += ctx.i18n.t('name.info.first').trim()

	if (ctx.session.name) {
		text += '\n\n'
		text += await ctx.wd.reader('menu.name').then(r => r.label())
		text += ': '
		text += formatNamePlain(ctx.session.name)
	}

	const now = Date.now() / 1000
	const nextChange = getNextChange(ctx.session.name)
	if (nextChange > now) {
		const remainingSeconds = nextChange - now
		const remainingMinutes = remainingSeconds / MINUTE

		text += '\n\n'
		text += await ctx.wd.reader('name.change').then(r => r.label())
		text += ': '
		text += remainingMinutes.toFixed(0)
		text += ' '
		text += await ctx.wd.reader('unit.minute').then(r => r.label())
	} else if (ctx.session.createFirst) {
		text += '\n\n'
		text += ctx.i18n.t('name.new.first')
		text += ': '
		text += ctx.session.createFirst
	}

	return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate<Context>(menuBody)

menu.interact(outEmoji.nameFallback, 'random', {
	hide: ctx => !canChangeFirstName(ctx.session.name),
	do: ctx => {
		ctx.session.createFirst = randomItem(UNISEX)
		return '.'
	}
})

menu.interact(ctx => `😍 ${ctx.i18n.t('name.take')}`, 'take', {
	hide: ctx => !ctx.session.createFirst || !canChangeFirstName(ctx.session.name),
	do: ctx => {
		const now = Date.now() / 1000
		ctx.session.name = {
			...(ctx.session.name ?? {}),
			first: ctx.session.createFirst!,
			lastChangeFirst: now
		}

		delete ctx.session.createFirst
		return '..'
	}
})

menu.interact(ctx => `😒 ${ctx.i18n.t('name.reject')}`, 'reject', {
	joinLastRow: true,
	hide: ctx => !ctx.session.name,
	do: ctx => {
		delete ctx.session.createLast
		return '..'
	}
})
