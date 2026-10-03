# Cloudflare monorepo deployment

GitHub needs no monorepo-specific setting. The target repository is
`iloveyouexe/GovPeep`; Cloudflare's projects must build the appropriate workspace.

These are the settings to apply during the deployment cutover. Local migration
does not update dashboard settings or publish a release.

## Resources to retain

Keep the `govpeep` Pages project, the `govpeep-api` Worker, and the `govpeep-db`
D1 database. A monorepo changes the source layout, not the number of deployed
applications. Archiving the old GitHub repository does not stop its already
deployed Worker.

The obsolete connection is **govpeep-api -> iloveyouexe/GovPeep-API**.
Disconnect that build integration, then connect the same Worker to GovPeep.

## Frontend: existing `govpeep` Pages project

Under the Pages project's build settings:

| Setting | Value |
| --- | --- |
| Git repository | `iloveyouexe/GovPeep` |
| Production branch | `main` |
| Root directory | Repository root (leave blank) |
| Build command | `bun install --frozen-lockfile && bun run build:web` |
| Build output directory | `apps/web/dist` |
| Build system | v3 (monorepos require v2 or later) |
| `BUN_VERSION` | `1.3.14` |
| `NODE_VERSION` | `24.15.0` |
| `SKIP_DEPENDENCY_INSTALL` | `true` (the build command installs explicitly) |
| `VITE_API_BASE_URL` | `https://govpeep-api.tech-hhamilton.workers.dev/api` |

Suggested include watch paths: `apps/web/*`, `package.json`, `bun.lock`,
`.gitattributes`. Cloudflare watch patterns use `*` to include nested paths.

The video files use Git LFS. Verify that the build checks out the actual MP4
objects rather than pointer text; fetch them with `git lfs pull` in the build
step if the existing checkout integration does not do so. Validate video
playback on the preview deployment.

Pages' default SPA fallback serves `index.html` for client routes because the
build has no top-level `404.html`. Check a direct visit to `/agency-list`.

## Backend: existing `govpeep-api` Worker

Under the Worker's **Settings > Build**, connect the **GovPeep** repository in
place of **GovPeep-API**. Keep the existing Worker project, so its URL and D1
association remain associated with the same service.

Cloudflare's documented flow is **Workers & Pages > govpeep-api > Settings >
Builds > Disconnect**, followed by **Connect** to select the new repository.
Publish the monorepo code to its intended production branch before reconnecting,
so Cloudflare can find `apps/api/wrangler.jsonc` immediately. If GovPeep is not
listed, grant that repository access in the existing Cloudflare Workers & Pages
GitHub App installation.

| Setting | Value |
| --- | --- |
| Git repository | `iloveyouexe/GovPeep` |
| Production branch | `main` |
| Root directory | Repository root (`/`) |
| Build command | `bun install --frozen-lockfile && bun run --cwd apps/api typecheck && bun run --cwd apps/api test` |
| Deploy command | `bun run --cwd apps/api deploy` |
| Version/preview command | `bun run --cwd apps/api wrangler versions upload` |
| `BUN_VERSION` | `1.3.14` |
| `NODE_VERSION` | `24.15.0` |
| `SKIP_DEPENDENCY_INSTALL` | `true` (use the explicit Bun install in the build command) |

The commands run from the Git root and select the API workspace explicitly.
Keep the dashboard root at `/` with these commands; setting it to `apps/api`
would resolve the workspace path twice. Bun uses the single root lockfile.
Suggested include watch paths (relative to the Git root): `apps/api/*`,
`package.json`, `bun.lock`.

`apps/api/wrangler.jsonc` retains:

- Worker name: `govpeep-api`
- D1 binding: `govpeep_db`
- Database name: `govpeep-db`
- Database ID: `87cadaea-ec5c-4f76-8586-79802e80e28e`

The Worker toolchain is pinned to the previously locked Wrangler 4.61.0 and
Vitest pool 0.12.7. Its existing compatibility date is retained for migration.
If configuring non-production build commands on this version, use
`bun run --cwd apps/api wrangler versions upload` rather than a newer Wrangler-only command.
Version URLs still use the configured D1 binding; they are not isolated staging
databases. Likewise, Pages previews use the production API unless their build
environment explicitly overrides `VITE_API_BASE_URL`.

## Database migrations

Repository setup commands always use `--local`. Deploying the Worker does not
run a database migration or import the development snapshot.

The initial migration uses `CREATE TABLE IF NOT EXISTS` to support the existing
agency table. After verifying the production schema matches, the explicit
command to register/apply migrations is, from the repository root:

```sh
bun run --cwd apps/api wrangler d1 migrations apply govpeep-db --remote
```

The initial schema is the same as the original API repository's `schema.sql`.
Do not use the partial public development snapshot to replace production data.

## Cutover order

1. Pause Pages automatic deployments under **Settings > Builds & deployments >
   Configure Production deployments** by clearing **Enable automatic production
   branch deployments**. Set preview branch deployments to **None** temporarily
   if publishing a migration branch. Existing deployments continue serving.
2. Disconnect the Worker's old repository under **Settings > Builds**.
3. Verify `bun run typecheck`, `bun run lint`, `bun run test`, and `bun run build`,
   then commit and publish/merge the monorepo code to GovPeep's `main` branch.
4. Reconnect the Worker to GovPeep and apply the backend build settings above.
   Deploy the Worker from `apps/api`; check both `/api/agencies` and
   `/api/agencies?q=NASA` return HTTP 200.
5. Apply the Pages build settings above, re-enable production deployments, and
   trigger a deployment of the monorepo commit on `main`. Do not retry a
   pre-migration commit with the new paths. Check navigation, search, logos,
   and video, then restore the desired preview branch controls.
6. The original `GovPeep-API` repository can remain archived. It retains the
   original API history. In GitHub's Cloudflare App installation, optional
   repository-access cleanup should remove only GovPeep-API and retain access
   to GovPeep and any other projects using the same installation.

## References

- [Pages monorepos](https://developers.cloudflare.com/pages/configuration/monorepos/)
- [Pages build image and tool versions](https://developers.cloudflare.com/pages/configuration/build-image/)
- [Workers Builds monorepos](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/)
- [Workers Builds settings](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Disconnecting/reconnecting Worker builds](https://developers.cloudflare.com/workers/ci-cd/builds/#disconnecting-builds)
- [Pages automatic deployment controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
- [Workers build image and explicit dependency installation](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/)
