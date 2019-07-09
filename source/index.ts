import {existsSync, readFileSync} from 'fs'

import Telegraf from 'telegraf'
import TelegrafI18n from 'telegraf-i18n'
import TelegrafWikibase from 'telegraf-wikibase'
import WikidataEntityStore from 'wikidata-entity-store'

import * as attackingMystics from './mystics-attacking'
import * as ensureSessionContent from './lib/session-state-math'
import * as userSessions from './lib/user-sessions'
import * as wdSets from './lib/wikidata-sets'
import menu from './menu'

const tokenFilePath = existsSync('/run/secrets') ? '/run/secrets/bot-token.txt' : 'bot-token.txt'
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

console.time('preload wikidata entity store')
const wdEntityStore = new WikidataEntityStore({
	properties: ['labels', 'descriptions', 'claims']
})

bot.use(new TelegrafWikibase(wdEntityStore, {
	contextKey: 'wd'
}).middleware())

const wikidataResourceKeyYaml = readFileSync('wikidata-items.yaml', 'utf8')
wdEntityStore.addResourceKeyYaml(wikidataResourceKeyYaml)
	.then(() => console.timeLog('preload wikidata entity store', 'wikidata-middleware'))

wdSets.build(wdEntityStore)
	.then(() => console.timeLog('preload wikidata entity store', 'wikidata-sets'))

bot.use((ctx: any, next) => {
	delete ctx.session.blocked
	return next && next()
})

attackingMystics.start(bot.telegram, wdEntityStore)

bot.use(menu.init({
	backButtonText: (ctx: any) => `🔙 ${ctx.i18n.t('menu.back')}`,
	mainMenuButtonText: (ctx: any) => `🔝 ${ctx.wd.r('menu.menu').label()}`
}))

bot.catch((error: any) => {
	console.error('telegraf error occured', error)
})

bot.startPolling()
