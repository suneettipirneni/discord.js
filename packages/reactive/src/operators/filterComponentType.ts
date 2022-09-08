import type { MappedInteractionTypes, MessageComponentInteraction } from 'discord.js';
import type { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export function filterComponentType<T extends keyof MappedInteractionTypes>(type: T) {
	return (source$: Observable<MessageComponentInteraction>) =>
		source$.pipe(filter(({ componentType }) => type === componentType)) as Observable<MappedInteractionTypes[T]>;
}
