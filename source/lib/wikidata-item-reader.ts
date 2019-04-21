import {EntitySimplified} from 'wikidata-sdk'

export class WikidataItemReader {
	constructor(
		private entity: EntitySimplified,
		private defaultLanguageCode: string = 'en'
	) { }

	qNumber(): string {
		return this.entity.id
	}

	label(languageCode = this.defaultLanguageCode): string {
		return label(this.entity, languageCode)
	}

	description(languageCode = this.defaultLanguageCode): string | undefined {
		return description(this.entity, languageCode)
	}

	url(): string {
		return url(this.entity)
	}
}

export function label(entity: EntitySimplified, languageCode = 'en'): string {
	const {labels} = entity
	if (!labels || !labels[languageCode]) {
		return entity.id
	}

	return labels[languageCode]
}

export function description(entity: EntitySimplified, languageCode = 'en'): string | undefined {
	const {descriptions} = entity
	if (!descriptions) {
		return undefined
	}

	return descriptions[languageCode]
}

export function url(entity: EntitySimplified): string {
	return `https://www.wikidata.org/wiki/${entity.id}`
}
