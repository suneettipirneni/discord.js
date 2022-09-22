// eslint-disable-next-line import/extensions
import { default as ipc } from './ipc';
// eslint-disable-next-line import/extensions
import { WebSocketTransport as websocket } from './websocket';

export interface Transport {
	close(): Promise<void>;
	connect(): Promise<void> | void;
	ping(): void;
	send(data: any): void;
}

export const transports = { ipc, websocket };
