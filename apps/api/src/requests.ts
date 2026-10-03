import { brand, draftSchema, updateSchema, eventSchema, renderLetter, type Draft, type RecordsRequest } from '@govpeep/contracts';
import { fail, json, getEntity, getJurisdiction } from './directory';

type Row = {
	id: string;
	draft_json: string;
	status: RecordsRequest['status'];
	version: number;
	created_at: string;
	updated_at: string;
	filed_at: string | null;
	reference_number: string;
	guidance_version: string | null;
};
const fromRow = (r: Row): RecordsRequest => ({
	...JSON.parse(r.draft_json),
	id: r.id,
	status: r.status,
	version: r.version,
	createdAt: r.created_at,
	updatedAt: r.updated_at,
	filedAt: r.filed_at,
	referenceNumber: r.reference_number,
	guidanceVersion: r.guidance_version,
});

export async function readJson(request: Request): Promise<unknown> {
	if (!request.headers.get('content-type')?.includes('application/json')) return fail('Expected JSON.', 415);
	const reader = request.body?.getReader();
	if (!reader) return fail('Missing request body.', 400);
	let size = 0;
	const parts: Uint8Array[] = [];
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.length;
		if (size > 48000) {
			await reader.cancel();
			return fail('Request is too large.', 413);
		}
		parts.push(value);
	}
	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const part of parts) {
		bytes.set(part, offset);
		offset += part.length;
	}
	try {
		return JSON.parse(new TextDecoder().decode(bytes));
	} catch {
		return fail('Invalid JSON.', 400);
	}
}

async function validateRecipient(db: D1Database, draft: Draft) {
	const jurisdiction = await getJurisdiction(db, draft.jurisdictionId);
	if (draft.entityId) {
		const entity = await getEntity(db, draft.entityId);
		if (!entity || entity.jurisdictionId !== draft.jurisdictionId) return fail('Recipient and jurisdiction do not match.', 400);
	}
	return jurisdiction;
}

export async function requests(request: Request, env: Env, userId: string): Promise<Response> {
	const db = env.govpeep_db;
	const url = new URL(request.url);
	const segments = url.pathname.split('/').filter(Boolean);
	const id = segments[2];
	const now = new Date().toISOString();
	if (segments.length > 4) return fail('Not found.', 404);

	if (!id && request.method === 'GET') {
		const { results } = await db
			.prepare('SELECT * FROM records_requests WHERE user_id=? ORDER BY updated_at DESC LIMIT 200')
			.bind(userId)
			.all<Row>();
		return json(results.map(fromRow));
	}
	if (!id && request.method === 'POST') {
		const parsed = draftSchema.safeParse(await readJson(request));
		if (!parsed.success) return fail(parsed.error.issues[0].message, 400);
		const draft = parsed.data;
		const guidance = await validateRecipient(db, draft);
		const requestId = crypto.randomUUID();
		const data = JSON.stringify(draft);
		// A conditional insert enforces the per-account draft cap even under concurrent creation.
		const result = await db.batch([
			db
				.prepare(
					`INSERT INTO records_requests (id,user_id,draft_json,created_at,updated_at,guidance_version,last_mutation)
        SELECT ?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM records_requests WHERE user_id=?) < 200`,
				)
				.bind(requestId, userId, data, now, now, guidance.guidanceVersion, requestId, userId),
			db
				.prepare(
					`INSERT INTO request_versions (request_id,version,draft_json,letter,guidance_json,created_at)
        SELECT id,version,draft_json,?,?,? FROM records_requests WHERE id=? AND user_id=?`,
				)
				.bind(renderLetter(draft), JSON.stringify(guidance), now, requestId, userId),
			db
				.prepare(
					`INSERT INTO request_events (id,request_id,kind,note,occurred_at,created_at)
        SELECT ?,id,'created','Draft created',?,? FROM records_requests WHERE id=? AND user_id=?`,
				)
				.bind(crypto.randomUUID(), now.slice(0, 10), now, requestId, userId),
		]);
		if (!result[0].meta.changes) return fail('This workspace has reached its 200-request allowance.', 409);
		return json({ id: requestId }, 201);
	}
	if (!id) return fail('Method not allowed.', 405);
	const row = await db.prepare('SELECT * FROM records_requests WHERE id=? AND user_id=?').bind(id, userId).first<Row>();
	if (!row) return fail('Request not found.', 404);
	const current = fromRow(row);

	if (request.method === 'GET' && segments.length === 3) {
		const events = await db
			.prepare(
				'SELECT id,kind,note,occurred_at AS occurredAt,created_at AS createdAt FROM request_events WHERE request_id=? ORDER BY created_at DESC,id',
			)
			.bind(id)
			.all();
		// Keep the original guidance snapshot when viewing an already-filed request.
		const version = await db
			.prepare('SELECT guidance_json FROM request_versions WHERE request_id=? AND version=?')
			.bind(id, current.version)
			.first<string>('guidance_json');
		return json({
			request: current,
			events: events.results,
			entity: current.entityId ? await getEntity(db, current.entityId) : null,
			jurisdiction: version ? JSON.parse(version) : await getJurisdiction(db, current.jurisdictionId),
		});
	}
	if (request.method === 'DELETE' && segments.length === 3) {
		const deleted = await db.prepare("DELETE FROM records_requests WHERE id=? AND user_id=? AND status='draft'").bind(id, userId).run();
		if (!deleted.meta.changes) return fail('Only drafts can be deleted.', 409);
		return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
	}
	if (request.method === 'PUT' && segments.length === 3) {
		if (current.status !== 'draft') return fail('Filed requests are preserved. Create a new draft to change the request.', 409);
		const parsed = updateSchema.safeParse(await readJson(request));
		if (!parsed.success) return fail(parsed.error.issues[0].message, 400);
		const { draft, version } = parsed.data;
		const guidance = await validateRecipient(db, draft);
		const mutation = crypto.randomUUID();
		const result = await db.batch([
			db
				.prepare(
					`UPDATE records_requests SET draft_json=?,version=version+1,updated_at=?,guidance_version=?,last_mutation=?
        WHERE id=? AND user_id=? AND version=? AND status='draft'`,
				)
				.bind(JSON.stringify(draft), now, guidance.guidanceVersion, mutation, id, userId, version),
			db
				.prepare(
					`INSERT INTO request_versions (request_id,version,draft_json,letter,guidance_json,created_at)
        SELECT id,version,draft_json,?,?,? FROM records_requests WHERE id=? AND user_id=? AND last_mutation=?`,
				)
				.bind(renderLetter(draft), JSON.stringify(guidance), now, id, userId, mutation),
			db
				.prepare(
					`INSERT INTO request_events (id,request_id,kind,note,occurred_at,created_at)
        SELECT ?,id,'edited','Draft saved',?,? FROM records_requests WHERE id=? AND user_id=? AND last_mutation=?`,
				)
				.bind(crypto.randomUUID(), now.slice(0, 10), now, id, userId, mutation),
		]);
		if (!result[0].meta.changes) return fail('This request changed in another tab. Reload before saving.', 409);
		return json({ id, version: version + 1 });
	}
	if (request.method === 'POST' && segments[3] === 'events') {
		const parsed = eventSchema.safeParse(await readJson(request));
		if (!parsed.success) return fail(parsed.error.issues[0].message, 400);
		const { status, occurredAt, note, referenceNumber, version } = parsed.data;
		const allowed: Record<string, string[]> = {
			draft: ['filed'],
			filed: ['acknowledged', 'completed', 'closed'],
			acknowledged: ['completed', 'closed'],
			completed: [],
			closed: [],
		};
		if (!allowed[current.status].includes(status)) return fail('That status change is not available.', 409);
		if (occurredAt > now.slice(0, 10) || (current.filedAt && occurredAt < current.filedAt))
			return fail('Choose a valid date on or after filing, not in the future.', 400);
		if (status === 'filed' && (!current.description || !current.requesterName || !current.requesterEmail))
			return fail('Complete the records description and your contact details before marking this filed.', 400);
		const mutation = crypto.randomUUID();
		const result = await db.batch([
			db
				.prepare(
					`UPDATE records_requests SET status=?,filed_at=COALESCE(filed_at,?),reference_number=?,updated_at=?,version=version+1,last_mutation=?
        WHERE id=? AND user_id=? AND version=? AND status=?`,
				)
				.bind(status, occurredAt, referenceNumber || current.referenceNumber, now, mutation, id, userId, version, current.status),
			db
				.prepare(
					`INSERT INTO request_versions (request_id,version,draft_json,letter,guidance_json,created_at)
        SELECT r.id,r.version,r.draft_json,v.letter,v.guidance_json,? FROM records_requests r JOIN request_versions v ON v.request_id=r.id AND v.version=r.version-1
        WHERE r.id=? AND r.user_id=? AND r.last_mutation=?`,
				)
				.bind(now, id, userId, mutation),
			db
				.prepare(
					`INSERT INTO request_events (id,request_id,kind,note,occurred_at,created_at)
        SELECT ?,id,?,?,?,? FROM records_requests WHERE id=? AND user_id=? AND last_mutation=?`,
				)
				.bind(
					crypto.randomUUID(),
					status,
					note ||
						(status === 'filed' ? `User recorded manual filing; ${brand.name} did not submit this request.` : `Marked ${status} by user.`),
					occurredAt,
					now,
					id,
					userId,
					mutation,
				),
		]);
		if (!result[0].meta.changes) return fail('This request changed in another tab. Reload before updating.', 409);
		return json({ id });
	}
	return fail('Method not allowed.', 405);
}
