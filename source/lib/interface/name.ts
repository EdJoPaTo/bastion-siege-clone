import {Name} from '../context'

export function formatNamePlain(name: Name): string {
	let text = name.first
	if (name.last) {
		text += ' '
		text += name.last
	}

	return text
}
