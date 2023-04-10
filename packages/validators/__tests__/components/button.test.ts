import type { APIButtonComponent } from 'discord-api-types/v10';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import { describe, test, expect } from 'vitest';
import {
	validator as buttonValidator,
	labelValidator,
	styleValidator,
	typeValidator,
} from '../../src/components/button.js';

describe('button validators', () => {
	test('valid button data', () => {
		const button1: APIButtonComponent = {
			type: ComponentType.Button,
			style: ButtonStyle.Primary,
			label: 'test',
			custom_id: 'test',
		};

		const button2: APIButtonComponent = {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: 'test',
			url: 'https://google.com',
		};

		expect(() => buttonValidator.parse(button1)).not.toThrow();
		expect(() => buttonValidator.parse(button2)).not.toThrow();
	});

	test('invalid button data', () => {
		const button1 = {
			type: ComponentType.Button,
			style: ButtonStyle.Primary,
			label: 'test',
			custom_id: 'test',
			url: 'https://google.com',
		};

		const button2 = {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: 'test',
			custom_id: 'test',
		};

		const button3 = {
			type: ComponentType.Button,
			style: ButtonStyle.Primary,
			label: 'test',
			url: 'https://google.com',
		};

		expect(() => buttonValidator.parse(button1)).toThrow();
		expect(() => buttonValidator.parse(button2)).toThrow();
		expect(() => buttonValidator.parse(button3)).toThrow();
	});

	test('label validation', () => {
		const label1 = 'a'.repeat(80);
		expect(() => labelValidator.parse(label1)).not.toThrow();

		const label2 = 'a'.repeat(81);
		expect(() => labelValidator.parse(label2)).toThrow();

		const label3 = '';
		expect(() => labelValidator.parse(label3)).toThrow();
	});

	test('style validation', () => {
		const ok = ButtonStyle.Danger;
		expect(() => styleValidator.parse(ok)).not.toThrow();

		const invalid = 42;
		expect(() => styleValidator.parse(invalid)).toThrow();
	});

	test('type validation', () => {
		const ok = ComponentType.Button;
		expect(() => typeValidator.parse(ok)).not.toThrow();

		const invalid = ComponentType.RoleSelect;
		expect(() => typeValidator.parse(invalid)).toThrow();
	});
});
