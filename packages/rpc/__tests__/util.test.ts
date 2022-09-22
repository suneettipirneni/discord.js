import process from 'node:process';
import { test, expect } from 'vitest';
// eslint-disable-next-line import/extensions
import { pid } from '../src/util';

test('pid', () => {
	expect(pid()).toBe(process ? process.pid : null);
});
