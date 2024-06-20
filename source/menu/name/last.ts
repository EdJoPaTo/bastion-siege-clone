import {arrayFilterUnique} from 'array-filter-unique';
import {MenuTemplate} from 'grammy-inline-menu';
import randomItem from 'random-item';
import {FAMILY} from 'wikidata-person-names';
import type {Context, Name} from '../../lib/context.js';
import {outEmoji} from '../../lib/interface/generals.js';
import {formatNamePlain} from '../../lib/interface/name.js';
import {HOUR, MINUTE} from '../../lib/unix-time.js';
import {getRaw} from '../../lib/user-sessions.js';

const CHANGE_EACH_SECONDS = HOUR * 22;

function getNextChange(name: Name | undefined): number {
	const lastChange = name?.lastChangeLast ?? 0;
	return lastChange + CHANGE_EACH_SECONDS;
}

function canChangeLastName(name: Name | undefined): name is Name {
	if (!name) {
		return false;
	}

	const now = Date.now() / 1000;
	const nextChange = getNextChange(name);
	if (nextChange > now) {
		return false;
	}

	return true;
}

export const menu = new MenuTemplate<Context>(async ctx => {
	let text = '';

	text += outEmoji.name;
	text += ' ';
	text += '*';
	text += ctx.t('name-question-last');
	text += '*';

	text += '\n\n';
	text += ctx.t('name-info-last').trim();

	if (ctx.session.name) {
		text += '\n\n';
		text += await ctx.wd.reader('menu.name').then(r => r.label());
		text += ': ';
		text += formatNamePlain(ctx.session.name);
	}

	const now = Date.now() / 1000;
	const nextChange = getNextChange(ctx.session.name);
	if (nextChange > now) {
		const remainingSeconds = nextChange - now;
		const remainingMinutes = remainingSeconds / MINUTE;

		text += '\n\n';
		text += await ctx.wd.reader('name.change').then(r => r.label());
		text += ': ';
		text += remainingMinutes.toFixed(0);
		text += ' ';
		text += await ctx.wd.reader('unit.minute').then(r => r.label());
	} else if (ctx.session.createLast !== undefined) {
		text += '\n\n';
		text += ctx.t('name-new-last');
		text += ': ';
		if (ctx.session.createLast) {
			text += ctx.session.createLast;
		} else {
			text += outEmoji.withoutLastName;
			text += ' ';
			text += await ctx.wd.reader('name.loseLastName').then(r => r.label());
		}
	}

	return {text, parse_mode: 'Markdown'};
});

menu.interact('random', {
	text: outEmoji.nameFallback,
	hide: ctx =>
		!canChangeLastName(ctx.session.name) || Boolean(ctx.session.name.last),
	do(ctx) {
		ctx.session.createLast = randomItem(FAMILY);
		return '.';
	},
});

menu.choose('existing', {
	columns: 2,
	maxRows: 3,
	async choices(ctx) {
		const currentLastName = ctx.session.name?.last;
		const all = await getRaw();
		const lastNames = all
			.map(o => o.data.name?.last)
			.filter(o => o !== currentLastName)
			.filter(o => typeof o === 'string')
			.filter(arrayFilterUnique())
			.sort((a, b) => a.localeCompare(b, ctx.wd.locale()));
		return lastNames;
	},
	hide: ctx =>
		!canChangeLastName(ctx.session.name) || Boolean(ctx.session.name.last),
	getCurrentPage: ctx => ctx.session.page,
	setPage(ctx, page) {
		ctx.session.page = page;
	},
	do(ctx, key) {
		ctx.session.createLast = key;
		return '.';
	},
});

menu.interact('looseLastName', {
	async text(ctx) {
		const reader = await ctx.wd.reader('name.loseLastName');
		return `${outEmoji.withoutLastName} ${reader.label()}`;
	},
	hide: ctx => !canChangeLastName(ctx.session.name) || !ctx.session.name.last,
	do(ctx) {
		ctx.session.createLast = false;
		return '.';
	},
});

menu.interact('take', {
	text: ctx => `😍 ${ctx.t('name-take')}`,
	hide: ctx =>
		ctx.session.createLast === undefined
		|| !canChangeLastName(ctx.session.name),
	do(ctx) {
		const now = Date.now() / 1000;
		const {createLast} = ctx.session;
		// eslint-disable-next-line unicorn/prefer-logical-operator-over-ternary
		const nextLast = createLast ? createLast : undefined;

		ctx.session.name = {
			...ctx.session.name!,
			last: nextLast,
			lastChangeLast: now,
		};

		delete ctx.session.createLast;
		return '..';
	},
});

menu.interact('reject', {
	joinLastRow: true,
	text: ctx => `😒 ${ctx.t('name-reject')}`,
	do(ctx) {
		delete ctx.session.createLast;
		return '..';
	},
});
