import {EMOJI} from 'bastion-siege-logic';
import {type Body, MenuTemplate} from 'grammy-inline-menu';
import {backButtons, type Context, type Session} from '../lib/context.js';
import {randomFamilyEmoji} from '../lib/interface/generals.js';
import {getRaw} from '../lib/user-sessions.js';

async function getFamilyMembers(lastName: string): Promise<Session[]> {
	const all = await getRaw();
	return all
		.map(o => o.data)
		.filter(o => o.name?.last === lastName);
}

async function menuBody(ctx: Context): Promise<Body> {
	let text = '';

	text += randomFamilyEmoji();
	text += ' ';
	text += '*';
	text += ctx.session.name!.last!;
	text += '*';

	if (ctx.session.name?.last) {
		const familyMembers = await getFamilyMembers(ctx.session.name.last);
		const lines = familyMembers
			.sort((a, b) => b.constructions.barracks - a.constructions.barracks)
			.map(o => `${o.constructions.barracks}${EMOJI.barracks}  ${o.name!.first}`);
		text += '\n\n';
		text += lines.join('\n');
	}

	return {text, parse_mode: 'Markdown'};
}

export const menu = new MenuTemplate<Context>(menuBody);

menu.manualRow(backButtons);
