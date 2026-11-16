# Shared contract

- This folder is the boundary between frontend and backend; changes require
  coordination between both owners.
- `models.ts` defines transport types without framework dependencies.
- `schemas.ts` validates the responses and keeps types compatible with models.ts.
- Export `openapi.json` with `npm run contracts:export` from the root after
  changing schemas or routes. CI checks that the export is up to date.
- Keep synthetic examples in fixtures/; do not use them as real storage.
- Avoid incompatible changes in 0.1; agree on a new version if they are necessary.
