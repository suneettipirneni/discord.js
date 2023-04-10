import type {
	APIChannelSelectComponent,
	APIMentionableSelectComponent,
	APIRoleSelectComponent,
	APISelectMenuOption,
	APIStringSelectComponent,
	APIUserSelectComponent,
} from 'discord-api-types/v10';
import { ChannelType, ComponentType } from 'discord-api-types/v10';
import { describe, test, expect } from 'vitest';
import {
	labelValueDescriptionValidator,
	minMaxValidator,
	optionValidator,
	validator,
} from '../../src/components/selectMenu.js';

describe('select menu validators', () => {
	test('valid select menu option data', () => {
		const option1: APISelectMenuOption = {
			label: 'test',
			value: 'test',
		};

		expect(() => optionValidator.parse(option1)).not.toThrow();

		const option2: APISelectMenuOption = {
			...option1,
			description: 'test',
			default: true,
		};

		expect(() => optionValidator.parse(option2)).not.toThrow();
	});

	test('invalid select menu option data', () => {
		// @ts-expect-error Invalid value
		const option1: APISelectMenuOption = {
			label: 'test',
		};

		expect(() => optionValidator.parse(option1)).toThrow();

		const option2: APISelectMenuOption = {
			label: 'a'.repeat(101),
			description: 'a'.repeat(101),
			default: true,
			value: 'test'.repeat(101),
		};

		expect(() => optionValidator.parse(option2)).toThrow();
	});

	test('valid select menu data', () => {
		const stringSelectMenu: APIStringSelectComponent = {
			type: ComponentType.StringSelect,
			custom_id: 'stringSelect',
			options: [
				{
					label: 'option 1',
					value: '1',
				},
			],
		};

		expect(() => validator.parse(stringSelectMenu)).not.toThrow();

		const roleSelectMenu: APIRoleSelectComponent = {
			type: ComponentType.RoleSelect,
			custom_id: 'roleSelect',
		};

		expect(() => validator.parse(roleSelectMenu)).not.toThrow();

		const mentionableSelectMenu: APIMentionableSelectComponent = {
			type: ComponentType.MentionableSelect,
			custom_id: 'mentionableSelect',
		};

		expect(() => validator.parse(mentionableSelectMenu)).not.toThrow();

		const userSelectMenu: APIUserSelectComponent = {
			type: ComponentType.UserSelect,
			custom_id: 'userSelect',
		};

		expect(() => validator.parse(userSelectMenu)).not.toThrow();

		const channelSelectMenu: APIChannelSelectComponent = {
			type: ComponentType.ChannelSelect,
			custom_id: 'channelSelect',
		};

		expect(() => validator.parse(channelSelectMenu)).not.toThrowError();

		const channelSelectMenu2: APIChannelSelectComponent = {
			type: ComponentType.ChannelSelect,
			custom_id: 'channelSelect',
			channel_types: [ChannelType.GuildText],
		};

		expect(() => validator.parse(channelSelectMenu2)).not.toThrowError();
	});

	test('invalid select menu data', () => {
		// @ts-expect-error Invalid data
		const stringSelectMenu: APIStringSelectComponent = {
			type: ComponentType.StringSelect,
			custom_id: 'stringSelect',
		};

		expect(() => validator.parse(stringSelectMenu)).toThrow();

		expect(() => validator.parse(stringSelectMenu)).toThrow();

		const roleSelectMenu: APIRoleSelectComponent = {
			type: ComponentType.RoleSelect,
			custom_id: 'roleSelect',
			// @ts-expect-error Invalid data
			options: [],
			channel_types: [],
		};

		expect(() => validator.parse(roleSelectMenu)).toThrow();

		const mentionableSelectMenu: APIMentionableSelectComponent = {
			type: ComponentType.MentionableSelect,
			custom_id: 'mentionableSelect',
			// @ts-expect-error Invalid data
			options: [],
			channel_types: [],
		};

		expect(() => validator.parse(mentionableSelectMenu)).toThrow();

		const userSelectMenu: APIUserSelectComponent = {
			type: ComponentType.UserSelect,
			custom_id: 'userSelect',
			// @ts-expect-error Invalid data
			options: [],
			channel_types: [],
		};

		expect(() => validator.parse(userSelectMenu)).toThrow();

		const channelSelectMenu: APIChannelSelectComponent = {
			type: ComponentType.ChannelSelect,
			custom_id: 'channelSelect',
			// @ts-expect-error Invalid data
			options: [],
		};

		expect(() => validator.parse(channelSelectMenu)).toThrow();
	});

	test('min/max validator', () => {
		const ok = 25;
		expect(() => minMaxValidator.parse(ok)).not.toThrow();

		const ok2 = 0;
		expect(() => minMaxValidator.parse(ok2)).not.toThrow();

		const invalid = 26;
		expect(() => minMaxValidator.parse(invalid)).toThrow();
	});

	test('label/value/description validator', () => {
		const ok = 'a'.repeat(100);
		expect(() => labelValueDescriptionValidator.parse(ok)).not.toThrow();

		const ok2 = 'a';
		expect(() => labelValueDescriptionValidator.parse(ok2)).not.toThrow();

		const invalid = '';
		expect(() => labelValueDescriptionValidator.parse(invalid)).toThrow();

		const invalid2 = 'a'.repeat(101);
		expect(() => labelValueDescriptionValidator.parse(invalid2)).toThrow();
	});
});
