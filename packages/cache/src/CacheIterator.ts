import type { Collection } from '@discordjs/collection';
import type { Snowflake } from 'discord-api-types/globals';

/**
 * Represents a set of object snowflakes that lazily resolves to objects.
 */
export class CacheIterator<T> {
	private readonly cache: Set<Snowflake>;

	private readonly lookupCache: Collection<Snowflake, T>;

	private readonly setIterator: IterableIterator<Snowflake>;

	/**
	 * Creates a new iterable cache
	 *
	 * @param cache - The set of object snowflakes to iterate over
	 * @param lookupCache - The lookup map of snowflakes to objects
	 */
	public constructor(cache: Set<Snowflake>, lookupCache: Collection<Snowflake, T>) {
		this.cache = cache;
		this.lookupCache = lookupCache;
		this.setIterator = this.cache.values();
	}

	/**
	 * The number of items in the cache.
	 */
	public get size() {
		return this.cache.size;
	}

	public [Symbol.iterator]() {
		return {
			next: () => {
				const nextKey = this.setIterator.next();
				return { done: nextKey.done ?? false, value: this.lookupCache.get(nextKey.value)! };
			},
		};
	}
}
