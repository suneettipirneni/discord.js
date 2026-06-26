import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';
import { createTsupConfig } from '../../tsup.config.js';

export default createTsupConfig({
	entry: {
		index: 'src/index.ts',
		inmemory: 'src/inmemory.ts',
		redis: 'src/redis.ts',
	},
	esbuildPlugins: [esbuildPluginVersionInjector()],
});
