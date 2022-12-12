import type { GatewayGuildBanAddDispatchData } from 'discord-api-types/v10';
import type { Cache } from '../cache';
import { update } from '../util.js';

export function handleGuildBanAdd(cache: Cache, data: GatewayGuildBanAddDispatchData) {
	const { guild_id, user } = data;
	update(cache.users, user.id, user);
	cache.guildBans.set(user.id, { guild_id, user_id: user.id });
}
