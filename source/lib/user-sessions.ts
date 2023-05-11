import {readdir} from 'node:fs/promises'
import {FileAdapter} from '@grammyjs/storage-file'
import {session} from 'grammy'
import randomItem from 'random-item'
import type {Session} from './context.js'

type SessionRawEntry = {
	readonly user: number;
	readonly data: Session;
}

const storage = new FileAdapter<Session>({dirName: 'sessions'})

const sessionMiddleware = session({
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	initial: (): Session => ({} as any),
	storage: new FileAdapter<Session>({dirName: 'sessions'}),
	getSessionKey: ctx => String(ctx.from!.id),
})

async function allSessionIds(): Promise<readonly number[]> {
	async function inner(path: string) {
		const results: number[] = []
		const hits = await readdir(path, {encoding: 'utf8', withFileTypes: true})

		const dirResults = await Promise.all(
			hits.filter(o => o.isDirectory()).map(async d => inner(path + '/' + d.name)),
		)
		results.push(...dirResults.flat())

		const fileResults = hits.filter(o => o.isFile)
			.map(o => /^(\d+)\.json$/.exec(o.name)?.[1])
			.filter(Boolean)
			.map(Number)
		results.push(...fileResults)

		return results
	}

	return inner('sessions')
}

export async function getRaw(): Promise<readonly SessionRawEntry[]> {
	const allIds = await allSessionIds()
	return Promise.all(allIds.map(async user => {
		const data = await getUser(user)
		return {user, data: data!}
	}))
}

export async function getUser(userId: number): Promise<Session | undefined> {
	return storage.read(String(userId))
}

export async function getRandomUser(
	filter: (o: SessionRawEntry) => boolean = () => true,
): Promise<SessionRawEntry> {
	const all = await getRaw()
	const rawArray = all.filter(o => filter(o))
	return randomItem(rawArray)
}

export const middleware = sessionMiddleware
