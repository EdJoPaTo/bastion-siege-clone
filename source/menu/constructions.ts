import TelegrafInlineMenu from 'telegraf-inline-menu'
import {EMOJI, BUILDINGS, WORKSHOP} from 'bastion-siege-logic'

import entryMenu from './construction'

function constructionTextFunc(ctx: any, key: string): string {
	const wdKey = `construction.${key}`
	return `${EMOJI[key]} ${ctx.wd.label(wdKey)}`
}

export const buildingsMenu = new TelegrafInlineMenu((ctx: any) => `*${ctx.wd.label('bs.buildings')}*`)

buildingsMenu.selectSubmenu('', BUILDINGS, entryMenu, {
	columns: 2,
	textFunc: constructionTextFunc
})

export const workshopMenu = new TelegrafInlineMenu((ctx: any) => `*${ctx.wd.label('bs.workshop')}*`)

workshopMenu.selectSubmenu('', WORKSHOP, entryMenu, {
	columns: 2,
	textFunc: constructionTextFunc
})
