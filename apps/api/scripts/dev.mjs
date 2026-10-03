import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const vars = new URL('../.dev.vars', import.meta.url);
if (!await Bun.file(vars).exists()) {
  await Bun.write(vars, `APP_ENV=development\nEMAIL_MODE=development\nBETTER_AUTH_SECRET=${randomBytes(48).toString('base64url')}\n`);
  console.log('Created local-only auth configuration in apps/api/.dev.vars.');
}
const child = Bun.spawn([
  process.execPath, 'run', 'wrangler',
  'dev', '--local', '--ip', '127.0.0.1', '--inspector-port', '0',
  '--var', `APP_ORIGIN:${process.env.APP_ORIGIN || 'http://127.0.0.1:5173'}`,
  ...process.argv.slice(2),
], { cwd: root, stdin: 'inherit', stdout: 'inherit', stderr: 'inherit' });
process.on('SIGINT', () => child.kill());
process.on('SIGTERM', () => child.kill());
process.exitCode = await child.exited;
