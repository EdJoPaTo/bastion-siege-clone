import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {Context, backButtons} from '../lib/context'

import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

/* eslint @typescript-eslint/no-var-requires: warn */
/* eslint @typescript-eslint/no-require-imports: warn */
const localeEmoji = require('locale-emoji')

export const menu = new MenuTemplate<Context>(languageMenuBody)

function flagString(languageCode: string, useFallbackFlag = false): string {
	const flag = localeEmoji(languageCode)
	if (!flag && useFallbackFlag) {
		return outEmoji.language
	}

	return flag
}

function languageMenuBody(ctx: Context): Body {
	const flag = flagString(ctx.wd.locale(), true)
	const text = wikidataInfoHeader(ctx.wd.r('menu.language'), {titlePrefix: flag})
	return {text, parse_mode: 'Markdown'}
}

menu.select('lang', ctx => ctx.wd.availableLocales(), {
	columns: 3,
	buttonText: (_, key) => {
		const flag = flagString(key)
		return `${flag} ${key}`
	},
	isSet: (ctx, key) => key === ctx.wd.locale(),
	set: (ctx, key) => {
		ctx.i18n.locale(key)
		ctx.wd.locale(key)
	},
	getCurrentPage: ctx => ctx.session.page,
	setPage: (ctx, page) => {
		ctx.session.page = page
	}
})

menu.manualRow(backButtons)
