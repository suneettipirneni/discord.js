import { EventEmitter } from 'node:events';
import { setTimeout } from 'node:timers';
// eslint-disable-next-line n/no-extraneous-import
import type { default as WebSocketType } from 'ws';
import { browser } from '..';
import type { RPCClient } from '../client';
import type { Transport } from './index';

type WebSocketConstructor = new (url: string, options?: WebSocketType.ClientOptions) => WebSocketType;

// @ts-expect-error - TS doesn't know that window can exist if browser is true
// eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-require-imports, n/no-extraneous-require
const WebSocket = (browser ? window.WebSocket : require('ws')) as WebSocketConstructor;

const pack = (data: Record<string, unknown> | string) => JSON.stringify(data);
const unpack = (data: string) => JSON.parse(data) as Record<string, unknown>;

export class WebSocketTransport extends EventEmitter implements Transport {
	private readonly client: RPCClient;

	private ws: WebSocketType | null;

	private tries: number;

	public constructor(client: RPCClient) {
		super();
		this.client = client;
		this.ws = null;
		this.tries = 0;
	}

	public connect() {
		const port = 6_463 + (this.tries % 10);
		this.tries += 1;

		this.ws = new WebSocket(
			`ws://127.0.0.1:${port}/?v=1&client_id=${this.client.clientId!}`,
			browser ? undefined : { origin: this.client.options.origin },
		);
		this.ws.onopen = this.onOpen.bind(this);
		this.ws.onclose = this.onClose.bind(this);
		this.ws.onerror = this.onError.bind(this);
		this.ws.onmessage = this.onMessage.bind(this);
	}

	public onOpen() {
		this.emit('open');
	}

	public onClose(event: WebSocketType.CloseEvent) {
		if (!event.wasClean) {
			return;
		}

		this.emit('close', event);
	}

	public onError(event: WebSocketType.ErrorEvent) {
		try {
			this.ws!.close();
		} catch {} // eslint-disable-line no-empty

		if (this.tries > 20) {
			this.emit('error', event.error);
		} else {
			setTimeout(() => {
				this.connect();
			}, 250);
		}
	}

	public onMessage(event: WebSocketType.MessageEvent) {
		this.emit('message', unpack(event.data as string));
	}

	public send(data: Record<string, unknown>) {
		this.ws!.send(pack(data));
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public ping() {}

	public async close() {
		return new Promise<void>((resolve) => {
			this.once('close', resolve);
			this.ws!.close();
		});
	}
}
