import { applyD1Migrations, reset } from 'cloudflare:test';
import { env, exports as worker } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import { logoPathFor, type Entity } from '@govpeep/contracts';

beforeEach(async () => {
	await reset();
	await applyD1Migrations(env.govpeep_db, env.TEST_MIGRATIONS);
	await env.govpeep_db
		.prepare(
			`INSERT INTO entities (id,name,description,jurisdiction_id,kind,website,source_url,logo)
    VALUES ('test-federal','A Federal Office','Test record','US','Federal directory listing','https://example.gov','https://example.gov',?)`,
		)
		.bind('logos\\Federal Office.svg')
		.run();
});

describe('nationwide directory and retained assets', () => {
	it('lists every jurisdiction alphabetically without prioritizing Alabama or requiring logos', async () => {
		const result = await (await worker.default.fetch('http://localhost/api/entities')).json<{ total: number; items: Entity[] }>();
		expect(result.total).toBe(4);
		expect(result.items[0].id).toBe('test-federal');
		expect(result.items[0].logoPath).toBe('/logos/Federal%20Office.svg');
		expect(result.items.find((e) => e.id === 'al-huntsville')?.logoPath).toBeNull();
		const federal = await (await worker.default.fetch('http://localhost/api/entities?jurisdiction=US')).json<{ total: number }>();
		expect(federal.total).toBe(1);
	});
	it('exposes the same safe asset path in entity details', async () => {
		const result = await (await worker.default.fetch('http://localhost/api/entities/test-federal')).json<{ entity: Entity }>();
		expect(result.entity.logoPath).toBe('/logos/Federal%20Office.svg');
	});
	it('normalizes historical paths without serving external URLs or non-image files', () => {
		expect(logoPathFor('logos\\Name.png')).toBe('/logos/Name.png');
		expect(logoPathFor('logos/Name.svg')).toBe('/logos/Name.svg');
		expect(logoPathFor('https://external.example/Name.png')).toBe('/logos/Name.png');
		expect(logoPathFor('No logo available')).toBeNull();
		expect(logoPathFor('javascript:alert(1)')).toBeNull();
		expect(logoPathFor('../secret.txt')).toBeNull();
	});
});
