import { type Interaction, InteractionType, type MessageComponentInteraction } from 'discord.js';
import { type Observable, filter } from 'rxjs';

export function messageComponents(observable$: Observable<Interaction>) {
	return observable$.pipe(
		filter(({ type }) => type === InteractionType.MessageComponent),
	) as Observable<MessageComponentInteraction>;
}
