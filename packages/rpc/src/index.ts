// eslint-disable-next-line import/extensions
import { register as registerUtil } from './util';

export const register = (id: string) => registerUtil(`discord-${id}`);

// @ts-expect-error - TS don't know that window can sometimes exist
export const browser = typeof window !== 'undefined';

// eslint-disable-next-line import/extensions
export { RPCClient as Client } from './client';
