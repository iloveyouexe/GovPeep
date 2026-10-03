import { createAuth, authProviders, sessionAvailable, developmentMail } from './auth';
import { directory, HttpError, json as privateJson } from './directory';
import { requests, readJson } from './requests';

function withCors(headers?: HeadersInit): Headers {
	const h = new Headers(headers);
	h.set('access-control-allow-origin', '*');
	h.set('access-control-allow-methods', 'GET,OPTIONS');
	h.set('access-control-allow-headers', 'content-type');
	h.set('access-control-max-age', '86400');
	h.set('content-type', 'application/json; charset=utf-8');
	return h;
}

function json(data: unknown, init?: ResponseInit): Response {
	return new Response(JSON.stringify(data), {
		...init,
		headers: withCors(init?.headers),
	});
}

function escapeLike(input: string): string {
	return input.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);
		try {
			if (url.pathname === '/api/config' && request.method === 'GET') {
				const providers = authProviders(env, request);
				return privateJson({
					authAvailable: providers.email || providers.google,
					sessionAvailable: sessionAvailable(env, request),
					authProviders: providers,
					developmentMailbox: developmentMail(env, request),
					stage: 'Early access · Milestone 1',
				});
			}
			if (url.pathname === '/api/dev/mail' && request.method === 'GET') {
				if (!developmentMail(env, request)) return privateJson({ error: 'Not found.' }, 404);
				if (request.headers.get('sec-fetch-site') === 'cross-site') return privateJson({ error: 'Forbidden.' }, 403);
				const email = (url.searchParams.get('email') || '').trim().toLowerCase();
				return privateJson(
					(
						await env.govpeep_db
							.prepare(
								'SELECT id,email,url,expires_at AS expiresAt FROM dev_mail WHERE email=? AND expires_at>? ORDER BY expires_at DESC LIMIT 5',
							)
							.bind(email, Date.now())
							.all()
					).results,
				);
			}
			if (url.pathname.startsWith('/api/auth/')) {
				if (!env.BETTER_AUTH_SECRET) return privateJson({ error: 'Sign-in is not configured yet.' }, 503);
				const providers = authProviders(env, request);
				if (url.pathname.endsWith('/sign-in/magic-link') && !providers.email) {
					return privateJson({ error: 'Email sign-in is not configured yet.' }, 503);
				}
				if (url.pathname.endsWith('/sign-in/social') && !providers.google)
					return privateJson({ error: 'Google sign-in is not configured yet.' }, 503);
				if (request.method === 'POST') request = new Request(request, { body: JSON.stringify(await readJson(request)) });
				const response = await createAuth(env, request).handler(request);
				const headers = new Headers(response.headers);
				headers.set('Cache-Control', 'no-store');
				return new Response(response.body, { status: response.status, headers });
			}
			const publicResponse = await directory(request, env);
			if (publicResponse) return publicResponse;
			if (url.pathname === '/api/requests' || url.pathname.startsWith('/api/requests/')) {
				if (!['GET', 'HEAD'].includes(request.method) && request.headers.get('origin') !== env.APP_ORIGIN)
					return privateJson({ error: 'Origin not allowed.' }, 403);
				if (!env.BETTER_AUTH_SECRET) return privateJson({ error: 'Sign in to continue.' }, 401);
				const session = await createAuth(env, request).api.getSession({ headers: request.headers });
				if (!session?.user.emailVerified) return privateJson({ error: 'Sign in to continue.' }, 401);
				return await requests(request, env, session.user.id);
			}
		} catch (error) {
			if (error instanceof HttpError) return privateJson({ error: error.message }, error.status);
			console.error(
				JSON.stringify({ message: 'Workspace request failed', path: url.pathname, error: error instanceof Error ? error.name : 'Unknown' }),
			);
			return privateJson({ error: 'Something went wrong. Please try again.' }, 500);
		}
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: withCors() });
		}

		if (request.method !== 'GET') {
			return json({ error: 'Method Not Allowed' }, { status: 405, headers: { Allow: 'GET, OPTIONS' } });
		}

		if (url.pathname !== '/api/agencies') {
			return json({ error: 'Not Found' }, { status: 404 });
		}

		const q = (url.searchParams.get('q') ?? '').trim();

		try {
			if (!q) {
				const { results } = await env.govpeep_db
					.prepare(
						'SELECT id, name, description, website, phone_number, logo, governance, created_at, updated_at\n' +
							'FROM agencies\n' +
							"WHERE logo IS NOT NULL AND TRIM(logo) <> ''\n" +
							'ORDER BY name',
					)
					.all();

				return json(results);
			}

			const pattern = `%${escapeLike(q.toLowerCase())}%`;
			const { results } = await env.govpeep_db
				.prepare(
					'SELECT id, name, description, website, phone_number, logo, governance, created_at, updated_at\n' +
						'FROM agencies\n' +
						// SQLite requires one escape character; JS doubles it only once.
						"WHERE (LOWER(name) LIKE ? ESCAPE '\\'\n" +
						"   OR LOWER(description) LIKE ? ESCAPE '\\'\n" +
						"   OR LOWER(governance) LIKE ? ESCAPE '\\')\n" +
						'ORDER BY\n' +
						"  CASE WHEN logo IS NULL OR TRIM(logo) = '' THEN 1 ELSE 0 END,\n" +
						'  name',
				)
				.bind(pattern, pattern, pattern)
				.all();

			return json(results);
		} catch (e) {
			console.error(
				JSON.stringify({
					message: 'Agency query failed',
					error: e instanceof Error ? e.message : String(e),
				}),
			);
			return json({ error: 'Internal Server Error' }, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
