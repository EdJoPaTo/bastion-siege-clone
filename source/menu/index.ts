import {type Body, MenuTemplate} from 'grammy-inline-menu';
import {EMOJI} from 'bastion-siege-logic';
import type {Context} from '../lib/context.js';
import {formatNamePlain} from '../lib/interface/name.js';
import {outEmoji, randomFamilyEmoji, wikidataInfoHeader} from '../lib/interface/generals.js';
import {resources} from '../lib/interface/resource.js';
import {buildingsMenu, workshopMenu} from './constructions.js';
import {menu as familyMenu} from './family.js';
import {menu as languageMenu} from './languages.js';
import {menu as nameMenu} from './name/index.js';
import {menu as spyMenu} from './spy.js';
import {menu as statsMenu} from './stats.js';
import {menu as tradeMenu} from './trade.js';
import {menu as warMenu} from './war.js';

async function menuBody(ctx: Context): Promise<Body> {
	let text = '';
	text += wikidataInfoHeader(await ctx.wd.reader('menu.menu'));
	text += '\n\n';

	if (ctx.session.name) {
		text += `${outEmoji.name} ${formatNamePlain(ctx.session.name)}`;
		text += '\n\n';
	}

	text += await resources(ctx, ctx.session.resources);

	text += '\n\n';
	text += ctx.t('disclaimer');

	return {text, parse_mode: 'Markdown'};
}

export const menu = new MenuTemplate(menuBody);

function buttonText(
	emoji: string,
	resourceKey: string,
): (ctx: Context) => Promise<string> {
	return async ctx => `${emoji} ${(await ctx.wd.reader(resourceKey)).label()}`;
}

menu.submenu(buttonText(EMOJI.buildings, 'bs.buildings'), 'b', buildingsMenu);
menu.submenu(buttonText(EMOJI.workshop, 'bs.workshop'), 'w', workshopMenu, {
	joinLastRow: true,
});

menu.submenu(buttonText(outEmoji.name, 'menu.name'), 'name', nameMenu);

menu.submenu(buttonText(randomFamilyEmoji(), 'menu.family'), 'family', familyMenu, {
	joinLastRow: true,
	hide: ctx => !ctx.session.name?.last,
});

menu.submenu(buttonText(EMOJI.war, 'bs.war'), 'war', warMenu, {
	hide: ctx => !ctx.session.name || ctx.session.constructions.barracks === 0,
});

menu.submenu(buttonText(EMOJI.trade, 'bs.trade'), 'trade', tradeMenu, {
	joinLastRow: true,
});

menu.submenu(buttonText(EMOJI.search, 'menu.spy'), 'spy', spyMenu, {
	hide: ctx => !ctx.session.name,
});

menu.submenu(buttonText(outEmoji.language, 'menu.language'), 'lang', languageMenu);

menu.submenu(buttonText(outEmoji.statistics, 'menu.statistics'), 'stats', statsMenu, {
	joinLastRow: true,
});

menu.url(buttonText(outEmoji.chat, 'menu.chat'), 'https://t.me/Bs1thApril');
