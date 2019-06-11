import TelegrafInlineMenu from 'telegraf-inline-menu'

import {EMOJI} from 'bastion-siege-logic'

import {resources} from '../lib/interface/resource'
import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

import {buildingsMenu, workshopMenu} from './constructions'
import * as nameMenu from './name-picker'
import languageMenu from './languages'
import mysticsMenu from './mystic'
import spyMenu from './spy'
import statsMenu from './stats'
import tradeMenu from './trade'
import warMenu from './war'

async function menuText(ctx: any): Promise<string> {
	let text = ''
	text += wikidataInfoHeader(ctx.wd.r('menu.menu'))
	text += '\n\n'

	if (ctx.session.name) {
		const {first, last} = ctx.session.name
		text += `${outEmoji.name} ${first} ${last}`
		text += '\n\n'
	}

	text += await resources(ctx, ctx.session.resources)

	text += '\n\n'
	text += ctx.i18n.t('disclaimer')

	return text
}

const menu = new TelegrafInlineMenu(menuText)
menu.setCommand('start')

function buttonText(emoji: string, resourceKey: string): (ctx: any) => string {
	return (ctx: any) => `${emoji} ${ctx.wd.r(resourceKey).label()}`
}

menu.submenu(buttonText(outEmoji.name, 'menu.name'), 'name', nameMenu.menu, {
	hide: ctx => !nameMenu.nameNeeded(ctx)
})

menu.submenu(buttonText(EMOJI.buildings, 'bs.buildings'), 'b', buildingsMenu)
menu.submenu(buttonText(EMOJI.workshop, 'bs.workshop'), 'w', workshopMenu, {
	joinLastRow: true
})

menu.submenu(buttonText(EMOJI.war, 'bs.war'), 'war', warMenu, {
	hide: (ctx: any) => nameMenu.nameNeeded(ctx) || ctx.session.constructions.barracks === 0
})

menu.submenu(buttonText(EMOJI.trade, 'bs.trade'), 'trade', tradeMenu, {
	joinLastRow: true
})

menu.submenu(buttonText(EMOJI.dragon, 'menu.mystical'), 'mystic', mysticsMenu, {
	hide: (ctx: any) => nameMenu.nameNeeded(ctx)
})

menu.submenu(buttonText(EMOJI.search, 'menu.spy'), 'spy', spyMenu, {
	joinLastRow: true,
	hide: (ctx: any) => nameMenu.nameNeeded(ctx)
})

menu.submenu(buttonText(outEmoji.language, 'menu.language'), 'lang', languageMenu)

menu.submenu(buttonText(outEmoji.statistics, 'menu.statistics'), 'stats', statsMenu, {
	joinLastRow: true
})

menu.urlButton(buttonText(outEmoji.chat, 'menu.chat'), 'https://t.me/Bs1thApril')

export default menu
