/* eslint-disable id-length */
import { GatewayDispatchEvents } from 'discord-api-types/v10';
import type { GatewayDispatchPayload } from 'discord-api-types/v10';
import { expect, test } from 'vitest';
import { memberKey, messageKey, presenceKey, roleKey, voiceStateKey } from '../src/index.js';
import { createInMemoryCache } from '../src/inmemory.js';

function payload(event: GatewayDispatchEvents, data: unknown): GatewayDispatchPayload {
	return { op: 0, s: 1, t: event, d: data } as GatewayDispatchPayload;
}

test('hydrates ready and guild create payloads into memory stores', () => {
	const cache = createInMemoryCache();

	cache.handleGatewayDispatch(
		payload(GatewayDispatchEvents.Ready, {
			user: { id: 'user-1', username: 'bot' },
			guilds: [{ id: 'guild-1', unavailable: true }],
		}),
		0,
	);

	expect(cache.users.get('user-1')).toMatchObject({ id: 'user-1' });
	expect(cache.guilds.get('guild-1')).toMatchObject({ id: 'guild-1', unavailable: true });

	cache.handleGatewayDispatch(
		payload(GatewayDispatchEvents.GuildCreate, {
			id: 'guild-1',
			name: 'guild',
			channels: [{ id: 'channel-1', guild_id: 'guild-1', name: 'general', type: 0 }],
			emojis: [{ id: 'emoji-1', name: 'wave' }],
			guild_scheduled_events: [{ id: 'event-1', guild_id: 'guild-1', name: 'event' }],
			members: [{ user: { id: 'user-2', username: 'member' }, roles: ['role-1'] }],
			presences: [{ guild_id: 'guild-1', status: 'online', user: { id: 'user-2' } }],
			roles: [{ id: 'role-1', name: 'role' }],
			stage_instances: [{ channel_id: 'stage-1', guild_id: 'guild-1', id: 'stage-instance-1' }],
			stickers: [{ id: 'sticker-1', guild_id: 'guild-1', name: 'sticker' }],
			threads: [{ id: 'thread-1', guild_id: 'guild-1', member: { id: 'thread-1', user_id: 'user-2' } }],
			voice_states: [{ channel_id: 'voice-1', guild_id: 'guild-1', user_id: 'user-2' }],
		}),
		0,
	);

	expect(cache.channels.get('channel-1')).toMatchObject({ id: 'channel-1' });
	expect(cache.members.get(memberKey('guild-1', 'user-2'))).toMatchObject({ guild_id: 'guild-1' });
	expect(cache.presences.get(presenceKey('guild-1', 'user-2'))).toMatchObject({ status: 'online' });
	expect(cache.roles.get(roleKey('guild-1', 'role-1'))).toMatchObject({ guild_id: 'guild-1' });
	expect(cache.threads.get('thread-1')).toMatchObject({ id: 'thread-1' });
	expect(cache.threadMembers.get('thread-1:user-2')).toMatchObject({ user_id: 'user-2' });
	expect(cache.voiceStates.get(voiceStateKey('guild-1', 'user-2'))).toMatchObject({ channel_id: 'voice-1' });
});

test('merges updates and deletes invalidated memory entries', () => {
	const cache = createInMemoryCache();

	cache.handleGatewayDispatch(
		payload(GatewayDispatchEvents.MessageCreate, {
			id: 'message-1',
			channel_id: 'channel-1',
			content: 'old',
			author: { id: 'user-1' },
		}),
	);
	cache.handleGatewayDispatch(
		payload(GatewayDispatchEvents.MessageUpdate, { id: 'message-1', channel_id: 'channel-1', content: 'new' }),
	);

	expect(cache.messages.get(messageKey('channel-1', 'message-1'))).toMatchObject({
		author: { id: 'user-1' },
		content: 'new',
	});

	cache.handleGatewayDispatch(
		payload(GatewayDispatchEvents.MessageDelete, { id: 'message-1', channel_id: 'channel-1' }),
	);
	expect(cache.messages.has(messageKey('channel-1', 'message-1'))).toBe(false);

	cache.handleGatewayDispatch(
		payload(GatewayDispatchEvents.GuildMemberAdd, { guild_id: 'guild-1', roles: [], user: { id: 'user-1' } }),
	);
	cache.handleGatewayDispatch(
		payload(GatewayDispatchEvents.GuildMemberRemove, { guild_id: 'guild-1', user: { id: 'user-1' } }),
	);

	expect(cache.members.has(memberKey('guild-1', 'user-1'))).toBe(false);
	expect(cache.users.get('user-1')).toMatchObject({ id: 'user-1' });
});

test('cleans guild-scoped memory resources on guild delete', () => {
	const cache = createInMemoryCache();

	cache.handleGatewayDispatch(
		payload(GatewayDispatchEvents.GuildRoleCreate, { guild_id: 'guild-1', role: { id: 'role-1' } }),
	);
	cache.handleGatewayDispatch(
		payload(GatewayDispatchEvents.PresenceUpdate, { guild_id: 'guild-1', status: 'online', user: { id: 'user-1' } }),
	);
	cache.handleGatewayDispatch(
		payload(GatewayDispatchEvents.VoiceStateUpdate, { channel_id: 'voice-1', guild_id: 'guild-1', user_id: 'user-1' }),
	);
	cache.handleGatewayDispatch(
		payload(GatewayDispatchEvents.ChannelCreate, { guild_id: 'guild-1', id: 'channel-1', type: 0 }),
	);
	cache.handleGatewayDispatch(payload(GatewayDispatchEvents.GuildDelete, { id: 'guild-1' }));

	expect(cache.roles.size()).toBe(0);
	expect(cache.presences.size()).toBe(0);
	expect(cache.voiceStates.size()).toBe(0);
	expect(cache.channels.size()).toBe(0);
});

test('uses custom mappers for overridden entity types', () => {
	const cache = createInMemoryCache({
		mappers: {
			guild: ({ raw }) => ({ customId: raw.id }),
		},
	});

	cache.handleGatewayDispatch(payload(GatewayDispatchEvents.GuildCreate, { id: 'guild-1' }));

	expect(cache.guilds.get('guild-1')).toEqual({ customId: 'guild-1' });
});
