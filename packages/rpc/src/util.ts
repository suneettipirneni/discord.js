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

const uuid4122 = () => {
	let uuid = '';
	for (let i = 0; i < 32; i += 1) {
		if (i === 8 || i === 12 || i === 16 || i === 20) {
			uuid += '-';
		}
		let n;
		if (i === 12) {
			n = 4;
		} else {
			const random = (Math.random() * 16) | 0;
			if (i === 16) {
				n = (random & 3) | 0;
			} else {
				n = random;
			}
		}
		uuid += n.toString(16);
	}
	return uuid;
};

export { pid, uuid4122 as uuid, register };
