import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig(async () => ({
	root: fileURLToPath(new URL('.', import.meta.url)),
	plugins: [
		cloudflareTest({
			wrangler: { configPath: fileURLToPath(new URL('./wrangler.jsonc', import.meta.url)) },
			miniflare: {
				bindings: {
					APP_ENV: 'development',
					EMAIL_MODE: 'development',
					APP_ORIGIN: 'http://localhost:5173',
					BETTER_AUTH_SECRET: 'test-only-secret-for-isolated-workers-runtime-123456789',
					TEST_MIGRATIONS: await readD1Migrations(fileURLToPath(new URL('./migrations', import.meta.url))),
				},
			},
		}),
	],
}));
