import { applyD1Migrations, reset } from 'cloudflare:test';
import { env, exports as worker } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import { developmentMail } from '../src/auth';

const origin = 'http://localhost:5173';
const SELF = worker.default;
const draft = {
	title: 'City contract records',
	recipientName: 'City of Huntsville',
	entityId: 'al-huntsville',
	jurisdictionId: 'US-AL',
	description: 'The awarded road maintenance contract and amendments.',
	requesterName: 'Test Resident',
	requesterEmail: 'resident@example.com',
};
const call = (path: string, method = 'GET', body?: unknown, cookie = '', requestOrigin = origin) =>
	SELF.fetch(origin + path, {
		method,
		headers: { 'Content-Type': 'application/json', Origin: requestOrigin, Cookie: cookie, 'CF-Connecting-IP': '127.0.0.1' },
		body: body === undefined ? undefined : JSON.stringify(body),
		redirect: 'manual',
	});
async function login(email: string) {
	const sent = await call('/api/auth/sign-in/magic-link', 'POST', { email, name: 'Test Resident', callbackURL: '/' });
	expect(sent.status, await sent.clone().text()).toBe(200);
	const mail = await (await call(`/api/dev/mail?email=${encodeURIComponent(email)}`)).json<{ url: string }[]>();
	const result = await SELF.fetch(mail[0].url, { redirect: 'manual' });
	expect(result.status).toBe(302);
	return {
		cookie: result.headers
			.getSetCookie()
			.map((c) => c.split(';')[0])
			.join('; '),
		url: mail[0].url,
	};
}
async function create(cookie: string) {
	const result = await call('/api/requests', 'POST', draft, cookie);
	expect(result.status, await result.clone().text()).toBe(201);
	return (await result.json<{ id: string }>()).id;
}
beforeEach(async () => {
	await reset();
	await applyD1Migrations(env.govpeep_db, env.TEST_MIGRATIONS);
});

describe('real email-link authentication and private workspaces', () => {
	it('serves source-checked Alabama records and jurisdiction guidance', async () => {
		const listing = await (await call('/api/entities?jurisdiction=US-AL')).json<{ total: number }>();
		expect(listing.total).toBe(3);
		const detail = await (
			await call('/api/entities/al-huntsville')
		).json<{ entity: { channel: string }; jurisdiction: { guidanceVersion: string; sources: unknown[] } }>();
		expect(detail.entity.channel).toBe('portal');
		expect(detail.jurisdiction.guidanceVersion).toContain('al-intro');
		expect(detail.jurisdiction.sources.length).toBeGreaterThan(0);
		expect((await (await call('/api/jurisdictions/US-CA')).json<{ guidanceVersion: null }>()).guidanceVersion).toBeNull();
	});

	it('authenticates with a single-use link and revokes the session on sign-out', async () => {
		const { cookie, url } = await login('one@example.com');
		expect(cookie).toContain('govpeep.session_token');
		const session = await (await call('/api/auth/get-session', 'GET', undefined, cookie)).json<{ user: { emailVerified: boolean } }>();
		expect(session.user.emailVerified).toBe(true);
		const replay = await SELF.fetch(url, { redirect: 'manual' });
		expect(replay.headers.get('location')).toContain('error=');
		expect(replay.headers.get('set-cookie') || '').not.toContain('govpeep.session_token');
		expect((await call('/api/auth/sign-out', 'POST', {}, cookie)).status).toBe(200);
		expect((await call('/api/requests', 'GET', undefined, cookie)).status).toBe(401);
	});

	it('requires authentication and protects mutations from cross-origin requests', async () => {
		expect((await call('/api/requests')).status).toBe(401);
		expect((await call('/api/requests', 'POST', draft, '', 'https://other.example')).status).toBe(403);
		expect(
			(await call('/api/auth/sign-in/magic-link', 'POST', { email: 'one@example.com', callbackURL: 'https://evil.example' })).status,
		).toBeGreaterThanOrEqual(400);
		expect((await call('/api/auth/sign-in/magic-link', 'POST', { email: 'one@example.com', name: 'x'.repeat(50000) })).status).toBe(413);
	});

	it('rejects expired email links without creating a session', async () => {
		await call('/api/auth/sign-in/magic-link', 'POST', { email: 'expired@example.com', callbackURL: '/' });
		const mail = await (await call('/api/dev/mail?email=expired%40example.com')).json<{ url: string }[]>();
		await env.govpeep_db
			.prepare('UPDATE auth_verification SET expires_at=?')
			.bind(Date.now() - 1000)
			.run();
		const response = await SELF.fetch(mail[0].url, { redirect: 'manual' });
		expect(response.headers.get('location')).toContain('error=');
		expect(response.headers.get('set-cookie') || '').not.toContain('govpeep.session_token');
	});

	it('commits exactly one of two concurrent edits with the same version', async () => {
		const { cookie } = await login('concurrent@example.com');
		const id = await create(cookie);
		const results = await Promise.all([
			call('/api/requests/' + id, 'PUT', { draft: { ...draft, title: 'Edit A' }, version: 1 }, cookie),
			call('/api/requests/' + id, 'PUT', { draft: { ...draft, title: 'Edit B' }, version: 1 }, cookie),
		]);
		expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
		expect(await env.govpeep_db.prepare('SELECT COUNT(*) AS n FROM request_versions WHERE request_id=?').bind(id).first('n')).toBe(2);
		expect(await env.govpeep_db.prepare('SELECT COUNT(*) AS n FROM request_events WHERE request_id=?').bind(id).first('n')).toBe(2);
	});

	it('never exposes the development mailbox on a non-local host or production environment', async () => {
		expect((await SELF.fetch('https://govpeep-api.example/api/dev/mail?email=one@example.com')).status).toBe(404);
		expect(developmentMail({ ...env, APP_ENV: 'production' }, new Request(origin))).toBe(false);
		expect((await SELF.fetch(origin + '/api/dev/mail', { headers: { 'Sec-Fetch-Site': 'cross-site' } })).status).toBe(403);
	});

	it('saves drafts across sessions and prevents access by another user', async () => {
		const a = await login('owner@example.com');
		const b = await login('other@example.com');
		const id = await create(a.cookie);
		expect((await call('/api/requests/' + id, 'GET', undefined, b.cookie)).status).toBe(404);
		expect((await call('/api/requests/' + id, 'PUT', { draft, version: 1 }, b.cookie)).status).toBe(404);
		expect((await call('/api/requests/' + id, 'DELETE', undefined, b.cookie)).status).toBe(404);
		expect(await (await call('/api/requests', 'GET', undefined, b.cookie)).json()).toEqual([]);
		const secondSession = await login('owner@example.com');
		const result = await (
			await call('/api/requests/' + id, 'GET', undefined, secondSession.cookie)
		).json<{ request: { title: string }; events: unknown[] }>();
		expect(result.request.title).toBe(draft.title);
		expect(result.events).toHaveLength(1);
	});

	it('detects stale writes and preserves versions and manual filing evidence', async () => {
		const { cookie } = await login('versions@example.com');
		const id = await create(cookie);
		const updated = { ...draft, title: 'Updated request' };
		expect((await call('/api/requests/' + id, 'PUT', { draft: updated, version: 1 }, cookie)).status).toBe(200);
		expect((await call('/api/requests/' + id, 'PUT', { draft, version: 1 }, cookie)).status).toBe(409);
		const date = new Date().toISOString().slice(0, 10);
		expect(
			(
				await call(
					`/api/requests/${id}/events`,
					'POST',
					{ status: 'filed', occurredAt: date, version: 2, referenceNumber: 'CITY-123' },
					cookie,
				)
			).status,
		).toBe(200);
		expect((await call('/api/requests/' + id, 'PUT', { draft, version: 3 }, cookie)).status).toBe(409);
		expect((await call('/api/requests/' + id, 'DELETE', undefined, cookie)).status).toBe(409);
		const detail = await (
			await call('/api/requests/' + id, 'GET', undefined, cookie)
		).json<{ request: { status: string; referenceNumber: string }; events: { note: string }[] }>();
		expect(detail.request).toMatchObject({ status: 'filed', referenceNumber: 'CITY-123' });
		expect(detail.events.some((e) => e.note.includes('GovPeep did not submit'))).toBe(true);
		expect(await env.govpeep_db.prepare('SELECT COUNT(*) AS n FROM request_versions WHERE request_id=?').bind(id).first('n')).toBe(3);
	});

	it('validates dates and recipient relationships and deletes only owned drafts', async () => {
		const { cookie } = await login('validation@example.com');
		expect((await call('/api/requests', 'POST', { ...draft, dateFrom: '2026-09-10', dateTo: '2026-09-01' }, cookie)).status).toBe(400);
		expect((await call('/api/requests', 'POST', { ...draft, jurisdictionId: 'US' }, cookie)).status).toBe(400);
		const id = await create(cookie);
		expect(
			(await call(`/api/requests/${id}/events`, 'POST', { status: 'filed', occurredAt: '2099-01-01', version: 1 }, cookie)).status,
		).toBe(400);
		expect((await call('/api/requests/' + id, 'DELETE', undefined, cookie)).status).toBe(204);
		expect((await call('/api/requests/' + id, 'GET', undefined, cookie)).status).toBe(404);
	});
});
