import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {EMOJI} from 'bastion-siege-logic'

import {Context} from '../lib/context'

import {resources} from '../lib/interface/resource'
import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

import {buildingsMenu, workshopMenu} from './constructions'
import * as nameMenu from './name-picker'
import {menu as languageMenu} from './languages'
import {menu as mysticsMenu} from './mystic'
import {menu as spyMenu} from './spy'
import {menu as statsMenu} from './stats'
import {menu as tradeMenu} from './trade'
import {menu as warMenu} from './war'

function menuBody(ctx: Context): Body {
	let text = ''
	text += wikidataInfoHeader(ctx.wd.r('menu.menu'))
	text += '\n\n'

	if (ctx.session.name) {
		const {first, last} = ctx.session.name
		text += `${outEmoji.name} ${first} ${last}`
		text += '\n\n'
	}

	text += resources(ctx, ctx.session.resources)

	text += '\n\n'
	text += ctx.i18n.t('disclaimer')

	return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate(menuBody)

function buttonText(emoji: string, resourceKey: string): (ctx: Context) => string {
	return ctx => `${emoji} ${ctx.wd.reader(resourceKey).label()}`
}

menu.submenu(buttonText(outEmoji.name, 'menu.name'), 'name', nameMenu.menu, {
	hide: ctx => !nameMenu.nameNeeded(ctx)
})

menu.submenu(buttonText(EMOJI.buildings, 'bs.buildings'), 'b', buildingsMenu)
menu.submenu(buttonText(EMOJI.workshop, 'bs.workshop'), 'w', workshopMenu, {
	joinLastRow: true
})

menu.submenu(buttonText(EMOJI.war, 'bs.war'), 'war', warMenu, {
	hide: ctx => nameMenu.nameNeeded(ctx) || ctx.session.constructions.barracks === 0
})

menu.submenu(buttonText(EMOJI.trade, 'bs.trade'), 'trade', tradeMenu, {
	joinLastRow: true
})

menu.submenu(buttonText(EMOJI.dragon, 'menu.mystical'), 'mystic', mysticsMenu, {
	hide: ctx => nameMenu.nameNeeded(ctx)
})

menu.submenu(buttonText(EMOJI.search, 'menu.spy'), 'spy', spyMenu, {
	joinLastRow: true,
	hide: ctx => nameMenu.nameNeeded(ctx)
})

menu.submenu(buttonText(outEmoji.language, 'menu.language'), 'lang', languageMenu)

menu.submenu(buttonText(outEmoji.statistics, 'menu.statistics'), 'stats', statsMenu, {
	joinLastRow: true
})

menu.url(buttonText(outEmoji.chat, 'menu.chat'), 'https://t.me/Bs1thApril')
