import type { APIGuild } from 'discord-api-types/v10';
import type { Cache } from '../cache.js';
import { update } from '../util.js';

export function handleGuildUpdate(cache: Cache, data: APIGuild): void {
	update(cache.guilds, data.id, data);
}
