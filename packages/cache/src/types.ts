import type {
	APIAuditLogEntry,
	APIAutoModerationRule,
	APIChannel,
	APIEmoji,
	APIEntitlement,
	APIGuildMember,
	APIGuildScheduledEvent,
	APIInteraction,
	APIRole,
	APISoundboardSound,
	APIStageInstance,
	APISticker,
	APISubscription,
	APIThreadChannel,
	APIThreadMember,
	APIUser,
	APIVoiceState,
	GatewayApplicationCommandPermissionsUpdateDispatchData,
	GatewayDispatchEvents,
	GatewayDispatchPayload,
	GatewayGuildBanModifyDispatchData,
	GatewayGuildCreateDispatchData,
	GatewayGuildDeleteDispatchData,
	GatewayGuildMemberAddDispatchData,
	GatewayGuildMemberUpdateDispatchData,
	GatewayGuildModifyDispatchData,
	GatewayIntegrationCreateDispatchData,
	GatewayIntegrationUpdateDispatchData,
	GatewayInviteCreateDispatchData,
	GatewayMessageCreateDispatchData,
	GatewayMessageUpdateDispatchData,
	GatewayPresenceUpdateDispatchData,
	Snowflake,
} from 'discord-api-types/v10';

/**
 * Raw cache entity types used when no custom mapping is supplied.
 */
export interface CacheTypes {
	applicationCommandPermissions: GatewayApplicationCommandPermissionsUpdateDispatchData;
	auditLogEntry: APIAuditLogEntry & { guild_id: Snowflake };
	autoModerationRule: APIAutoModerationRule;
	ban: GatewayGuildBanModifyDispatchData;
	channel: APIChannel & { guild_id?: Snowflake };
	emoji: APIEmoji & { guild_id: Snowflake };
	entitlement: APIEntitlement;
	guild: GatewayGuildCreateDispatchData | GatewayGuildDeleteDispatchData | GatewayGuildModifyDispatchData;
	integration: GatewayIntegrationCreateDispatchData | GatewayIntegrationUpdateDispatchData;
	interaction: APIInteraction;
	invite: GatewayInviteCreateDispatchData;
	member: {
		guild_id: Snowflake;
	} & (APIGuildMember | GatewayGuildMemberAddDispatchData | GatewayGuildMemberUpdateDispatchData);
	message: GatewayMessageCreateDispatchData | GatewayMessageUpdateDispatchData;
	presence: GatewayPresenceUpdateDispatchData;
	role: APIRole & { guild_id: Snowflake };
	scheduledEvent: APIGuildScheduledEvent;
	soundboardSound: APISoundboardSound;
	stageInstance: APIStageInstance;
	sticker: APISticker & { guild_id: Snowflake };
	subscription: APISubscription;
	thread: APIThreadChannel;
	threadMember: APIThreadMember & { guild_id?: Snowflake };
	user: APIUser;
	voiceState: APIVoiceState;
}

export type CacheTypeKey = keyof CacheTypes;

export type CacheTypeOverrides = Partial<Record<CacheTypeKey, unknown>>;

/**
 * Resolves the stored entity type for a cache key.
 */
export type CacheEntity<TTypes extends CacheTypeOverrides, Key extends CacheTypeKey> = Key extends keyof TTypes
	? TTypes[Key]
	: CacheTypes[Key];

/**
 * Metadata passed to custom cache mappers.
 */
export interface CacheMapperContext<Raw, Existing> {
	event: GatewayDispatchEvents;
	existing: Existing | undefined;
	raw: Raw;
	shardId: number | undefined;
}

/**
 * Converts a raw Discord gateway payload into a user-defined cache entity.
 */
export type CacheMapper<Raw, Custom> = (context: CacheMapperContext<Raw, Custom>) => Custom;

export type RequiredCacheMappers<TTypes extends CacheTypeOverrides> = {
	[Key in CacheTypeKey & keyof TTypes]-?: CacheMapper<CacheTypes[Key], CacheEntity<TTypes, Key>>;
};

export type CacheMappers<TTypes extends CacheTypeOverrides> = Partial<{
	[Key in CacheTypeKey]: CacheMapper<CacheTypes[Key], CacheEntity<TTypes, Key>>;
}>;

export type InferableCacheMappers = Partial<{
	[Key in CacheTypeKey]: (context: CacheMapperContext<CacheTypes[Key], unknown>) => unknown;
}>;

/**
 * Infers cache entity overrides from a mapper object.
 */
export type InferCacheTypes<TMappers extends InferableCacheMappers> = {
	[Key in CacheTypeKey & keyof TMappers]: TMappers[Key] extends (
		context: CacheMapperContext<CacheTypes[Key], unknown>,
	) => infer Return
		? Return
		: never;
};

/**
 * Options for in-memory cache creation.
 */
export interface CacheFactoryOptions<TTypes extends CacheTypeOverrides = CacheTypeOverrides> {
	mappers?: CacheMappers<TTypes>;
}

export interface InferableCacheFactoryOptions<TMappers extends InferableCacheMappers> extends Omit<
	CacheFactoryOptions<InferCacheTypes<TMappers>>,
	'mappers'
> {
	mappers: TMappers;
}

/**
 * Options for Redis-backed cache creation.
 */
export interface RedisCacheFactoryOptions<
	TTypes extends CacheTypeOverrides = CacheTypeOverrides,
> extends CacheFactoryOptions<TTypes> {
	/**
	 * Prefix for all Redis keys owned by this cache.
	 *
	 * @defaultValue `'discordjs:cache'`
	 */
	prefix?: string;
}

export interface InferableRedisCacheFactoryOptions<TMappers extends InferableCacheMappers> extends Omit<
	RedisCacheFactoryOptions<InferCacheTypes<TMappers>>,
	'mappers'
> {
	mappers: TMappers;
}

/**
 * Synchronous cache store.
 */
export interface CacheStore<Value> {
	clear(): void;
	delete(key: string): boolean;
	entries(): IterableIterator<[string, Value]>;
	get(key: string): Value | undefined;
	has(key: string): boolean;
	keys(): IterableIterator<string>;
	set(key: string, value: Value): void;
	size(): number;
	values(): IterableIterator<Value>;
}

/**
 * Asynchronous cache store.
 */
export interface AsyncCacheStore<Value> {
	clear(): Promise<void>;
	delete(key: string): Promise<boolean>;
	entries(): Promise<[string, Value][]>;
	get(key: string): Promise<Value | undefined>;
	has(key: string): Promise<boolean>;
	keys(): Promise<string[]>;
	set(key: string, value: Value): Promise<void>;
	size(): Promise<number>;
	values(): Promise<Value[]>;
}

export interface CacheStores<TTypes extends CacheTypeOverrides> {
	applicationCommandPermissions: CacheStore<CacheEntity<TTypes, 'applicationCommandPermissions'>>;
	auditLogEntries: CacheStore<CacheEntity<TTypes, 'auditLogEntry'>>;
	autoModerationRules: CacheStore<CacheEntity<TTypes, 'autoModerationRule'>>;
	bans: CacheStore<CacheEntity<TTypes, 'ban'>>;
	channels: CacheStore<CacheEntity<TTypes, 'channel'>>;
	emojis: CacheStore<CacheEntity<TTypes, 'emoji'>>;
	entitlements: CacheStore<CacheEntity<TTypes, 'entitlement'>>;
	guilds: CacheStore<CacheEntity<TTypes, 'guild'>>;
	integrations: CacheStore<CacheEntity<TTypes, 'integration'>>;
	interactions: CacheStore<CacheEntity<TTypes, 'interaction'>>;
	invites: CacheStore<CacheEntity<TTypes, 'invite'>>;
	members: CacheStore<CacheEntity<TTypes, 'member'>>;
	messages: CacheStore<CacheEntity<TTypes, 'message'>>;
	presences: CacheStore<CacheEntity<TTypes, 'presence'>>;
	roles: CacheStore<CacheEntity<TTypes, 'role'>>;
	scheduledEvents: CacheStore<CacheEntity<TTypes, 'scheduledEvent'>>;
	soundboardSounds: CacheStore<CacheEntity<TTypes, 'soundboardSound'>>;
	stageInstances: CacheStore<CacheEntity<TTypes, 'stageInstance'>>;
	stickers: CacheStore<CacheEntity<TTypes, 'sticker'>>;
	subscriptions: CacheStore<CacheEntity<TTypes, 'subscription'>>;
	threadMembers: CacheStore<CacheEntity<TTypes, 'threadMember'>>;
	threads: CacheStore<CacheEntity<TTypes, 'thread'>>;
	users: CacheStore<CacheEntity<TTypes, 'user'>>;
	voiceStates: CacheStore<CacheEntity<TTypes, 'voiceState'>>;
}

export interface AsyncCacheStores<TTypes extends CacheTypeOverrides> {
	applicationCommandPermissions: AsyncCacheStore<CacheEntity<TTypes, 'applicationCommandPermissions'>>;
	auditLogEntries: AsyncCacheStore<CacheEntity<TTypes, 'auditLogEntry'>>;
	autoModerationRules: AsyncCacheStore<CacheEntity<TTypes, 'autoModerationRule'>>;
	bans: AsyncCacheStore<CacheEntity<TTypes, 'ban'>>;
	channels: AsyncCacheStore<CacheEntity<TTypes, 'channel'>>;
	emojis: AsyncCacheStore<CacheEntity<TTypes, 'emoji'>>;
	entitlements: AsyncCacheStore<CacheEntity<TTypes, 'entitlement'>>;
	guilds: AsyncCacheStore<CacheEntity<TTypes, 'guild'>>;
	integrations: AsyncCacheStore<CacheEntity<TTypes, 'integration'>>;
	interactions: AsyncCacheStore<CacheEntity<TTypes, 'interaction'>>;
	invites: AsyncCacheStore<CacheEntity<TTypes, 'invite'>>;
	members: AsyncCacheStore<CacheEntity<TTypes, 'member'>>;
	messages: AsyncCacheStore<CacheEntity<TTypes, 'message'>>;
	presences: AsyncCacheStore<CacheEntity<TTypes, 'presence'>>;
	roles: AsyncCacheStore<CacheEntity<TTypes, 'role'>>;
	scheduledEvents: AsyncCacheStore<CacheEntity<TTypes, 'scheduledEvent'>>;
	soundboardSounds: AsyncCacheStore<CacheEntity<TTypes, 'soundboardSound'>>;
	stageInstances: AsyncCacheStore<CacheEntity<TTypes, 'stageInstance'>>;
	stickers: AsyncCacheStore<CacheEntity<TTypes, 'sticker'>>;
	subscriptions: AsyncCacheStore<CacheEntity<TTypes, 'subscription'>>;
	threadMembers: AsyncCacheStore<CacheEntity<TTypes, 'threadMember'>>;
	threads: AsyncCacheStore<CacheEntity<TTypes, 'thread'>>;
	users: AsyncCacheStore<CacheEntity<TTypes, 'user'>>;
	voiceStates: AsyncCacheStore<CacheEntity<TTypes, 'voiceState'>>;
}

/**
 * Synchronous gateway cache.
 */
export interface Cache<TTypes extends CacheTypeOverrides = CacheTypeOverrides> extends CacheStores<TTypes> {
	handleGatewayDispatch(payload: GatewayDispatchPayload, shardId?: number): void;
}

/**
 * Asynchronous gateway cache.
 */
export interface AsyncCache<TTypes extends CacheTypeOverrides = CacheTypeOverrides> extends AsyncCacheStores<TTypes> {
	handleGatewayDispatch(payload: GatewayDispatchPayload, shardId?: number): Promise<void>;
}

/**
 * Structural dispatch source compatible with `@discordjs/ws` and `@discordjs/core` gateway-like objects.
 */
export interface GatewayDispatchSource {
	on(event: string, listener: (payload: GatewayDispatchPayload, shardId: number) => Promise<void> | void): unknown;
}
