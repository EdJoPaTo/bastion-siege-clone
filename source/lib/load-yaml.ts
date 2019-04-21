import * as yaml from 'js-yaml'

type Dictionary<T> = {[key: string]: T}

export function getKeysRecursive(root: Dictionary<any>, prefix = ''): string[] {
	let keys: string[] = []
	for (const key of Object.keys(root)) {
		const subKey = prefix ? prefix + '.' + key : key
		if (typeof root[key] === 'object') {
			keys = keys.concat(getKeysRecursive(root[key], subKey))
		} else {
			keys.push(subKey)
		}
	}

	return keys
}

export function getValueByKey(root: Dictionary<any>, key: string): any {
	const splitted = key.split('.')

	let cursor = root
	for (const elem of splitted) {
		cursor = cursor[elem]
	}

	return cursor
}

export default function (contentString: string): Dictionary<string> {
	const contentYaml = yaml.safeLoad(contentString)
	const keys = getKeysRecursive(contentYaml)

	const result: Dictionary<string> = {}
	for (const key of keys) {
		result[key] = getValueByKey(contentYaml, key)
	}

	return result
}
