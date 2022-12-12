import type { GatewayGuildMemberRemoveDispatchData } from 'discord-api-types/v10';
import type { Cache } from '../cache';

export function handleGuildMemberRemove(cache: Cache, data: GatewayGuildMemberRemoveDispatchData) {
	const { guild_id, user } = data;
	cache.members.delete(user.id);
	cache.guildMembers.get(guild_id)?.delete(user.id);
}
