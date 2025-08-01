import {MenuTemplate} from 'grammy-inline-menu';
import {backButtons, type Context} from '../../lib/context.ts';
import {outEmoji} from '../../lib/interface/generals.ts';
import {formatNamePlain} from '../../lib/interface/name.ts';
import {menu as firstMenu} from './first.ts';
import {menu as lastMenu} from './last.ts';

export const menu = new MenuTemplate<Context>(async ctx => {
	let text = '';

	text += outEmoji.name;
	text += ' ';
	text += '*';
	text += ctx.t('name-question-full');
	text += '*';

	text += '\n\n';
	text += ctx.t('name-info-full').trim();

	if (ctx.session.name) {
		text += '\n\n';
		text += (await ctx.wd.reader('menu.name')).label();
		text += ': ';
		text += formatNamePlain(ctx.session.name);
	}

	return {text, parse_mode: 'Markdown'};
});

menu.submenu('first', firstMenu, {
	text: ctx => ctx.session.name?.first ?? outEmoji.nameFallback,
});

menu.submenu('last', lastMenu, {
	joinLastRow: true,
	text: ctx => ctx.session.name?.last ?? outEmoji.nameFallback,
	hide: ctx => !ctx.session.name,
});

menu.manualRow(backButtons);
