import {Constructions, Resources} from 'bastion-siege-logic'
import {Context as TelegrafContext} from 'telegraf'
import {createBackMainMenuButtons} from 'telegraf-inline-menu'
import {I18n} from 'telegraf-i18n'
import {MiddlewareProperty} from 'telegraf-wikibase'

import {PeopleInConstructions} from '../types'

export interface Name {
	readonly first: string;
	readonly last?: string;
}

export interface Session {
	__wikibase_language_code?: string;
	attackTarget?: number;
	blocked?: boolean;
	constructions: Constructions;
	name?: Name;
	page?: number;
	createFirst?: string;
	createLast?: string;
	people: PeopleInConstructions;
	peopleTimestamp: number;
	resources: Resources;
	resourcesTimestamp: number;
	selectedSpy: string;
	selectedSpyEmoji: string;
}

export interface Context extends TelegrafContext {
	readonly i18n: I18n;
	readonly session: Session;
	readonly wd: MiddlewareProperty;
}

export const backButtons = createBackMainMenuButtons<Context>(
	ctx => `🔙 ${ctx.i18n.t('menu.back')}`,
	async ctx => `🔝 ${(await ctx.wd.reader('menu.menu')).label()}`
)
