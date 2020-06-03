import {existsSync, readFileSync} from 'fs'

import {MenuMiddleware} from 'telegraf-inline-menu'
import {Telegraf} from 'telegraf'
import {TelegrafWikibase, resourceKeysFromYaml} from 'telegraf-wikibase'
import TelegrafI18n from 'telegraf-i18n'

import {buildCache as buildNameCache} from './lib/name-options'
import {Context} from './lib/context'
import * as attackingMystics from './mystics-attacking'
import * as ensureSessionContent from './lib/session-state-math'
import * as userSessions from './lib/user-sessions'
import * as wdSets from './lib/wikidata-sets'

import {menu} from './menu'

const tokenFilePath = existsSync('/run/secrets') ? '/run/secrets/bot-token.txt' : 'bot-token.txt'
const token = readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf<Context>(token)

bot.use(userSessions.middleware())
bot.use(ensureSessionContent.middleware())

const i18n = new TelegrafI18n({
	directory: 'locales',
	defaultLanguage: 'en',
	defaultLanguageOnMissing: true,
	useSession: true
})

bot.use(i18n.middleware())

const twb = new TelegrafWikibase(new Map(), {
	contextKey: 'wd'
})

const wikidataResourceKeyYaml = readFileSync('wikidata-items.yaml', 'utf8')
twb.addResourceKeys(resourceKeysFromYaml(wikidataResourceKeyYaml))

bot.use(twb.middleware())

bot.use(async (ctx, next) => {
	delete ctx.session.blocked
	return next()
})

attackingMystics.start(bot.telegram, twb)

const menuMiddleware = new MenuMiddleware('/', menu)
bot.command('start', async ctx => menuMiddleware.replyToContext(ctx))
bot.use(menuMiddleware.middleware())

bot.catch((error: any) => {
	console.error('telegraf error occured', error)
})

async function startup(): Promise<void> {
	console.time('preload wdSets')
	await wdSets.build()
	console.timeEnd('preload wdSets')

	await buildNameCache()

	await bot.telegram.setMyCommands([
		{command: 'start', description: 'show the menu'}
	])

	await bot.launch()
	console.log(new Date(), 'Bot started as', bot.options.username)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startup()
