export const outEmoji: {[key: string]: string} = {
	possibleYes: '✅',
	possibleNo: '⛔️'
}

export function possibleEmoji(condition: boolean): string {
	return condition ? outEmoji.possibleYes : outEmoji.possibleNo
}
