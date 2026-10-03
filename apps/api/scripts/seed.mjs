import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { columns, validateAgencies } from './agency-data.mjs';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const snapshot = await Bun.file(new URL('../data/agencies.json', import.meta.url)).json();
const agencies = validateAgencies(snapshot.agencies);
const quote = (value) => value === null ? 'NULL' : `'${value.replaceAll("'", "''")}'`;

// Existing local records/edits are retained; this only fills in missing IDs.
const sql = agencies.map((agency) =>
  `INSERT INTO agencies (${columns.join(', ')}) VALUES (${columns.map((key) => quote(agency[key])).join(', ')}) ON CONFLICT(id) DO NOTHING;`,
).join('\n');

await mkdir(new URL('../.wrangler/', import.meta.url), { recursive: true });
const sqlFile = fileURLToPath(new URL('../.wrangler/seed.sql', import.meta.url));
await Bun.write(sqlFile, sql + '\n');
const child = Bun.spawn([
  'node', require.resolve('wrangler/bin/wrangler.js'),
  'd1', 'execute', 'govpeep-db', '--local', '--file', sqlFile,
], { cwd: root, stdout: 'pipe', stderr: 'inherit' });
const output = await new Response(child.stdout).text();
const code = await child.exited;
if (code !== 0) {
  console.error(output);
  process.exit(code);
}
console.log(`Local seed complete (${agencies.length} snapshot records; existing rows retained).`);
