# Simulation API · contract 0.2

Independent backend in `backend/`. Local base:
`http://127.0.0.1:4000/api/v1`. Read-only, synthetic data and no database.

The shared contract is in [contracts/](../contracts/README.md): transport
models, validators, examples and [OpenAPI](../contracts/openapi.json).
Contract changes are coordinated between frontend and backend.

| Method | Route relative to `/api/v1`     | Response                                                                     |
| ------ | ------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/health`                       | Technical status, service and version; not a medical assessment              |
| GET    | `/astronauts`                   | `{ data: Astronaut[], meta }`                                                |
| GET    | `/astronauts/{id}/measurements` | `{ data: OrbitaRecord[], metrics: Metric[], meta }`                        |
| GET    | `/astronauts/{id}/mission`      | `{ data: { records: OrbitaRecord[], tasks: PlanTask[] }, meta }` |
| GET    | `/openapi.json`                 | Versioned OpenAPI specification                                              |

Data responses include:

```json
{
  "contractVersion": "0.2",
  "dataKind": "synthetic",
  "clinicalValidation": "pending"
}
```

This object is called `meta`. The complete examples are in
`contracts/fixtures/astronauts.json`, `measurements.json` and `mission.json`.

## Semantics

- Each record is one value of the main app's schema 2 (`schema_version: 2`), with its own `state` (`recorded`, `confirmed_none` or `not_recorded`), `variable`, `unit`, `unit_status`, `method`, `time`, `origin`, `source`, `mission_phase` and `subject`. `value` is present only when the state is `recorded`; do not replace missing values with zero.
- `time` is ISO 8601 UTC with the `Z` suffix, or `null` when the source time is unknown (see `source_time`).
- All records belong to the requested astronaut (`subject`); the `variable` of each measurement record
  must exist in the `metrics` catalog. They are sorted by date, descending.
- Mission records and tasks (`tasks`, with `scheduled_at` and `planned_minutes`) in ascending chronological order. Method and unit do not
  by themselves confirm clinical validity; they are fields of the demonstration scenario.
- IDs unique within each collection. Do not mix people or units.
- Existing astronaut with no records: 200 with empty lists; for measurements
  the available catalog is kept.
- Nonexistent astronaut: 404 and
  `{ "error": { "code": "ASTRONAUT_NOT_FOUND", "message": "Astronauta no encontrado." } }`.
- Write methods: 405 and `Allow: GET, HEAD` header. There is no persistence.
- Data responses are not cached. Errors are not replaced by mocks.

## Development and integration

Backend terminal, from the root:

```bash
npm --prefix backend ci
npm --prefix backend run dev
```

The frontend works with mocks by default. To integrate it, set in the root
`.env.local` and restart Next.js:

```dotenv
HEALTH_DATA_SOURCE=mock
HEALTH_API_BASE_URL=http://127.0.0.1:4000/api/v1
```

The top button selects the source per request through `source=mock|api`.
`HEALTH_DATA_SOURCE` only defines the initial mode. Choosing API does not modify environment
variables or connect to a URL supplied by the browser. Without a valid URL,
the interface shows «Backend not configured» and allows going back to mocks.

Next.js queries the API from the server. Browser CORS is not required.
The client has an 8-second timeout and validates the responses with the shared
schemas. If the integration fails, it shows the error state with retry and an explicit return
to simulation. The empty catalog and the person not found have their own states.
API 0.2 declares synthetic data; there is not yet a real-data response
or a research endpoint. Its comparisons remain blocked for lack
of per-test evidence, as the aerobic integration documentation explains.

In API mode, the four views receive records and tasks from the
backend. Backend tasks are read-only. The user's observations and summaries are
local browser drafts, separated from the mock context. There is no sending to professionals nor write
endpoints: they will be agreed as a separate extension when they are needed.

## Verify the contract

```bash
npm run test:contracts
```

After agreeing on a contract modification:

```bash
npm run contracts:export
npm run test:contracts
```

CI validates examples, the currency of the OpenAPI JSON and the backend router's
real responses against what the frontend accepts.

## Manual HTTP check

```bash
curl http://127.0.0.1:4000/api/v1/health
curl http://127.0.0.1:4000/api/v1/astronauts
curl http://127.0.0.1:4000/api/v1/astronauts/astro-01/mission
curl http://127.0.0.1:4000/api/v1/astronauts/astro-03/measurements
curl -i http://127.0.0.1:4000/api/v1/astronauts/inexistente/mission
```

Teammate setup and branch workflow: [teamwork](team-workflow.md).
