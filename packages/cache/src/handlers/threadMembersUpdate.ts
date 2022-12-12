import type { GatewayThreadMembersUpdateDispatchData } from 'discord-api-types/v10';
import type { Cache } from '../cache';

export function handleThreadMembersUpdate(cache: Cache, data: GatewayThreadMembersUpdateDispatchData) {
	const { added_members, removed_member_ids } = data;

	if (added_members) {
		for (const member of added_members) {
			cache.threadMembers.set(member.user_id!, member);
		}
	}

	if (removed_member_ids) {
		for (const id of removed_member_ids) {
			cache.threadMembers.delete(id);
		}
	}
}
