import {type ConstructionName, EMOJI} from 'bastion-siege-logic';
import {type Body, MenuTemplate} from 'grammy-inline-menu';
import {backButtons, type Context, type Session} from '../lib/context.js';
import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals.js';
import * as userSessions from '../lib/user-sessions.js';

async function menuBody(ctx: Context): Promise<Body> {
	const allSessions = await userSessions.getRaw();
	const allSessionData = allSessions.map(o => o.data);

	let text = wikidataInfoHeader(await ctx.wd.reader('menu.statistics'), {
		titlePrefix: outEmoji.statistics,
	});
	text += '\n\n';

	const active = allSessionData.filter(o => !o.blocked && o.name).length;
	const statLines: string[] = [
		`${allSessions.length} ${EMOJI.people} (${active} ${outEmoji.activeUser})`,

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
	const reader = await ctx.wd.reader(`construction.${construction}`);
	const level = Math.max(...sessions.map(o => o.constructions[construction]));
	return `${EMOJI[construction]} ≤${level} ${reader.label()}`;
}

export const menu = new MenuTemplate(menuBody);

menu.url(
	async ctx => `ℹ️ ${(await ctx.wd.reader('menu.wikidataItem')).label()}`,
	async ctx => (await ctx.wd.reader('menu.statistics')).url(),
);

menu.manualRow(backButtons);
