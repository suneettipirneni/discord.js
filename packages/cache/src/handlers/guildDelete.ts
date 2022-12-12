import type { APIUnavailableGuild } from 'discord-api-types/v10';
import type { Cache } from '../cache';

export function handleGuildDelete(cache: Cache, data: APIUnavailableGuild) {
	cache.guilds.delete(data.id);
	cache.guildChannels.delete(data.id);
	cache.guildRoles.delete(data.id);
	cache.guildMembers.delete(data.id);
	cache.guildScheduledEvents.delete(data.id);
	cache.guildStageInstances.delete(data.id);
}
