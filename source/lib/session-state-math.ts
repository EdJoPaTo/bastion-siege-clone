import {
	CONSTRUCTIONS,
	estimateResourcesAfter,
	Resources
} from 'bastion-siege-logic'

const GAME_SPEEDUP = 30

function foodPenalty(ctx: any): number {
	const resources = ctx.session.resources as Resources
	return resources.food > 0 ? 1 : 0.2
}

function initWhenMissing(ctx: any, now: number): void {
	const {constructions} = ctx.session
	if (!constructions) {
		ctx.session.constructions = {}
		for (const key of CONSTRUCTIONS) {
			ctx.session.constructions[key] = 0
		}

		ctx.session.constructions.townhall = 1
		ctx.session.constructions.storage = 1
		ctx.session.constructions.houses = 1
	}

	const {resources, resourcesTimestamp} = ctx.session
	if (!resources || !resourcesTimestamp) {
		ctx.session.resourcesTimestamp = now
		const resources: Resources = {
			gold: 500,
			wood: 0,
			stone: 0,
			food: 200
		}
		ctx.session.resources = resources
	}
}

function calcCurrentResources(ctx: any, now: number): void {
	const {constructions, resources, resourcesTimestamp} = ctx.session

	const totalSeconds = now - resourcesTimestamp
	const totalMinutes = Math.floor(GAME_SPEEDUP * foodPenalty(ctx) * totalSeconds / 60)

	if (totalMinutes > 0) {
		ctx.session.resources = estimateResourcesAfter(resources, constructions, totalMinutes)
		ctx.session.resourcesTimestamp = now
	}
}

export function middleware(): (ctx: any, next?: () => void) => void {
	return (ctx, next) => {
		const now = Date.now() / 1000

		initWhenMissing(ctx, now)
		calcCurrentResources(ctx, now)

		return next && next()
	}
}
