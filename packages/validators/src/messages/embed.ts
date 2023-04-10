import { s } from '@sapphire/shapeshift';
import type {
	APIEmbed,
	APIEmbedAuthor,
	APIEmbedField,
	APIEmbedFooter,
	APIEmbedImage,
	APIEmbedProvider,
} from 'discord-api-types/v10';
import { isValidationEnabled } from '../validation.js';

export const fieldNameValidator = s.string
	.lengthGreaterThanOrEqual(1)
	.lengthLessThanOrEqual(256)
	.setValidationEnabled(isValidationEnabled);

export const fieldValueValidator = s.string
	.lengthGreaterThanOrEqual(1)
	.lengthLessThanOrEqual(1_024)
	.setValidationEnabled(isValidationEnabled);

export const fieldInlineValidator = s.boolean.optional;

export const embedFieldValidator = s
	.object<APIEmbedField>({
		name: fieldNameValidator,
		value: fieldValueValidator,
		inline: fieldInlineValidator.optional,
	})
	.setValidationEnabled(isValidationEnabled);

export const embedFieldsArrayValidator = embedFieldValidator.array
	.lengthLessThanOrEqual(25)
	.setValidationEnabled(isValidationEnabled);

export const fieldLengthValidator = s.number.lessThanOrEqual(25).setValidationEnabled(isValidationEnabled);

export function validateFieldLength(amountAdding: number, fields?: APIEmbedField[]): void {
	fieldLengthValidator.parse((fields?.length ?? 0) + amountAdding);
}

export const authorNameValidator = fieldNameValidator.setValidationEnabled(isValidationEnabled);

export const imageURLValidator = s.string
	.url({
		allowedProtocols: ['http:', 'https:', 'attachment:'],
	})
	.setValidationEnabled(isValidationEnabled);

export const urlValidator = s.string
	.url({
		allowedProtocols: ['http:', 'https:'],
	})
	.setValidationEnabled(isValidationEnabled);

export const embedAuthorValidator = s
	.object<APIEmbedAuthor>({
		name: authorNameValidator,
		icon_url: imageURLValidator.optional,
		url: urlValidator.optional,
		proxy_icon_url: imageURLValidator.optional,
	})
	.setValidationEnabled(isValidationEnabled);

export const colorValidator = s.number.int
	.greaterThanOrEqual(0)
	.lessThanOrEqual(0xffffff)
	.setValidationEnabled(isValidationEnabled);

export const descriptionValidator = s.string
	.lengthGreaterThanOrEqual(1)
	.lengthLessThanOrEqual(4_096)
	.setValidationEnabled(isValidationEnabled);

export const footerTextValidator = s.string
	.lengthGreaterThanOrEqual(1)
	.lengthLessThanOrEqual(2_048)
	.setValidationEnabled(isValidationEnabled);

export const embedFooterValidator = s
	.object<APIEmbedFooter>({
		text: footerTextValidator,
		icon_url: imageURLValidator,
	})
	.setValidationEnabled(isValidationEnabled);

export const timestampValidator = s.string.setValidationEnabled(isValidationEnabled);
export const titleValidator = fieldNameValidator.setValidationEnabled(isValidationEnabled);

export const imageValidator = s.object<APIEmbedImage>({
	url: imageURLValidator,
	proxy_url: imageURLValidator.optional,
	height: s.number.optional,
	width: s.number.optional,
});

export const providerValidator = s.object<APIEmbedProvider>({
	name: s.string.optional,
	url: urlValidator.optional,
});

export const validator = s.object<APIEmbed>({
	title: titleValidator.optional,
	description: descriptionValidator.optional,
	url: urlValidator.optional,
	timestamp: timestampValidator.optional,
	color: colorValidator.optional,
	footer: embedFooterValidator.optional,
	image: imageValidator.optional,
	thumbnail: imageValidator.optional,
	video: imageValidator.optional,
	provider: providerValidator.optional,
	author: embedAuthorValidator.optional,
	fields: embedFieldsArrayValidator.optional,
});
