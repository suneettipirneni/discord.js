import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import net, { type Socket } from 'node:net';
import process from 'node:process';
import { fetch } from 'undici';
import type { RPCClient } from '../client';
import type { RPCPayload, RPCResponsePayload } from '../typings/payloads';
// eslint-disable-next-line import/extensions
import { RPCCommands, RPCEvents } from '../typings/types';
import type { Transport } from './index';

enum OPCodes {
	HANDSHAKE,
	FRAME,
	CLOSE,
	PING,
	PONG,
}

export const getIPCPath = (id: number) => {
	if (process.platform === 'win32') {
		return `\\\\?\\pipe\\discord-ipc-${id}`;
	}

	const {
		env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP },
	} = process;
	const prefix = XDG_RUNTIME_DIR ?? TMPDIR ?? TMP ?? TEMP ?? '/tmp';
	return `${prefix.replace(/\/$/, '')}/discord-ipc-${id}`;
};

async function getIPC(id = 0): Promise<Socket> {
	return new Promise((resolve, reject) => {
		const path = getIPCPath(id);
		const onerror = () => {
			if (id < 10) {
				resolve(getIPC(id + 1));
			} else {
				reject(new Error('Could not connect'));
			}
		};

		const sock = net.createConnection(path, () => {
			sock.removeListener('error', onerror);
			resolve(sock);
		});
		sock.once('error', onerror);
	});
}

async function findEndpoint(tries = 0): Promise<string> {
	if (tries > 30) {
		throw new Error('Could not find endpoint');
	}

	const endpoint = `http://127.0.0.1:${6_463 + (tries % 10)}`;
	try {
		const res = await fetch(endpoint);
		if (res.status === 404) {
			return endpoint;
		}

		return await findEndpoint(tries + 1);
	} catch {
		return findEndpoint(tries + 1);
	}
}

function encode(op: number, data: unknown) {
	const dataString = JSON.stringify(data);
	const len = Buffer.byteLength(dataString);
	const packet = Buffer.alloc(8 + len);
	packet.writeInt32LE(op, 0);
	packet.writeInt32LE(len, 4);
	packet.write(dataString, 8, len);
	return packet;
}

class IPCTransport extends EventEmitter implements Transport {
	private readonly client: RPCClient;

	private socket: Socket | null;

	public constructor(client: RPCClient) {
		super();
		this.client = client;
		this.socket = null;
	}

	private async onPacket(data: Buffer): Promise<void> {
		const op = data.readInt32LE(0);
		const packetData = JSON.parse(data.subarray(8).toString()) as RPCResponsePayload;

		switch (op) {
			case OPCodes.PING:
				this.send(packetData!, OPCodes.PONG);
				break;
			case OPCodes.FRAME:
				if (!packetData) {
					return;
				}

				if (packetData.cmd === RPCCommands.Authorize && packetData.evt !== RPCEvents.Error) {
					const endpoint = await findEndpoint().catch((error) => error);

					if (!endpoint) return void this.client.emit(RPCEvents.Error, endpoint);

					this.client.updateEndpoint(endpoint);
				}

				this.emit('message', packetData);
				break;
			case OPCodes.CLOSE:
				this.emit('close', packetData);
				break;
			default:
				break;
		}
	}

	public async connect() {
		this.socket = await getIPC();
		const socket = this.socket;
		socket.on('close', this.onClose.bind(this));
		socket.on('error', this.onClose.bind(this));
		this.emit('open');
		socket.write(
			encode(OPCodes.HANDSHAKE, {
				// eslint-disable-next-line id-length
				v: 1,
				client_id: this.client.clientId,
			}),
		);
		socket.pause();

		let chunkedData: Buffer | null = Buffer.alloc(0);
		let remainingBytes: number | null = 0;
		const onData = (data: Buffer): void => {
			if (!socket || socket.destroyed) return;

			const wholeData = chunkedData ? Buffer.concat([chunkedData, data.subarray(0, remainingBytes!)]) : data;
			const remainingData = remainingBytes ? data.subarray(remainingBytes) : null;

			const length = wholeData.readUInt32LE(4);
			const jsonData = wholeData.subarray(8);

			remainingBytes = length - jsonData.length;

			if (remainingBytes && remainingBytes > 0) {
				chunkedData = wholeData;
			} else {
				chunkedData = null;
				remainingBytes = null;
			}

			void this.onPacket(wholeData);
			if (remainingData) onData(remainingData);
		};

		socket.on('data', onData);
	}

	public onClose(error: boolean) {
		this.emit('close', error);
	}

	public send(data: RPCPayload | string, op = OPCodes.FRAME) {
		this.socket!.write(encode(op, data));
	}

	public async close() {
		return new Promise<void>((resolve) => {
			this.once('close', resolve);
			this.send({} as RPCPayload, OPCodes.CLOSE);
			this.socket!.end();
		});
	}

	public ping() {
		this.send(randomUUID(), OPCodes.PING);
	}
}

export { IPCTransport as default, encode };
