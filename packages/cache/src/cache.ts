import { Collection } from '@discordjs/collection';
import type { ManagerShardEventsMap } from '@discordjs/core';
import type { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';
import type { APIEmoji, APISticker } from 'discord-api-types/v10';
import {
	type APIChannel,
	type Snowflake,
	type APIRole,
	type APIMessage,
	type APIUser,
	type APIGuildMember,
	type GatewayPresenceUpdate,
	type APIStageInstance,
	type APIGuildScheduledEvent,
	type APIThreadChannel,
	type APIThreadMember,
	GatewayDispatchEvents,
} from 'discord-api-types/v10';
import { CacheIterator } from './CacheIterator.js';
import { handleChannelCreate } from './handlers/channelCreate.js';
import { handleChannelDelete } from './handlers/channelDelete.js';
import { handleChannelUpdate } from './handlers/channelUpdate.js';
import { handleGuildBanAdd } from './handlers/guildBanAdd.js';
import { handleGuildBanRemove } from './handlers/guildBanRemove.js';
import type { APISparseGuild } from './handlers/guildCreate.js';
import { handleGuildCreate } from './handlers/guildCreate.js';
import { handleGuildDelete } from './handlers/guildDelete.js';
import { handleGuildMemberAdd } from './handlers/guildMemberAdd.js';
import { handleGuildMemberRemove } from './handlers/guildMemberRemove.js';
import { handleGuildStickersUpdate } from './handlers/guildStickersUpdate.js';
import { handleGuildUpdate } from './handlers/guildUpdate.js';
import { handleThreadCreate } from './handlers/threadCreate.js';
import { handleThreadDelete } from './handlers/threadDelete.js';
import { handleThreadMemberUpdate } from './handlers/threadMemberUpdate.js';
import { handleThreadMembersUpdate } from './handlers/threadMembersUpdate.js';
import { handleThreadUpdate } from './handlers/threadUpdate.js';

export interface APISparseGuildMember extends Omit<APIGuildMember, 'roles' | 'user'> {
	roles: Set<Snowflake>;
	user_id: Snowflake;
}

export class Cache {
	public readonly guilds: Collection<Snowflake, APISparseGuild> = new Collection();

	public readonly channels: Collection<Snowflake, APIChannel> = new Collection();

	public readonly roles: Collection<Snowflake, APIRole> = new Collection();

	public readonly guildChannels: Collection<Snowflake, Set<Snowflake>> = new Collection();

	public readonly guildRoles: Collection<Snowflake, Set<Snowflake>> = new Collection();

	public readonly messages: Collection<Snowflake, APIMessage> = new Collection();

	public readonly users: Collection<Snowflake, APIUser> = new Collection();

	public readonly members: Collection<Snowflake, APISparseGuildMember> = new Collection();

	public readonly guildMembers: Collection<Snowflake, Set<Snowflake>> = new Collection();

	public readonly presences: Collection<Snowflake, GatewayPresenceUpdate> = new Collection();

	public readonly stageInstances: Collection<Snowflake, APIStageInstance> = new Collection();

	public readonly guildStageInstances: Collection<Snowflake, Set<Snowflake>> = new Collection();

	public readonly scheduledEvents: Collection<Snowflake, APIGuildScheduledEvent> = new Collection();

	public readonly guildScheduledEvents: Collection<Snowflake, Set<Snowflake>> = new Collection();

	public readonly channelThreads: Collection<Snowflake, Set<Snowflake>> = new Collection();

	public readonly channelPins: Collection<Snowflake, Set<Snowflake>> = new Collection();

	public readonly threadMembers: Collection<Snowflake, APIThreadMember> = new Collection();

	public readonly guildBans: Collection<Snowflake, { guild_id: Snowflake; user_id: Snowflake }> = new Collection();

	public readonly emojis: Collection<Snowflake, APIEmoji> = new Collection();

	public readonly guildEmojis: Collection<Snowflake, Set<Snowflake>> = new Collection();

	public readonly stickers: Collection<Snowflake, APISticker> = new Collection();

	public readonly guildStickers: Collection<Snowflake, Set<Snowflake>> = new Collection();

	public listen(emitter: AsyncEventEmitter<ManagerShardEventsMap>) {
		emitter.on(GatewayDispatchEvents.GuildCreate, ({ data }) => handleGuildCreate(this, data));
		emitter.on(GatewayDispatchEvents.GuildUpdate, ({ data }) => handleGuildUpdate(this, data));
		emitter.on(GatewayDispatchEvents.GuildDelete, ({ data }) => handleGuildDelete(this, data));
		emitter.on(GatewayDispatchEvents.ChannelCreate, ({ data }) => handleChannelCreate(this, data));
		emitter.on(GatewayDispatchEvents.ChannelUpdate, ({ data }) => handleChannelUpdate(this, data));
		emitter.on(GatewayDispatchEvents.ChannelDelete, ({ data }) => handleChannelDelete(this, data));
		emitter.on(GatewayDispatchEvents.ThreadCreate, ({ data }) => handleThreadCreate(this, data));
		emitter.on(GatewayDispatchEvents.ThreadUpdate, ({ data }) => handleThreadUpdate(this, data as APIThreadChannel));
		emitter.on(GatewayDispatchEvents.ThreadDelete, ({ data }) => handleThreadDelete(this, data as APIThreadChannel));
		emitter.on(GatewayDispatchEvents.ThreadMemberUpdate, ({ data }) => handleThreadMemberUpdate(this, data));
		emitter.on(GatewayDispatchEvents.ThreadMembersUpdate, ({ data }) => handleThreadMembersUpdate(this, data));
		emitter.on(GatewayDispatchEvents.GuildBanAdd, ({ data }) => handleGuildBanAdd(this, data));
		emitter.on(GatewayDispatchEvents.GuildBanRemove, ({ data }) => handleGuildBanRemove(this, data));
		emitter.on(GatewayDispatchEvents.GuildStickersUpdate, ({ data }) => handleGuildStickersUpdate(this, data));
		emitter.on(GatewayDispatchEvents.GuildMemberAdd, ({ data }) => handleGuildMemberAdd(this, data));
		emitter.on(GatewayDispatchEvents.GuildMemberRemove, ({ data }) => handleGuildMemberRemove(this, data));
	}

	public resolveEmojis(guildId: Snowflake) {
		const guildEmojis = this.guildEmojis.get(guildId) ?? new Set();
		return new CacheIterator(guildEmojis, this.emojis);
	}

	public resolveRoles(guildId: Snowflake) {
		const guildRoles = this.guildRoles.get(guildId) ?? new Set();
		return new CacheIterator(guildRoles, this.roles);
	}

	public resolveChannels(guildId: Snowflake) {
		const guildChannels = this.guildChannels.get(guildId) ?? new Set();
		return new CacheIterator(guildChannels, this.channels);
	}
}
