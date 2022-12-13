import type { GatewayGuildMemberRemoveDispatchData } from 'discord-api-types/v10';
import type { Cache } from '../cache';

export function handleGuildMemberRemove(cache: Cache, data: GatewayGuildMemberRemoveDispatchData) {
	const { guild_id, user } = data;
	cache.members.delete(user.id);
	cache.guildMembers.get(guild_id)?.delete(user.id);

	// Check if member still shares another guild with the bot
	for (const guild of cache.guilds.keys()) {
		if (cache.guildMembers.get(guild)?.has(user.id)) return;
	}

	// User no longer shares any guilds with the bot, delete user from cache
	cache.users.delete(user.id);
}
