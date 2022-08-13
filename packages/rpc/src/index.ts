import { RPCClient } from './client';
// @ts-expect-error
import { register as registerUtil } from './util';

export const Client = RPCClient;
export const register = (id: string) =>
	// @ts-expect-error
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
	registerUtil(`discord-${id}`);
