import type { APIChannel } from 'discord-api-types/v10';
import type { Cache } from '../cache';

export function handleChannelDelete(cache: Cache, data: APIChannel) {
	cache.channels.delete(data.id);
	cache.channelThreads.delete(data.id);
}
