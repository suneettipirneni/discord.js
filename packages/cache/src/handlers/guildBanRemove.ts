import type { GatewayGuildBanRemoveDispatchData } from 'discord-api-types/v10';
import type { Cache } from '../cache';
import { update } from '../util.js';

export function handleGuildBanRemove(cache: Cache, data: GatewayGuildBanRemoveDispatchData) {
	const { user } = data;
	cache.guildBans.delete(user.id);

	update(cache.users, user.id, user);
}
