import {createBackMainMenuButtons} from 'telegraf-inline-menu'
import type {Constructions, Resources} from 'bastion-siege-logic'
import type {Context as TelegrafContext} from 'telegraf'
import type {I18nContext} from '@grammyjs/i18n'
import type {MiddlewareProperty} from 'telegraf-wikibase'

import type {PeopleInConstructions} from '../types.js'

type UnixSeconds = number

export type Name = {
	readonly first: string;
	readonly last?: string;
	readonly lastChangeFirst?: UnixSeconds;
	readonly lastChangeLast?: UnixSeconds;
}

export type Session = {
	__wikibase_language_code?: string;
	attackTarget?: number;
	blocked?: boolean;
	constructions: Constructions;
	name?: Name;
	page?: number;
	createFirst?: string;
	createLast?: string | false;
	people: PeopleInConstructions;
	peopleTimestamp: number;
	resources: Resources;
	resourcesTimestamp: number;
	selectedSpy: string;
	selectedSpyEmoji: string;
}

export type Context = TelegrafContext & {
	readonly i18n: I18nContext;
	readonly match: RegExpExecArray | undefined;
	readonly session: Session;
	readonly wd: MiddlewareProperty;
}

export const backButtons = createBackMainMenuButtons<Context>(
	ctx => `🔙 ${ctx.i18n.t('menu.back')}`,
	async ctx => `🔝 ${(await ctx.wd.reader('menu.menu')).label()}`,
)
