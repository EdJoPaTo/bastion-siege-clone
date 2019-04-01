import * as wdkGot from 'wikidata-sdk-got'
import arrayFilterUnique from 'array-filter-unique'
import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
	ConstructionName,
	Constructions,
	CONSTRUCTIONS,
	EMOJI
} from 'bastion-siege-logic'

import * as userSessions from '../lib/user-sessions'

import {wikidataInfoHeader} from '../lib/interface/generals'

interface Spy {
	emoji: string;
	value: string;
	label?: string;
	description?: string;
}

const spyCache = new Map()

async function getPossibleSpies(lang: string): Promise<Spy[]> {
	const query = `SELECT ?item ?itemLabel ?itemDescription ?emoji WHERE {
  ?item wdt:P279+ wd:Q729.
	?item wdt:P487 ?emoji.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
}`
	const result = await wdkGot.sparqlQuerySimplified(query, {cache: spyCache})
	const mapped: any = result.map((o: any) => ({...o.item, emoji: o.emoji}))
	return mapped as Spy[]
}

async function currentSpy(ctx: any): Promise<Spy> {
	const possibleSpies = await getPossibleSpies(ctx.wd.locale())

	const {selectedSpy, selectedSpyEmoji} = ctx.session
	const entries = possibleSpies.filter(o => o.value === selectedSpy && o.emoji === selectedSpyEmoji)
	if (entries.length > 0) {
		return entries[0]
	}

	const rand = Math.floor(Math.random() * possibleSpies.length)
	ctx.session.selectedSpy = possibleSpies[rand].value
	ctx.session.selectedSpyEmoji = possibleSpies[rand].emoji
	return possibleSpies[rand]
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

async function tradeMenuText(ctx: any): Promise<string> {
	let text = ''
	text += wikidataInfoHeader(ctx, 'menu.spy', {titlePrefix: EMOJI.search})

	const mySpy = await currentSpy(ctx)

	text += '\n\n'
	text += `${ctx.session.selectedSpyEmoji} ${mySpy.label}\n`
	if (mySpy.description) {
		text += mySpy.description
		text += '\n'
	}

	return text
}

const menu = new TelegrafInlineMenu(tradeMenuText)

menu.simpleButton((ctx: any) => `${ctx.wd.label('action.espionage')}`, 'espionage', {
	doFunc: (ctx: any) => {
		const possibleSessions = userSessions.getRaw()
			.filter(o => o.data.name)

		const pickedSessionId = Math.floor(Math.random() * possibleSessions.length)
		const session = possibleSessions[pickedSessionId].data
		const name = session.name as {first: string; last: string}
		const constructions = session.constructions as Constructions

		const spyableConstructions = getSpyableConstructions(ctx.session.selectedSpy)
		const pickedIndex = Math.floor(Math.random() * spyableConstructions.length)
		const pickedConstructionKey = spyableConstructions[pickedIndex]
		const pickedConstructionLevel = constructions[pickedConstructionKey]

		let message = ''
		message += ctx.session.selectedSpyEmoji
		message += ' '
		message += `${name.first} ${name.last}`
		message += ' '
		message += EMOJI[pickedConstructionKey]
		message += ctx.wd.label(`construction.${pickedConstructionKey}`)
		message += ' '
		message += pickedConstructionLevel

		return ctx.answerCbQuery(message)
	}
})

menu.button((ctx: any) => `${ctx.wd.label('action.change')}`, 'change', {
	joinLastRow: true,
	doFunc: (ctx: any) => {
		delete ctx.session.selectedSpy
	}
})

menu.urlButton((ctx: any) => `ℹ️ ${ctx.wd.label('menu.wikidataItem')}`, (ctx: any) => ctx.wd.url('menu.spy'))

export default menu
