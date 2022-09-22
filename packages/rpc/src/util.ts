let register: (id: string) => void = () => false;
try {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
	const { app } = require('electron');
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
	register = app.setAsDefaultProtocolClient.bind(app);
} catch (err) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
		register = require('register-scheme');
	} catch (e) {} // eslint-disable-line no-empty
}

function pid() {
	if (typeof process !== 'undefined') {
		return process.pid;
	}
	return null;
}

export { pid, register };
