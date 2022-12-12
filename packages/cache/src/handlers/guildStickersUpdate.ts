import type { GatewayGuildStickersUpdateDispatchData } from 'discord-api-types/v10';
import type { Cache } from '../cache';
import { update } from '../util.js';

export function handleGuildStickersUpdate(cache: Cache, data: GatewayGuildStickersUpdateDispatchData) {
	const { guild_id, stickers } = data;

	for (const sticker of stickers) {
		update(cache.stickers, sticker.id, sticker);
	}

	const fetchedStickers = cache.guildStickers.get(guild_id);

	if (fetchedStickers) {
		for (const sticker of stickers) {
			fetchedStickers.add(sticker.id);
		}
	} else {
		cache.guildStickers.set(guild_id, new Set(stickers.map((sticker) => sticker.id)));
	}
}
