# Legacy Rust API

Historical Actix/Postgres backend imported from
https://github.com/iloveyouexe/GovPeep-API at commit
`95272a4654789053a06df3b4d49c36143656eb9c`.

The active backend is now `../../apps/api` (Cloudflare Workers + D1).
This directory preserves the earlier agency handlers, Argon2 signup handler,
and experimental FOIA generation integration for reference.

The old server registers only `GET /api/agencies` and
`POST /api/generate_foia`. Other handlers are not wired into `main.rs`.
The generation integration uses an outdated OpenAI model and reads a misleadingly
named `CLAUDEAI_API_KEY`; it needs redesign before reuse.

To investigate this service separately, provide a local `.env` with a compatible
Postgres `DATABASE_URL`, then run `cargo run` here. It binds to port 8080.
Database migrations are not included in the original repository.
