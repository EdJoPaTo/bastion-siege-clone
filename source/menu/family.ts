import {EMOJI} from 'bastion-siege-logic';
import {MenuTemplate} from 'grammy-inline-menu';
import {backButtons, type Context, type Session} from '../lib/context.ts';
import {randomFamilyEmoji} from '../lib/interface/generals.ts';
import {getRaw} from '../lib/user-sessions.ts';

async function getFamilyMembers(lastName: string): Promise<Session[]> {
	const all = await getRaw();
	return all.map(o => o.data).filter(o => o.name?.last === lastName);
}

export const menu = new MenuTemplate<Context>(async ctx => {
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
			.map(o =>
				`${o.constructions.barracks}${EMOJI.barracks}  ${o.name!.first}`);
		text += '\n\n';
		text += lines.join('\n');
	}

	return {text, parse_mode: 'Markdown'};
});

menu.manualRow(backButtons);
