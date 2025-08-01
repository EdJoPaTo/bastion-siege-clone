import {
	BUILDINGS,
	calcBuildingCost,
	calcMinutesNeeded,
	type ConstructionName,
	type Constructions,
	EMOJI,
	type Resources,
	WORKSHOP,
} from 'bastion-siege-logic';
import {type Body, MenuTemplate} from 'grammy-inline-menu';
import {backButtons, type Context} from '../lib/context.js';
import {constructionLine} from '../lib/interface/construction.js';
import {wikidataInfoHeader} from '../lib/interface/generals.js';
import {menu as entryMenu} from './construction.js';

function canUpgrade(
	constructions: Constructions,
	construction: ConstructionName,
	currentResources: Resources,
): boolean {
	const cost = calcBuildingCost(construction, constructions[construction]);
	const minutesNeeded = calcMinutesNeeded(
		cost,
		constructions,
		currentResources,
	);
	return minutesNeeded === 0;
}

async function constructionMenuBody(
	ctx: Context,
	key: 'buildings' | 'workshop',
	entries: readonly ConstructionName[],
): Promise<Body> {
	const wdKey = `bs.${key}`;
	const currentResources = ctx.session.resources;
	const {constructions} = ctx.session;

	let text = wikidataInfoHeader(await ctx.wd.reader(wdKey), {
		titlePrefix: EMOJI[key],
	});

	text += '\n\n';

	const constructionLines = await Promise.all(entries.map(async construction =>
		constructionLine(
			ctx,
			construction,
			constructions[construction],
			canUpgrade(constructions, construction, currentResources),
		)));
	text += constructionLines.join('\n');

	return {text, parse_mode: 'Markdown'};
}

async function constructionButtonTextFunc(
	ctx: Context,
	key: string,
): Promise<string> {
	const reader = await ctx.wd.reader(`construction.${key}`);
	const emoji = EMOJI[key as ConstructionName];
	return `${emoji} ${reader.label()}`;
}

export const buildingsMenu = new MenuTemplate<Context>(async ctx =>
	constructionMenuBody(ctx, 'buildings', BUILDINGS));

buildingsMenu.chooseIntoSubmenu('', entryMenu, {
	columns: 2,
	choices: BUILDINGS,
	buttonText: constructionButtonTextFunc,
});

buildingsMenu.manualRow(backButtons);

export const workshopMenu = new MenuTemplate<Context>(async ctx =>
	constructionMenuBody(ctx, 'workshop', WORKSHOP));

workshopMenu.chooseIntoSubmenu('', entryMenu, {
	columns: 2,
	choices: WORKSHOP,
	buttonText: constructionButtonTextFunc,
});

workshopMenu.manualRow(backButtons);
