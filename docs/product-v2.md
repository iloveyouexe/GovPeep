# GovPeep v2 direction and milestone 1

## Product decisions

- Personal public-records workspace, flexible enough for casual and frequent users.
- Nationwide directory and public positioning. Alabama remains an internal
  source-review priority, not a marketing theme or the default filter.
- Manual filing is first-class. Drafting/saving/exporting never means submitted.
- Google SSO and verified-email links; connected Gmail/Outlook inboxes are later work.
- Recurring requests will create a new dated draft and notify the user, with
  pause/skip controls. Automatic sending is a separate future capability.
- Monthly operating target: $25, with service allowances and application quotas.

## Implemented first slice

- Public landing page plus responsive overview, directory, sign-in, requests
  list/editor, timeline, and settings. The working name is centralized in
  `packages/contracts/src/brand.ts` for later rebranding.
- Better Auth email-link sessions stored in D1, private request ownership checks,
  same-origin browser API calls, and a production-gated development mailbox.
- Deterministic, editable manual drafts; copy/download; manual filing/status events.
- Optimistic version checks and immutable filed contents/guidance snapshots.
- 200 requests per account; 48 KB mutation payload limit; 80 email attempts/day.
- Three source-checked Alabama offices (Governor, Secretary of State, Huntsville).
- Federal demo listings explicitly marked imported/unverified. All states and DC
  can be selected for a custom manual recipient, but most lack reviewed guidance.
- Original organization names/logos are retained and displayed. Default browsing
  includes every jurisdiction alphabetically; manual requests require an explicit
  jurisdiction choice rather than silently selecting Alabama.
- No automatic legal deadlines: Alabama guidance is introductory and citations
  distinguish official filing policies, statute lookup, and secondary commentary.

Schedules, AI-assisted scoping, recurring notifications, attachments, and automated
agency submission are **not implemented**. The UI labels planned features clearly.

## Next slices

1. Expand Alabama source verification and import FOIA.gov agency components.
2. Build common-record pathways and limited AI clarification/record suggestions.
   Preserve manual editing and surface sources/uncertainty; avoid invented contacts.
3. Add schedule definitions and uniquely keyed occurrences, time-zone-aware rolling
   periods, an indexed due-schedule query, retry-safe draft creation, and email outbox.
4. Add private response attachments and verified inbound delivery events, followed
   by selected publication alerts and supported agency delivery integrations.

## Budget

No AI service is called by milestone 1. Local email is simulated and free.
Production email uses a verified sender on Resend; its free tier was listed as
3,000/month and 100/day when reviewed. Cloudflare Workers Paid starts at $5/month;
D1/R2 and other services have separate included usage/overages. Account allowances
may be shared with other projects. Domain registration is an up-front annual cost.

Before enabling AI, implement a concurrency-safe global cost reservation ledger,
token/output limits, per-user allowances, bounded retries, and a pause switch.
Before accepting attachments, define storage/size quotas and retention/deletion.
The $25 target is not an enforceable provider billing ceiling without these controls
and operating/usage monitoring.

## Research anchors

- https://www.foia.gov/how-wizard-works.html — pathways, agency matching, ML fallback.
- https://www.foia.gov/developer/ — federal component data; requires an API key.
- https://governor.alabama.gov/public-records/ — forms, email, published recurring reports.
- https://www.sos.alabama.gov/public-records-request — office-specific filing policy.
- https://www.huntsvilleal.gov/government/public-records/ — city form and fee policy.
- https://www.rcfp.org/open-government-guide/alabama/ — secondary legal reference.
- https://alison.legislature.state.al.us/code-of-alabama — statutory text to review
  before implementing exact response-clock rules.

The law/source profile versions in the database reflect the initial review date.
Source-checked contact instructions are not a guarantee of eligibility, release,
or complete statewide coverage.
