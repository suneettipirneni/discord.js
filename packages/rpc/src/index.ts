import { register as registerUtil } from './util.js';

export const register = (id: string) => registerUtil(`discord-${id}`);

export const browser = typeof window !== 'undefined';

export { RPCClient as Client } from './client.js';
