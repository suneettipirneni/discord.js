import type { GatewayDispatchPayload } from 'discord-api-types/v10';
import { createCacheOperations, mergeValues, StoreNames, type StoreName } from './operations.js';
import { MemoryStore } from './stores.js';
import type {
	Cache,
	CacheEntity,
	CacheFactoryOptions,
	CacheMappers,
	CacheStore,
	CacheTypeKey,
	CacheTypeOverrides,
	CacheTypes,
	InferableCacheFactoryOptions,
	InferableCacheMappers,
	InferCacheTypes,
	RequiredCacheMappers,
} from './types.js';

type MemoryStoreMap<TTypes extends CacheTypeOverrides> = {
	[Key in StoreName]: CacheStore<CacheEntity<TTypes, Key>>;
};

export class MemoryCache<TTypes extends CacheTypeOverrides = CacheTypeOverrides> implements Cache<TTypes> {
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

	readonly #stores: MemoryStoreMap<TTypes>;

	readonly #mappers: CacheMappers<TTypes>;

	public constructor(options: CacheFactoryOptions<TTypes> = {}) {
		this.#mappers = options.mappers ?? {};
		this.#stores = Object.fromEntries(
			StoreNames.map((name) => [name, new MemoryStore()]),
		) as unknown as MemoryStoreMap<TTypes>;

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

	public handleGatewayDispatch(payload: GatewayDispatchPayload, shardId?: number): void {
		for (const operation of createCacheOperations(payload)) {
			switch (operation.type) {
				case 'upsert':
					this.upsert(operation.store, operation.key, operation.raw, operation.event, shardId, operation.merge);
					break;
				case 'delete':
					this.#stores[operation.store].delete(operation.key);
					break;
				case 'deletePrefix':
					this.deletePrefix(operation.store, operation.prefix);
					break;
				case 'deleteWhere':
					this.deleteWhere(operation.store, (value) => operation.predicate(value));
					break;
			}
		}
	}

	private deletePrefix(storeName: StoreName, prefix: string): void {
		const store = this.#stores[storeName];
		for (const key of store.keys()) {
			if (key.startsWith(prefix)) store.delete(key);
		}
	}

	private deleteWhere(storeName: StoreName, predicate: (value: unknown) => boolean): void {
		const store = this.#stores[storeName];
		for (const [key, value] of store.entries()) {
			if (predicate(value)) store.delete(key);
		}
	}

	private upsert<Key extends CacheTypeKey>(
		storeName: Key,
		key: string,
		raw: unknown,
		event: GatewayDispatchPayload['t'],
		shardId: number | undefined,
		merge = false,
	): void {
		const store = this.#stores[storeName];
		const existing = store.get(key);
		const mapper = this.#mappers[storeName];
		const value = mapper
			? mapper({ event, existing, raw: raw as CacheTypes[Key], shardId })
			: merge
				? mergeValues(existing, raw as CacheEntity<TTypes, Key>)
				: raw;

		store.set(key, value as CacheEntity<TTypes, Key>);
	}
}

export function createInMemoryCache<TMappers extends InferableCacheMappers>(
	options: InferableCacheFactoryOptions<TMappers>,
): Cache<InferCacheTypes<TMappers>>;
export function createInMemoryCache<TTypes extends CacheTypeOverrides>(
	options: CacheFactoryOptions<TTypes> & { mappers: RequiredCacheMappers<TTypes> },
): Cache<TTypes>;
export function createInMemoryCache(options?: CacheFactoryOptions): Cache;
export function createInMemoryCache<TTypes extends CacheTypeOverrides>(
	options?: CacheFactoryOptions<TTypes>,
): Cache<TTypes> {
	return new MemoryCache(options);
}
