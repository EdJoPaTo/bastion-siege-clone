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

export function resourceLine(ctx: any, resource: ResourceName, amount: number): string {
	const parts: string[] = []

	parts.push(EMOJI[resource])
	parts.push(
		`*${ctx.wd.label(`resource.${resource}`)}*`
	)
	parts.push(formatNumberShort(amount, true))

	return parts.join(' ')
}

export function constructionResourceLine(ctx: any, resource: ResourceName, amount: number, possible: boolean): string {
	return `${possibleEmoji(possible)} ${resourceLine(ctx, resource, amount)}`
}

export function resources(ctx: any, resources: Resources): string {
	const lines = RESOURCES
		.map(o => resourceLine(ctx, o, resources[o]))

	return lines.join('\n')
}

export function constructionResources(ctx: any, required: ConstructionResources, available: Resources): string {
	const lines = CONSTRUCTION_RESOURCES
		.filter(o => required[o])
		.map(o => constructionResourceLine(ctx, o, required[o], available[o] >= required[o]))

	return lines.join('\n')
}
