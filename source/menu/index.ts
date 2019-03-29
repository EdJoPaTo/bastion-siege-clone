import TelegrafInlineMenu from 'telegraf-inline-menu'

import {EMOJI} from 'bastion-siege-logic'

import {buildingsMenu, workshopMenu} from './constructions'
import languageMenu from './languages'
import * as nameMenu from './name-picker'

const menu = new TelegrafInlineMenu((ctx: any) => `*${ctx.wd.label('menu.menu')}*`)
menu.setCommand('start')

menu.submenu((ctx: any) => `👋 ${ctx.wd.label('menu.name')}`, 'name', nameMenu.menu, {
	hide: ctx => !nameMenu.nameNeeded(ctx)
})

menu.submenu((ctx: any) => `${EMOJI.buildings} ${ctx.wd.label('bs.buildings')}`, 'b', buildingsMenu)
menu.submenu((ctx: any) => `${EMOJI.workshop} ${ctx.wd.label('bs.workshop')}`, 'w', workshopMenu, {
	joinLastRow: true
})

menu.submenu((ctx: any) => `🏳️‍🌈 ${ctx.wd.label('menu.language')}`, 'lang', languageMenu)

export default menu
