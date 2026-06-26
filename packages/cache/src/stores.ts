import type { AsyncCacheStore, CacheStore } from './types.js';

export class MemoryStore<Value> implements CacheStore<Value> {
	readonly #items = new Map<string, Value>();

	public clear(): void {
		this.#items.clear();
	}

	public delete(key: string): boolean {
		return this.#items.delete(key);
	}

	public entries(): IterableIterator<[string, Value]> {
		return this.#items.entries();
	}

	public get(key: string): Value | undefined {
		return this.#items.get(key);
	}

	public has(key: string): boolean {
		return this.#items.has(key);
	}

	public keys(): IterableIterator<string> {
		return this.#items.keys();
	}

	public set(key: string, value: Value): void {
		this.#items.set(key, value);
	}

	public size(): number {
		return this.#items.size;
	}

	public values(): IterableIterator<Value> {
		return this.#items.values();
	}
}

export class RedisStore<Value> implements AsyncCacheStore<Value> {
	public constructor(
		private readonly redis: RedisStoreClient,
		private readonly prefix: string,
		private readonly name: string,
	) {}

	public async clear(): Promise<void> {
		const keys = await this.keys();
		if (keys.length > 0) {
			await this.redis.del(...keys.map((key) => this.valueKey(key)));
		}

		await this.redis.del(this.indexKey);
	}

	public async delete(key: string): Promise<boolean> {
		const [deleted] = await Promise.all([this.redis.del(this.valueKey(key)), this.redis.srem(this.indexKey, key)]);
		return deleted > 0;
	}

	public async entries(): Promise<[string, Value][]> {
		const keys = await this.keys();
		const entries: [string, Value][] = [];

		for (const key of keys) {
			const value = await this.get(key);
			if (value !== undefined) {
				entries.push([key, value]);
			}
		}

		return entries;
	}

	public async get(key: string): Promise<Value | undefined> {
		const value = await this.redis.get(this.valueKey(key));
		return value === null ? undefined : (JSON.parse(value) as Value);
	}

	public async has(key: string): Promise<boolean> {
		return (await this.redis.exists(this.valueKey(key))) > 0;
	}

	public async keys(): Promise<string[]> {
		return this.redis.smembers(this.indexKey);
	}

	public async set(key: string, value: Value): Promise<void> {
		await Promise.all([this.redis.set(this.valueKey(key), JSON.stringify(value)), this.redis.sadd(this.indexKey, key)]);
	}

	public async size(): Promise<number> {
		return this.redis.scard(this.indexKey);
	}

	public async values(): Promise<Value[]> {
		const entries = await this.entries();
		return entries.map(([, value]) => value);
	}

	public valueKey(key: string): string {
		return `${this.prefix}:${this.name}:${key}`;
	}

	private get indexKey(): string {
		return `${this.prefix}:${this.name}:keys`;
	}
}

export interface RedisStoreClient {
	del(...keys: string[]): Promise<number>;
	exists(key: string): Promise<number>;
	get(key: string): Promise<string | null>;
	sadd(key: string, ...members: string[]): Promise<number>;
	scard(key: string): Promise<number>;
	set(key: string, value: string): Promise<unknown>;
	smembers(key: string): Promise<string[]>;
	srem(key: string, ...members: string[]): Promise<number>;
}
