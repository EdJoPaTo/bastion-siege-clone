import * as randomItem from 'random-item'
import * as LocalSession from 'telegraf-session-local'

import {Context, Session} from './context.js'

interface SessionRawEntry {
	readonly user: number;
	readonly data: Session;
}

const localSession = new LocalSession<Session>({
	// Database name/path, where sessions will be located (default: 'sessions.json')
	database: 'persist/sessions.json',
	// Format of storage/database (default: JSON.stringify / JSON.parse)
	format: {
		serialize: object => JSON.stringify(object, null, '\t') + '\n',
		deserialize: string => JSON.parse(string),
	},
	getSessionKey: ctx => `${ctx.from!.id}`,
})

export function getRaw(): readonly SessionRawEntry[] {
	return (localSession.DB as any)
		.get('sessions').value()
		.map((o: {id: string; data: Session}) => {
			const user = Number(o.id.split(':')[0])
			return {user, data: o.data}
		})
}

export function getUser(userId: number): Session | undefined {
	return (localSession.DB as any)
		.get('sessions')
		.getById(`${userId}`)
		.get('data')
		.value()
}

export function getRandomUser(filter: (o: SessionRawEntry) => boolean = () => true): SessionRawEntry {
	const rawArray = getRaw()
		.filter(o => filter(o))
	return randomItem(rawArray)
}

export function middleware(): (ctx: Context, next: () => Promise<void>) => void {
	return localSession.middleware() as any
}
