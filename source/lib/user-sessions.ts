import {Constructions, Resources} from 'bastion-siege-logic'

/* eslint @typescript-eslint/no-var-requires: warn */
/* eslint @typescript-eslint/no-require-imports: warn */
const LocalSession = require('telegraf-session-local')

export interface Session {
	constructions: Constructions;
	resources: Resources;
	resourcesTimestamp: number;
	wikidataLanguageCode: string;
	blocked?: boolean;
	name?: {
		first: string;
		last: string;
	};
	people: {
		houses: number;
		barracks: number;
		wall: number;
	};
	peopleTimestamp: number;
	selectedSpy: string;
	selectedSpyEmoji: string;
}

interface SessionRawEntry {
	user: number;
	data: Session;
}

const localSession = new LocalSession({
	// Database name/path, where sessions will be located (default: 'sessions.json')
	database: 'persist/sessions.json',
	// Format of storage/database (default: JSON.stringify / JSON.parse)
	format: {
		serialize: (obj: any) => JSON.stringify(obj, null, '\t') + '\n',
		deserialize: (str: string) => JSON.parse(str)
	},
	getSessionKey: (ctx: any) => `${ctx.from.id}`
})

export function getRaw(): ReadonlyArray<SessionRawEntry> {
	return localSession.DB
		.get('sessions').value()
		.map((o: {id: string; data: any}) => {
			const user = Number(o.id.split(':')[0])
			return {user, data: o.data}
		})
}

export function getUser(userId: number): any {
	return localSession.DB
		.get('sessions')
		.getById(`${userId}`)
		.get('data')
		.value() || {}
}

export function getRandomUser(filter: (o: SessionRawEntry) => boolean = () => true): SessionRawEntry {
	const rawArr = getRaw()
		.filter(filter)
	const pickedIndex = Math.floor(Math.random() * rawArr.length)
	return rawArr[pickedIndex]
}

export function middleware(): (ctx: any, next: any) => void {
	return localSession.middleware()
}
