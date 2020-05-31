import {Constructions, Resources} from 'bastion-siege-logic'
import {Context as TelegrafContext} from 'telegraf'
import {createBackMainMenuButtons} from 'telegraf-inline-menu'
import {I18n} from 'telegraf-i18n'
import {MiddlewareProperty} from 'telegraf-wikibase'

import {PeopleInConstructions} from '../types'

export interface Name {
	readonly first: string;
	readonly last: string;
}

export interface Session {
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
	wikidataLanguageCode: string;
}

export interface Context extends TelegrafContext {
	i18n: I18n;
	session: Session;
	wd: MiddlewareProperty;
}

export const backButtons = createBackMainMenuButtons<Context>(ctx => `🔙 ${ctx.i18n.t('menu.back')}`, ctx => `🔝 ${ctx.wd.r('menu.menu').label()}`)
