import type { GatewayGuildEmojisUpdateDispatchData, Snowflake } from 'discord-api-types/v10';
import type { Cache } from '../cache';
import { update } from '../util.js';

export function handleGuildEmojisUpdate(cache: Cache, data: GatewayGuildEmojisUpdateDispatchData) {
	const { guild_id, emojis } = data;
	const fetchedEmojis = cache.guildEmojis.get(guild_id);

	for (const emoji of emojis) {
		if (!emoji.id) {
			// Standard emojis should not be cached
			continue;
		}

		update(cache.emojis, emoji.id, emoji);
	}

	if (fetchedEmojis) {
		for (const emoji of emojis) {
			if (!emoji.id) {
				// Standard emojis should not be cached
				continue;
			}

			fetchedEmojis.add(emoji.id);
		}
	} else {
		const emoji_set = emojis.reduce((acc, emoji) => {
			if (!emoji.id) {
				return acc;
			}

			acc.add(emoji.id);
			return acc;
		}, new Set<Snowflake>());

		cache.guildEmojis.set(guild_id, emoji_set);
	}
}
