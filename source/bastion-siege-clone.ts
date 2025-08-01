import {readFileSync} from 'node:fs';
import {env} from 'node:process';
import {Bot} from 'grammy';
import {MenuMiddleware} from 'grammy-inline-menu';
import {generateUpdateMiddleware} from 'telegraf-middleware-console-time';
import {resourceKeysFromYaml, TelegrafWikibase} from 'telegraf-wikibase';
import type {Context} from './lib/context.ts';
import * as ensureSessionContent from './lib/session-state-math.ts';
import * as userSessions from './lib/user-sessions.ts';
import * as wdSets from './lib/wikidata-sets.ts';
import {menu} from './menu/index.ts';
import {i18n} from './translation.ts';

const token = env['BOT_TOKEN'];
if (!token) {
	throw new Error('You have to provide the bot-token from @BotFather via environment variable (BOT_TOKEN)');
}

const baseBot = new Bot<Context>(token);

if (env['NODE_ENV'] !== 'production') {
	baseBot.use(generateUpdateMiddleware());
}

const bot = baseBot.errorBoundary(async ({error}) => {
	console.error('grammy ERROR occured', error);
});

bot.use(userSessions.middleware);
bot.use(ensureSessionContent.middleware());

bot.use(i18n.middleware());

const twb = new TelegrafWikibase({
	contextKey: 'wd',
	logQueriedEntityIds: env['NODE_ENV'] !== 'production',
	userAgent: 'EdJoPaTo/bastion-siege-clone',
});

const wikidataResourceKeyYaml = readFileSync('wikidata-items.yaml', 'utf8');
twb.addResourceKeys(resourceKeysFromYaml(wikidataResourceKeyYaml));

bot.use(twb.middleware());

bot.use(async (ctx, next) => {
	delete ctx.session.blocked;
	return next();
});

const menuMiddleware = new MenuMiddleware('/', menu);
bot.command('start', async ctx => menuMiddleware.replyToContext(ctx));
bot.use(menuMiddleware.middleware());

await baseBot.api.setMyCommands([
	{command: 'start', description: 'show the menu'},
]);

console.time('preload wdSets');
await wdSets.build();
console.timeEnd('preload wdSets');

await twb.startRegularResourceKeyUpdate(error => {
	console.error('TelegrafWikibase', 'regular update failed', error);
});

await baseBot.start({
	onStart(botInfo) {
		console.log(new Date(), 'Bot starts as', botInfo.username);
	},
});
