import { vi, test, expect } from 'vitest';
// eslint-disable-next-line import/extensions
import { getIPCPath } from '../src/transports/ipc';

test('getIPCPath under windows machine', () => {
	vi.mock('node:process', () => {
		return {
			default: {
				platform: 'win32',
			},
		};
	});

	for (let id = 0; id < 10; id++) {
		expect(getIPCPath(id)).toBe(`\\\\?\\pipe\\discord-ipc-${id}`);
	}

	vi.unmock('node:process');
});

// TODO: snapstore / flatpak test
