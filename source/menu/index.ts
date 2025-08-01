import {EMOJI} from 'bastion-siege-logic';
import {MenuTemplate} from 'grammy-inline-menu';
import type {Context} from '../lib/context.ts';
import {
	outEmoji,
	randomFamilyEmoji,
	wikidataInfoHeader,
} from '../lib/interface/generals.ts';
import {formatNamePlain} from '../lib/interface/name.ts';
import {resources} from '../lib/interface/resource.ts';
import {buildingsMenu, workshopMenu} from './constructions.ts';
import {menu as familyMenu} from './family.ts';
import {menu as languageMenu} from './languages.ts';
import {menu as nameMenu} from './name/index.ts';
import {menu as spyMenu} from './spy.ts';
import {menu as statsMenu} from './stats.ts';
import {menu as tradeMenu} from './trade.ts';
import {menu as warMenu} from './war.ts';

export const menu = new MenuTemplate<Context>(async ctx => {
	let text = wikidataInfoHeader(await ctx.wd.reader('menu.menu'));
	text += '\n\n';

	if (ctx.session.name) {
		text += `${outEmoji.name} ${formatNamePlain(ctx.session.name)}`;
		text += '\n\n';
	}

	text += await resources(ctx, ctx.session.resources);

	text += '\n\n';
	text += ctx.t('disclaimer');

	return {text, parse_mode: 'Markdown'};
});

function buttonText(
	emoji: string,
	resourceKey: string,
): (ctx: Context) => Promise<string> {
	return async ctx => {
		const reader = await ctx.wd.reader(resourceKey);
		return `${emoji} ${reader.label()}`;
	};
}

menu.submenu('b', buildingsMenu, {
	text: buttonText(EMOJI.buildings, 'bs.buildings'),
});
menu.submenu('w', workshopMenu, {
	joinLastRow: true,
	text: buttonText(EMOJI.workshop, 'bs.workshop'),
});

menu.submenu('name', nameMenu, {
	text: buttonText(outEmoji.name, 'menu.name'),
});

menu.submenu('family', familyMenu, {
	joinLastRow: true,
	text: buttonText(randomFamilyEmoji(), 'menu.family'),
	hide: ctx => !ctx.session.name?.last,
});

menu.submenu('war', warMenu, {
	text: buttonText(EMOJI.war, 'bs.war'),
	hide: ctx => !ctx.session.name || ctx.session.constructions.barracks === 0,
});

menu.submenu('trade', tradeMenu, {
	joinLastRow: true,
	text: buttonText(EMOJI.trade, 'bs.trade'),
});

menu.submenu('spy', spyMenu, {
	text: buttonText(EMOJI.search, 'menu.spy'),
	hide: ctx => !ctx.session.name,
});

menu.submenu('lang', languageMenu, {
	text: buttonText(outEmoji.language, 'menu.language'),
});

menu.submenu('stats', statsMenu, {
	joinLastRow: true,
	text: buttonText(outEmoji.statistics, 'menu.statistics'),
});

menu.url({
	text: buttonText(outEmoji.chat, 'menu.chat'),
	url: 'https://t.me/Bs1thApril',
});
