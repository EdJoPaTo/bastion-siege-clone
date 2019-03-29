import {
	CONSTRUCTIONS,
	estimateResourcesAfter
} from 'bastion-siege-logic'

const GAME_SPEEDUP = 30

function initWhenMissing(ctx: any): void {
	const {constructions, resources, resourcesTimestamp} = ctx.session

	if (!constructions) {
		ctx.session.constructions = {}
		for (const key of CONSTRUCTIONS) {
			ctx.session.constructions[key] = 0
		}

		ctx.session.constructions.townhall = 1
		ctx.session.constructions.storage = 1
		ctx.session.constructions.houses = 1
	}

	if (!resources || !resourcesTimestamp) {
		ctx.session.resourcesTimestamp = Date.now() / 1000
		ctx.session.resources = {
			gold: 500,
			wood: 0,
			stone: 0,
			food: 200
		}
	}
}

export function calcCurrentResources(ctx: any): void {
	const now = Date.now() / 1000
	const {constructions, resources, resourcesTimestamp} = ctx.session

	const totalSeconds = now - resourcesTimestamp
	const totalMinutes = Math.floor(GAME_SPEEDUP * totalSeconds / 60)

	if (totalMinutes > 0) {
		ctx.session.resources = estimateResourcesAfter(resources, constructions, totalMinutes)
		ctx.session.resourcesTimestamp = now
	}
}

export function middleware(): (ctx: any, next?: () => void) => void {
	return (ctx, next) => {
		initWhenMissing(ctx)
		calcCurrentResources(ctx)

		return next && next()
	}
}
