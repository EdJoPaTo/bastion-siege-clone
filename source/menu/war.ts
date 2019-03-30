import TelegrafInlineMenu from 'telegraf-inline-menu'

function menuText(ctx: any): string {
	let text = ''
	text += `*${ctx.wd.label('bs.war')}*\n`
	text += 'Work in progress…'
	return text
}

const menu = new TelegrafInlineMenu(menuText)

export default menu
