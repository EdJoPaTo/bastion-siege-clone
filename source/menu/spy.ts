import arrayFilterUnique from 'array-filter-unique'
import randomItem from 'random-item'
import TelegrafInlineMenu from 'telegraf-inline-menu'
import WikidataEntityReader from 'wikidata-entity-reader'
import {
	ConstructionName,
	CONSTRUCTIONS,
	EMOJI
} from 'bastion-siege-logic'

import {Context, Name} from '../lib/context'
import * as userSessions from '../lib/user-sessions'
import * as wdSets from '../lib/wikidata-sets'

import {wikidataInfoHeader} from '../lib/interface/generals'

function getSpy(ctx: Context): WikidataEntityReader {
	if (!ctx.session.selectedSpy) {
		ctx.session.selectedSpy = wdSets.getRandom('spies')
	}

	const reader = ctx.wd.reader(ctx.session.selectedSpy)

	if (!ctx.session.selectedSpyEmoji) {
		const spymojis = reader.unicodeChars()
		ctx.session.selectedSpyEmoji = randomItem(spymojis)
	}

	return reader
}

function getSpyableConstructions(qNumber: string): ConstructionName[] {
	const possibleConstructions = qNumber
		.slice(1)
		.split('')
		.map(o => Number(o))
		.filter(arrayFilterUnique())
		.map(o => CONSTRUCTIONS[o])

	return possibleConstructions
}

async function menuText(ctx: Context): Promise<string> {
	let text = ''
	text += wikidataInfoHeader(ctx.wd.r('menu.spy'), {titlePrefix: EMOJI.search})

	const spyReader = getSpy(ctx)
	const description = spyReader.description()

	text += '\n\n'
	text += `${ctx.session.selectedSpyEmoji} ${spyReader.label()}\n`
	if (description) {
		text += description
		text += '\n'
	}

	return text
}

const menu = new TelegrafInlineMenu(async (ctx: any) => menuText(ctx))

menu.simpleButton((ctx: any) => `${ctx.wd.r('action.espionage').label()}`, 'espionage', {
	doFunc: async (ctx: any) => {
		const possibleSessions = userSessions.getRaw()
			.filter(o => o.data.name)

		const session = randomItem(possibleSessions).data
		const name = session.name as Name

		const spyableConstructions = getSpyableConstructions(ctx.session.selectedSpy)
		const pickedConstructionKey = randomItem(spyableConstructions)
		const pickedConstructionLevel = session.constructions[pickedConstructionKey]

		let message = ''
		message += ctx.session.selectedSpyEmoji
		message += ' '
		message += `${name.first} ${name.last}`
		message += ' '
		message += EMOJI[pickedConstructionKey]
		message += ctx.wd.r(`construction.${pickedConstructionKey}`).label()
		message += ' '
		message += pickedConstructionLevel

		return ctx.answerCbQuery(message)
	}
})

menu.button((ctx: any) => `${ctx.wd.r('action.change').label()}`, 'change', {
	joinLastRow: true,
	doFunc: (ctx: any) => {
		delete ctx.session.selectedSpy
		delete ctx.session.selectedSpyEmoji
	}
})

menu.urlButton((ctx: any) => `ℹ️ ${ctx.wd.r('menu.wikidataItem').label()} ${ctx.wd.r('menu.spy').label()}`, (ctx: any) => ctx.wd.r('menu.spy').url())

menu.urlButton((ctx: any) => {
	const spyReader = getSpy(ctx)
	return `ℹ️ ${ctx.wd.r('menu.wikidataItem').label()} ${ctx.session.selectedSpyEmoji} ${spyReader.label()}`
}, (ctx: any) => getSpy(ctx).url())

export default menu
