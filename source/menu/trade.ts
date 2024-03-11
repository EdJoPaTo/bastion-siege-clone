import {
	calcStorageCapacity,
	EMOJI,
	type ResourceName,
	type Resources,
} from 'bastion-siege-logic';
import {MenuTemplate} from 'grammy-inline-menu';
import {backButtons, type Context} from '../lib/context.js';
import {formatNumberShort} from '../lib/interface/format-number.js';
import {wikidataInfoHeader} from '../lib/interface/generals.js';
import {resources} from '../lib/interface/resource.js';

function buy(
	currentResources: Resources,
	resource: ResourceName,
	amount: number,
): Resources {
	const result = {...currentResources};
	result.gold -= amount * 2;
	result[resource] += amount;
	return result;
}

export const menu = new MenuTemplate<Context>(async ctx => {
	let text = wikidataInfoHeader(await ctx.wd.reader('action.buy'), {
		titlePrefix: EMOJI.trade,
	});
	text += '\n\n';
	text += await resources(ctx, ctx.session.resources);
	return {text, parse_mode: 'Markdown'};
});

function resourceFromCtx(ctx: Context): ResourceName {
	return ctx.match![1] as ResourceName;
}

const resourceMenu = new MenuTemplate<Context>(async ctx => {
	const resource = resourceFromCtx(ctx);
	const currentResources = ctx.session.resources;
	const {constructions} = ctx.session;
	const storageCapacity = calcStorageCapacity(constructions.storage);

	let text = wikidataInfoHeader(await ctx.wd.reader(`resource.${resource}`), {
		titlePrefix: EMOJI[resource],
	});

	text += '\n\n';

	const goldReader = await ctx.wd.reader('resource.gold');
	const currentGoldShort = formatNumberShort(currentResources.gold, true);
	text += `${EMOJI.gold} ${goldReader.label()} ${currentGoldShort}${EMOJI.gold}\n`;

	const resourceReader = await ctx.wd.reader(`resource.${resource}`);
	const currentResourceShort = formatNumberShort(
		currentResources[resource],
		true,
	);
	text += `${EMOJI[resource]} ${resourceReader.label()} ${currentResourceShort}${EMOJI[resource]}\n`;

	const storageCapacityReader = await ctx.wd.reader('bs.storageCapacity');
	const capacityShort = formatNumberShort(storageCapacity, true);
	text += `${storageCapacityReader.label()} ${capacityShort}${EMOJI[resource]}\n`;

	text += '\n';
	text += `200${EMOJI.gold} / 100${EMOJI[resource]}\n`;
	return {text, parse_mode: 'Markdown'};
});

menu.chooseIntoSubmenu('', ['wood', 'stone', 'food'], resourceMenu, {
	async buttonText(ctx, key) {
		const emoji = EMOJI[key as ResourceName];
		const reader = await ctx.wd.reader(`resource.${key}`);
		return `${emoji} ${reader.label()}`;
	},
});

menu.manualRow(backButtons);

function buyOptions(ctx: Context): string[] {
	const resource = resourceFromCtx(ctx);
	const currentResources = ctx.session.resources;
	const {constructions} = ctx.session;
	const storageCapacity = calcStorageCapacity(constructions.storage);

	const upperLimitResource = storageCapacity - currentResources[resource];
	const upperLimitGold = currentResources.gold / 2;
	const upperLimitExact = Math.min(upperLimitResource, upperLimitGold);

	const exp = Math.floor(Math.log10(upperLimitExact));
	const magnitude = 10 ** exp;

	const options = [1 / 40, 1 / 20, 1 / 10, 1 / 4, 1 / 2, 1, 2.5, 5];

	return options
		.map(o => o * magnitude)
		.filter(o => !(o < 100 || o > upperLimitExact))
		.slice(-6)
		.map(String);
}

resourceMenu.choose('buy', buyOptions, {
	columns: 3,
	buttonText(ctx, key) {
		const resource = resourceFromCtx(ctx);
		const numberText = formatNumberShort(Number(key), true);
		return `${numberText}${EMOJI[resource]}`;
	},
	do(ctx, key) {
		const resource = resourceFromCtx(ctx);
		const currentResources = ctx.session.resources;
		ctx.session.resources = buy(currentResources, resource, Number(key));
		return '.';
	},
});

resourceMenu.url(async ctx => `ℹ️ ${(await ctx.wd.reader('menu.wikidataItem')).label()}`, async ctx => {
	const resource = resourceFromCtx(ctx);
	const wdKey = `resource.${resource}`;
	const reader = await ctx.wd.reader(wdKey);
	return reader.url();
});

resourceMenu.manualRow(backButtons);
