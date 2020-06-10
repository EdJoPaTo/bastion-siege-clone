import {MenuTemplate, Body} from 'telegraf-inline-menu'
import arrayFilterUnique from 'array-filter-unique'
import randomItem from 'random-item'

import {Context} from '../../lib/context'
import {formatNamePlain} from '../../lib/interface/name'
import {getFamilyNames} from '../../lib/name-options'
import {getRaw} from '../../lib/user-sessions'
import {HOUR, MINUTE} from '../../lib/unix-time'
import {outEmoji} from '../../lib/interface/generals'

const CHANGE_EACH_SECONDS = HOUR * 22

function getNextChange(ctx: Context): number {
	const lastChange = ctx.session.name?.lastChangeLast ?? 0
	return lastChange + CHANGE_EACH_SECONDS
}

function canGetNewLastName(ctx: Context): boolean {
	if (!ctx.session.name) {
		return false
	}

	if (ctx.session.name.last) {
		return false
	}

	const now = Date.now() / 1000
	const nextChange = getNextChange(ctx)
	if (nextChange > now) {
		return false
	}

	return true
}

function canRemoveLastName(ctx: Context): boolean {
	if (!ctx.session.name?.last) {
		return false
	}

	const now = Date.now() / 1000
	const nextChange = getNextChange(ctx)
	if (nextChange > now) {
		return false
	}

	return true
}

async function menuBody(ctx: Context): Promise<Body> {
	let text = ''

	text += outEmoji.name
	text += ' '
	text += '*'
	text += ctx.i18n.t('name.question.last')
	text += '*'

	text += '\n\n'
	text += ctx.i18n.t('name.info.last').trim()

	if (ctx.session.name) {
		text += '\n\n'
		text += await ctx.wd.reader('menu.name').then(r => r.label())
		text += ': '
		text += formatNamePlain(ctx.session.name)
	}

	const now = Date.now() / 1000
	const nextChange = getNextChange(ctx)
	if (nextChange > now) {
		const remainingSeconds = nextChange - now
		const remainingMinutes = remainingSeconds / MINUTE

		text += '\n\n'
		text += await ctx.wd.reader('name.change').then(r => r.label())
		text += ': '
		text += remainingMinutes.toFixed(0)
		text += ' '
		text += await ctx.wd.reader('unit.minute').then(r => r.label())
	} else if (ctx.session.createLast) {
		text += '\n\n'
		text += ctx.i18n.t('name.new.last')
		text += ': '
		text += ctx.session.createLast
	}

	return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate<Context>(menuBody)

menu.interact(outEmoji.nameFallback, 'random', {
	hide: ctx => !canGetNewLastName(ctx),
	do: ctx => {
		ctx.session.createLast = randomItem(getFamilyNames())
		return '.'
	}
})

menu.choose('existing', getExistingFamilies, {
	columns: 2,
	maxRows: 3,
	hide: ctx => !canGetNewLastName(ctx),
	getCurrentPage: ctx => ctx.session.page,
	setPage: (ctx, page) => {
		ctx.session.page = page
	},
	do: (ctx, key) => {
		ctx.session.createLast = key
		return '.'
	}
})

menu.interact(ctx => `😍 ${ctx.i18n.t('name.take')}`, 'take', {
	hide: ctx => !ctx.session.createLast || !canGetNewLastName(ctx),
	do: ctx => {
		const now = Date.now() / 1000
		ctx.session.name = {
			...ctx.session.name!,
			last: ctx.session.createLast!,
			lastChangeLast: now
		}

		delete ctx.session.createLast
		return '..'
	}
})

menu.interact(async ctx => `🎭 ${await ctx.wd.reader('name.loseLastName').then(r => r.label())}`, 'looseLastName', {
	joinLastRow: true,
	hide: ctx => !canRemoveLastName(ctx),
	do: ctx => {
		const now = Date.now() / 1000
		ctx.session.name = {
			...ctx.session.name!,
			last: undefined,
			lastChangeLast: now
		}

		delete ctx.session.createLast
		return '..'
	}
})

menu.interact(ctx => `😒 ${ctx.i18n.t('name.reject')}`, 'reject', {
	joinLastRow: true,
	do: ctx => {
		delete ctx.session.createLast
		return '..'
	}
})

function getExistingFamilies(ctx: Context): string[] {
	const currentLastName = ctx.session.name?.last
	const all = getRaw()
	const lastNames = all
		.map(o => o.data.name?.last)
		.filter(o => o !== currentLastName)
		.filter((o): o is string => typeof o === 'string')
		.filter(arrayFilterUnique())
		.sort((a, b) => a.localeCompare(b, ctx.wd.locale()))
	return lastNames
}
