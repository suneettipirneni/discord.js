import { GatewayDispatchEvents } from 'discord-api-types/v10';
import type {
	APIEmoji,
	APIGuildMember,
	APIRole,
	APISoundboardSound,
	APISticker,
	GatewayDispatchPayload,
	GatewayGuildCreateDispatchData,
	GatewayGuildMembersChunkDispatchData,
	GatewayGuildSoundboardSoundsUpdateDispatchData,
	GatewaySoundboardSoundsDispatchData,
	GatewayThreadListSync,
	GatewayThreadMembersUpdateDispatchData,
	Snowflake,
} from 'discord-api-types/v10';
import {
	applicationCommandPermissionsKey,
	autoModerationRuleKey,
	banKey,
	emojiKey,
	guildScopedKey,
	integrationKey,
	inviteKey,
	memberKey,
	messageKey,
	presenceKey,
	roleKey,
	scheduledEventKey,
	soundboardSoundKey,
	stageInstanceKey,
	stickerKey,
	threadMemberKey,
	voiceStateKey,
} from './keys.js';
import type { CacheTypes } from './types.js';

export type StoreName =
	| 'applicationCommandPermissions'
	| 'auditLogEntry'
	| 'autoModerationRule'
	| 'ban'
	| 'channel'
	| 'emoji'
	| 'entitlement'
	| 'guild'
	| 'integration'
	| 'interaction'
	| 'invite'
	| 'member'
	| 'message'
	| 'presence'
	| 'role'
	| 'scheduledEvent'
	| 'soundboardSound'
	| 'stageInstance'
	| 'sticker'
	| 'subscription'
	| 'thread'
	| 'threadMember'
	| 'user'
	| 'voiceState';

export const StoreNames = [
	'applicationCommandPermissions',
	'auditLogEntry',
	'autoModerationRule',
	'ban',
	'channel',
	'emoji',
	'entitlement',
	'guild',
	'integration',
	'interaction',
	'invite',
	'member',
	'message',
	'presence',
	'role',
	'scheduledEvent',
	'soundboardSound',
	'stageInstance',
	'sticker',
	'subscription',
	'thread',
	'threadMember',
	'user',
	'voiceState',
] as const satisfies readonly StoreName[];

export type CacheOperation =
	| {
			event: GatewayDispatchEvents;
			key: string;
			merge?: boolean;
			raw: unknown;
			store: StoreName;
			type: 'upsert';
	  }
	| {
			key: string;
			store: StoreName;
			type: 'delete';
	  }
	| {
			predicate(value: unknown): boolean;
			store: StoreName;
			type: 'deleteWhere';
	  }
	| {
			prefix: string;
			store: StoreName;
			type: 'deletePrefix';
	  };

type MutableOperationList = CacheOperation[];

export function createCacheOperations(payload: GatewayDispatchPayload): CacheOperation[] {
	const operations: MutableOperationList = [];
	const event = payload.t;

	switch (event) {
		case GatewayDispatchEvents.ApplicationCommandPermissionsUpdate: {
			const data = getData<CacheTypes['applicationCommandPermissions']>(payload);
			operations.push({
				event,
				key: applicationCommandPermissionsKey(data.application_id, data.guild_id, data.id),
				raw: data,
				store: 'applicationCommandPermissions',
				type: 'upsert',
			});
			break;
		}

		case GatewayDispatchEvents.AutoModerationRuleCreate:
		case GatewayDispatchEvents.AutoModerationRuleUpdate: {
			const data = getData<CacheTypes['autoModerationRule']>(payload);
			operations.push({
				event,
				key: autoModerationRuleKey(data.guild_id, data.id),
				raw: data,
				store: 'autoModerationRule',
				type: 'upsert',
			});
			break;
		}

		case GatewayDispatchEvents.AutoModerationRuleDelete: {
			const data = getData<CacheTypes['autoModerationRule']>(payload);
			operations.push({
				key: autoModerationRuleKey(data.guild_id, data.id),
				store: 'autoModerationRule',
				type: 'delete',
			});
			break;
		}

		case GatewayDispatchEvents.ChannelCreate:
		case GatewayDispatchEvents.ChannelUpdate: {
			const data = getData<CacheTypes['channel']>(payload);
			operations.push({
				event,
				key: data.id,
				merge: event === GatewayDispatchEvents.ChannelUpdate,
				raw: data,
				store: 'channel',
				type: 'upsert',
			});
			break;
		}

		case GatewayDispatchEvents.ChannelDelete: {
			const data = getData<CacheTypes['channel']>(payload);
			operations.push({ key: data.id, store: 'channel', type: 'delete' });
			operations.push({ prefix: `${data.id}:`, store: 'message', type: 'deletePrefix' });
			break;
		}

		case GatewayDispatchEvents.EntitlementCreate:
		case GatewayDispatchEvents.EntitlementUpdate: {
			const data = getData<CacheTypes['entitlement']>(payload);
			operations.push({ event, key: data.id, raw: data, store: 'entitlement', type: 'upsert' });
			break;
		}

		case GatewayDispatchEvents.EntitlementDelete: {
			const data = getData<CacheTypes['entitlement']>(payload);
			operations.push({ key: data.id, store: 'entitlement', type: 'delete' });
			break;
		}

		case GatewayDispatchEvents.GuildAuditLogEntryCreate: {
			const data = getData<CacheTypes['auditLogEntry']>(payload);
			operations.push({
				event,
				key: guildScopedKey(data.guild_id, data.id),
				raw: data,
				store: 'auditLogEntry',
				type: 'upsert',
			});
			break;
		}

		case GatewayDispatchEvents.GuildBanAdd: {
			const data = getData<CacheTypes['ban']>(payload);
			operations.push({ event, key: banKey(data.guild_id, data.user.id), raw: data, store: 'ban', type: 'upsert' });
			operations.push({ event, key: data.user.id, raw: data.user, store: 'user', type: 'upsert' });
			break;
		}

		case GatewayDispatchEvents.GuildBanRemove: {
			const data = getData<CacheTypes['ban']>(payload);
			operations.push({ key: banKey(data.guild_id, data.user.id), store: 'ban', type: 'delete' });
			operations.push({ event, key: data.user.id, raw: data.user, store: 'user', type: 'upsert' });
			break;
		}

		case GatewayDispatchEvents.GuildCreate: {
			const data = getData<GatewayGuildCreateDispatchData>(payload);
			hydrateGuildCreate(operations, event, data);
			break;
		}

		case GatewayDispatchEvents.GuildUpdate: {
			const data = getData<CacheTypes['guild']>(payload);
			operations.push({ event, key: data.id, merge: true, raw: data, store: 'guild', type: 'upsert' });
			break;
		}

		case GatewayDispatchEvents.GuildDelete: {
			const data = getData<{ id: Snowflake }>(payload);
			operations.push({ key: data.id, store: 'guild', type: 'delete' });
			deleteGuildScopedResources(operations, data.id);
			break;
		}

		case GatewayDispatchEvents.GuildEmojisUpdate: {
			const data = getData<{ emojis: APIEmoji[]; guild_id: Snowflake }>(payload);
			operations.push({ prefix: `${data.guild_id}:`, store: 'emoji', type: 'deletePrefix' });
			for (const emoji of data.emojis) {
				if (emoji.id)
					operations.push({
						event,
						key: emojiKey(data.guild_id, emoji.id),
						raw: withGuildId(emoji, data.guild_id),
						store: 'emoji',
						type: 'upsert',
					});
			}

			break;
		}

		case GatewayDispatchEvents.GuildStickersUpdate: {
			const data = getData<{ guild_id: Snowflake; stickers: APISticker[] }>(payload);
			operations.push({ prefix: `${data.guild_id}:`, store: 'sticker', type: 'deletePrefix' });
			for (const sticker of data.stickers) {
				operations.push({
					event,
					key: stickerKey(data.guild_id, sticker.id),
					raw: withGuildId(sticker, data.guild_id),
					store: 'sticker',
					type: 'upsert',
				});
			}

			break;
		}

		case GatewayDispatchEvents.GuildMemberAdd:
		case GatewayDispatchEvents.GuildMemberUpdate: {
			const data = getData<CacheTypes['member'] & { user: CacheTypes['user'] }>(payload);
			operations.push({
				event,
				key: memberKey(data.guild_id, data.user.id),
				merge: true,
				raw: data,
				store: 'member',
				type: 'upsert',
			});
			operations.push({ event, key: data.user.id, raw: data.user, store: 'user', type: 'upsert' });
			break;
		}

		case GatewayDispatchEvents.GuildMemberRemove: {
			const data = getData<{ guild_id: Snowflake; user: CacheTypes['user'] }>(payload);
			operations.push({ key: memberKey(data.guild_id, data.user.id), store: 'member', type: 'delete' });
			operations.push({ event, key: data.user.id, raw: data.user, store: 'user', type: 'upsert' });
			break;
		}

		case GatewayDispatchEvents.GuildMembersChunk: {
			const data = getData<GatewayGuildMembersChunkDispatchData>(payload);
			hydrateGuildMembersChunk(operations, event, data);
			break;
		}

		case GatewayDispatchEvents.GuildRoleCreate:
		case GatewayDispatchEvents.GuildRoleUpdate: {
			const data = getData<{ guild_id: Snowflake; role: APIRole }>(payload);
			operations.push({
				event,
				key: roleKey(data.guild_id, data.role.id),
				merge: event === GatewayDispatchEvents.GuildRoleUpdate,
				raw: withGuildId(data.role, data.guild_id),
				store: 'role',
				type: 'upsert',
			});
			break;
		}

		case GatewayDispatchEvents.GuildRoleDelete: {
			const data = getData<{ guild_id: Snowflake; role_id: Snowflake }>(payload);
			operations.push({ key: roleKey(data.guild_id, data.role_id), store: 'role', type: 'delete' });
			break;
		}

		case GatewayDispatchEvents.GuildScheduledEventCreate:
		case GatewayDispatchEvents.GuildScheduledEventUpdate: {
			const data = getData<CacheTypes['scheduledEvent']>(payload);
			operations.push({
				event,
				key: scheduledEventKey(data.guild_id, data.id),
				merge: true,
				raw: data,
				store: 'scheduledEvent',
				type: 'upsert',
			});
			break;
		}

		case GatewayDispatchEvents.GuildScheduledEventDelete: {
			const data = getData<CacheTypes['scheduledEvent']>(payload);
			operations.push({ key: scheduledEventKey(data.guild_id, data.id), store: 'scheduledEvent', type: 'delete' });
			break;
		}

		case GatewayDispatchEvents.GuildSoundboardSoundCreate:
		case GatewayDispatchEvents.GuildSoundboardSoundUpdate: {
			const data = getData<CacheTypes['soundboardSound']>(payload);
			if (data.guild_id && data.sound_id) {
				operations.push({
					event,
					key: soundboardSoundKey(data.guild_id, data.sound_id),
					merge: event === GatewayDispatchEvents.GuildSoundboardSoundUpdate,
					raw: data,
					store: 'soundboardSound',
					type: 'upsert',
				});
			}

			break;
		}

		case GatewayDispatchEvents.GuildSoundboardSoundDelete: {
			const data = getData<{ guild_id: Snowflake; sound_id: Snowflake }>(payload);
			operations.push({
				key: soundboardSoundKey(data.guild_id, data.sound_id),
				store: 'soundboardSound',
				type: 'delete',
			});
			break;
		}

		case GatewayDispatchEvents.GuildSoundboardSoundsUpdate: {
			const data = getData<GatewayGuildSoundboardSoundsUpdateDispatchData>(payload);
			hydrateGuildSoundboardSoundsUpdate(operations, event, data);
			break;
		}

		case GatewayDispatchEvents.SoundboardSounds: {
			const data = getData<GatewaySoundboardSoundsDispatchData>(payload);
			hydrateSoundboardSounds(operations, event, data);
			break;
		}

		case GatewayDispatchEvents.IntegrationCreate:
		case GatewayDispatchEvents.IntegrationUpdate: {
			const data = getData<CacheTypes['integration']>(payload);
			operations.push({
				event,
				key: integrationKey(data.guild_id, data.id),
				merge: true,
				raw: data,
				store: 'integration',
				type: 'upsert',
			});
			break;
		}

		case GatewayDispatchEvents.IntegrationDelete: {
			const data = getData<{ guild_id: Snowflake; id: Snowflake }>(payload);
			operations.push({ key: integrationKey(data.guild_id, data.id), store: 'integration', type: 'delete' });
			break;
		}

		case GatewayDispatchEvents.InteractionCreate: {
			const data = getData<CacheTypes['interaction'] & { guild_id?: Snowflake }>(payload);
			operations.push({ event, key: data.id, raw: data, store: 'interaction', type: 'upsert' });
			if ('user' in data && data.user) {
				operations.push({ event, key: data.user.id, raw: data.user, store: 'user', type: 'upsert' });
			}

			if ('member' in data && data.member && 'user' in data.member && data.member.user && data.guild_id) {
				operations.push({
					event,
					key: memberKey(data.guild_id, data.member.user.id),
					merge: true,
					raw: withGuildId(data.member, data.guild_id),
					store: 'member',
					type: 'upsert',
				});
				operations.push({ event, key: data.member.user.id, raw: data.member.user, store: 'user', type: 'upsert' });
			}

			break;
		}

		case GatewayDispatchEvents.InviteCreate: {
			const data = getData<CacheTypes['invite']>(payload);
			operations.push({ event, key: inviteKey(data.guild_id, data.code), raw: data, store: 'invite', type: 'upsert' });
			break;
		}

		case GatewayDispatchEvents.InviteDelete: {
			const data = getData<{ code: string; guild_id?: Snowflake | null }>(payload);
			operations.push({ key: inviteKey(data.guild_id, data.code), store: 'invite', type: 'delete' });
			break;
		}

		case GatewayDispatchEvents.MessageCreate:
		case GatewayDispatchEvents.MessageUpdate: {
			const data = getData<CacheTypes['message']>(payload);
			operations.push({
				event,
				key: messageKey(data.channel_id, data.id),
				merge: event === GatewayDispatchEvents.MessageUpdate,
				raw: data,
				store: 'message',
				type: 'upsert',
			});
			if ('author' in data && data.author)
				operations.push({ event, key: data.author.id, raw: data.author, store: 'user', type: 'upsert' });
			if (data.member && data.guild_id && 'author' in data && data.author) {
				operations.push({
					event,
					key: memberKey(data.guild_id, data.author.id),
					merge: true,
					raw: withGuildId(data.member, data.guild_id),
					store: 'member',
					type: 'upsert',
				});
			}

			break;
		}

		case GatewayDispatchEvents.MessageDelete: {
			const data = getData<{ channel_id: Snowflake; id: Snowflake }>(payload);
			operations.push({ key: messageKey(data.channel_id, data.id), store: 'message', type: 'delete' });
			break;
		}

		case GatewayDispatchEvents.MessageDeleteBulk: {
			const data = getData<{ channel_id: Snowflake; ids: Snowflake[] }>(payload);
			for (const id of data.ids)
				operations.push({ key: messageKey(data.channel_id, id), store: 'message', type: 'delete' });
			break;
		}

		case GatewayDispatchEvents.PresenceUpdate: {
			const data = getData<CacheTypes['presence']>(payload);
			operations.push({
				event,
				key: presenceKey(data.guild_id, data.user.id),
				merge: true,
				raw: data,
				store: 'presence',
				type: 'upsert',
			});
			operations.push({ event, key: data.user.id, merge: true, raw: data.user, store: 'user', type: 'upsert' });
			break;
		}

		case GatewayDispatchEvents.Ready: {
			const data = getData<{ guilds: CacheTypes['guild'][]; user: CacheTypes['user'] }>(payload);
			operations.push({ event, key: data.user.id, raw: data.user, store: 'user', type: 'upsert' });
			for (const guild of data.guilds)
				operations.push({ event, key: guild.id, merge: true, raw: guild, store: 'guild', type: 'upsert' });
			break;
		}

		case GatewayDispatchEvents.StageInstanceCreate:
		case GatewayDispatchEvents.StageInstanceUpdate: {
			const data = getData<CacheTypes['stageInstance']>(payload);
			operations.push({
				event,
				key: stageInstanceKey(data.guild_id, data.channel_id),
				merge: true,
				raw: data,
				store: 'stageInstance',
				type: 'upsert',
			});
			break;
		}

		case GatewayDispatchEvents.StageInstanceDelete: {
			const data = getData<CacheTypes['stageInstance']>(payload);
			operations.push({
				key: stageInstanceKey(data.guild_id, data.channel_id),
				store: 'stageInstance',
				type: 'delete',
			});
			break;
		}

		case GatewayDispatchEvents.SubscriptionCreate:
		case GatewayDispatchEvents.SubscriptionUpdate: {
			const data = getData<CacheTypes['subscription']>(payload);
			operations.push({ event, key: data.id, raw: data, store: 'subscription', type: 'upsert' });
			break;
		}

		case GatewayDispatchEvents.SubscriptionDelete: {
			const data = getData<CacheTypes['subscription']>(payload);
			operations.push({ key: data.id, store: 'subscription', type: 'delete' });
			break;
		}

		case GatewayDispatchEvents.ThreadCreate:
		case GatewayDispatchEvents.ThreadUpdate: {
			const data = getData<CacheTypes['thread'] & { member?: CacheTypes['threadMember'] }>(payload);
			operations.push({
				event,
				key: data.id,
				merge: event === GatewayDispatchEvents.ThreadUpdate,
				raw: data,
				store: 'thread',
				type: 'upsert',
			});
			if ('member' in data && data.member?.user_id) {
				operations.push({
					event,
					key: threadMemberKey(data.id, data.member.user_id),
					merge: true,
					raw: data.member,
					store: 'threadMember',
					type: 'upsert',
				});
			}

			break;
		}

		case GatewayDispatchEvents.ThreadDelete: {
			const data = getData<{ id: Snowflake }>(payload);
			operations.push({ key: data.id, store: 'thread', type: 'delete' });
			operations.push({ prefix: `${data.id}:`, store: 'threadMember', type: 'deletePrefix' });
			operations.push({ prefix: `${data.id}:`, store: 'message', type: 'deletePrefix' });
			break;
		}

		case GatewayDispatchEvents.ThreadListSync: {
			const data = getData<GatewayThreadListSync>(payload);
			hydrateThreadListSyncPayload(operations, event, data);
			break;
		}

		case GatewayDispatchEvents.ThreadMemberUpdate: {
			const data = getData<CacheTypes['threadMember'] & { id: Snowflake; user_id: Snowflake }>(payload);
			operations.push({
				event,
				key: threadMemberKey(data.id, data.user_id),
				merge: true,
				raw: data,
				store: 'threadMember',
				type: 'upsert',
			});
			break;
		}

		case GatewayDispatchEvents.ThreadMembersUpdate: {
			const data = getData<GatewayThreadMembersUpdateDispatchData>(payload);
			hydrateThreadMembersUpdate(operations, event, data);
			break;
		}

		case GatewayDispatchEvents.UserUpdate: {
			const data = getData<CacheTypes['user']>(payload);
			operations.push({ event, key: data.id, merge: true, raw: data, store: 'user', type: 'upsert' });
			break;
		}

		case GatewayDispatchEvents.VoiceStateUpdate: {
			const data = getData<CacheTypes['voiceState']>(payload);
			if (!data.guild_id) break;

			if (data.channel_id) {
				operations.push({
					event,
					key: voiceStateKey(data.guild_id, data.user_id),
					merge: true,
					raw: data,
					store: 'voiceState',
					type: 'upsert',
				});
			} else {
				operations.push({ key: voiceStateKey(data.guild_id, data.user_id), store: 'voiceState', type: 'delete' });
			}

			if (data.member?.user) {
				operations.push({ event, key: data.member.user.id, raw: data.member.user, store: 'user', type: 'upsert' });
				operations.push({
					event,
					key: memberKey(data.guild_id, data.member.user.id),
					merge: true,
					raw: withGuildId(data.member, data.guild_id),
					store: 'member',
					type: 'upsert',
				});
			}

			break;
		}

		case GatewayDispatchEvents.AutoModerationActionExecution:
		case GatewayDispatchEvents.ChannelPinsUpdate:
		case GatewayDispatchEvents.GuildIntegrationsUpdate:
		case GatewayDispatchEvents.GuildScheduledEventUserAdd:
		case GatewayDispatchEvents.GuildScheduledEventUserRemove:
		case GatewayDispatchEvents.MessagePollVoteAdd:
		case GatewayDispatchEvents.MessagePollVoteRemove:
		case GatewayDispatchEvents.MessageReactionAdd:
		case GatewayDispatchEvents.MessageReactionRemove:
		case GatewayDispatchEvents.MessageReactionRemoveAll:
		case GatewayDispatchEvents.MessageReactionRemoveEmoji:
		case GatewayDispatchEvents.RateLimited:
		case GatewayDispatchEvents.Resumed:
		case GatewayDispatchEvents.TypingStart:
		case GatewayDispatchEvents.VoiceChannelEffectSend:
		case GatewayDispatchEvents.VoiceServerUpdate:
		case GatewayDispatchEvents.WebhooksUpdate:
			break;

		default:
			break;
	}

	return operations;
}

export function mergeValues<Value>(existing: Value | undefined, value: Value): Value {
	if (isObject(existing) && isObject(value)) return { ...existing, ...value };
	return value;
}

function hydrateGuildCreate(
	operations: MutableOperationList,
	event: GatewayDispatchEvents,
	guild: GatewayGuildCreateDispatchData,
): void {
	operations.push({ event, key: guild.id, raw: guild, store: 'guild', type: 'upsert' });

	for (const channel of getArray<CacheTypes['channel']>(guild, 'channels')) {
		operations.push({ event, key: channel.id, raw: channel, store: 'channel', type: 'upsert' });
	}

	for (const thread of getArray<CacheTypes['thread']>(guild, 'threads')) {
		operations.push({ event, key: thread.id, raw: thread, store: 'thread', type: 'upsert' });
		if ('member' in thread && thread.member?.user_id) {
			operations.push({
				event,
				key: threadMemberKey(thread.id, thread.member.user_id),
				raw: thread.member,
				store: 'threadMember',
				type: 'upsert',
			});
		}
	}

	for (const member of getArray<APIGuildMember>(guild, 'members')) hydrateMember(operations, event, guild.id, member);
	for (const presence of getArray<CacheTypes['presence']>(guild, 'presences')) {
		operations.push({
			event,
			key: presenceKey(guild.id, presence.user.id),
			raw: presence,
			store: 'presence',
			type: 'upsert',
		});
		operations.push({ event, key: presence.user.id, merge: true, raw: presence.user, store: 'user', type: 'upsert' });
	}

	for (const role of getArray<APIRole>(guild, 'roles')) {
		operations.push({
			event,
			key: roleKey(guild.id, role.id),
			raw: withGuildId(role, guild.id),
			store: 'role',
			type: 'upsert',
		});
	}

	for (const emoji of getArray<APIEmoji>(guild, 'emojis')) {
		if (emoji.id)
			operations.push({
				event,
				key: emojiKey(guild.id, emoji.id),
				raw: withGuildId(emoji, guild.id),
				store: 'emoji',
				type: 'upsert',
			});
	}

	for (const sticker of getArray<APISticker>(guild, 'stickers')) {
		operations.push({
			event,
			key: stickerKey(guild.id, sticker.id),
			raw: withGuildId(sticker, guild.id),
			store: 'sticker',
			type: 'upsert',
		});
	}

	for (const voiceState of getArray<CacheTypes['voiceState']>(guild, 'voice_states')) {
		if (voiceState.channel_id)
			operations.push({
				event,
				key: voiceStateKey(guild.id, voiceState.user_id),
				raw: voiceState,
				store: 'voiceState',
				type: 'upsert',
			});
	}

	for (const stageInstance of getArray<CacheTypes['stageInstance']>(guild, 'stage_instances')) {
		operations.push({
			event,
			key: stageInstanceKey(guild.id, stageInstance.channel_id),
			raw: stageInstance,
			store: 'stageInstance',
			type: 'upsert',
		});
	}

	for (const scheduledEvent of getArray<CacheTypes['scheduledEvent']>(guild, 'guild_scheduled_events')) {
		operations.push({
			event,
			key: scheduledEventKey(guild.id, scheduledEvent.id),
			raw: scheduledEvent,
			store: 'scheduledEvent',
			type: 'upsert',
		});
	}

	for (const sound of getArray<APISoundboardSound>(guild, 'soundboard_sounds')) {
		if (sound.sound_id) {
			operations.push({
				event,
				key: soundboardSoundKey(guild.id, sound.sound_id),
				raw: sound,
				store: 'soundboardSound',
				type: 'upsert',
			});
		}
	}
}

function hydrateGuildMembersChunk(
	operations: MutableOperationList,
	event: GatewayDispatchEvents,
	data: GatewayGuildMembersChunkDispatchData,
): void {
	for (const member of data.members) hydrateMember(operations, event, data.guild_id, member);
	for (const presence of data.presences ?? []) {
		operations.push({
			event,
			key: presenceKey(data.guild_id, presence.user.id),
			raw: presence,
			store: 'presence',
			type: 'upsert',
		});
		operations.push({ event, key: presence.user.id, merge: true, raw: presence.user, store: 'user', type: 'upsert' });
	}
}

function hydrateGuildSoundboardSoundsUpdate(
	operations: MutableOperationList,
	event: GatewayDispatchEvents,
	data: GatewayGuildSoundboardSoundsUpdateDispatchData,
): void {
	operations.push({ prefix: `${data.guild_id}:`, store: 'soundboardSound', type: 'deletePrefix' });
	for (const sound of data.soundboard_sounds) {
		operations.push({
			event,
			key: soundboardSoundKey(data.guild_id, sound.sound_id),
			raw: sound,
			store: 'soundboardSound',
			type: 'upsert',
		});
	}
}

function hydrateSoundboardSounds(
	operations: MutableOperationList,
	event: GatewayDispatchEvents,
	data: GatewaySoundboardSoundsDispatchData,
): void {
	for (const sound of data.soundboard_sounds) {
		operations.push({
			event,
			key: soundboardSoundKey(data.guild_id, sound.sound_id),
			raw: sound,
			store: 'soundboardSound',
			type: 'upsert',
		});
	}
}

function hydrateThreadListSyncPayload(
	operations: MutableOperationList,
	event: GatewayDispatchEvents,
	data: GatewayThreadListSync,
): void {
	for (const thread of data.threads) {
		operations.push({ event, key: thread.id, merge: true, raw: thread, store: 'thread', type: 'upsert' });
	}

	for (const member of data.members) {
		if (member.id && member.user_id) {
			operations.push({
				event,
				key: threadMemberKey(member.id, member.user_id),
				merge: true,
				raw: member,
				store: 'threadMember',
				type: 'upsert',
			});
		}
	}
}

function hydrateThreadMembersUpdate(
	operations: MutableOperationList,
	event: GatewayDispatchEvents,
	data: GatewayThreadMembersUpdateDispatchData,
): void {
	for (const member of data.added_members ?? []) {
		if (member.user_id) {
			operations.push({
				event,
				key: threadMemberKey(data.id, member.user_id),
				merge: true,
				raw: withGuildId(member, data.guild_id),
				store: 'threadMember',
				type: 'upsert',
			});
		}
	}

	for (const userId of data.removed_member_ids ?? []) {
		operations.push({ key: threadMemberKey(data.id, userId), store: 'threadMember', type: 'delete' });
	}
}

function hydrateMember(
	operations: MutableOperationList,
	event: GatewayDispatchEvents,
	guildId: Snowflake,
	member: APIGuildMember,
): void {
	if (!member.user) return;

	operations.push({
		event,
		key: memberKey(guildId, member.user.id),
		merge: true,
		raw: withGuildId(member, guildId),
		store: 'member',
		type: 'upsert',
	});
	operations.push({ event, key: member.user.id, raw: member.user, store: 'user', type: 'upsert' });
}

function deleteGuildScopedResources(operations: MutableOperationList, guildId: Snowflake): void {
	const prefixStores: StoreName[] = [
		'applicationCommandPermissions',
		'auditLogEntry',
		'autoModerationRule',
		'ban',
		'emoji',
		'integration',
		'member',
		'presence',
		'role',
		'scheduledEvent',
		'soundboardSound',
		'stageInstance',
		'sticker',
		'voiceState',
	];

	for (const store of prefixStores) operations.push({ prefix: `${guildId}:`, store, type: 'deletePrefix' });

	for (const store of ['channel', 'thread', 'threadMember', 'message', 'invite'] as const) {
		operations.push({ predicate: (value) => valueHasGuildId(value, guildId), store, type: 'deleteWhere' });
	}
}

function getArray<Value>(object: object, key: string): Value[] {
	const value = (object as Record<string, unknown>)[key];
	return Array.isArray(value) ? (value as Value[]) : [];
}

function getData<Data>(payload: GatewayDispatchPayload): Data {
	return payload.d as Data;
}

function withGuildId<Value extends object>(value: Value, guildId: Snowflake): Value & { guild_id: Snowflake } {
	return { ...value, guild_id: guildId };
}

function valueHasGuildId(value: unknown, guildId: Snowflake): boolean {
	return isObject(value) && value.guild_id === guildId;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
