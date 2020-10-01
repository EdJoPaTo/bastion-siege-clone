import {existsSync, readFileSync} from 'fs'

import {generateUpdateMiddleware} from 'telegraf-middleware-console-time'
import {MenuMiddleware} from 'telegraf-inline-menu'
import {Telegraf} from 'telegraf'
import {TelegrafWikibase, resourceKeysFromYaml} from 'telegraf-wikibase'
import TelegrafI18n from 'telegraf-i18n'

import {Context} from './lib/context'
import * as attackingMystics from './mystics-attacking'
import * as ensureSessionContent from './lib/session-state-math'
import * as userSessions from './lib/user-sessions'
import * as wdSets from './lib/wikidata-sets'

process.title = 'bs-clone-tgbot'

import {menu} from './menu'

const tokenFilePath = existsSync('/run/secrets') ? '/run/secrets/bot-token.txt' : 'bot-token.txt'
const token = readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf<Context>(token)

if (process.env.NODE_ENV !== 'production') {
	bot.use(generateUpdateMiddleware())
}

bot.use(userSessions.middleware())
bot.use(ensureSessionContent.middleware())

const i18n = new TelegrafI18n({
	directory: 'locales',
	defaultLanguage: 'en',
	defaultLanguageOnMissing: true,
	useSession: true
})

bot.use(i18n.middleware())

const twb = new TelegrafWikibase({
	contextKey: 'wd',
	logQueriedEntityIds: process.env.NODE_ENV !== 'production',
	userAgent: 'EdJoPaTo/bastion-siege-clone'
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
	await bot.telegram.setMyCommands([
		{command: 'start', description: 'show the menu'}
	])

	console.time('preload wdSets')
	await wdSets.build()
	console.timeEnd('preload wdSets')

	await twb.startRegularResourceKeyUpdate(error => {
		console.error('TelegrafWikibase', 'regular update failed', error)
	})

	await bot.launch()
	console.log(new Date(), 'Bot started as', bot.options.username)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startup()
