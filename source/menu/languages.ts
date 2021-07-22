import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {Context, backButtons} from '../lib/context'

import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const localeEmoji = require('locale-emoji')

export const menu = new MenuTemplate<Context>(languageMenuBody)

function flagString(languageCode: string, useFallbackFlag = false): string {
	const flag = localeEmoji(languageCode)
	if (!flag && useFallbackFlag) {
		return outEmoji.language
	}

	return flag
}

async function languageMenuBody(ctx: Context): Promise<Body> {
	const flag = flagString(ctx.wd.locale(), true)
	const text = wikidataInfoHeader(await ctx.wd.reader('menu.language'), {titlePrefix: flag})
	return {text, parse_mode: 'Markdown'}
}

menu.select('lang', async ctx => ctx.wd.availableLocales(), {
	columns: 3,
	buttonText: (_, key) => {
		const flag = flagString(key)
		return `${flag} ${key}`
	},
	isSet: (ctx, key) => key === ctx.wd.locale(),
	set: (ctx, key) => {
		ctx.i18n.locale(key)
		ctx.wd.locale(key)
		return true
	},
	getCurrentPage: ctx => ctx.session.page,
	setPage: (ctx, page) => {
		ctx.session.page = page
	},
})

menu.manualRow(backButtons)
