import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import { fileURLToPath } from 'node:url';

export default defineWorkersConfig(async () => ({
	root: fileURLToPath(new URL('.', import.meta.url)),
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: fileURLToPath(new URL('./wrangler.jsonc', import.meta.url)) },
				miniflare: {
					bindings: {
						TEST_MIGRATIONS: await readD1Migrations(fileURLToPath(new URL('./migrations', import.meta.url))),
					},
				},
			},
		},
	},
}));
