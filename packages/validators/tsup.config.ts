import { createTsupConfig } from '../../tsup.config.js';

export default createTsupConfig({
	entry: ['src/components/button.ts', 'src/components/selectMenu.ts'],
});
