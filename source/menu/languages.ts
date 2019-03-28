import TelegrafInlineMenu from 'telegraf-inline-menu'

import {countryEmojisOfLanguage} from '../lib/interface/language-code-emojis'

const menu = new TelegrafInlineMenu(ctx => languageText(ctx, true))

async function flagsString(languageCode: string): Promise<string> {
	const flags = await countryEmojisOfLanguage(languageCode)
	if (flags.length === 0) {
		return '🏳️‍🌈'
	}

	return flags.join('')
}

async function languageText(ctx: any, markdown = false): Promise<string> {
	const flags = await flagsString(ctx.wd.locale())
	const text = ctx.wd.label('menu.language')

	if (markdown) {
		return `${flags} *${text}*`
	}

	return `${flags} ${text}`
}

menu.select('lang', (ctx: any) => ctx.wd.wikidata.availableLocales((o: number) => o > 0.5), {
	columns: 3,
	textFunc: async (_ctx, key) => {
		const flags = await countryEmojisOfLanguage(key)
		return `${flags.join('')} ${key}`
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
