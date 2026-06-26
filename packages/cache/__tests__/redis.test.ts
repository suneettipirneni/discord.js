/* eslint-disable id-length */
import { GatewayDispatchEvents } from 'discord-api-types/v10';
import type { GatewayDispatchPayload } from 'discord-api-types/v10';
import { expect, test, vi } from 'vitest';
import { memberKey } from '../src/index.js';
import type { RedisStoreClient } from '../src/index.js';
import { createRedisCache } from '../src/redis.js';

function payload(event: GatewayDispatchEvents, data: unknown): GatewayDispatchPayload {
	return { op: 0, s: 1, t: event, d: data } as GatewayDispatchPayload;
}

function createRedisMock() {
	const values = new Map<string, string>();
	const sets = new Map<string, Set<string>>();

	const redis = {
		del: vi.fn(async (...keys: string[]) => {
			let deleted = 0;
			for (const key of keys) {
				if (values.delete(key)) deleted++;
				if (sets.delete(key)) deleted++;
			}

			return deleted;
		}),
		exists: vi.fn(async (key: string) => Number(values.has(key))),
		get: vi.fn(async (key: string) => values.get(key) ?? null),
		sadd: vi.fn(async (key: string, ...members: string[]) => {
			const set = sets.get(key) ?? new Set<string>();
			sets.set(key, set);

			let added = 0;
			for (const member of members) {
				if (!set.has(member)) added++;
				set.add(member);
			}

			return added;
		}),
		scard: vi.fn(async (key: string) => sets.get(key)?.size ?? 0),
		set: vi.fn(async (key: string, value: string) => {
			values.set(key, value);
			return 'OK';
		}),
		smembers: vi.fn(async (key: string) => Array.from(sets.get(key) ?? [])),
		srem: vi.fn(async (key: string, ...members: string[]) => {
			const set = sets.get(key);
			if (!set) return 0;

			let removed = 0;
			for (const member of members) {
				if (set.delete(member)) removed++;
			}

			return removed;
		}),
	} satisfies RedisStoreClient;

	return { redis, values, sets };
}

test('stores Redis values as JSON under namespaced keys', async () => {
	const { redis, values, sets } = createRedisMock();
	const cache = createRedisCache(redis, { prefix: 'test' });

	await cache.guilds.set('guild-1', { id: 'guild-1' });

	expect(values.get('test:guild:guild-1')).toBe(JSON.stringify({ id: 'guild-1' }));
	expect(sets.get('test:guild:keys')?.has('guild-1')).toBe(true);
	expect(await cache.guilds.get('guild-1')).toEqual({ id: 'guild-1' });
	expect(await cache.guilds.has('guild-1')).toBe(true);

	await cache.guilds.delete('guild-1');

	expect(await cache.guilds.has('guild-1')).toBe(false);
	expect(redis.srem).toHaveBeenCalledWith('test:guild:keys', 'guild-1');
});

test('applies gateway reducers to Redis stores', async () => {
	const { redis } = createRedisMock();
	const cache = createRedisCache(redis, { prefix: 'test' });

	await cache.handleGatewayDispatch(
		payload(GatewayDispatchEvents.GuildMemberAdd, {
			guild_id: 'guild-1',
			roles: [],
			user: { id: 'user-1' },
		}),
		0,
	);

	expect(await cache.members.get(memberKey('guild-1', 'user-1'))).toMatchObject({
		guild_id: 'guild-1',
		user: { id: 'user-1' },
	});
	expect(await cache.users.get('user-1')).toEqual({ id: 'user-1' });
});
