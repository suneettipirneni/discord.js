import type { APIMessage, Client, Interaction, Message } from 'discord.js';
import { fromEvent, takeUntil, timer, type Observable } from 'rxjs';
import { filterMessage } from '../operators/index.js';

export type InteractionObservableFactory = (timeout: number) => Observable<Interaction>;

export interface InteractionObservableFactoryOptions {
	message?: APIMessage | Message;
	timeout?: number;
}

export const fromClient = (client: Client) => {
	return ({ timeout, message }: InteractionObservableFactoryOptions) => {
		let retVal$ = fromEvent(client, 'interactionCreate') as Observable<Interaction>;

		if (timeout) {
			retVal$ = retVal$.pipe(takeUntil(timer(timeout)));
		}

		if (message) {
			retVal$ = retVal$.pipe(filterMessage(message));
		}

		return retVal$;
	};
};
