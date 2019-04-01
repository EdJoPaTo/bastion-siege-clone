import TelegrafInlineMenu from 'telegraf-inline-menu'

import {EMOJI} from 'bastion-siege-logic'

import {resources} from '../lib/interface/resource'
import {outEmoji, wikidataInfoHeader} from '../lib/interface/generals'

import {buildingsMenu, workshopMenu} from './constructions'
import * as nameMenu from './name-picker'
import spyMenu from './spy'
import languageMenu from './languages'
import tradeMenu from './trade'
import warMenu from './war'

async function menuText(ctx: any): Promise<string> {
	let text = ''
	text += await wikidataInfoHeader(ctx, 'menu.menu')
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

menu.submenu(async (ctx: any) => `${outEmoji.name} ${await ctx.wd.label('menu.name')}`, 'name', nameMenu.menu, {
	hide: ctx => !nameMenu.nameNeeded(ctx)
})

menu.submenu(async (ctx: any) => `${EMOJI.buildings} ${await ctx.wd.label('bs.buildings')}`, 'b', buildingsMenu)
menu.submenu(async (ctx: any) => `${EMOJI.workshop} ${await ctx.wd.label('bs.workshop')}`, 'w', workshopMenu, {
	joinLastRow: true
})

menu.submenu(async (ctx: any) => `${EMOJI.war} ${await ctx.wd.label('bs.war')}`, 'war', warMenu, {
	hide: (ctx: any) => nameMenu.nameNeeded(ctx) || ctx.session.constructions.barracks === 0
})

menu.submenu(async (ctx: any) => `${EMOJI.search} ${await ctx.wd.label('menu.spy')}`, 'spy', spyMenu, {
	joinLastRow: true,
	hide: (ctx: any) => nameMenu.nameNeeded(ctx)
})

menu.submenu(async (ctx: any) => `${EMOJI.trade} ${await ctx.wd.label('bs.trade')}`, 'trade', tradeMenu, {
	joinLastRow: true
})

menu.submenu(async (ctx: any) => `${outEmoji.language} ${await ctx.wd.label('menu.language')}`, 'lang', languageMenu)

menu.urlButton(async (ctx: any) => `${outEmoji.chat} ${await ctx.wd.label('menu.chat')}`, 'https://t.me/Bs1thApril')

export default menu
