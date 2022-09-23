import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import net, { type Socket } from 'node:net';
import process from 'node:process';
import type { RPCClient } from '../client';
import type { RPCPayload, RPCResponsePayload } from '../typings/payloads';
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
	// eslint-disable-next-line n/no-sync
	const prefix = fs.realpathSync(XDG_RUNTIME_DIR ?? TMPDIR ?? TMP ?? TEMP ?? '/tmp');

	// [0] = normal, [1] = snapstore, [2] = flatpak
	const possibleSubDirectory = ['snap.discord/', 'app/com.discordapp.Discord/'];

	for (const subDirectory of possibleSubDirectory) {
		const path = `${prefix.replace(/\/$/, '')}/${subDirectory}`;
		// eslint-disable-next-line n/no-sync
		if (fs.existsSync(path)) return path + `discord-ipc-${id}`;
	}

	return `${prefix.replace(/\/$/, '')}/discord-ipc-${id}`;
};

const createSocket = async (path: string): Promise<net.Socket> => {
	return new Promise((resolve, reject) => {
		const socket = net.createConnection(path);

		const onError = (err: Error) => {
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			socket.removeListener('conect', onConnect);
			reject(err);
		};

		const onConnect = () => {
			socket.removeListener('error', onError);
			resolve(socket);
		};

		socket.once('connect', onConnect);
		socket.once('error', onError);
	});
};

async function getIPC(): Promise<Socket> {
	for (let id = 1; id < 10; id++) {
		try {
			return await createSocket(getIPCPath(id));
		} catch {
			continue;
		}
	}

	throw new Error('Could not connect');
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
