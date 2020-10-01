import {MenuTemplate, Body} from 'telegraf-inline-menu'
import arrayFilterUnique from 'array-filter-unique'
import randomItem from 'random-item'
import WikidataEntityReader from 'wikidata-entity-reader'
import {
	ConstructionName,
	CONSTRUCTIONS,
	EMOJI
} from 'bastion-siege-logic'

import {Context, backButtons} from '../lib/context'
import * as userSessions from '../lib/user-sessions'
import * as wdSets from '../lib/wikidata-sets'

import {formatNamePlain} from '../lib/interface/name'
import {wikidataInfoHeader} from '../lib/interface/generals'

async function getSpy(ctx: Context): Promise<WikidataEntityReader> {
	if (!ctx.session.selectedSpy) {
		ctx.session.selectedSpy = wdSets.getRandom('spies')
	}

	const reader = await ctx.wd.reader(ctx.session.selectedSpy)

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

async function menuBody(ctx: Context): Promise<Body> {
	let text = ''
	text += wikidataInfoHeader(await ctx.wd.reader('menu.spy'), {titlePrefix: EMOJI.search})

	const spyReader = await getSpy(ctx)
	const description = spyReader.description()

	text += '\n\n'
	text += `${ctx.session.selectedSpyEmoji} ${spyReader.label()}\n`
	if (description) {
		text += description
		text += '\n'
	}

	return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate(menuBody)

menu.interact(async ctx => `${(await ctx.wd.reader('action.espionage')).label()}`, 'espionage', {
	do: async ctx => {
		const possibleSessions = userSessions.getRaw()
			.filter(o => o.data.name)

		const session = randomItem(possibleSessions).data
		const name = session.name!

		const spyableConstructions = getSpyableConstructions(ctx.session.selectedSpy)
		const pickedConstructionKey = randomItem(spyableConstructions)
		const pickedConstructionLevel = session.constructions[pickedConstructionKey]

		let message = ''
		message += ctx.session.selectedSpyEmoji
		message += ' '
		message += formatNamePlain(name)
		message += ' '
		message += EMOJI[pickedConstructionKey]
		message += (await ctx.wd.reader(`construction.${pickedConstructionKey}`)).label()
		message += ' '
		message += pickedConstructionLevel

		await ctx.answerCbQuery(message)
		return false
	}
})

menu.interact(async ctx => `${(await ctx.wd.reader('action.change')).label()}`, 'change', {
	joinLastRow: true,
	do: ctx => {
		// @ts-expect-error
		delete ctx.session.selectedSpy
		// @ts-expect-error
		delete ctx.session.selectedSpyEmoji
		return '.'
	}
})

menu.url(
	async ctx => `ℹ️ ${(await ctx.wd.reader('menu.wikidataItem')).label()} ${(await ctx.wd.reader('menu.spy')).label()}`,
	async ctx => (await ctx.wd.reader('menu.spy')).url()
)

menu.url(async ctx => {
	const spyReader = await getSpy(ctx)
	return `ℹ️ ${(await ctx.wd.reader('menu.wikidataItem')).label()} ${ctx.session.selectedSpyEmoji} ${spyReader.label()}`
}, async ctx => (await getSpy(ctx)).url())

menu.manualRow(backButtons)
