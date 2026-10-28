import randomItem from "random-item";
import type { WikibaseEntityReader } from "telegraf-wikibase";

export const outEmoji = {
	activeUser: "💙",
	betrayal: "😈",
	chat: "💭",
	fire: "🔥",
	health: "❤️",
	language: "🏳️‍🌈",
	lose: "😭",
	name: "👋",
	nameFallback: "🔮",
	possibleNo: "⛔️",
	possibleYes: "✅",
	statistics: "📊",
	suicide: "😵",
	win: "🎉",
	withoutLastName: "🎭",
} as const;

const FAMILY_EMOJIS: readonly string[] = [
	"👨‍👩‍👧‍👦",
	"👨‍👩‍👦‍👦",
	"👨‍👩‍👧‍👧",
	"👩‍👩‍👧‍👦",
	"👩‍👩‍👦‍👦",
	"👩‍👩‍👧‍👧",
	"👨‍👨‍👧‍👦",
	"👨‍👨‍👦‍👦",
	"👨‍👨‍👧‍👧",
	"👨‍👩‍👦",
	"👨‍👩‍👧",
	"👨‍👨‍👦",
	"👨‍👨‍👧",
	"👩‍👩‍👦",
	"👩‍👩‍👧",
	"👩‍👦",
	"👩‍👧",
	"👩‍👧‍👦",
	"👩‍👦‍👦",
	"👩‍👧‍👧",
	"👨‍👦",
	"👨‍👧",
	"👨‍👧‍👦",
	"👨‍👦‍👦",
	"👨‍👧‍👧",
];

export function possibleEmoji(condition: boolean) {
	return condition ? outEmoji.possibleYes : outEmoji.possibleNo;
}

export function randomFamilyEmoji(): string {
	return randomItem(FAMILY_EMOJIS);
}

type InfoHeaderOptions = {
	readonly titlePrefix?: string;
	readonly titleSuffix?: string;
};

export function wikidataInfoHeader(
	wdr: WikibaseEntityReader,
	options: InfoHeaderOptions = {},
): string {
	const { titlePrefix, titleSuffix } = options;
	const label = wdr.label();
	const description = wdr.description();

	let text = "";

	if (titlePrefix) {
		text += titlePrefix;
		text += " ";
	}

	text += `*${label}*`;

	if (titleSuffix) {
		text += " ";
		text += titleSuffix;
	}

	if (description) {
		text += "\n";
		text += description;
	}

	return text;
}
