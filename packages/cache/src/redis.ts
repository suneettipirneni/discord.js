import type { GatewayDispatchPayload } from 'discord-api-types/v10';
import type Redis from 'ioredis';
import { createCacheOperations, mergeValues, StoreNames, type StoreName } from './operations.js';
import { RedisStore, type RedisStoreClient } from './stores.js';
import type {
	AsyncCache,
	AsyncCacheStore,
	CacheEntity,
	CacheTypeKey,
	CacheTypeOverrides,
	CacheTypes,
	InferableRedisCacheFactoryOptions,
	InferableCacheMappers,
	InferCacheTypes,
	RedisCacheFactoryOptions,
	RequiredCacheMappers,
} from './types.js';

type RedisStoreMap<TTypes extends CacheTypeOverrides> = {
	[Key in StoreName]: AsyncCacheStore<CacheEntity<TTypes, Key>>;
};

export const DefaultRedisCachePrefix = 'discordjs:cache';

export class RedisCache<TTypes extends CacheTypeOverrides = CacheTypeOverrides> implements AsyncCache<TTypes> {
	public readonly applicationCommandPermissions;

	public readonly auditLogEntries;

	public readonly autoModerationRules;

	public readonly bans;

	public readonly channels;

	public readonly emojis;

	public readonly entitlements;

	public readonly guilds;

	public readonly integrations;

	public readonly interactions;

	public readonly invites;

	public readonly members;

	public readonly messages;

	public readonly presences;

	public readonly roles;

	public readonly scheduledEvents;

	public readonly soundboardSounds;

	public readonly stageInstances;

	public readonly stickers;

	public readonly subscriptions;

	public readonly threadMembers;

	public readonly threads;

	public readonly users;

	public readonly voiceStates;

	readonly #stores: RedisStoreMap<TTypes>;

	readonly #options: RedisCacheFactoryOptions<TTypes>;

	public constructor(redis: Redis | RedisStoreClient, options: RedisCacheFactoryOptions<TTypes> = {}) {
		this.#options = options;
		const prefix = options.prefix ?? DefaultRedisCachePrefix;
		this.#stores = Object.fromEntries(
			StoreNames.map((name) => [name, new RedisStore(redis, prefix, name)]),
		) as unknown as RedisStoreMap<TTypes>;

		this.applicationCommandPermissions = this.#stores.applicationCommandPermissions;
		this.auditLogEntries = this.#stores.auditLogEntry;
		this.autoModerationRules = this.#stores.autoModerationRule;
		this.bans = this.#stores.ban;
		this.channels = this.#stores.channel;
		this.emojis = this.#stores.emoji;
		this.entitlements = this.#stores.entitlement;
		this.guilds = this.#stores.guild;
		this.integrations = this.#stores.integration;
		this.interactions = this.#stores.interaction;
		this.invites = this.#stores.invite;
		this.members = this.#stores.member;
		this.messages = this.#stores.message;
		this.presences = this.#stores.presence;
		this.roles = this.#stores.role;
		this.scheduledEvents = this.#stores.scheduledEvent;
		this.soundboardSounds = this.#stores.soundboardSound;
		this.stageInstances = this.#stores.stageInstance;
		this.stickers = this.#stores.sticker;
		this.subscriptions = this.#stores.subscription;
		this.threadMembers = this.#stores.threadMember;
		this.threads = this.#stores.thread;
		this.users = this.#stores.user;
		this.voiceStates = this.#stores.voiceState;
	}

	public async handleGatewayDispatch(payload: GatewayDispatchPayload, shardId?: number): Promise<void> {
		for (const operation of createCacheOperations(payload)) {
			switch (operation.type) {
				case 'upsert':
					await this.upsert(operation.store, operation.key, operation.raw, operation.event, shardId, operation.merge);
					break;
				case 'delete':
					await this.#stores[operation.store].delete(operation.key);
					break;
				case 'deletePrefix':
					await this.deletePrefix(operation.store, operation.prefix);
					break;
				case 'deleteWhere':
					await this.deleteWhere(operation.store, (value) => operation.predicate(value));
					break;
			}
		}
	}

	private async deletePrefix(storeName: StoreName, prefix: string): Promise<void> {
		const store = this.#stores[storeName];
		for (const key of await store.keys()) {
			if (key.startsWith(prefix)) await store.delete(key);
		}
	}

	private async deleteWhere(storeName: StoreName, predicate: (value: unknown) => boolean): Promise<void> {
		const store = this.#stores[storeName];
		for (const [key, value] of await store.entries()) {
			if (predicate(value)) await store.delete(key);
		}
	}

	private async upsert<Key extends CacheTypeKey>(
		storeName: Key,
		key: string,
		raw: unknown,
		event: GatewayDispatchPayload['t'],
		shardId: number | undefined,
		merge = false,
	): Promise<void> {
		const store = this.#stores[storeName];
		const existing = await store.get(key);
		const mapper = this.#options.mappers?.[storeName];
		const value = mapper
			? mapper({ event, existing, raw: raw as CacheTypes[Key], shardId })
			: merge
				? mergeValues(existing, raw as CacheEntity<TTypes, Key>)
				: raw;

		await store.set(key, value as CacheEntity<TTypes, Key>);
	}
}

export function createRedisCache<TMappers extends InferableCacheMappers>(
	redis: Redis | RedisStoreClient,
	options: InferableRedisCacheFactoryOptions<TMappers>,
): AsyncCache<InferCacheTypes<TMappers>>;
export function createRedisCache<TTypes extends CacheTypeOverrides>(
	redis: Redis | RedisStoreClient,
	options: RedisCacheFactoryOptions<TTypes> & { mappers: RequiredCacheMappers<TTypes> },
): AsyncCache<TTypes>;
export function createRedisCache(redis: Redis | RedisStoreClient, options?: RedisCacheFactoryOptions): AsyncCache;
export function createRedisCache<TTypes extends CacheTypeOverrides>(
	redis: Redis | RedisStoreClient,
	options?: RedisCacheFactoryOptions<TTypes>,
): AsyncCache<TTypes> {
	return new RedisCache(redis, options);
}
