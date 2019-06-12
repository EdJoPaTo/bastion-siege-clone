import TelegrafInlineMenu from 'telegraf-inline-menu'

import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

/* eslint @typescript-eslint/no-var-requires: warn */
/* eslint @typescript-eslint/no-require-imports: warn */
const localeEmoji = require('locale-emoji')

const menu = new TelegrafInlineMenu(ctx => languageMenuText(ctx))

function flagString(languageCode: string, useFallbackFlag = false): string {
	const flag = localeEmoji(languageCode)
	if (!flag && useFallbackFlag) {
		return outEmoji.language
	}

	return flag
}

function languageMenuText(ctx: any): string {
	const flag = flagString(ctx.wd.locale(), true)
	const text = wikidataInfoHeader(ctx.wd.r('menu.language'), {titlePrefix: flag})
	return text
}

menu.select('lang', (ctx: any) => ctx.wd.wikidata.availableLocales((o: number) => o > 0.1), {
	columns: 3,
	textFunc: (_ctx, key) => {
		const flag = flagString(key)
		return `${flag} ${key}`
	},
	isSetFunc: (ctx: any, key) => key === ctx.wd.locale(),
	setFunc: (ctx: any, key) => {
		ctx.i18n.locale(key)
		ctx.wd.locale(key)
	},
	getCurrentPage: (ctx: any) => ctx.session.page,
	setPage: (ctx: any, page) => {
		ctx.session.page = page
	}
})

export default menu
