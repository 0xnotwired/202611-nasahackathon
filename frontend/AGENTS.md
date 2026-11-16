<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Órbita: current scope

- The Next.js block above applies to the frontend; working only in
  `backend/` does not require installing Next.js or the root dependencies.
- Prioritize the frontend with fictional data. The contract and clinical catalog
  are provisional until medical validation is received.
- Organize functionality in `src/features/health-monitoring`. Components
  consume `data/service.ts`; they must not import fixtures or API URLs.
- Keep mocks reproducible and distinguish `null`, zero and absence of records.
- Do not add ranges, diagnoses or treatments inferred from the samples.
- The frontend lives in `src/` and `public/`; the independent backend in `backend/`.
  Each side has its own package.json, lockfile, configuration and checks.
- The read API runs on Node.js/TypeScript on port 4000; the Next.js frontend
  on 3000. Do not implement backend logic in `src/app/api/`.
- The shared contract lives in `contracts/`. Coordinate changes between both
  owners and update OpenAPI, examples and compatibility tests.
- Do not import frontend code from the backend or the reverse. The only runtime
  link is HTTP; the shared transport types have no framework.
- See the file distribution and branch workflow in `docs/team-workflow.md`.
- Use `npm run check` and `npm run build` as validation. Add dependencies only
  when they solve a present need.
