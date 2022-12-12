import type { GatewayThreadMemberUpdateDispatchData } from 'discord-api-types/v10';
import type { Cache } from '../cache';
import { update } from '../util.js';

export function handleThreadMemberUpdate(cache: Cache, data: GatewayThreadMemberUpdateDispatchData) {
	const { guild_id, ...member } = data;
	update(cache.threadMembers, member.id!, member);
}
