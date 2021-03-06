import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {EMOJI} from 'bastion-siege-logic'

import {Context} from '../lib/context'

import {formatNamePlain} from '../lib/interface/name'
import {outEmoji, wikidataInfoHeader, randomFamilyEmoji} from '../lib/interface/generals'
import {resources} from '../lib/interface/resource'

import {buildingsMenu, workshopMenu} from './constructions'
import {menu as familyMenu} from './family'
import {menu as languageMenu} from './languages'
import {menu as mysticsMenu} from './mystic'
import {menu as nameMenu} from './name'
import {menu as spyMenu} from './spy'
import {menu as statsMenu} from './stats'
import {menu as tradeMenu} from './trade'
import {menu as warMenu} from './war'

async function menuBody(ctx: Context): Promise<Body> {
	let text = ''
	text += wikidataInfoHeader(await ctx.wd.reader('menu.menu'))
	text += '\n\n'

	if (ctx.session.name) {
		text += `${outEmoji.name} ${formatNamePlain(ctx.session.name)}`
		text += '\n\n'
	}

	text += await resources(ctx, ctx.session.resources)

	text += '\n\n'
	text += ctx.i18n.t('disclaimer')

	return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate(menuBody)

function buttonText(emoji: string, resourceKey: string): (ctx: Context) => Promise<string> {
	return async ctx => `${emoji} ${(await ctx.wd.reader(resourceKey)).label()}`
}

menu.submenu(buttonText(EMOJI.buildings, 'bs.buildings'), 'b', buildingsMenu)
menu.submenu(buttonText(EMOJI.workshop, 'bs.workshop'), 'w', workshopMenu, {
	joinLastRow: true
})

menu.submenu(buttonText(outEmoji.name, 'menu.name'), 'name', nameMenu)

menu.submenu(buttonText(randomFamilyEmoji(), 'menu.family'), 'family', familyMenu, {
	joinLastRow: true,
	hide: ctx => !ctx.session.name?.last
})

menu.submenu(buttonText(EMOJI.war, 'bs.war'), 'war', warMenu, {
	hide: ctx => !ctx.session.name || ctx.session.constructions.barracks === 0
})

menu.submenu(buttonText(EMOJI.trade, 'bs.trade'), 'trade', tradeMenu, {
	joinLastRow: true
})

menu.submenu(buttonText(EMOJI.dragon, 'menu.mystical'), 'mystic', mysticsMenu, {
	hide: ctx => !ctx.session.name
})

menu.submenu(buttonText(EMOJI.search, 'menu.spy'), 'spy', spyMenu, {
	joinLastRow: true,
	hide: ctx => !ctx.session.name
})

menu.submenu(buttonText(outEmoji.language, 'menu.language'), 'lang', languageMenu)

menu.submenu(buttonText(outEmoji.statistics, 'menu.statistics'), 'stats', statsMenu, {
	joinLastRow: true
})

menu.url(buttonText(outEmoji.chat, 'menu.chat'), 'https://t.me/Bs1thApril')
