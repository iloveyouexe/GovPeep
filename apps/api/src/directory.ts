import { logoPathFor, type Entity, type Jurisdiction } from '@govpeep/contracts';

export function json(data: unknown, status = 200) {
	return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
export function fail(message: string, status: number): never {
	throw new HttpError(message, status);
}
export class HttpError extends Error {
	constructor(
		message: string,
		public status: number,
	) {
		super(message);
	}
}

const entityColumns = `id,name,description,jurisdiction_id AS jurisdictionId,kind,website,custodian,channel,
  filing_url AS filingUrl,filing_email AS filingEmail,instructions,verification,checked_at AS checkedAt,source_url AS sourceUrl,logo`;
type EntityRow = Omit<Entity, 'logoPath'> & { logo: string | null };
function formatEntity({ logo, ...entity }: EntityRow): Entity {
	return { ...entity, logoPath: logoPathFor(logo) };
}
export async function getEntity(db: D1Database, id: string): Promise<Entity | null> {
	const row = await db.prepare(`SELECT ${entityColumns} FROM entities WHERE id=?`).bind(id).first<EntityRow>();
	return row ? formatEntity(row) : null;
}
export async function getJurisdiction(db: D1Database, id: string): Promise<Jurisdiction> {
	const row = await db
		.prepare('SELECT id,name,guidance_version AS guidanceVersion,summary,notes_json,sources_json FROM jurisdictions WHERE id=?')
		.bind(id)
		.first<{ id: string; name: string; guidanceVersion: string | null; summary: string; notes_json: string; sources_json: string }>();
	if (!row) return fail('Unknown jurisdiction.', 400);
	return {
		id: row.id,
		name: row.name,
		guidanceVersion: row.guidanceVersion,
		summary:
			row.summary ||
			'Detailed guidance for this jurisdiction is not yet reviewed. Confirm the applicable law and filing instructions with official sources.',
		notes: JSON.parse(row.notes_json),
		sources: JSON.parse(row.sources_json),
	};
}
export async function directory(request: Request, env: Env): Promise<Response | null> {
	const url = new URL(request.url);
	if (request.method !== 'GET') return null;
	if (url.pathname === '/api/jurisdictions') {
		return json(
			(await env.govpeep_db.prepare('SELECT id,name,guidance_version AS guidanceVersion FROM jurisdictions ORDER BY name').all()).results,
		);
	}
	if (url.pathname.startsWith('/api/jurisdictions/'))
		return json(await getJurisdiction(env.govpeep_db, decodeURIComponent(url.pathname.slice(19))));
	if (url.pathname.startsWith('/api/entities/')) {
		const entity = await getEntity(env.govpeep_db, decodeURIComponent(url.pathname.slice(14)));
		if (!entity) return fail('Entity not found.', 404);
		return json({ entity, jurisdiction: await getJurisdiction(env.govpeep_db, entity.jurisdictionId) });
	}
	if (url.pathname !== '/api/entities') return null;
	const q = (url.searchParams.get('q') || '')
		.trim()
		.slice(0, 200)
		.replace(/[\\%_]/g, '\\$&');
	const jurisdiction = url.searchParams.get('jurisdiction') || '';
	const page = Math.max(1, Math.min(10000, Number(url.searchParams.get('page')) || 1));
	const where = "WHERE (?='' OR jurisdiction_id=?) AND (?='' OR name LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')";
	const args = [jurisdiction, jurisdiction, q, `%${q}%`, `%${q}%`];
	const total = await env.govpeep_db
		.prepare(`SELECT COUNT(*) AS total FROM entities ${where}`)
		.bind(...args)
		.first<number>('total');
	const { results } = await env.govpeep_db
		.prepare(`SELECT ${entityColumns} FROM entities ${where} ORDER BY name COLLATE NOCASE,id LIMIT 24 OFFSET ?`)
		.bind(...args, (Math.floor(page) - 1) * 24)
		.all<EntityRow>();
	return json({ items: results.map(formatEntity), total, page: Math.floor(page), pageSize: 24 });
}
