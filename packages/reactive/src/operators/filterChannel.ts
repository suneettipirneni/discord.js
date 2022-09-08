import { type Observable, filter } from 'rxjs';

export function filterChannel(channelId: string) {
	return <T extends { channel: { id: string } }>(source$: Observable<T>) =>
		source$.pipe(filter(({ channel: { id } }) => id === channelId));
}
