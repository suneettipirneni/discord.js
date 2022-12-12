import type { APIChannel } from 'discord-api-types/v10';
import { ChannelType } from 'discord-api-types/v10';
import type { Cache } from '../cache.js';
import { update } from '../util.js';

export function handleChannelCreate(cache: Cache, data: APIChannel): void {
	update(cache.channels, data.id, data);

	if (data.type === ChannelType.GroupDM || data.type === ChannelType.DM) {
		return;
	}

	const fetchedGuildChannels = cache.guildChannels.get(data.guild_id!);

	if (fetchedGuildChannels) {
		fetchedGuildChannels.add(data.id);
	} else {
		cache.guildChannels.set(data.guild_id!, new Set([data.id]));
	}
}
