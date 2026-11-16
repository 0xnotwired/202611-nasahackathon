# Órbita · Backend

Independent API in **Node.js 22.18+ and TypeScript**. Default port: 4000.
It does not need Next.js, React, a database, Docker or production dependencies.
TypeScript runs with Node's native support; `tsc` checks types.

## Start only the backend

From the repo root:

```bash
npm --prefix backend ci
npm --prefix backend run dev
```

Or from this folder:

```bash
nvm use
npm ci
cp .env.example .env  # optional: the code already uses these defaults
npm run dev
```

Check: http://127.0.0.1:4000/api/v1/health.
Served contract: http://127.0.0.1:4000/api/v1/openapi.json.

`npm run dev` restarts the process when code changes. `npm start` runs it without
watch. There is no mandatory build step for this development environment.
It uses TypeScript syntax that Node can strip: avoid enums, parameter
properties or other features that need transformation.

## Where to work

```text
backend/
  src/index.ts          Startup, port and process shutdown
  src/server.ts         Node HTTP adapter
  src/app.ts            Routes and responses
  src/data/provider.ts  Data source; start the simulation here
  src/data/seed.json    Initial fictional scenario owned by the backend
  tests/                Backend tests
  package*.json         Own dependencies and lockfile
```

The seeds are independent of the frontend mocks. You can change how the data is
generated or processed here without editing `../src/`. The shape of the responses
is agreed in `../contracts/`; do not change it unilaterally.

Read-only routes:

- `GET /api/v1/health`
- `GET /api/v1/astronauts`
- `GET /api/v1/astronauts/:astronautId/measurements`
- `GET /api/v1/astronauts/:astronautId/mission`

A nonexistent astronaut (404) and one with no records (200 with empty lists)
are distinguished. Responses declare synthetic data and pending clinical validation.
Errors use `{ error: { code, message } }`.

The database accepts no writes and does not persist user activity. The session
and review drafts stay in the frontend's browser. Adding writes or
persistence requires agreeing on the routes and states with the frontend first.

## Dependencies and checks

Always install from this folder: `npm install <package>` or, from the root,
`npm --prefix backend install <package>`. Do not edit the root package.json for the
backend. npm workspaces are not needed to develop these two applications.

```bash
npm run check        # Types + backend tests
```

After a change that may affect the responses, from the root:

```bash
npm ci               # installs the contract/frontend tools
npm run test:contracts
```

This last check validates the router's real responses against the schemas that
the frontend consumes and checks the versioned OpenAPI.

## Test alongside the frontend

The frontend uses mocks by default. In the root, configure `.env.local`:

```dotenv
HEALTH_DATA_SOURCE=api
HEALTH_API_BASE_URL=http://127.0.0.1:4000/api/v1
```

In another terminal run `npm run dev` from the root and open localhost:3000.
Queries are made from Next.js on the server; there is no need to add browser
CORS for this flow.

The default configuration listens on localhost. This change does not prepare a
production deployment, authentication or real storage.

For branches and file boundaries, see [teamwork](../docs/team-workflow.md).
