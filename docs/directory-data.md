# Directory inventory and acquisition strategy

## Existing data is retained

The original snapshot is `apps/api/data/agencies.json`: 379 federal directory
entries with names, descriptions, websites, and logo references. Local images
remain in `apps/web/public/logos` (380 images including a fallback image).

The audit script confirmed all 379 snapshot entries have a matching local logo:

```sh
bun run --cwd apps/api data:audit
```

The workspace migration initially omitted the logo field from `entities` and
defaulted the frontend to Alabama. Migration `0004_entity_logos.sql` restores
the mapping, and the directory now defaults to all jurisdictions alphabetically.
Apply it with `bun run db:migrate` locally, or the explicit remote migration
command during deployment. Existing requests and IDs are preserved.

The current inventory is not a complete list of all public-records recipients.
It contains aliases and entities whose eligibility or proper custodian needs
review. Treat it as a starting inventory, not an authoritative filing registry.

## Recommended source hierarchy

| Coverage | Discovery source | Filing authority |
| --- | --- | --- |
| Federal | FOIA.gov agency/component API | Agency component's official FOIA page and form |
| State government | Official state agency directories | Agency's records policy/contact page |
| Counties, municipalities, special districts | Census of Governments organization data; state/local official directories | Entity's own records office and policy |
| School districts/public education | Official education directories and public datasets | District/institution records custodian |

References:

- https://www.foia.gov/developer/ — API key required; component data follows JSON:API.
- https://www.census.gov/programs-surveys/cog.html — government organization datasets.
- https://www.usa.gov/state-local-governments — official state/local directory links.

Census entity counts do not establish legal coverage or identify every department.
Courts, legislatures, quasi-public bodies, and different record categories can
follow different access regimes. Verify those rather than assigning federal FOIA
to everything with a government-looking name.

## Acquisition pipeline to build next

1. Import source datasets into a staging area, retaining source IDs, provenance,
   retrieval date, raw snapshots, and a hash for change detection.
2. Normalize names, aliases, jurisdiction, entity type, parent entity, and official
   website. Prefer stable source IDs over names as matching keys.
3. Reconcile aliases/duplicates against the existing inventory. Keep an ID map
   so prior requests continue to refer to the correct historical recipient.
4. Extract custodian contacts, forms, channels, and policy URLs from official
   pages. Queue conflicting or uncertain values for review.
5. Publish source/review status separately from directory inclusion. A listed
   entity is not automatically ready for assisted or automated submission.
6. Recheck sources on a shared weekly/monthly schedule, with diffs and targeted
   revalidation of broken links. Do not crawl anew for every user search.

Alabama may remain an internal source-review priority; it is not the product's
public positioning or the default browsing filter. Nation-wide navigation is
available now; complete verified national coverage is ongoing data work.

## Logo enrichment is separate

Keep the existing images and attribution notice. Prefer official branding files
or approved official-site assets, stored locally with their source and checksum.
Use generic icons when no suitable image exists; never exclude an entity merely
because it lacks a logo. Avoid AI-generated seals or fabricated official branding.

Logo paths from the old Windows dataset are normalized to same-origin `/logos/`
URLs. Broken images fall back to a neutral office icon. Logos help recognition;
they are not an endorsement, an eligibility check, or a data-quality badge.
