# Development agency snapshot

`agencies.json` is a snapshot of the public `GET /api/agencies` response.
Its source URL and capture timestamp are included in the file.

The public unfiltered endpoint returns only agencies with a non-empty logo.
This dataset is therefore a directory sample, not a full production D1 backup.

From the repository root:

```sh
bun run db:setup
```

This applies local migrations and inserts missing agency IDs. Existing local
rows are retained. Tests use their own small isolated fixtures instead.

To explicitly refresh the checked-in public snapshot:

```sh
bun run --cwd apps/api data:refresh
```

Review changes before committing. Normal setup and development use the local
file and do not fetch the production API.
