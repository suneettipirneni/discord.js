export interface Transport {
	connect: () => Promise<void> | void;
	close: () => Promise<void>;
	ping: () => void;
	send: (data: any) => void;
}

export { default as IPCTransport } from './ipc';
export { default as WSTransport } from './ws';
