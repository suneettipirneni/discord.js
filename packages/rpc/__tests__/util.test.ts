import { test, expect } from 'vitest';
import { pid } from '../src/util';

test('pid', () => {
	expect(pid()).toBe(process ? process.pid : null);
});
