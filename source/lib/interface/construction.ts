import {
	calcBarracksCapacity,
	calcGoldCapacity,
	calcGoldIncome,
	calcGoldIncomePerPerson,
	calcHousesCapacity,
	calcHousesPeopleIncome,
	calcProduction,
	calcProductionFood,
	calcStorageCapacity,
	calcWallArcherCapacity,
	type ConstructionName,
	type Constructions,
	EMOJI,
	type ResourceName,
} from 'bastion-siege-logic';
import type {Context} from '../context.js';
import type {PeopleInConstructions} from '../../types.js';
import {formatNumberShort} from './format-number.js';
import {possibleEmoji, wikidataInfoHeader} from './generals.js';

export async function constructionLine(
	ctx: Context,
	construction: ConstructionName,
	level: number,
	canUpgrade: boolean,
): Promise<string> {
	const reader = await ctx.wd.reader(`construction.${construction}`);
	const parts: string[] = [
		possibleEmoji(canUpgrade),
		EMOJI[construction],
		String(level),
		`*${reader.label()}*`,
	];

	return parts.join(' ');
}

export async function infoHeader(
	ctx: Context,
	construction: ConstructionName,
	currentLevel: number,
): Promise<string> {
	const wdKey = `construction.${construction}`;
	return wikidataInfoHeader(await ctx.wd.reader(wdKey), {
		titlePrefix: EMOJI[construction],
		titleSuffix: String(currentLevel),
	});
}

function simpleLineString(...args: ReadonlyArray<string | number>): string {
	return args.join(' ');
}

async function incomeString(
	ctx: Context,
	income: number | string,
	unit: string,
): Promise<string> {
	const readerLabel = await ctx.wd.reader('other.income');
	const readerDay = await ctx.wd.reader('bs.day');
	return simpleLineString(
		readerLabel.label(),
		income,
		`${unit} / ${readerDay.label()}`,
	);
}

async function storageCapacityString(
	ctx: Context,
	capacity: number,
	unit: ResourceName,
): Promise<string> {
	const readerCapacity = await ctx.wd.reader('bs.storageCapacity');
	return simpleLineString(
		readerCapacity.label(),
		formatNumberShort(capacity, true),
		EMOJI[unit],
	);
}

export function peopleString(
	label: string,
	available: number,
	capacity: number,
	unit: string,
): string {
	return simpleLineString(
		label,
		formatNumberShort(available, true) + unit,
		'/',
		formatNumberShort(capacity, true) + unit,
	);
}

export async function constructionPropertyString(
	ctx: Context,
	constructions: Constructions,
	people: PeopleInConstructions,
	construction: ConstructionName,
): Promise<string | undefined> {
	if (construction === 'townhall') {
		const lines: string[] = [
			await storageCapacityString(
				ctx,
				calcGoldCapacity(constructions.townhall),
				'gold',
			),
			await incomeString(
				ctx,
				calcGoldIncomePerPerson(constructions.townhall).toFixed(1),
				`${EMOJI.gold} / ${(await ctx.wd.reader('bs.inhabitant')).label()}`,
			),
			await incomeString(
				ctx,
				calcGoldIncome(constructions.townhall, constructions.houses),
				EMOJI.gold,
			),
		];

		return lines.join('\n');
	}

	if (construction === 'storage') {
		const units: ResourceName[] = ['wood', 'stone', 'food'];
		const lines = await Promise.all(units
			.map(async o =>
				storageCapacityString(
					ctx,
					calcStorageCapacity(constructions.storage),
					o,
				),
			));

		return lines.join('\n');
	}

	if (construction === 'houses') {
		const lines: string[] = [
			peopleString(
				(await ctx.wd.reader('bs.people')).label(),
				people.houses,
				calcHousesCapacity(constructions.houses),
				EMOJI.people,
			),
			await incomeString(
				ctx,
				calcHousesPeopleIncome(constructions.houses),
				EMOJI.people,
			),
			await incomeString(
				ctx,
				calcProductionFood(constructions.farm, constructions.houses),
				EMOJI.food,
			),
		];

		return lines.join('\n');
	}

	if (construction === 'farm') {
		return incomeString(
			ctx,
			calcProductionFood(constructions.farm, constructions.houses),
			EMOJI.food,
		);
	}

	if (construction === 'sawmill') {
		return incomeString(ctx, calcProduction(constructions.sawmill), EMOJI.wood);
	}

	if (construction === 'mine') {
		return incomeString(ctx, calcProduction(constructions.mine), EMOJI.stone);
	}

	if (construction === 'barracks') {
		return peopleString(
			(await ctx.wd.reader('bs.army')).label(),
			people.barracks,
			calcBarracksCapacity(constructions.barracks),
			EMOJI.army,
		);
	}

	if (construction === 'wall') {
		return peopleString(
			(await ctx.wd.reader('bs.archer')).label(),
			people.wall,
			calcWallArcherCapacity(constructions.wall),
			EMOJI.archer,
		);
	}

	return undefined;
}
