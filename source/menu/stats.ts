import {type Body, MenuTemplate} from 'grammy-inline-menu';
import {type ConstructionName, EMOJI} from 'bastion-siege-logic';
import {backButtons, type Context, type Session} from '../lib/context.js';
import * as userSessions from '../lib/user-sessions.js';
import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals.js';

async function menuBody(ctx: Context): Promise<Body> {
	const allSessions = await userSessions.getRaw();
	const allSessionData = allSessions.map(o => o.data);

	let text = '';
	text += wikidataInfoHeader(await ctx.wd.reader('menu.statistics'), {titlePrefix: outEmoji.statistics});
	text += '\n\n';

	const statLines: string[] = [
		`${allSessions.length} ${EMOJI.people} (${allSessionData.filter(o => !o.blocked && o.name).length} ${outEmoji.activeUser})`,

		await maxConstructionLevelLine(ctx, allSessionData, 'townhall'),
		await maxConstructionLevelLine(ctx, allSessionData, 'barracks'),
	];

	text += statLines.join('\n');

	return {text, parse_mode: 'Markdown'};
}

async function maxConstructionLevelLine(
	ctx: Context,
	sessions: readonly Session[],
	construction: ConstructionName,
): Promise<string> {
	return `${EMOJI[construction]} ≤${Math.max(...sessions.map(o => o.constructions[construction]))} ${(await ctx.wd.reader(`construction.${construction}`)).label()}`;
}

export const menu = new MenuTemplate(menuBody);

menu.url(
	async ctx => `ℹ️ ${(await ctx.wd.reader('menu.wikidataItem')).label()}`,
	async ctx => (await ctx.wd.reader('menu.statistics')).url(),
);

menu.manualRow(backButtons);
