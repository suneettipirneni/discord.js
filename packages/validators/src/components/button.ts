import { Result, s } from '@sapphire/shapeshift';
import type { APIButtonComponent } from 'discord-api-types/v10';
import { ComponentType, ButtonStyle } from 'discord-api-types/v10';
import { customIdValidator, disabledValidator, emojiValidator } from '../shared.js';
import { isValidationEnabled } from '../validation.js';

export const labelValidator = s.string
	.lengthGreaterThanOrEqual(1)
	.lengthLessThanOrEqual(80)
	.setValidationEnabled(isValidationEnabled);

export const linkStyleValidator = s.enum(ButtonStyle.Link as const).setValidationEnabled(isValidationEnabled);
export const typeValidator = s.enum(ComponentType.Button as const).setValidationEnabled(isValidationEnabled);
export const styleValidator = s.nativeEnum(ButtonStyle).setValidationEnabled(isValidationEnabled);

export const validator = s
	.object<APIButtonComponent>({
		label: labelValidator.optional,
		type: typeValidator,
		// @ts-expect-error check for interaction buttons
		style: styleValidator,
		emoji: emojiValidator.optional,
		disabled: disabledValidator.optional,
		// @ts-expect-error check for link buttons
		url: s.string.url().optional,
		custom_id: customIdValidator.optional,
	})
	.setValidationEnabled(isValidationEnabled)
	.reshape((button) => {
		if (button.style !== ButtonStyle.Link) {
			// @ts-expect-error exhaustive check for interaction buttons
			if (button.url !== undefined) {
				return Result.err(new Error('URL is not allowed for interaction buttons'));
			}

			// @ts-expect-error exhaustive check for interaction buttons
			if (button.custom_id === undefined) {
				return Result.err(new Error('Custom ID is required for interaction buttons'));
			}
		}

		if (button.style === ButtonStyle.Link) {
			// @ts-expect-error exhaustive check for link buttons
			if (button.custom_id !== undefined) {
				return Result.err(new Error('Custom ID is not allowed for link buttons'));
			}

			// @ts-expect-error exhaustive check for link buttons
			if (button.url === undefined) {
				return Result.err(new Error('URL is required for link buttons'));
			}
		}

		return Result.ok(button);
	});
