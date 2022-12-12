import type { APIThreadChannel } from 'discord-api-types/v10';
import type { Cache } from '../cache';

export function handleThreadDelete(cache: Cache, data: APIThreadChannel): void {
	cache.channels.delete(data.id);
	cache.channelThreads.delete(data.id);
}
