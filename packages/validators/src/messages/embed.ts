import { s } from '@sapphire/shapeshift';
import type { APIEmbedField } from 'discord-api-types/v10';
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
	.object({
		name: fieldNameValidator,
		value: fieldValueValidator,
		inline: fieldInlineValidator,
	})
	.setValidationEnabled(isValidationEnabled);

export const embedFieldsArrayValidator = embedFieldValidator.array.setValidationEnabled(isValidationEnabled);

export const fieldLengthValidator = s.number.lessThanOrEqual(25).setValidationEnabled(isValidationEnabled);

export function validateFieldLength(amountAdding: number, fields?: APIEmbedField[]): void {
	fieldLengthValidator.parse((fields?.length ?? 0) + amountAdding);
}

export const authorNameValidator = fieldNameValidator.nullable.setValidationEnabled(isValidationEnabled);

export const imageURLValidator = s.string
	.url({
		allowedProtocols: ['http:', 'https:', 'attachment:'],
	})
	.nullish.setValidationEnabled(isValidationEnabled);

export const urlValidator = s.string
	.url({
		allowedProtocols: ['http:', 'https:'],
	})
	.nullish.setValidationEnabled(isValidationEnabled);

export const embedAuthorValidator = s
	.object({
		name: authorNameValidator,
		iconURL: imageURLValidator,
		url: urlValidator,
	})
	.setValidationEnabled(isValidationEnabled);

export const RGBValidator = s.number.int
	.greaterThanOrEqual(0)
	.lessThanOrEqual(255)
	.setValidationEnabled(isValidationEnabled);
export const colorValidator = s.number.int
	.greaterThanOrEqual(0)
	.lessThanOrEqual(0xffffff)
	.or(s.tuple([RGBValidator, RGBValidator, RGBValidator]))
	.nullable.setValidationEnabled(isValidationEnabled);

export const descriptionValidator = s.string
	.lengthGreaterThanOrEqual(1)
	.lengthLessThanOrEqual(4_096)
	.nullable.setValidationEnabled(isValidationEnabled);

export const footerTextValidator = s.string
	.lengthGreaterThanOrEqual(1)
	.lengthLessThanOrEqual(2_048)
	.nullable.setValidationEnabled(isValidationEnabled);

export const embedFooterValidator = s
	.object({
		text: footerTextValidator,
		iconURL: imageURLValidator,
	})
	.setValidationEnabled(isValidationEnabled);

export const timestampValidator = s.union(s.number, s.date).nullable.setValidationEnabled(isValidationEnabled);

export const titleValidator = fieldNameValidator.nullable.setValidationEnabled(isValidationEnabled);
