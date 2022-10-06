import { default as ipc } from './ipc.js';
import { WebSocketTransport as websocket } from './websocket.js';

export interface Transport {
	close(): Promise<void>;
	connect(): Promise<void> | void;
	ping(): void;
	send(data: any): void;
}

export const transports = { ipc, websocket };
