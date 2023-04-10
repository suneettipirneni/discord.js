import { Result, s } from '@sapphire/shapeshift';
import { ChannelType, ComponentType } from 'discord-api-types/v10';
import type { APISelectMenuOption, APISelectMenuComponent } from 'discord-api-types/v10';
import { customIdValidator, disabledValidator, emojiValidator } from '../shared.js';
import { isValidationEnabled } from '../validation.js';

export const placeholderValidator = s.string.lengthLessThanOrEqual(150).setValidationEnabled(isValidationEnabled);
export const minMaxValidator = s.number.int
	.greaterThanOrEqual(0)
	.lessThanOrEqual(25)
	.setValidationEnabled(isValidationEnabled);

export const labelValueDescriptionValidator = s.string
	.lengthGreaterThanOrEqual(1)
	.lengthLessThanOrEqual(100)
	.setValidationEnabled(isValidationEnabled);

export const optionValidator = s
	.object<APISelectMenuOption>({
		label: labelValueDescriptionValidator,
		value: labelValueDescriptionValidator,
		description: labelValueDescriptionValidator.optional,
		emoji: emojiValidator.optional,
		default: s.boolean.optional,
	})
	.setValidationEnabled(isValidationEnabled);

export const optionsValidator = optionValidator.array
	.lengthGreaterThanOrEqual(0)
	.setValidationEnabled(isValidationEnabled);

export const optionsLengthValidator = s.number.int
	.greaterThanOrEqual(0)
	.lessThanOrEqual(25)
	.setValidationEnabled(isValidationEnabled);

export const defaultValidator = s.boolean;

export function validateRequiredSelectMenuOptionParameters(label?: string, value?: string) {
	labelValueDescriptionValidator.parse(label);
	labelValueDescriptionValidator.parse(value);
}

export const channelTypesValidator = s.nativeEnum(ChannelType).array.setValidationEnabled(isValidationEnabled);

export const urlValidator = s.string
	.url({
		allowedProtocols: ['http:', 'https:', 'discord:'],
	})
	.setValidationEnabled(isValidationEnabled);

export const typeValidator = s
	.enum(
		ComponentType.StringSelect as const,
		ComponentType.ChannelSelect as const,
		ComponentType.RoleSelect as const,
		ComponentType.UserSelect as const,
		ComponentType.MentionableSelect as const,
	)
	.setValidationEnabled(isValidationEnabled);

export const validator = s
	.object<APISelectMenuComponent>({
		custom_id: customIdValidator,
		// @ts-expect-error All select menu combinations
		type: typeValidator,
		placeholder: placeholderValidator.optional,
		min_values: minMaxValidator.optional,
		max_values: minMaxValidator.optional,
		disabled: disabledValidator.optional,
		options: s.array(optionValidator).lengthGreaterThanOrEqual(1).optional,
		channel_types: channelTypesValidator.optional,
	})
	.setValidationEnabled(isValidationEnabled)
	.reshape((selectMenu) => {
		// @ts-expect-error invalid combination
		if (selectMenu.type === ComponentType.StringSelect && !selectMenu.options) {
			return Result.err(new Error('String select menus must have options'));
		}

		// @ts-expect-error Invalid combination
		if (selectMenu.type !== ComponentType.StringSelect && selectMenu.options) {
			return Result.err(new Error('Only string select menus can have options'));
		}

		// @ts-expect-error Invalid combinator
		if (selectMenu.type !== ComponentType.ChannelSelect && selectMenu.channel_types) {
			return Result.err(new Error('Only channel select menus can have a channel types'));
		}

		return Result.ok(selectMenu);
	});
