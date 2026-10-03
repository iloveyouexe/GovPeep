import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { logoPathFor } from '@govpeep/contracts';

const snapshot = await Bun.file(new URL('../data/agencies.json', import.meta.url)).json();
const logos = new URL('../../web/public/logos/', import.meta.url);
const missing = [];
let matched = 0;
for (const agency of snapshot.agencies) {
  const path = logoPathFor(agency.logo);
  if (path && existsSync(fileURLToPath(new URL(path.slice('/logos/'.length), logos)))) matched++;
  else missing.push({ name: agency.name, logo: agency.logo });
}
console.log(JSON.stringify({
  snapshotRecords: snapshot.agencies.length,
  imageFiles: readdirSync(logos).filter((name) => !name.endsWith('.txt')).length,
  recordsWithLocalLogos: matched, missing,
}, null, 2));
