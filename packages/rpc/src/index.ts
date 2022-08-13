import { RPCClient } from './client';
import { register as registerUtil } from './util';

export const Client = RPCClient;
export const register = (id: string) =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
	registerUtil(`discord-${id}`);
