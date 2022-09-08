import type { Interaction, ModalSubmitInteraction } from 'discord.js';
import { InteractionType } from 'discord.js';
import type { Observable } from 'rxjs';
import { filter } from 'rxjs';

export function modals(observable$: Observable<Interaction>) {
	return observable$.pipe(
		filter(({ type }) => type === InteractionType.ModalSubmit),
	) as Observable<ModalSubmitInteraction>;
}
