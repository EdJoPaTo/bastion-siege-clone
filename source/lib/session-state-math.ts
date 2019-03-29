import {
	CONSTRUCTIONS,
	RESOURCES
} from 'bastion-siege-logic'

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

export function middleware(): (ctx: any, next?: () => void) => void {
	return (ctx, next) => {
		initWhenMissing(ctx)

		return next && next()
	}
}
