# v2 monorepo migration

## Sources

- Frontend: `https://github.com/iloveyouexe/GovPeep`, commit
  `e6a9e2c8f6175c83c0bd8bd539b89aa2a23be6ef` (2026-01-27).
- Worker and legacy Rust: `https://github.com/iloveyouexe/GovPeep-API`, commit
  `95272a4654789053a06df3b4d49c36143656eb9c` (2026-01-27).
- API remote `main` at inspection: `5dd11caada7d4d72f1d70d28dfff8dd93b1b201f`.
  The only intervening change emptied the old README; application source matches.

The existing GovPeep Git history remains the monorepo history. API source is
imported as a snapshot; its earlier commits remain in the original API repository.

## Path mapping

| Previous location | Monorepo location |
| --- | --- |
| GovPeep `src`, `public`, frontend configs and manifest | `apps/web/` |
| GovPeep-API `govpeep-api/` Worker source/config/tests | `apps/api/` |
| GovPeep-API root Rust source and Cargo manifests | `legacy/rust-api/` |
| GovPeep-API `govpeep-api/schema.sql` | `apps/api/migrations/0001_agencies.sql` |

Frontend environment values were relocated to ignored `apps/web/.env.local`.
The old Supabase values are not consumed by the current frontend. New installs
use the checked-in `.env.example` files instead.

Existing local Worker state was copied into `apps/api/.wrangler/`, and the
original API checkout/state was retained. Only local schema/seed operations were
performed. Git metadata, Rust build output, and the original backend's secrets
were not imported into the new source tree.

## Baseline repairs

- Fixed SQLite `LIKE ... ESCAPE` to use one escape character, resolving search
  failures while preserving literal `%`, `_`, and backslash searches.
- Replaced generated Hello World tests with Worker/D1 endpoint regression tests.
- Added local migrations and an idempotent seed from a public agency snapshot.
- Generated Worker types through Wrangler, with type checks for source and tests.
- Fixed the profile's untyped field rendering and omitted its password field.
- Added API URL configuration and cleaned up stale/cancelled frontend searches.
- Consolidated active dependencies into Bun workspaces and one root lockfile.

## Next feature work

The FOIA wizard, letter generation/preview, and real authentication need product
implementation. The Rust implementation is historical reference, not an active
dependency of the Worker. The next toolchain refresh can upgrade the pinned
Worker runtime/testing packages and review frontend dependency updates separately.
