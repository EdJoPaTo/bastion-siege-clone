import {
	CONSTRUCTIONS,
	estimateResourcesAfter,
	RESOURCES
} from 'bastion-siege-logic'

const GAME_SPEEDUP = 30

function initWhenMissing(ctx: any): void {
	const {constructions, resources, resourcesTimestamp} = ctx.session

	if (!constructions) {
		ctx.session.constructions = {}
		for (const key of CONSTRUCTIONS) {
			ctx.session.constructions[key] = 0
		}
	}

	if (!resources || !resourcesTimestamp) {
		ctx.session.resources = {}
		ctx.session.resourcesTimestamp = Date.now() / 1000
		for (const key of RESOURCES) {
			ctx.session.resources[key] = 0
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
