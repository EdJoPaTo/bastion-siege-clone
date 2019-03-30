import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
	EMOJI
} from 'bastion-siege-logic'

import {wikidataInfoHeader} from '../lib/interface/generals'

function menuText(ctx: any): string {
	let text = ''
	text += wikidataInfoHeader(ctx, 'bs.war', {titlePrefix: EMOJI.war})
	text += '\n\n'
	text += 'Work in progress…'
	return text
}

const menu = new TelegrafInlineMenu(menuText)

export default menu
