# Órbita — Your health, on board

Proposal for NASA Space Apps 2026: a personal health application for astronauts that integrates health, physical adaptation and habitat with on-board procedures and care follow-up.

The core journey connects observation, measurement, interpretation, action and outcome. The copilot supports both the preventive routine and the review of a change.

## Status

Next.js frontend with Summary, Physical evolution, Exercise and Follow-up; design
adapted from Research and simulated data. Independent Node.js/TypeScript backend
with a read API. The user's activity records and reviews are stored
in their browser; they are not sent to the specialist.

The catalog and the scenarios are provisional, pending medical validation.
There is no clinical interpretation, prescription, sensors, AI or server persistence.

## Two development areas

| Area                | Folder            | Environment                                                      |
| ------------------- | ----------------- | ---------------------------------------------------------------- |
| Frontend            | `src/`, `public/` | Next.js, port 3000; root package.json/lockfile                   |
| Backend             | `backend/`        | Node.js + TypeScript, port 4000; its own package.json/lockfile   |
| Shared contract     | `contracts/`      | Types, validators, OpenAPI and examples; coordinated changes     |

npm workspaces, a database and Docker are not used. Requires Node.js 22.18 or later.

## Start the frontend

```bash
nvm use  # if you use nvm
npm ci
npm run dev
```

Open http://localhost:3000. By default it uses mocks and does not need the backend.

## Start only the backend

```bash
npm --prefix backend ci
npm --prefix backend run dev
```

Check http://127.0.0.1:4000/api/v1/health. You do not need to install the frontend.
Instructions and extension points: [backend/README.md](backend/README.md).

## Connect both

Keep both processes running. In the root `.env.local`:

```dotenv
HEALTH_DATA_SOURCE=api
HEALTH_API_BASE_URL=http://127.0.0.1:4000/api/v1
```

Restart Next.js. The frontend then reads astronauts, measurements, assessments and
sessions from the backend. To go back to mocks, use `HEALTH_DATA_SOURCE=mock`.
Integration errors are not hidden by silently replacing them with examples.

## Verify

```bash
npm run check                   # Frontend: ESLint, types and tests
npm run build                   # Frontend: production
npm --prefix backend run check  # Backend: its own types and tests
npm run test:contracts          # Backend ↔ frontend compatibility
npm run contracts:export        # Update OpenAPI after agreeing on changes
```

## Work as a team

The [branch and file distribution guide](docs/team-workflow.md) explains what
each person edits and how to create `backend/api` from `origin/frontend`. **This
base must be committed and pushed first:** local changes do not appear in
your teammate's clone.

- [API contract](docs/api.md) and [executable contract](contracts/README.md).
- [Architecture and boilerHack analysis](docs/architecture.md).

Challenge: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/
