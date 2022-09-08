import type { EmbedBuilder, MessageComponentInteraction } from 'discord.js';
import type { Observable } from 'rxjs';

export function reactor(data: EmbedBuilder) {
	return <T extends MessageComponentInteraction>(source$: Observable<T>) => {
		return source$.subscribe(async (interaction) => {
			await interaction.update({ embeds: [data] });
		});
	};
}
