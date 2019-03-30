import TelegrafInlineMenu from 'telegraf-inline-menu'

import {EMOJI} from 'bastion-siege-logic'

import {resources} from '../lib/interface/resource'
import {wikidataInfoHeader} from '../lib/interface/generals'

import {buildingsMenu, workshopMenu} from './constructions'
import * as nameMenu from './name-picker'
import languageMenu from './languages'
import tradeMenu from './trade'
import warMenu from './war'

function menuText(ctx: any): string {
	let text = ''
	text += wikidataInfoHeader(ctx, 'menu.menu')
	text += '\n\n'

	if (ctx.session.name) {
		const {first, last} = ctx.session.name
		text += `${ctx.wd.label('menu.name')} ${first} ${last}`
		text += '\n\n'
	}

	text += resources(ctx, ctx.session.resources)

	return text
}

const menu = new TelegrafInlineMenu(menuText)
menu.setCommand('start')

menu.submenu((ctx: any) => `👋 ${ctx.wd.label('menu.name')}`, 'name', nameMenu.menu, {
	hide: ctx => !nameMenu.nameNeeded(ctx)
})

menu.submenu((ctx: any) => `${EMOJI.buildings} ${ctx.wd.label('bs.buildings')}`, 'b', buildingsMenu)
menu.submenu((ctx: any) => `${EMOJI.workshop} ${ctx.wd.label('bs.workshop')}`, 'w', workshopMenu, {
	joinLastRow: true
})

menu.submenu((ctx: any) => `${EMOJI.war} ${ctx.wd.label('bs.war')}`, 'war', warMenu, {
	hide: ctx => nameMenu.nameNeeded(ctx)
})

menu.submenu((ctx: any) => `${EMOJI.trade} ${ctx.wd.label('bs.trade')}`, 'trade', tradeMenu, {
	joinLastRow: true
})

menu.submenu((ctx: any) => `🏳️‍🌈 ${ctx.wd.label('menu.language')}`, 'lang', languageMenu)

export default menu
