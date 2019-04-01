import {
	calcBarracksCapacity,
	calcGoldIncome,
	calcHousesCapacity,
	calcHousesPeopleIncome,
	calcWallArcherCapacity,
	Constructions,
	CONSTRUCTIONS,
	estimateResourcesAfter,
	Resources
} from 'bastion-siege-logic'

import {PeopleInConstructions} from '../types'

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

	const {people, peopleTimestamp} = ctx.session
	if (!people || !peopleTimestamp) {
		ctx.session.peopleTimestamp = now
		const people: PeopleInConstructions = {
			houses: 0,
			barracks: 0,
			wall: 0
		}
		ctx.session.people = people
	}
}

function assignPeopleToConstruction(people: PeopleInConstructions, construction: keyof PeopleInConstructions, totalCapacity: number, peopleAvailable: number): number {
	const freePlaces = totalCapacity - people[construction]
	if (freePlaces > 0) {
		const addPeople = Math.min(freePlaces, peopleAvailable)
		people[construction] += addPeople
		return addPeople
	}

	return 0
}

function calcCurrentPeople(ctx: any, now: number): void {
	const {peopleTimestamp} = ctx.session
	const constructions = ctx.session.constructions as Constructions
	const people = ctx.session.people as PeopleInConstructions

	const totalSeconds = now - peopleTimestamp
	const totalMinutes = Math.floor(GAME_SPEEDUP * foodPenalty(ctx) * totalSeconds / 60)

	const totalPoepleIncome = calcHousesPeopleIncome(constructions.houses) * totalMinutes
	if (totalPoepleIncome < 1) {
		return
	}

	ctx.session.peopleTimestamp = now

	let peopleAvailable = totalPoepleIncome + people.houses
	people.houses = 0

	peopleAvailable -= assignPeopleToConstruction(people, 'barracks', calcBarracksCapacity(constructions.barracks), peopleAvailable)
	peopleAvailable -= assignPeopleToConstruction(people, 'wall', calcWallArcherCapacity(constructions.wall), peopleAvailable)

	people.houses = Math.min(peopleAvailable, calcHousesCapacity(constructions.houses))
}

function calcCurrentResources(ctx: any, now: number): void {
	const {constructions, resources, resourcesTimestamp} = ctx.session

	const totalSeconds = now - resourcesTimestamp
	const totalMinutes = Math.floor(GAME_SPEEDUP * foodPenalty(ctx) * totalSeconds / 60)

	if (totalMinutes > 0) {
		ctx.session.resources = estimateResourcesAfter(resources, constructions, totalMinutes)

		// Max negative gold should be recoverable in 12h realtime hours
		const goldIncome24h = calcGoldIncome(constructions.townhall, constructions.houses) * 12 * 60 * GAME_SPEEDUP * foodPenalty(ctx)
		ctx.session.resources.gold = Math.max(-goldIncome24h, ctx.session.resources.gold)

		ctx.session.resourcesTimestamp = now
	}
}

export function middleware(): (ctx: any, next?: () => void) => void {
	return (ctx, next) => {
		const now = Date.now() / 1000

		initWhenMissing(ctx, now)
		calcCurrentResources(ctx, now)
		calcCurrentPeople(ctx, now)

		return next && next()
	}
}
