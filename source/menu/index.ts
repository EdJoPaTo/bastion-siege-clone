import TelegrafInlineMenu from 'telegraf-inline-menu'

import {EMOJI} from 'bastion-siege-logic'

import {resources} from '../lib/interface/resource'

import {buildingsMenu, workshopMenu} from './constructions'
import * as nameMenu from './name-picker'
import languageMenu from './languages'
import tradeMenu from './trade'

function menuText(ctx: any): string {
	let text = ''
	text += `*${ctx.wd.label('menu.menu')}*\n`

	if (ctx.session.name) {
		const {first, last} = ctx.session.name
		text += '\n'
		text += `😎 ${first} ${last}\n`
	}

	text += '\n'
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

menu.simpleButton((ctx: any) => `${EMOJI.war} ${ctx.wd.label('bs.war')}`, 'war', {
	hide: ctx => nameMenu.nameNeeded(ctx),
	doFunc: ctx => ctx.answerCbQuery('work in progress…')
})

menu.submenu((ctx: any) => `${EMOJI.trade} ${ctx.wd.label('bs.trade')}`, 'trade', tradeMenu, {
	joinLastRow: true
})

menu.submenu((ctx: any) => `🏳️‍🌈 ${ctx.wd.label('menu.language')}`, 'lang', languageMenu)

export default menu
