import {
	CONSTRUCTION_RESOURCES,
	ConstructionResources,
	EMOJI,
	ResourceName,
	RESOURCES,
	Resources
} from 'bastion-siege-logic'

import {Context} from '../context'

import {formatNumberShort} from './format-number'
import {possibleEmoji} from './generals'

export async function resourceLine(ctx: Context, resource: ResourceName, amount: number): Promise<string> {
	const reader = await ctx.wd.reader(`resource.${resource}`)
	const parts: string[] = [
		EMOJI[resource],
		`*${reader.label()}*`,
		formatNumberShort(amount, true)
	]

	return parts.join(' ')
}

export async function constructionResourceLine(ctx: Context, resource: ResourceName, amount: number, possible: boolean): Promise<string> {
	return `${possibleEmoji(possible)} ${await resourceLine(ctx, resource, amount)}`
}

export async function resources(ctx: Context, resources: Resources): Promise<string> {
	const lines = await Promise.all(RESOURCES
		.map(async o => resourceLine(ctx, o, resources[o]))
	)

	return lines.join('\n')
}

export async function constructionResources(ctx: Context, required: ConstructionResources, available: Resources): Promise<string> {
	const lines = await Promise.all(CONSTRUCTION_RESOURCES
		.filter(o => required[o])
		.map(async o => constructionResourceLine(ctx, o, required[o], available[o] >= required[o]))
	)

	return lines.join('\n')
}
