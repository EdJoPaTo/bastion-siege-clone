import {
	CONSTRUCTION_RESOURCES,
	ConstructionResources,
	EMOJI,
	ResourceName,
	RESOURCES,
	Resources
} from 'bastion-siege-logic'

import {formatNumberShort} from './format-number'
import {possibleEmoji} from './generals'

export async function resourceLine(ctx: any, resource: ResourceName, amount: number): Promise<string> {
	const parts: string[] = []

	parts.push(EMOJI[resource])
	parts.push(
		`*${await ctx.wd.label(`resource.${resource}`)}*`
	)
	parts.push(formatNumberShort(amount, true))

	return parts.join(' ')
}

export async function constructionResourceLine(ctx: any, resource: ResourceName, amount: number, possible: boolean): Promise<string> {
	return `${possibleEmoji(possible)} ${await resourceLine(ctx, resource, amount)}`
}

export async function resources(ctx: any, resources: Resources): Promise<string> {
	const linePromises = RESOURCES
		.map(o => resourceLine(ctx, o, resources[o]))

	const lines = await Promise.all(linePromises)
	return lines.join('\n')
}

export async function constructionResources(ctx: any, required: ConstructionResources, available: Resources): Promise<string> {
	const linePromises = CONSTRUCTION_RESOURCES
		.filter(o => required[o])
		.map(o => constructionResourceLine(ctx, o, required[o], available[o] >= required[o]))

	const lines = await Promise.all(linePromises)
	return lines.join('\n')
}
