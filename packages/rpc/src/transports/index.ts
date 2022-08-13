export interface Transport {
	connect: () => Promise<void> | void;
	close: () => Promise<void>;
	ping: () => void;
	send: (data: any) => void;
}

import { default as ipc } from './ipc';
import { WebSocketTransport as websocket } from './websocket';

export const transports = { ipc, websocket };
