import { type Observable, filter } from 'rxjs';

export function filterCustomId(id: string) {
	return <T extends { customId: string }>(source$: Observable<T>) =>
		source$.pipe(filter(({ customId }) => customId === id));
}
