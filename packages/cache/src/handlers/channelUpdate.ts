import type { APIChannel } from 'discord-api-types/v10';
import type { Cache } from '../cache';
import { update } from '../util.js';

export function handleChannelUpdate(cache: Cache, data: APIChannel): void {
	update(cache.channels, data.id, data);
}
