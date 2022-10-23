import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import fs from 'node:fs/promises';
import net, { type Socket } from 'node:net';
import process from 'node:process';
import type { RPCClient } from '../client';
import type { RPCPayload, RPCResponsePayload } from '../typings/payloads';
import type { Transport } from './index';

enum OPCodes {
	Handshake,
	Frame,
	Close,
	Ping,
	Pong,
}

export const getIPCPath = async (id: number) => {
	if (process.platform === 'win32') {
		return `\\\\?\\pipe\\discord-ipc-${id}`;
	}

	const {
		env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP },
	} = process;
	const prefix = await fs.realpath(XDG_RUNTIME_DIR ?? TMPDIR ?? TMP ?? TEMP ?? '/tmp');

	// [0] = snapstore, [1] = flatpak
	const possibleSubDirectory = ['snap.discord/', 'app/com.discordapp.Discord/'];

	for (const subDirectory of possibleSubDirectory) {
		const path = `${prefix.replace(/\/$/, '')}/${subDirectory}`;
		if (await fs.realpath(path)) return path + `discord-ipc-${id}`;
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
			return await createSocket(await getIPCPath(id));
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

	public async connect() {
		this.socket = await getIPC();
		const socket = this.socket;
		socket.on('close', this.onClose.bind(this));
		socket.on('error', this.onClose.bind(this));
		this.emit('open');
		socket.write(
			encode(OPCodes.Handshake, {
				// eslint-disable-next-line id-length
				v: 1,
				client_id: this.client.clientId,
			}),
		);
		socket.pause();
		socket.on('readable', this.onReadable.bind(this));
	}

	private async onReadable(): Promise<void> {
		let data = this.socket?.read() as Buffer | undefined;
		if (!data) return;

		do {
			const chunk = this.socket?.read() as Buffer | undefined;
			if (!chunk) break;
			data = Buffer.concat([data, chunk]);
		} while (true);

		const op = data.readUInt32LE(0);
		const length = data.readUInt32LE(4);
		const parsedData = JSON.parse(data.subarray(8, length + 8).toString()) as RPCResponsePayload;

		switch (op) {
			case OPCodes.Ping:
				this.send(parsedData!, OPCodes.Pong);
				break;
			case OPCodes.Frame:
				if (!parsedData) {
					return;
				}

				this.emit('message', parsedData);
				break;
			case OPCodes.Close:
				this.emit('close', parsedData);
				break;
			default:
				break;
		}
	}

	public onClose(error: boolean) {
		this.emit('close', error);
	}

	public send(data: RPCPayload | string, op = OPCodes.Frame) {
		this.socket!.write(encode(op, data));
	}

	public async close() {
		return new Promise<void>((resolve) => {
			this.once('close', resolve);
			this.send({} as RPCPayload, OPCodes.Close);
			this.socket!.end();
		});
	}

	public ping() {
		this.send(randomUUID(), OPCodes.Ping);
	}
}

export { IPCTransport as default, encode };
