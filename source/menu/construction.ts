import {
	calcBuildingCost,
	calcMinutesNeeded,
	calcResourcesAfterConstruction,
	type ConstructionName,
} from 'bastion-siege-logic';
import {MenuTemplate} from 'grammy-inline-menu';
import {backButtons, type Context} from '../lib/context.ts';
import {
	constructionPropertyString,
	infoHeader,
} from '../lib/interface/construction.ts';
import {constructionResources} from '../lib/interface/resource.ts';

function constructionFromCtx(ctx: Context): {
	construction: ConstructionName;
	level: number;
} {
	const construction = ctx.match![1] as ConstructionName;
	const {constructions} = ctx.session;
	const level = constructions[construction];

	return {construction, level};
}

export const menu = new MenuTemplate<Context>(async ctx => {
	const {constructions, people} = ctx.session;
	const {construction, level} = constructionFromCtx(ctx);

	const requiredResources = calcBuildingCost(construction, level);
	const currentResources = ctx.session.resources;

	const textParts: string[] = [];
	textParts.push(await infoHeader(ctx, construction, level));

	const properties = await constructionPropertyString(
		ctx,
		constructions,
		people,
		construction,
	);
	if (properties) {
		textParts.push(properties);
	}

	textParts.push(await constructionResources(ctx, requiredResources, currentResources));
	const text = textParts.join('\n\n');

	return {text, parse_mode: 'Markdown'};
});

menu.interact('upgrade', {
	text: async ctx => `⬆️ ${(await ctx.wd.reader('action.upgrade')).label()}`,
	hide(ctx) {
		const {constructions} = ctx.session;
		const {construction, level} = constructionFromCtx(ctx);
		const requiredResources = calcBuildingCost(construction, level);
		const currentResources = ctx.session.resources;

		const minutes = calcMinutesNeeded(
			requiredResources,
			constructions,
			currentResources,
		);
		return minutes > 0;
	},
	do(ctx) {
		const {construction, level} = constructionFromCtx(ctx);
		const requiredResources = calcBuildingCost(construction, level);
		const currentResources = ctx.session.resources;

		ctx.session.resources = calcResourcesAfterConstruction(
			currentResources,
			requiredResources,
		);
		const constructions = {...ctx.session.constructions};
		constructions[construction] = level + 1;
		ctx.session.constructions = constructions;

		return '.';
	},
});

menu.url({
	text: async ctx =>
		`ℹ️ ${(await ctx.wd.reader('menu.wikidataItem')).label()}`,
	async url(ctx) {
		const {construction} = constructionFromCtx(ctx);
		const wdKey = `construction.${construction}`;
		const reader = await ctx.wd.reader(wdKey);
		return reader.url();
	},
});

menu.manualRow(backButtons);
