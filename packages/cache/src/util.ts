import type { Collection } from '@discordjs/collection';
import type { Nullable } from 'discord-api-types/utils/internals';
import type { Snowflake } from 'discord-api-types/v10';

export function update<T>(collection: Collection<Snowflake, T>, id: Snowflake, updated: T) {
	const existing = collection.get(id);
	if (existing) {
		collection.set(id, merge(existing, updated as Partial<Nullable<T>>));
	}

	collection.set(id, updated as T);
}

export function updatePartial<T>(collection: Collection<Snowflake, T>, id: Snowflake, updated: Partial<Nullable<T>>) {
	const existing = collection.get(id);
	if (!existing) {
		return;
	}

	collection.set(id, merge(existing, updated));
}

export function merge<T>(original: T, updated: Partial<Nullable<T>>): T {
	for (const [key, value] of Object.entries(updated)) {
		if (value === null || value === undefined) {
			continue;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		(original as Record<string, unknown>)[key] = value;
	}

	return original;
}
