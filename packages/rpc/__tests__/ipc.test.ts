import { vi, test, expect } from 'vitest';
import { getIPCPath } from '../src/transports/ipc.js';

test('getIPCPath under windows machine', async () => {
	vi.mock('node:process', () => {
		return {
			default: {
				platform: 'win32',
			},
		};
	});

	for (let id = 0; id < 10; id++) {
		expect(await getIPCPath(id)).toBe(`\\\\?\\pipe\\discord-ipc-${id}`);
	}

	vi.unmock('node:process');
});

// TODO: snapstore / flatpak test
