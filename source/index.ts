import {existsSync, readFileSync} from 'node:fs'
import * as process from 'node:process'

import {generateUpdateMiddleware} from 'telegraf-middleware-console-time'
import {MenuMiddleware} from 'telegraf-inline-menu'
import {Telegraf} from 'telegraf'
import {resourceKeysFromYaml, TelegrafWikibase} from 'telegraf-wikibase'
import {I18n} from '@grammyjs/i18n'

import * as ensureSessionContent from './lib/session-state-math.js'
import * as userSessions from './lib/user-sessions.js'
import * as wdSets from './lib/wikidata-sets.js'
import type {Context} from './lib/context.js'

import {menu} from './menu/index.js'

(process as any).title = 'bs-clone-tgbot'

const token = (existsSync('/run/secrets/bot-token.txt') && readFileSync('/run/secrets/bot-token.txt', 'utf8').trim())
	|| (existsSync('bot-token.txt') && readFileSync('bot-token.txt', 'utf8').trim())
	|| process.env['BOT_TOKEN']
if (!token) {
	throw new Error(
		'You have to provide the bot-token from @BotFather via file (bot-token.txt) or environment variable (BOT_TOKEN)',
	)
}

const bot = new Telegraf<Context>(token)

if (process.env['NODE_ENV'] !== 'production') {
	bot.use(generateUpdateMiddleware())
}

bot.use(userSessions.middleware())
bot.use(ensureSessionContent.middleware())

const i18n = new I18n({
	directory: 'locales',
	defaultLanguage: 'en',
	defaultLanguageOnMissing: true,
	useSession: true,
})

bot.use(i18n.middleware())

const twb = new TelegrafWikibase({
	contextKey: 'wd',
	logQueriedEntityIds: process.env['NODE_ENV'] !== 'production',
	userAgent: 'EdJoPaTo/bastion-siege-clone',
})

const wikidataResourceKeyYaml = readFileSync('wikidata-items.yaml', 'utf8')
twb.addResourceKeys(resourceKeysFromYaml(wikidataResourceKeyYaml))

bot.use(twb.middleware())

bot.use(async (ctx, next) => {
	delete ctx.session.blocked
	return next()
})

const menuMiddleware = new MenuMiddleware('/', menu)
bot.command('start', async ctx => menuMiddleware.replyToContext(ctx))
bot.use(menuMiddleware.middleware())

bot.catch((error: any) => {
	console.error('telegraf error occured', error)
})

async function startup(): Promise<void> {
	await bot.telegram.setMyCommands([
		{command: 'start', description: 'show the menu'},
	])

	console.time('preload wdSets')
	await wdSets.build()
	console.timeEnd('preload wdSets')

	await twb.startRegularResourceKeyUpdate(error => {
		console.error('TelegrafWikibase', 'regular update failed', error)
	})

	await bot.launch()
	console.log(new Date(), 'Bot started as', bot.botInfo?.username)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startup()
