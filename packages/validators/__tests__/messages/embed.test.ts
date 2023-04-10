import type { APIEmbed } from 'discord-api-types/v10';
import { describe, test, expect } from 'vitest';
import { validator } from '../../src/messages/embed.js';

describe('embed validators', () => {
	test('valid embed data', () => {
		const embed1: APIEmbed = {
			title: 'title',
			description: 'description',
			url: 'https://example.com',
			timestamp: new Date().toISOString(),
			color: 0x00ff00,
			footer: {
				text: 'footer text',
				icon_url: 'https://example.com/icon.png',
				proxy_icon_url: 'https://example.com/icon.png',
			},
			image: {
				url: 'https://example.com/image.png',
				proxy_url: 'https://example.com/image.png',
				height: 100,
				width: 100,
			},
			thumbnail: {
				url: 'https://example.com/thumbnail.png',
				proxy_url: 'https://example.com/thumbnail.png',
				height: 100,
				width: 100,
			},
			video: {
				url: 'https://example.com/video.mp4',
				height: 100,
				width: 100,
			},
			provider: {
				name: 'provider name',
				url: 'https://example.com',
			},
			fields: [
				{
					name: 'field name',
					value: 'field value',
					inline: true,
				},
			],
		};

		expect(() => validator.parse(embed1)).not.toThrow();
		expect(() => validator.parse({})).not.toThrow();
	});

	test('invalid embed data', () => {
		const embed1: APIEmbed = {
			title: 'title'.repeat(256),
			description: 'description'.repeat(4_096),
			url: 'https://example.com'.repeat(2_048),
			timestamp: new Date().toISOString(),
			color: 0x00ff00,
			footer: {
				text: 'footer text'.repeat(2_048),
				icon_url: 'https://example.com/icon.png'.repeat(2_048),
				proxy_icon_url: 'https://example.com/icon.png'.repeat(2_048),
			},
			image: {
				url: 'https://example.com/image.png'.repeat(2_048),
				proxy_url: 'https://example.com/image.png'.repeat(2_048),
				height: 100,
				width: 100,
			},
			thumbnail: {
				url: 'https://example.com/thumbnail.png'.repeat(2_048),
				proxy_url: 'https://example.com/thumbnail.png'.repeat(2_048),
				height: 100,
				width: 100,
			},
			video: {
				url: 'https://example.com/video.mp4'.repeat(2_048),
				height: 100,
				width: 100,
			},
			provider: {
				name: 'provider name'.repeat(256),
				url: 'https://example.com'.repeat(2_048),
			},
			fields: [
				{
					name: 'field name'.repeat(256),
					value: 'field value'.repeat(1_024),
					inline: true,
				},
			],
		};

		expect(() => validator.parse(embed1)).toThrow();

		// An invalid embed that fails due to incorrect embed fields
		const embed2: APIEmbed = {
			title: 'title',
			fields: [
				// @ts-expect-error Invalid field
				{
					name: 'field name',
				},
			],
		};

		expect(() => validator.parse(embed2)).toThrow();
	});
});
