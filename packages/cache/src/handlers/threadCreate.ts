import type { APIThreadChannel } from 'discord-api-types/v10';
import type { Cache } from '../cache';
import { update } from '../util.js';

export function handleThreadCreate(cache: Cache, data: APIThreadChannel): void {
	update(cache.channels, data.id, data);

	const fetchedThreads = cache.channelThreads.get(data.id);

	if (fetchedThreads) {
		fetchedThreads.add(data.id);
	} else {
		cache.channelThreads.set(data.id, new Set([data.id]));
	}
}
