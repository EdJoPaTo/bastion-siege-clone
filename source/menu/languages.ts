import {type Body, MenuTemplate} from 'grammy-inline-menu'
// @ts-expect-error missing types
import localeEmoji from 'locale-emoji'

import {backButtons, type Context} from '../lib/context.js'

import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals.js'

export const menu = new MenuTemplate<Context>(languageMenuBody)

function flagString(languageCode: string): string | undefined {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	return localeEmoji(languageCode) as string | undefined
}

async function languageMenuBody(ctx: Context): Promise<Body> {
	const flag = flagString(ctx.wd.locale()) ?? outEmoji.language
	const text = wikidataInfoHeader(await ctx.wd.reader('menu.language'), {titlePrefix: flag})
	return {text, parse_mode: 'Markdown'}
}

menu.select('lang', async ctx => ctx.wd.availableLocales(), {
	columns: 3,
	buttonText(_, key) {
		const flag = flagString(key)
		return flag ? `${flag} ${key}` : key
	},
	isSet: (ctx, key) => key === ctx.wd.locale(),
	set(ctx, key) {
		ctx.i18n.locale(key)
		ctx.wd.locale(key)
		return true
	},
	getCurrentPage: ctx => ctx.session.page,
	setPage(ctx, page) {
		ctx.session.page = page
	},
})

menu.manualRow(backButtons)
