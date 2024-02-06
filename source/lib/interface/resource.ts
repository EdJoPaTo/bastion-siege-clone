import {
	CONSTRUCTION_RESOURCES,
	type ConstructionResources,
	EMOJI,
	type ResourceName,
	RESOURCES,
	type Resources,
} from 'bastion-siege-logic';
import type {Context} from '../context.js';
import {formatNumberShort} from './format-number.js';
import {possibleEmoji} from './generals.js';

export async function resourceLine(
	ctx: Context,
	resource: ResourceName,
	amount: number,
): Promise<string> {
	const reader = await ctx.wd.reader(`resource.${resource}`);
	const parts: string[] = [
		EMOJI[resource],
		`*${reader.label()}*`,
		formatNumberShort(amount, true),
	];

	return parts.join(' ');
}

export async function constructionResourceLine(
	ctx: Context,
	resource: ResourceName,
	amount: number,
	possible: boolean,
): Promise<string> {
	const emoji = possibleEmoji(possible);
	const line = await resourceLine(ctx, resource, amount);
	return `${emoji} ${line}`;
}

export async function resources(
	ctx: Context,
	resources: Resources,
): Promise<string> {
	const lines = await Promise.all(
		RESOURCES.map(async o => resourceLine(ctx, o, resources[o])),
	);

	return lines.join('\n');
}

export async function constructionResources(
	ctx: Context,
	required: ConstructionResources,
	available: Resources,
): Promise<string> {
	const lines = await Promise.all(
		CONSTRUCTION_RESOURCES
			.filter(o => required[o])
			.map(async resource =>
				constructionResourceLine(
					ctx,
					resource,
					required[resource],
					available[resource] >= required[resource],
				),
			),
	);

	return lines.join('\n');
}
