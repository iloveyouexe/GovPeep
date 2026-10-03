import { applyD1Migrations, reset } from 'cloudflare:test';
import { env, exports as worker } from 'cloudflare:workers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authProviders, createAuth } from '../src/auth';

const origin = 'http://localhost:5173';
const clientId = 'test-client.apps.googleusercontent.com';
const googleEnv = () => ({ ...env, EMAIL_MODE: 'disabled', GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: 'test-only-google-secret' });
const cookies = (response: Response) =>
	response.headers
		.getSetCookie()
		.map((value) => value.split(';')[0])
		.join('; ');

async function start(callbackURL = '/app') {
	const request = new Request(origin + '/api/auth/sign-in/social', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Origin: origin, 'CF-Connecting-IP': '127.0.0.1' },
		body: JSON.stringify({ provider: 'google', callbackURL, errorCallbackURL: '/sign-in', disableRedirect: true }),
	});
	return createAuth(googleEnv(), request).handler(request);
}

beforeEach(async () => {
	await reset();
	await applyD1Migrations(env.govpeep_db, env.TEST_MIGRATIONS);
});

describe('Google sign-in', () => {
	it('can be enabled independently of email and does not expose credentials', async () => {
		expect(authProviders(googleEnv(), new Request(origin))).toEqual({ email: false, google: true });
		const config = await worker.default.fetch(origin + '/api/config');
		const body = await config.text();
		expect(body).not.toContain('GOOGLE_CLIENT_SECRET');
		expect(body).not.toContain('BETTER_AUTH_SECRET');
		expect(
			(
				await worker.default.fetch(origin + '/api/auth/sign-in/social', {
					method: 'POST',
					headers: { Origin: origin, 'Content-Type': 'application/json' },
					body: JSON.stringify({ provider: 'google' }),
				})
			).status,
		).toBe(503);
	});

	it('uses PKCE, the canonical callback, and only basic sign-in scopes', async () => {
		const response = await start();
		expect(response.status).toBe(200);
		const url = new URL((await response.json<{ url: string }>()).url);
		expect(url.origin).toBe('https://accounts.google.com');
		expect(url.searchParams.get('client_id')).toBe(clientId);
		expect(url.searchParams.get('redirect_uri')).toBe(origin + '/api/auth/callback/google');
		expect(url.searchParams.get('code_challenge_method')).toBe('S256');
		expect(url.searchParams.get('state')).toBeTruthy();
		expect(url.searchParams.get('scope')?.split(' ').sort()).toEqual(['email', 'openid', 'profile']);
		expect(url.searchParams.get('access_type')).toBe('online');
		expect(url.searchParams.has('include_granted_scopes')).toBe(false);
		expect((await start('https://evil.example')).status).toBeGreaterThanOrEqual(400);
	});

	it('creates a verified, usable session after a mocked Google code exchange', async () => {
		const response = await start();
		const authorization = new URL((await response.json<{ url: string }>()).url);
		const key = await crypto.subtle.generateKey(
			{ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
			true,
			['sign', 'verify'],
		);
		if (!('privateKey' in key)) throw new Error('Expected an RSA key pair.');
		const base64 = (bytes: Uint8Array) =>
			btoa(String.fromCharCode(...bytes))
				.replace(/\+/g, '-')
				.replace(/\//g, '_')
				.replace(/=+$/, '');
		const encode = (data: unknown) => base64(new TextEncoder().encode(JSON.stringify(data)));
		const now = Math.floor(Date.now() / 1000);
		const unsigned =
			encode({ alg: 'RS256', kid: 'test-google-key' }) +
			'.' +
			encode({
				iss: 'https://accounts.google.com',
				aud: clientId,
				sub: 'google-test-user',
				email: 'google-user@example.com',
				email_verified: true,
				name: 'Google Test User',
				iat: now,
				exp: now + 3600,
				...(authorization.searchParams.get('nonce') ? { nonce: authorization.searchParams.get('nonce') } : {}),
			});
		const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key.privateKey, new TextEncoder().encode(unsigned));
		const token = unsigned + '.' + base64(new Uint8Array(signature));
		const jwk = await crypto.subtle.exportKey('jwk', key.publicKey);
		const mocked = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
			const url = input instanceof Request ? input.url : String(input);
			if (url.startsWith('https://oauth2.googleapis.com/token'))
				return Response.json({ access_token: 'test-only-access-token', token_type: 'Bearer', expires_in: 3600, id_token: token });
			if (url.startsWith('https://www.googleapis.com/oauth2/v3/certs'))
				return Response.json({ keys: [{ ...jwk, kid: 'test-google-key', alg: 'RS256' }] });
			throw new Error('Unexpected external request in OAuth test: ' + url);
		});
		try {
			const callback = new Request(
				origin + '/api/auth/callback/google?code=test-code&state=' + encodeURIComponent(authorization.searchParams.get('state')!),
				{
					headers: { Cookie: cookies(response), 'CF-Connecting-IP': '127.0.0.1' },
				},
			);
			const result = await createAuth(googleEnv(), callback).handler(callback);
			expect(result.status).toBe(302);
			expect(new URL(result.headers.get('location')!, origin).href).toBe(origin + '/app');
			expect(cookies(result)).toContain('govpeep.session_token');
			const sessionRequest = new Request(origin + '/api/auth/get-session', { headers: { Cookie: cookies(result) } });
			const session = await createAuth(googleEnv(), sessionRequest).api.getSession({ headers: sessionRequest.headers });
			expect(session?.user).toMatchObject({ email: 'google-user@example.com', emailVerified: true });
			const privateResponse = await worker.default.fetch(origin + '/api/requests', { headers: { Cookie: cookies(result) } });
			expect(privateResponse.status).toBe(200);
			expect(mocked).toHaveBeenCalled();
		} finally {
			mocked.mockRestore();
		}
	});

	it('rejects a callback without valid OAuth state', async () => {
		const request = new Request(origin + '/api/auth/callback/google?code=invalid&state=invalid');
		const response = await createAuth(googleEnv(), request).handler(request);
		expect(response.headers.get('set-cookie') || '').not.toContain('govpeep.session_token');
		expect(await env.govpeep_db.prepare('SELECT COUNT(*) AS n FROM auth_user').first('n')).toBe(0);
	});
});
