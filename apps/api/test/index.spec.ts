import { applyD1Migrations, env, SELF } from 'cloudflare:test';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const fixtures = [
  ['nasa', 'NASA', 'Space science and exploration', 'nasa.png', 'Federal'],
  ['alpha', 'Alpha Records', 'Public records', 'alpha.png', 'State'],
  ['no-logo', 'Agency without logo', 'Space records', null, 'Local'],
  ['blank-logo', 'Blank logo', 'Public records', '  ', 'Local'],
  ['percent', '100% Records', 'Literal percent', 'percent.png', 'Federal'],
  ['underscore', 'File_Records', 'Literal underscore', 'underscore.png', 'Federal'],
  ['slash', 'Path\\Records', 'Literal backslash', 'slash.png', 'Federal'],
];

beforeAll(async () => {
  await applyD1Migrations(env.govpeep_db, env.TEST_MIGRATIONS);
  await env.govpeep_db.batch(fixtures.map(([id, name, description, logo, governance]) =>
    env.govpeep_db.prepare(
      `INSERT INTO agencies
       (id, name, description, website, phone_number, logo, governance, created_at, updated_at)
       VALUES (?, ?, ?, 'https://example.com', NULL, ?, ?, '2026-01-01', '2026-01-01')`,
    ).bind(id, name, description, logo, governance),
  ));
});

async function list(query = '') {
  const response = await SELF.fetch(`https://example.com/api/agencies${query}`);
  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toContain('application/json');
  return response.json<{ id: string; name: string; phone_number: string | null }[]>();
}

describe('agency directory (real Worker and D1)', () => {
  it('lists agencies with logos in alphabetical order and retains the response shape', async () => {
    const rows = await list();
    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.name)).toEqual(rows.map((row) => row.name).sort());
    expect(rows.map((row) => row.id)).not.toContain('no-logo');
    expect(rows.map((row) => row.id)).not.toContain('blank-logo');
    expect(rows.find((row) => row.id === 'nasa')).toMatchObject({
      id: 'nasa', name: 'NASA', phone_number: null, governance: 'Federal',
    });
  });

  it('treats whitespace-only searches as an unfiltered listing', async () => {
    expect(await list('?q=%20%20')).toEqual(await list());
  });

  it.each([
    [' nAsA ', ['nasa']],
    ['exploration', ['nasa']],
    ['State', ['alpha']],
    ['space', ['nasa', 'no-logo']],
    ['%', ['percent']],
    ['_', ['underscore']],
    ['\\', ['slash']],
    ["' OR 1=1 --", []],
    ['no-such-agency', []],
  ])('searches %j literally across name, description and governance', async (query, ids) => {
    expect((await list(`?q=${encodeURIComponent(query)}`)).map((row) => row.id)).toEqual(ids);
  });

  it('returns an empty array for an empty database', async () => {
    await env.govpeep_db.prepare('DELETE FROM agencies').run();
    expect(await list()).toEqual([]);
  });

  it('answers CORS preflight without a response body', async () => {
    const response = await SELF.fetch('https://example.com/api/agencies', { method: 'OPTIONS' });
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(response.headers.get('access-control-allow-methods')).toBe('GET,OPTIONS');
    expect(await response.text()).toBe('');
  });

  it('rejects writes and advertises supported methods', async () => {
    const response = await SELF.fetch('https://example.com/api/agencies', { method: 'POST' });
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, OPTIONS');
    expect(await response.json()).toEqual({ error: 'Method Not Allowed' });
  });

  it('returns JSON 404s for unknown endpoints', async () => {
    const response = await SELF.fetch('https://example.com/api/missing');
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Not Found' });
  });

  it('returns a generic CORS-enabled error on database failure', async () => {
    await env.govpeep_db.prepare('DROP TABLE agencies').run();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const response = await SELF.fetch('https://example.com/api/agencies?q=NASA');
      expect(response.status).toBe(500);
      expect(response.headers.get('access-control-allow-origin')).toBe('*');
      expect(await response.json()).toEqual({ error: 'Internal Server Error' });
      expect(log).toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
