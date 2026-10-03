# Deploying the GovPeep workspace

The v2 workspace introduces real authentication and private request data. The
existing `govpeep` Pages project, `govpeep-api` Worker, and `govpeep-db` D1 database
are reused. Both applications build from `iloveyouexe/GovPeep`.

## What changed since the directory demo

- Pages serves a same-origin `/api/*` gateway through a Worker service binding.
- Browser API URLs are relative; the old `VITE_API_BASE_URL` variable is unused.
- The API needs migrations `0002_workspace.sql`, `0003_directory.sql`, and
  `0004_entity_logos.sql` (restores historical logo references).
- Real email sign-in needs a verified sender domain and authentication secrets.
- `EMAIL_MODE=disabled` is the committed production default until email is ready.
  Google sign-in can be enabled independently; see `google-sign-in.md`. If neither
  provider is configured, the public directory and landing page remain available.
- The local mailbox is only available when development mode, development email
  mode, and loopback request/application hosts all agree. Never deploy dev vars.

## 1. API build configuration

Cloudflare **Workers & Pages > govpeep-api > Settings > Builds**:

| Setting | Value |
| --- | --- |
| Repository | `iloveyouexe/GovPeep` |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `bun install --frozen-lockfile && bun run --cwd apps/api typecheck && bun run --cwd apps/api test` |
| Deploy command | `bun run --cwd apps/api deploy` |
| Version command | `bun run --cwd apps/api wrangler versions upload` |
| Build variable `BUN_VERSION` | `1.3.14` |
| Build variable `NODE_VERSION` | `24.15.0` |
| Build variable `SKIP_DEPENDENCY_INSTALL` | `true` |

The root stays `/`: commands select `apps/api` themselves. Watch paths should
include `apps/api/*`, `packages/*`, `package.json`, and `bun.lock`. Keeping `*`
is also valid while bringing up the first deployment.

Wrangler and the Workers test runtime have been updated together for Better Auth:
Wrangler 4.147.0, `@cloudflare/vitest-plugin` 1.3.6, and Vitest 4.1.11. The
compatibility date is 2026-10-02 with `nodejs_compat` enabled.

## 2. Apply production migrations before deploying the new API

From the repository root, with Cloudflare CLI authentication configured:

```sh
bun run --cwd apps/api wrangler d1 migrations list govpeep-db --remote
bun run --cwd apps/api wrangler d1 migrations apply govpeep-db --remote
```

Review/backup the production database before applying new migrations. These
migrations add tables and copy existing agency listings into the new directory;
they do not drop the existing `agencies` table. The seed script is **local only**
and should not be used as a production database replacement.

The D1 binding remains `govpeep_db`, pointing to database `govpeep-db`, ID
`87cadaea-ec5c-4f76-8586-79802e80e28e`. The old `/api/agencies` endpoint remains
available for compatibility. New clients use `/api/entities`.
The directory defaults to all jurisdictions and includes organizations without
logos. Existing image assets are mapped back to the new entity records.

## 3. Pages build configuration and service binding

Cloudflare **Workers & Pages > govpeep > Settings**:

| Setting | Value |
| --- | --- |
| Repository / branch | `iloveyouexe/GovPeep` / `main` |
| Root directory | Repository root (blank or `/`) |
| Build command | `bun install --frozen-lockfile && bun run build:web` |
| Output directory | `apps/web/dist` |
| Build variable `BUN_VERSION` | `1.3.14` |
| Build variable `NODE_VERSION` | `24.15.0` |
| Build variable `SKIP_DEPENDENCY_INSTALL` | `true` |

Under the Pages project's bindings configuration, add a **service binding**:

```text
Binding name: API
Worker:       govpeep-api
```

Deploy again after saving the binding. `bun run build:web` compiles
`functions/api/[[path]].ts` into `apps/web/dist/_worker.js/index.js` (Pages advanced
mode). `_routes.json` invokes it only for `/api/*`; static files and SPA routes
remain assets. The gateway forwards the original request URL, cookies, and
response cookies through the service binding. It never redirects the browser
to `workers.dev` and reports HTTP 503 if the binding is missing.

Watch paths: `apps/web/*`, `functions/*`, `packages/*`, `package.json`, `bun.lock`.
Check a direct visit to `/directory` and `/requests` after deployment.
The public landing page is `/`; the signed-in overview is `/app`.

## 4. Enable sign-in providers

For Google SSO, follow [Google sign-in setup](google-sign-in.md). Configure the
server-side OAuth client ID/secret and exact frontend callback URI. It uses the
same D1 accounts and cookies and does not require Resend or inbox access.

For email links, complete the steps below when a sender domain is ready:

1. Choose a domain and verify a sending domain with Resend. This can be a sending
   subdomain; the website may remain on `govpeep.pages.dev` initially.
2. Create a restricted Resend sending API key. Keep it server-side.
3. Generate a random auth secret of at least 32 characters and store it using
   Wrangler's interactive secret commands (never commit it):

   ```sh
   bun run --cwd apps/api wrangler secret put BETTER_AUTH_SECRET
   bun run --cwd apps/api wrangler secret put RESEND_API_KEY
   ```

4. Edit the non-secret `vars` in `apps/api/wrangler.jsonc`:

   ```jsonc
   "vars": {
     "APP_ENV": "production",
     "APP_ORIGIN": "https://govpeep.pages.dev",
     "EMAIL_MODE": "resend",
     "EMAIL_FROM": "GovPeep <hello@your-verified-domain>"
   }
   ```

   Replace the sender with an actually verified domain. `APP_ORIGIN` is the
   canonical **frontend** origin, with no trailing slash. Change it when moving
   the website to a custom domain. Deploy the configuration with the API.

5. Verify `/api/config` **on the frontend origin**, then sign in with an address
   you control. Check sign-out and saved requests. Direct Worker/preview origins
   do not advertise email sign-in when they differ from the configured origin.

The app reserves email usage atomically before sending and caps this API at
80 attempts per UTC day, including failed attempts. Requests are rate-limited
by Better Auth using Cloudflare's client IP header. Provider quotas can be
shared with other projects, so this is not a global account billing guarantee.

For local development, `bun run dev` creates `.dev.vars` with a random secret
and uses an in-browser local mailbox. It never uses Resend in that mode.

## Preview environments

Private preview workspaces need their own Worker, D1 database, auth secret,
service binding, and exact `APP_ORIGIN`. A version upload alone does not isolate
production data. Until that environment is configured, preview the public UI
and directory; production-only origin checks intentionally reject preview
authentication/mutations. Production auth secrets must not be reused locally.

## Release checks

```sh
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bun run build
```

Run `bun run test:e2e` against local development after `bun run db:setup`.
Apply production migrations, deploy the API, configure/deploy the Pages binding,
then verify directory search and the actual sign-in/save/file/sign-out workflow.
No real requests are sent to agencies by this milestone.

## References

- [Pages service bindings](https://developers.cloudflare.com/pages/functions/bindings/#service-bindings)
- [Pages advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/)
- [Workers Builds monorepos](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/)
- [Better Auth magic links](https://www.better-auth.com/docs/plugins/magic-link)
- [Resend email API](https://resend.com/docs/api-reference/emails/send-email)
