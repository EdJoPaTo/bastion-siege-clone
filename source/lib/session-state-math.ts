import {
	calcBarracksCapacity,
	calcGoldIncome,
	calcHousesCapacity,
	calcHousesPeopleIncome,
	calcWallArcherCapacity,
	estimateResourcesAfter
} from 'bastion-siege-logic'

import {PeopleInConstructions} from '../types'

import {Context, Session} from './context'

const GAME_SPEEDUP = 30

function foodPenalty(session: Session): number {
	return session.resources.food > 0 ? 1 : 0.2
}

function initWhenMissing(session: Session, now: number): void {
	const {constructions} = session
	if (!constructions) {
		session.constructions = {
			townhall: 1,
			storage: 1,
			houses: 1,
			sawmill: 0,
			mine: 0,
			farm: 1,
			barracks: 0,
			wall: 0,
			trebuchet: 0,
			ballista: 0
		}
	}

	const {resources, resourcesTimestamp} = session
	if (!resources || !resourcesTimestamp) {
		session.resourcesTimestamp = now
		session.resources = {
			gold: 500,
			wood: 0,
			stone: 0,
			food: 200
		}
	}

	const {people, peopleTimestamp} = session
	if (!people || !peopleTimestamp) {
		session.peopleTimestamp = now
		const people: PeopleInConstructions = {
			houses: 0,
			barracks: 0,
			wall: 0
		}
		session.people = people
	}
}

function calcCurrentPeople(session: Session, now: number): void {
	const {constructions, people, peopleTimestamp} = session

	const totalSeconds = now - peopleTimestamp
	const totalMinutes = Math.floor(GAME_SPEEDUP * foodPenalty(session) * totalSeconds / 60)

	const totalPoepleIncome = calcHousesPeopleIncome(constructions.houses) * totalMinutes
	if (totalPoepleIncome < 1) {
		return
	}

	const freePlacesBarracks = calcBarracksCapacity(constructions.barracks) - session.people.barracks
	const freePlacesWall = calcWallArcherCapacity(constructions.wall) - session.people.wall

	let peopleAvailable = totalPoepleIncome + people.houses

	const addToWall = Math.min(freePlacesWall, Math.max(0, peopleAvailable))
	peopleAvailable -= addToWall

	const addToBarracks = Math.min(freePlacesBarracks, Math.max(0, peopleAvailable))
	peopleAvailable -= addToBarracks

	const housesPeople = Math.max(0, Math.min(peopleAvailable, calcHousesCapacity(constructions.houses)))

	session.peopleTimestamp = now
	session.people = {
		barracks: session.people.barracks + addToBarracks,
		houses: housesPeople,
		wall: session.people.wall + addToWall
	}
}

function calcCurrentResources(session: Session, now: number): void {
	const {constructions, resources, resourcesTimestamp} = session

	const totalSeconds = now - resourcesTimestamp
	const totalMinutes = Math.floor(GAME_SPEEDUP * foodPenalty(session) * totalSeconds / 60)

	if (totalMinutes > 0) {
		session.resources = estimateResourcesAfter(resources, constructions, totalMinutes)

		// Max negative gold should be recoverable in 12h realtime hours
		const goldIncome24h = calcGoldIncome(constructions.townhall, constructions.houses) * 12 * 60 * GAME_SPEEDUP * foodPenalty(session)

		session.resources = {
			...session.resources,
			gold: Math.max(-goldIncome24h, session.resources.gold)
		}

		session.resourcesTimestamp = now
	}
}

export function middleware(): (ctx: Context, next: () => Promise<void>) => Promise<void> {
	return async (ctx, next) => {
		const now = Date.now() / 1000

		initWhenMissing(ctx.session, now)
		calcCurrentResources(ctx.session, now)
		calcCurrentPeople(ctx.session, now)

		return next()
	}
}
