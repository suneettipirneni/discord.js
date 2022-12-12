import type { APIThreadChannel } from 'discord-api-types/v10';
import type { Cache } from '../cache';
import { update } from '../util.js';

export function handleThreadUpdate(cache: Cache, data: APIThreadChannel): void {
	update(cache.channels, data.id, data);
}
