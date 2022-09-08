import type { Interaction } from 'discord.js';
import { InteractionType } from 'discord.js';
import { filter, type Observable } from 'rxjs';

export function filterMessage(message: { id: string }) {
	return <T extends Interaction>(source$: Observable<T>) => {
		return source$.pipe(
			filter((interaction) => {
				if (interaction.type === InteractionType.MessageComponent) {
					return interaction.message.id === message.id;
				}

				return false;
			}),
		);
	};
}
