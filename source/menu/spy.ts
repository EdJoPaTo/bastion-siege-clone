import {arrayFilterUnique} from 'array-filter-unique';
import {
	type ConstructionName,
	CONSTRUCTIONS,
	EMOJI,
} from 'bastion-siege-logic';
import {MenuTemplate} from 'grammy-inline-menu';
import randomItem from 'random-item';
import {backButtons, type Context} from '../lib/context.js';
import {wikidataInfoHeader} from '../lib/interface/generals.js';
import {formatNamePlain} from '../lib/interface/name.js';
import * as userSessions from '../lib/user-sessions.js';
import * as wdSets from '../lib/wikidata-sets.js';

async function getSpy(ctx: Context) {
	ctx.session.selectedSpy ||= wdSets.getRandom('spies');
	const reader = await ctx.wd.reader(ctx.session.selectedSpy);
	if (!ctx.session.selectedSpyEmoji) {
		const spymojis = reader.unicodeChars();
		ctx.session.selectedSpyEmoji = randomItem(spymojis);
	}

	return reader;
}

function getSpyableConstructions(qNumber: string): ConstructionName[] {
	const possibleConstructions = [...qNumber]
		.slice(1)
		.map(Number)
		.filter(arrayFilterUnique())
		.map(o => CONSTRUCTIONS[o]!);

	return possibleConstructions;
}

export const menu = new MenuTemplate<Context>(async ctx => {
	let text = wikidataInfoHeader(await ctx.wd.reader('menu.spy'), {
		titlePrefix: EMOJI.search,
	});

	const spyReader = await getSpy(ctx);
	const description = spyReader.description();

	text += '\n\n';
	text += `${ctx.session.selectedSpyEmoji} ${spyReader.label()}\n`;
	if (description) {
		text += description;
		text += '\n';
	}

	return {text, parse_mode: 'Markdown'};
});

menu.interact(
	async ctx => `${(await ctx.wd.reader('action.espionage')).label()}`,
	'espionage',
	{
		async do(ctx) {
			const {data: session} = await userSessions.getRandomUser(session =>
				Boolean(session.data.name),
			);
			const name = session.name!;

			const spyableConstructions = getSpyableConstructions(
				ctx.session.selectedSpy,
			);
			const pickedConstructionKey = randomItem(spyableConstructions);
			const pickedConstructionLevel
				= session.constructions[pickedConstructionKey];

			let message = '';
			message += ctx.session.selectedSpyEmoji;
			message += ' ';
			message += formatNamePlain(name);
			message += ' ';
			message += EMOJI[pickedConstructionKey];
			message += (await ctx.wd.reader(`construction.${pickedConstructionKey}`))
				.label();
			message += ' ';
			message += pickedConstructionLevel.toFixed(0);

			await ctx.answerCallbackQuery(message);
			return false;
		},
	},
);

menu.interact(
	async ctx => `${(await ctx.wd.reader('action.change')).label()}`,
	'change',
	{
		joinLastRow: true,
		do(ctx) {
			// @ts-expect-error delete non optional. It gets set automatically by middleware
			delete ctx.session.selectedSpy;
			// @ts-expect-error delete non optional. It gets set automatically by middleware
			delete ctx.session.selectedSpyEmoji;
			return '.';
		},
	},
);

menu.url(
	async ctx => {
		const spyReader = await ctx.wd.reader('menu.spy');
		const wdItemReader = await ctx.wd.reader('menu.wikidataItem');
		return `ℹ️ ${wdItemReader.label()} ${spyReader.label()}`;
	},
	async ctx => (await ctx.wd.reader('menu.spy')).url(),
);

menu.url(async ctx => {
	const spyReader = await getSpy(ctx);
	const wdItemReader = await ctx.wd.reader('menu.wikidataItem');
	return `ℹ️ ${wdItemReader.label()} ${ctx.session.selectedSpyEmoji} ${spyReader.label()}`;
}, async ctx => (await getSpy(ctx)).url());

menu.manualRow(backButtons);
