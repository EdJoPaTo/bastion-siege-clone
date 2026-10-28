import { readdir } from "node:fs/promises";

import { FileAdapter } from "@grammyjs/storage-file";
import { session } from "grammy";
import randomItem from "random-item";

import type { Session } from "./context.ts";

type SessionRawEntry = {
	readonly user: number;
	readonly data: Session;
};

const DIRECTORY = "sessions";

const storage = new FileAdapter<Session>({ dirName: DIRECTORY });

const sessionMiddleware = session({
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	initial: (): Session => ({}) as any,
	storage,
	getSessionKey: (ctx) => String(ctx.from!.id),
});

async function allSessionIds(): Promise<readonly number[]> {
	const hits = await readdir(DIRECTORY, { encoding: "utf8", recursive: true, withFileTypes: true });
	const ids = hits
		.filter((o) => o.isFile())
		.map((o) => /^(\d+)\.json$/u.exec(o.name)?.[1])
		.filter(Boolean)
		.map(Number);
	return ids;
}

export async function getRaw(): Promise<readonly SessionRawEntry[]> {
	const allIds = await allSessionIds();
	return Promise.all(
		allIds.map(async (user) => {
			const data = await getUser(user);
			return { user, data: data! };
		}),
	);
}

export function getUser(userId: number): Promise<Session | undefined> {
	return storage.read(String(userId));
}

export async function getRandomUser(
	filter: (o: SessionRawEntry) => boolean = () => true,
): Promise<SessionRawEntry> {
	const all = await getRaw();
	const rawArray = all.filter((o) => filter(o));
	return randomItem(rawArray);
}

export const middleware = sessionMiddleware;
