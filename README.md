# GovPeep

GovPeep's v2 monorepo: an agency directory and FOIA-request UI, backed by a
Cloudflare Worker and D1. Bun workspaces manage the active applications.

## Layout

```text
apps/web/          React 18, Vite, Tailwind, Redux
apps/api/          Cloudflare Worker, D1 migrations, seed data, Vitest tests
legacy/rust-api/   Earlier Actix/Postgres backend retained for reference
scripts/          Root development runner
docs/             Deployment and migration notes
```

## Run locally

Prerequisites: **Bun 1.3.14**, **Node.js 22+** (24.15.0 tested), and **Git LFS**
for the background videos. Run these commands from the repository root:

```sh
git lfs pull
bun install --frozen-lockfile
bun run db:setup
bun run dev
```

`bun run dev` starts both services, prefixes their output, and stops both with
**Ctrl+C**. Default addresses:

- Frontend: http://127.0.0.1:5173
- Directory: http://127.0.0.1:5173/agency-list
- Backend: http://127.0.0.1:8787/api/agencies

No Cloudflare login or backend secrets are required for the local directory.
`db:setup` applies migrations and seeds **local D1** using the checked-in public
agency snapshot. It preserves existing rows and can be run again safely.
State persists under `apps/api/.wrangler/state`; tests have isolated databases.

### Port conflicts

Create `.env.local` at the repository root (see `.env.example`):

```dotenv
WEB_PORT=5174
API_PORT=8788
```

The root runner connects Vite to the selected API port automatically. It reports
an error if a selected port is already occupied instead of silently switching.

To run the services in separate terminals using their default ports:

```sh
bun run dev:api
bun run dev:web
```

For separate terminals with custom ports, pass `--port` to each command and set
`API_PROXY_TARGET` in `apps/web/.env.local` to match the backend. Root `WEB_PORT`
and `API_PORT` are interpreted by the combined runner only.

### API selection

Local Vite requests use `/api`, proxied to the local Worker. Production builds
default to `https://govpeep-api.tech-hhamilton.workers.dev/api`.

Override `VITE_API_BASE_URL` at build time (or in `apps/web/.env.local`) when
using another API. This is a public browser setting, not a secret. See
`apps/web/.env.example`. For future Worker secrets use the ignored
`apps/api/.dev.vars` file; the current agency API needs none.

## Commands

| Root command | Purpose |
| --- | --- |
| `bun run dev` | Start web and API together |
| `bun run dev:web` / `bun run dev:api` | Start one application |
| `bun run db:setup` | Apply local migrations, then insert missing seed rows |
| `bun run db:migrate` / `bun run db:seed` | Run either local database step |
| `bun run typecheck` | Check web, Worker, and Worker tests; generate binding types |
| `bun run lint` | Run the frontend ESLint configuration |
| `bun run test` | Run the Worker/D1 integration tests once |
| `bun run build` | Build web and dry-run the Worker bundle (no deployment) |
| `bun run build:web` / `bun run build:api` | Build one application |
| `bun run cf-typegen` | Regenerate Worker runtime/binding types |

The API's `test:watch` and `data:refresh` commands can be run with
`bun run --cwd apps/api <command>`. Snapshot provenance and refresh instructions
are in [apps/api/data/README.md](apps/api/data/README.md).

Use **`bun run test`**, not `bun test`: these tests need Vitest's Workers runtime.

## Current feature status

- Agency listing and case-insensitive search run against D1.
- The FOIA wizard is a UI prototype: its completion screen does not generate,
  submit, or email a letter.
- Account screens use prototype cookie/Redux storage, including a stored
  password. Use dummy credentials; real authentication is a v2 follow-up.
- The Rust code preserves earlier work, including an outdated AI integration.

## Deployment

The frontend remains a Cloudflare Pages application and the API remains a
Cloudflare Worker. Both can build from this repository. See
[docs/deployment.md](docs/deployment.md) for the exact Git/Cloudflare cutover
settings and [docs/migration.md](docs/migration.md) for source provenance.
