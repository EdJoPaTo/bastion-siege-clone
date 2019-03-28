import TelegrafInlineMenu from 'telegraf-inline-menu'
import {ConstructionName, CONSTRUCTIONS} from 'bastion-siege-logic'

import {infoHeader} from '../lib/interface/construction'

const menu = new TelegrafInlineMenu(constructionText)

function constructionFromCtx(ctx: any): {construction: ConstructionName; level: number} {
	const construction = ctx.match[1]
	const constructions = ctx.session.constructions || {}
	const level = constructions[construction] || 0

	return {construction, level}
}

function constructionText(ctx: any): string {
	const {construction, level} = constructionFromCtx(ctx)

	const text = infoHeader(ctx, construction, level)

	return text
}

menu.button((ctx: any) => `⬆️ ${ctx.wd.label('action.upgrade')}`, 'upgrade', {
	doFunc: (ctx: any) => {
		if (!ctx.session.constructions) {
			ctx.session.constructions = {}
			for (const c of CONSTRUCTIONS) {
				ctx.session.constructions[c] = 0
			}
		}

		const {construction, level} = constructionFromCtx(ctx)
		ctx.session.constructions[construction] = level + 1
	}
})

menu.urlButton((ctx: any) => `ℹ️ ${ctx.wd.label('wikidataItem')}`, (ctx: any) => {
	const {construction} = constructionFromCtx(ctx)
	const wdKey = `construction.${construction}`
	return ctx.wd.url(wdKey)
})

export default menu
