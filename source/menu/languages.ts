import TelegrafInlineMenu from 'telegraf-inline-menu'

import {countryEmojisOfLanguage} from '../lib/interface/language-code-emojis'
import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

const menu = new TelegrafInlineMenu(ctx => languageMenuText(ctx))

async function flagsString(languageCode: string, fallbackFlag: boolean): Promise<string> {
	const flags = await countryEmojisOfLanguage(languageCode)
	if (flags.length === 0 && fallbackFlag) {
		return outEmoji.language
	}

	return flags.join('')
}

async function languageMenuText(ctx: any): Promise<string> {
	const flags = await flagsString(ctx.wd.locale(), true)
	const text = wikidataInfoHeader(ctx.wd.r('menu.language'), {titlePrefix: flags})
	return text
}

menu.select('lang', (ctx: any) => ctx.wd.wikidata.availableLocales((o: number) => o > 0.1), {
	columns: 3,
	textFunc: async (_ctx, key) => {
		const flags = await flagsString(key, false)
		return `${flags} ${key}`
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
