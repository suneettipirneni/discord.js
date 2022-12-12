import type { GatewayGuildMemberUpdateDispatchData } from 'discord-api-types/v10';
import type { Cache } from '../cache';
import { updatePartial } from '../util.js';

export function handleGuildMemberUpdate(cache: Cache, data: GatewayGuildMemberUpdateDispatchData) {
	updatePartial(cache.members, data.user.id, data);
}
