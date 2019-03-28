import TelegrafInlineMenu from 'telegraf-inline-menu'

import {EMOJI} from 'bastion-siege-logic'

import {buildingsMenu, workshopMenu} from './constructions'

const menu = new TelegrafInlineMenu((ctx: any) => `*${ctx.wd.label('menu')}*`)
menu.setCommand('start')

menu.submenu((ctx: any) => `${EMOJI.buildings} ${ctx.wd.label('buildings')}`, 'b', buildingsMenu)
menu.submenu((ctx: any) => `${EMOJI.workshop} ${ctx.wd.label('workshop')}`, 'w', workshopMenu, {
	joinLastRow: true
})

export default menu
