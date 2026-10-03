import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import concurrently from 'concurrently';

const root = fileURLToPath(new URL('../', import.meta.url));

function portFromEnv(name, fallback) {
  const port = Number(process.env[name] || fallback);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be a port between 1 and 65535.`);
  }
  return port;
}

async function checkPort(port) {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', () => reject(new Error(
      `Port ${port} is unavailable. Set WEB_PORT/API_PORT in the root .env.local.`,
    )));
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}

try {
  const webPort = portFromEnv('WEB_PORT', 5173);
  const apiPort = portFromEnv('API_PORT', 8787);
  if (webPort === apiPort) throw new Error('WEB_PORT and API_PORT must differ.');
  await Promise.all([checkPort(webPort), checkPort(apiPort)]);

  const apiTarget = `http://127.0.0.1:${apiPort}`;
  console.log(`GovPeep web: http://127.0.0.1:${webPort}`);
  console.log(`GovPeep API: ${apiTarget}/api/agencies`);
  console.log('Press Ctrl+C to stop both services. Run bun run db:setup before first use.');

  const { result } = concurrently([
    { name: 'api', command: `bun run dev:api --port ${apiPort}`, cwd: root,
      env: { APP_ORIGIN: `http://127.0.0.1:${webPort}` } },
    {
      name: 'web',
      command: `bun run dev:web --port ${webPort}`,
      cwd: root,
      env: { API_PROXY_TARGET: apiTarget },
    },
  ], {
    prefixColors: ['cyan', 'magenta'],
    killOthersOn: ['failure', 'success'],
    successCondition: 'all',
  });

  await result;
} catch (error) {
  if (error instanceof Error) console.error(error.message);
  process.exitCode = 1;
}
