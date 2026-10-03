import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { columns, validateAgencies } from './agency-data.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const snapshot = await Bun.file(new URL('../data/agencies.json', import.meta.url)).json();
const agencies = validateAgencies(snapshot.agencies);
const quote = (value) => value === null ? 'NULL' : `'${value.replaceAll("'", "''")}'`;

// Existing local records/edits are retained; this only fills in missing IDs.
const sql = agencies.map((agency) =>
  `INSERT INTO agencies (${columns.join(', ')}) VALUES (${columns.map((key) => quote(agency[key])).join(', ')}) ON CONFLICT(id) DO NOTHING;`,
).join('\n') + `\nINSERT OR IGNORE INTO entities (id,name,description,jurisdiction_id,kind,website,source_url,instructions,logo)
SELECT 'federal-' || id,name,description,'US','Federal directory listing',website,
'https://govpeep-api.tech-hhamilton.workers.dev/api/agencies',
'Imported from the demo directory. Confirm legal coverage and the correct FOIA office using official sources before filing.',logo FROM agencies;
UPDATE entities SET logo=(SELECT agencies.logo FROM agencies WHERE entities.id='federal-' || agencies.id)
WHERE id LIKE 'federal-%' AND logo IS NULL;`;

await mkdir(new URL('../.wrangler/', import.meta.url), { recursive: true });
const sqlFile = fileURLToPath(new URL('../.wrangler/seed.sql', import.meta.url));
await Bun.write(sqlFile, sql + '\n');
const child = Bun.spawn([
  process.execPath, 'run', 'wrangler',
  'd1', 'execute', 'govpeep-db', '--local', '--file', sqlFile,
], { cwd: root, stdout: 'pipe', stderr: 'inherit' });
const output = await new Response(child.stdout).text();
const code = await child.exited;
if (code !== 0) {
  console.error(output);
  process.exit(code);
}
console.log(`Local seed complete (${agencies.length} snapshot records; existing rows retained).`);
