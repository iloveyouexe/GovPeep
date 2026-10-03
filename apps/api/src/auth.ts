import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './auth-schema';
import { brand } from '@govpeep/contracts';

const loopback = (value: string) => {
	try {
		return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(value).hostname);
	} catch {
		return false;
	}
};
export function developmentMail(env: Env, request: Request) {
	return (
		String(env.APP_ENV) === 'development' && String(env.EMAIL_MODE) === 'development' && loopback(env.APP_ORIGIN) && loopback(request.url)
	);
}
export function sessionAvailable(env: Env, request: Request) {
	const local = String(env.APP_ENV) === 'development' && loopback(env.APP_ORIGIN) && loopback(request.url);
	return Boolean(env.BETTER_AUTH_SECRET && (local || new URL(request.url).origin === env.APP_ORIGIN));
}
export function authProviders(env: Env, request: Request) {
	const available = sessionAvailable(env, request);
	return {
		email:
			available && Boolean(developmentMail(env, request) || (String(env.EMAIL_MODE) === 'resend' && env.RESEND_API_KEY && env.EMAIL_FROM)),
		google: available && Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
	};
}

export function createAuth(env: Env, request: Request) {
	if (!env.BETTER_AUTH_SECRET) throw new Error('Authentication is not configured.');
	return betterAuth({
		appName: brand.name,
		baseURL: env.APP_ORIGIN,
		basePath: '/api/auth',
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [env.APP_ORIGIN],
		socialProviders:
			env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
				? {
						google: {
							clientId: env.GOOGLE_CLIENT_ID,
							clientSecret: env.GOOGLE_CLIENT_SECRET,
							prompt: 'select_account',
							accessType: 'online',
							includeGrantedScopes: false,
						},
					}
				: {},
		database: drizzleAdapter(drizzle(env.govpeep_db), { provider: 'sqlite', schema, transaction: false }),
		advanced: {
			cookiePrefix: 'govpeep',
			database: { generateId: () => crypto.randomUUID() },
			ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] },
		},
		session: { expiresIn: 60 * 60 * 24 * 7, cookieCache: { enabled: false } },
		rateLimit: {
			enabled: true, storage: 'database', window: 60, max: 30,
			// Session refreshes from several tabs must not consume the small sign-in allowance.
			customRules: { '/get-session': { window: 60, max: 120 } },
		},
		plugins: [
			magicLink({
				expiresIn: 600,
				storeToken: 'hashed',
				sendMagicLink: async ({ email, url }) => {
					if (developmentMail(env, request)) {
						await env.govpeep_db.prepare('DELETE FROM dev_mail WHERE expires_at < ?').bind(Date.now()).run();
						await env.govpeep_db
							.prepare('INSERT INTO dev_mail (id,email,url,expires_at) VALUES (?,?,?,?)')
							.bind(crypto.randomUUID(), email, url, Date.now() + 600000)
							.run();
						return;
					}
					if (String(env.EMAIL_MODE) !== 'resend' || !env.RESEND_API_KEY || !env.EMAIL_FROM) {
						throw new Error('Email delivery is not configured.');
					}
					// Atomic daily reservation: failed attempts also consume quota, conservatively.
					const reservation = await env.govpeep_db
						.prepare(
							'INSERT INTO email_usage (day,count) VALUES (?,1) ON CONFLICT(day) DO UPDATE SET count=count+1 WHERE count < 80 RETURNING count',
						)
						.bind(new Date().toISOString().slice(0, 10))
						.first();
					if (!reservation) throw new Error('Daily email allowance reached. Try again tomorrow.');
					const response = await fetch('https://api.resend.com/emails', {
						method: 'POST',
						headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
						body: JSON.stringify({
							from: env.EMAIL_FROM,
							to: [email],
							subject: `Your ${brand.name} sign-in link`,
							text: `Sign in to ${brand.name}:\n\n${url}\n\nThis link expires in 10 minutes and can be used once. If you did not request it, you can ignore this email.`,
						}),
						signal: AbortSignal.timeout(15000),
					});
					if (!response.ok) {
						await response.body?.cancel();
						throw new Error('Email could not be delivered. Please try again.');
					}
					await response.body?.cancel();
				},
			}),
		],
	});
}
