import {readFileSync} from 'fs'

import Telegraf from 'telegraf'
import TelegrafI18n from 'telegraf-i18n'

import * as attackingMystics from './mystics-attacking'
import * as ensureSessionContent from './lib/session-state-math'
import * as userSessions from './lib/user-sessions'
import menu from './menu'
import WikidataItemStore from './lib/wikidata-item-store'
import WikidataLabel from './lib/wikidata-label-middleware'

const tokenFilePath = process.env.NODE_ENV === 'production' ? process.env.npm_package_config_tokenpath as string : 'token.txt'
const token = readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf(token)

bot.use(userSessions.middleware())
bot.use(ensureSessionContent.middleware())

const i18n = new TelegrafI18n({
	directory: 'locales',
	defaultLanguage: 'en',
	defaultLanguageOnMissing: true,
	useSession: true
})

bot.use(i18n.middleware())

const wdItemStore = new WikidataItemStore('labels', 'descriptions', 'claims')
const wdLabel = new WikidataLabel(wdItemStore, 'wikidata-items.yaml')
wdLabel.load()
bot.use(wdLabel.middleware())

attackingMystics.start(bot.telegram, wdItemStore)

bot.use(menu.init({
	backButtonText: (ctx: any) => `🔙 ${ctx.i18n.t('menu.back')}`,
	mainMenuButtonText: (ctx: any) => `🔝 ${ctx.wd.label('menu.menu')}`
}))

bot.catch((error: any) => {
	console.error('telegraf error occured', error)
})

bot.startPolling()
