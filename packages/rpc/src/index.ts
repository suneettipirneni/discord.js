import { register as registerUtil } from './util.js';

export const register = (id: string) => registerUtil(`discord-${id}`);

// @ts-expect-error - TS don't know that window can sometimes exist
export const browser = typeof window !== 'undefined';

export { RPCClient as Client } from './client.js';
