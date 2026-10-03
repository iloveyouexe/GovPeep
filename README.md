# GovPeep

A public records workspace: discover public offices, sign in with Google or
an email link, prepare and save manual requests, and record their progress.
Cloudflare Workers and D1 power the backend; Bun workspaces manage the monorepo.

## Layout

```text
apps/web/          React, Vite, Tailwind, responsive request workspace
apps/api/          Worker, Better Auth, D1 migrations, seed data, integration tests
packages/contracts/ Shared request validation, types, and letter template
functions/         Pages same-origin API gateway (bundled into the web build)
tests/e2e/         Playwright browser workflow
legacy/rust-api/   Earlier Actix/Postgres backend retained for reference
scripts/          Root development runner
docs/             Deployment and migration notes
```

## Run locally

Prerequisites: **Bun 1.3.14**, **Node.js 22+** (24.15.0 tested), and **Git LFS**
for retained media assets. Run these commands from the repository root:

```sh
git lfs pull
bun install --frozen-lockfile
bun run db:setup
bun run dev
```

`bun run dev` starts both services, prefixes their output, and stops both with
**Ctrl+C**. Default addresses:

- Frontend: http://127.0.0.1:5173
- Workspace: http://127.0.0.1:5173/app
- Directory: http://127.0.0.1:5173/directory
- Backend: http://127.0.0.1:8787/api/entities

No Cloudflare login, real email account, or paid API is required locally.
The API development script creates an ignored `.dev.vars` file with a random
auth secret. Sign in using any test email and open the **Local development
mailbox** link on the sign-in page. The link creates a real local account/session;
it does not send email. The mailbox requires development mode and loopback hosts.

Google sign-in is supported independently of email delivery. It becomes available
when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are configured; see
[Google sign-in setup](docs/google-sign-in.md). No Gmail/mailbox permissions are requested.
`db:setup` applies migrations and seeds **local D1** using the checked-in public
agency snapshot. It preserves existing rows and can be run again safely.
State persists under `apps/api/.wrangler/state`; tests have isolated databases.
Existing sessions/data survive restarts. Old demo cookie/Redux identities are
discarded; they are not migrated into real accounts.

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

For separate terminals with custom ports, pass `--port` to each command, set
`APP_ORIGIN` in the API process environment to the frontend origin, and set
`API_PROXY_TARGET` in `apps/web/.env.local` to match the backend. The combined
runner configures these automatically from root `WEB_PORT` and `API_PORT`.

### API selection

All browser requests use same-origin `/api`. Vite proxies locally; the Pages
gateway forwards to the API service binding in production. `VITE_API_BASE_URL`
is retired. Use the exact origin printed by the runner (`127.0.0.1`, not an
alternate `localhost` alias) so sign-in and mutation origin checks agree.

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
| `bun run test:e2e` | Browser sign-in, request creation/editing, filing, persistence, and mobile checks |
| `bun run build` | Build web and dry-run the Worker bundle (no deployment) |
| `bun run build:web` / `bun run build:api` | Build one application |
| `bun run cf-typegen` | Regenerate Worker runtime/binding types |

The API's `test:watch` and `data:refresh` commands can be run with
`bun run --cwd apps/api <command>`. Snapshot provenance and refresh instructions
are in [apps/api/data/README.md](apps/api/data/README.md).
`bun run --cwd apps/api data:audit` checks the preserved agency snapshot against
local logo files. The current snapshot has 379 entries and all 379 have a matching
local image. See [directory data strategy](docs/directory-data.md) for expansion.

Use **`bun run test`**, not `bun test`: these tests need Vitest's Workers runtime.

For browser tests, run `bunx playwright install chromium` once, then
`bun run db:setup` and `bun run test:e2e`. On Windows with Edge installed, set
`$env:PLAYWRIGHT_CHANNEL='msedge'` to use it instead. Tests start/reuse the local
servers and refuse a deployment without the development mailbox. Browser test
accounts live only in local D1 and use unique `example.com` addresses.

For an unused-code/dependency audit, run `bunx knip --no-progress` from the root.
`knip.jsonc` accounts for the virtual `cloudflare:test` module supplied by the
Worker test runtime. Directory logos are restored from the legacy inventory,
with neutral fallbacks for missing images. An organization never needs a logo
to be included in the directory.

## Current feature status

- **Working:** public landing page, nationwide directory browsing, Google/email-link
  authentication (when configured), private D1 drafts, deterministic editable
  letter preview, text download/copy, manual filing/status history, and version
  conflict detection. Filed draft contents and guidance snapshots are preserved.
- **Coverage:** three Alabama filing sources checked (Governor, Secretary of
  State, Huntsville), imported federal demo listings, and jurisdiction choices
  for all 50 states plus DC. Listings are not a claim of complete coverage or
  legal eligibility. Other state guidance is explicitly unreviewed.
- **Next:** AI-assisted scoping, recurring draft creation/notifications, response
  attachments, and broader verified directory coverage. The Schedules page is
  clearly marked as planned; no schedule runs or agency submissions occur.
- The Rust code preserves earlier work, including an outdated AI integration.

## Working brand

GovPeep is a placeholder product name. Customer-facing branding is centralized
in `packages/contracts/src/brand.ts` and reused by the website, HTML title, and
authentication emails. Changing it does not rename Cloudflare services, database
IDs, repository/package names, or the stable session cookie prefix.

## Deployment

The frontend remains a Cloudflare Pages application and the API remains a
Cloudflare Worker. Both can build from this repository. See
[docs/deployment.md](docs/deployment.md) for the exact Git/Cloudflare cutover
settings and [docs/migration.md](docs/migration.md) for source provenance.
