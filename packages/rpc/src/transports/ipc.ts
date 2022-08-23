import net, { type Socket } from 'net';
import { EventEmitter } from 'node:events';
import { fetch } from 'undici';
import type { Transport } from './index';
import type { RPCClient } from '../client';
import type { RPCPayload, RPCResponsePayload } from '../typings/payloads';
import { RPCCommands, RPCEvents } from '../typings/types';
import { uuid } from '../util';

enum OPCodes {
	HANDSHAKE,
	FRAME,
	CLOSE,
	PING,
	PONG,
}

function getIPCPath(id: number) {
	if (process.platform === 'win32') {
		return `\\\\?\\pipe\\discord-ipc-${id}`;
	}
	const {
		env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP },
	} = process;
	const prefix = XDG_RUNTIME_DIR ?? TMPDIR ?? TMP ?? TEMP ?? '/tmp';
	return `${prefix.replace(/\/$/, '')}/discord-ipc-${id}`;
}

function getIPC(id = 0): Promise<Socket> {
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
	const endpoint = `http://127.0.0.1:${6463 + (tries % 10)}`;
	try {
		const r = await fetch(endpoint);
		if (r.status === 404) {
			return endpoint;
		}
		return await findEndpoint(tries + 1);
	} catch (e) {
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

interface WorkingData {
	full: string;
	op: number | undefined;
}

const working: WorkingData = {
	full: '',
	op: undefined,
};

function decode(socket: Socket, callback: (opts: { op: number; data: RPCResponsePayload | undefined }) => void) {
	const packet = socket.read() as Buffer | undefined;
	if (!packet) {
		return;
	}

	let { op } = working;
	let raw;
	if (working.full === '') {
		working.op = packet.readInt32LE(0);
		op = working.op;
		const len = packet.readInt32LE(4);
		raw = packet.subarray(8, len + 8);
	} else {
		raw = packet.toString();
	}

	try {
		const data = JSON.parse(working.full + (raw as string)) as RPCResponsePayload;
		callback({ op: op!, data });
		working.full = '';
		working.op = undefined;
	} catch (err) {
		working.full += raw;
	}

	decode(socket, callback);
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
			encode(OPCodes.HANDSHAKE, {
				v: 1,
				client_id: this.client.clientId,
			}),
		);
		socket.pause();
		socket.on('readable', () => {
			decode(socket, ({ op, data }) => {
				switch (op) {
					case OPCodes.PING:
						this.send(data!, OPCodes.PONG);
						break;
					case OPCodes.FRAME:
						if (!data) {
							return;
						}

						if (data.cmd === RPCCommands.Authorize && data.evt !== RPCEvents.Error) {
							findEndpoint()
								.then((endpoint) => {
									this.client.updateEndpoint(endpoint);
								})
								.catch((e) => {
									// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
									this.client.emit(RPCEvents.Error, e);
								});
						}
						this.emit('message', data);
						break;
					case OPCodes.CLOSE:
						this.emit('close', data);
						break;
					default:
						break;
				}
			});
		});
	}

	public onClose(error: boolean) {
		this.emit('close', error);
	}

	public send(data: RPCPayload | string, op = OPCodes.FRAME) {
		this.socket!.write(encode(op, data));
	}

	public async close() {
		return new Promise<void>((r) => {
			this.once('close', r);
			this.send({} as RPCPayload, OPCodes.CLOSE);
			this.socket!.end();
		});
	}

	public ping() {
		this.send(uuid(), OPCodes.PING);
	}
}

export { IPCTransport as default, encode, decode };
