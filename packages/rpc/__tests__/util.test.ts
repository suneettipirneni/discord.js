import process from 'node:process';
import { test, expect } from 'vitest';
import { pid } from '../src/util.js';

test('pid', () => {
	expect(pid()).toBe(process ? process.pid : null);
});
