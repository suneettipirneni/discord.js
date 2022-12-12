import type { APIGuild, GatewayGuildCreateDispatchData } from 'discord-api-types/v10';
import type { Cache } from '../cache.js';
import { update } from '../util.js';
import { handleChannelCreate } from './channelCreate.js';
import { handleGuildMemberAdd } from './guildMemberAdd.js';

export type APISparseGuild = Omit<APIGuild, 'emojis' | 'roles' | 'stickers'>;

export function handleGuildCreate(cache: Cache, data: GatewayGuildCreateDispatchData) {
	const {
		roles,
		channels,
		threads,
		members,
		presences,
		stage_instances,
		guild_scheduled_events,
		emojis,
		stickers,
		...guild
	} = data;

	update(cache.guilds, guild.id, guild);

	for (const member of members) {
		handleGuildMemberAdd(cache, { ...member, guild_id: guild.id });
	}

	for (const channel of channels) {
		handleChannelCreate(cache, channel);
	}

	for (const thread of threads) {
		const fetchedGuildChannels = cache.guildChannels.get(guild.id);

		if (fetchedGuildChannels) {
			fetchedGuildChannels.add(thread.id);
		} else {
			cache.guildChannels.set(guild.id, new Set([thread.id]));
		}

		update(cache.channels, thread.id, thread);
	}

	for (const role of roles) {
		const fetchedGuildRoles = cache.guildRoles.get(guild.id);

		if (fetchedGuildRoles) {
			fetchedGuildRoles.add(role.id);
		} else {
			cache.guildRoles.set(guild.id, new Set([role.id]));
		}

		update(cache.roles, role.id, role);
	}

	for (const presence of presences) {
		update(cache.presences, presence.user.id, presence);
	}

	for (const stageInstance of stage_instances) {
		update(cache.stageInstances, stageInstance.id, stageInstance);

		const fetchedStageInstances = cache.guildStageInstances.get(guild.id);

		if (fetchedStageInstances) {
			fetchedStageInstances.add(stageInstance.id);
		} else {
			cache.guildStageInstances.set(guild.id, new Set([stageInstance.id]));
		}
	}

	for (const event of guild_scheduled_events) {
		update(cache.scheduledEvents, event.id, event);

		const fetchedScheduledEvents = cache.guildScheduledEvents.get(guild.id);

		if (fetchedScheduledEvents) {
			fetchedScheduledEvents.add(event.id);
		} else {
			cache.guildScheduledEvents.set(guild.id, new Set([event.id]));
		}
	}
}
