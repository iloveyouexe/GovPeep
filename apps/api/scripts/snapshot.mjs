import { mkdir } from 'node:fs/promises';
import { validateAgencies } from './agency-data.mjs';

// This reads only the public directory. It never accesses D1 administration APIs.
const source = 'https://govpeep-api.tech-hhamilton.workers.dev/api/agencies';
const response = await fetch(source, { signal: AbortSignal.timeout(30_000) });
if (!response.ok) throw new Error(`Agency snapshot request failed: HTTP ${response.status}`);
const agencies = validateAgencies(await response.json());
const output = new URL('../data/agencies.json', import.meta.url);
await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await Bun.write(output, JSON.stringify({ source, capturedAt: new Date().toISOString(), agencies }, null, 2) + '\n');
console.log(`Saved ${agencies.length} public agency records. Review the snapshot diff before committing.`);
