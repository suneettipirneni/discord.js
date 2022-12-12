import type { GatewayGuildMemberAddDispatchData } from 'discord-api-types/v10';
import type { Cache } from '../cache';
import { update } from '../util.js';

export function handleGuildMemberAdd(cache: Cache, data: GatewayGuildMemberAddDispatchData) {
	const { guild_id, user, ...member } = data;
	update(cache.members, user!.id, member);
	update(cache.users, user!.id, user);

	const fetchedGuildMembers = cache.guildMembers.get(guild_id);
	if (fetchedGuildMembers) {
		fetchedGuildMembers.add(user!.id);
	} else {
		cache.guildMembers.set(guild_id, new Set([user!.id]));
	}
}
