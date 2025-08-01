import {MenuTemplate} from 'grammy-inline-menu';
import randomItem from 'random-item';
import {UNISEX} from 'wikidata-person-names';
import type {Context, Name} from '../../lib/context.ts';
import {outEmoji} from '../../lib/interface/generals.ts';
import {formatNamePlain} from '../../lib/interface/name.ts';
import {DAY, MINUTE} from '../../lib/unix-time.ts';

const CHANGE_EACH_SECONDS = DAY * 7;

function getNextChange(name: Name | undefined): number {
	const lastChange = name?.lastChangeFirst ?? 0;
	return lastChange + CHANGE_EACH_SECONDS;
}

function canChangeFirstName(name: Name | undefined): boolean {
	const now = Date.now() / 1000;
	const nextChange = getNextChange(name);
	return now > nextChange;
}

export const menu = new MenuTemplate<Context>(async ctx => {
	let text = '';

	text += outEmoji.name;
	text += ' ';
	text += '*';
	text += ctx.t('name-question-first');
	text += '*';

	text += '\n\n';
	text += ctx.t('name-info-first').trim();

	if (ctx.session.name) {
		text += '\n\n';
		text += (await ctx.wd.reader('menu.name')).label();
		text += ': ';
		text += formatNamePlain(ctx.session.name);
	}

	const now = Date.now() / 1000;
	const nextChange = getNextChange(ctx.session.name);
	if (nextChange > now) {
		const remainingSeconds = nextChange - now;
		const remainingMinutes = remainingSeconds / MINUTE;

		text += '\n\n';
		text += (await ctx.wd.reader('name.change')).label();
		text += ': ';
		text += remainingMinutes.toFixed(0);
		text += ' ';
		text += (await ctx.wd.reader('unit.minute')).label();
	} else if (ctx.session.createFirst) {
		text += '\n\n';
		text += ctx.t('name-new-first');
		text += ': ';
		text += ctx.session.createFirst;
	}

	return {text, parse_mode: 'Markdown'};
});

menu.interact('random', {
	text: outEmoji.nameFallback,
	hide: ctx => !canChangeFirstName(ctx.session.name),
	do(ctx) {
		ctx.session.createFirst = randomItem(UNISEX);
		return '.';
	},
});

menu.interact('take', {
	text: ctx => `😍 ${ctx.t('name-take')}`,
	hide: ctx =>
		!ctx.session.createFirst || !canChangeFirstName(ctx.session.name),
	do(ctx) {
		const now = Date.now() / 1000;
		ctx.session.name = {
			...ctx.session.name,
			first: ctx.session.createFirst!,
			lastChangeFirst: now,
		};

		delete ctx.session.createFirst;
		return '..';
	},
});

menu.interact('reject', {
	joinLastRow: true,
	text: ctx => `😒 ${ctx.t('name-reject')}`,
	hide: ctx => !ctx.session.name,
	do(ctx) {
		delete ctx.session.createLast;
		return '..';
	},
});
