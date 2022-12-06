import process from 'node:process';

// eslint-disable-next-line import/no-mutable-exports
let register: (id: string) => void = () => false;
try {
	// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
	const { app } = require('electron');
	register = app.setAsDefaultProtocolClient.bind(app);
} catch {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
		register = require('register-scheme');
	} catch {} // eslint-disable-line no-empty
}

function pid() {
	if (typeof process !== 'undefined') {
		return process.pid;
	}

	return null;
}

export { pid, register };
