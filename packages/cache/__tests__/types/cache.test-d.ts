import { expectTypeOf } from 'vitest';
import type { RedisStoreClient } from '../../src/index.js';
import { createInMemoryCache } from '../../src/inmemory.js';
import { createRedisCache } from '../../src/redis.js';

interface CustomGuild {
	customId: string;
}

interface MyCacheTypes {
	guild: CustomGuild;
}

const cache = createInMemoryCache<MyCacheTypes>({
	mappers: {
		guild: ({ raw }) => ({ customId: raw.id }),
	},
});

expectTypeOf(cache.guilds.get('123')).toEqualTypeOf<CustomGuild | undefined>();

const inferredCache = createInMemoryCache({
	mappers: {
		guild: ({ raw }) => ({ customId: raw.id }),
	},
});

expectTypeOf(inferredCache.guilds.get('123')).toEqualTypeOf<CustomGuild | undefined>();

const redis = {} as RedisStoreClient;
const asyncCache = createRedisCache<MyCacheTypes>(redis, {
	mappers: {
		guild: ({ raw }) => ({ customId: raw.id }),
	},
});

expectTypeOf(asyncCache.guilds.get('123')).toEqualTypeOf<Promise<CustomGuild | undefined>>();

const inferredAsyncCache = createRedisCache(redis, {
	mappers: {
		guild: ({ raw }) => ({ customId: raw.id }),
	},
});

expectTypeOf(inferredAsyncCache.guilds.get('123')).toEqualTypeOf<Promise<CustomGuild | undefined>>();
