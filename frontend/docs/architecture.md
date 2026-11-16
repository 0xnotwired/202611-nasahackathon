# Órbita development base

## Current decision: two areas and one contract

Next.js frontend at the root, independent Node.js/TypeScript backend in `backend/`
and shared contract in `contracts/`. Each application has its own dependencies,
lockfile, environment, tests and CI. No workspaces or other infrastructure are used.

```text
Frontend :3000 → servicio de datos → mocks del frontend (por defecto)
                                  → HTTP + validación del contrato
                                               ↓
                               Backend :4000 → fuente de simulación propia
```

There are no implementation imports between frontend and backend. Pure types and
OpenAPI live in the shared zone. The previous simulation Route Handlers were
removed from `src/app/api/`: the API now belongs solely to `backend/`.

API mode also consumes records and tasks, through `/mission`.
The user's activity and review drafts remain in the browser. There is
not yet a write contract or server persistence.

The backend base uses Node's native HTTP and native TypeScript execution so as
not to impose a framework or a database. If it needs dependencies, its
owner installs them only inside `backend/`.

File and branch distribution: [teamwork](team-workflow.md).

## boilerHack analysis

Inspected reference: `/home/ivansarita/projects/personal/boilerHack`.
The README, dependencies, `src` organization, HTTP client,
environment configuration, `items` feature, CI and the FastAPI backend structure were reviewed.
It is a base for full CRUD; Órbita first needs reading and visualization.
Its patterns were adapted, without copying the whole boilerplate.

| Pattern | Decision for Órbita | Reason |
| --- | --- | --- |
| Next.js, strict TypeScript, Tailwind | Keep the current installation | It is already set up; do not downgrade to the boilerplate's versions |
| Features in `src/features` | Adopt `health-monitoring` | Contract, data and components have a clear place |
| Centralized HTTP client and environment | Adopt, server only | A single point for errors, timeout and backend URL |
| Zod | Adopt | Validate external responses and derive the types from the same contract |
| Type scripts and CI | Adopt | Detect incompatibilities before integrating team work |
| shadcn/Radix and component library | Postpone | The current screen is solved with HTML and Tailwind |
| TanStack Query and providers | Postpone | There is no polling, mutations or client cache to justify it |
| React Hook Form and toasts | Postpone | Native controls cover the current needs |
| FastAPI + SQLAlchemy + Alembic | Postpone | Requires another runtime and defining persistence before validating the data |
| Docker, multiple databases, `dev:all` | Postpone | The team can start with `npm ci` and `npm run dev` |
| The boilerplate's credit-risk data | Do not reuse | It does not belong to the project's domain |

## Boundaries between team tasks

- **Frontend:** `src/`, `public/`, tests and root configuration. Screens
  consume the data service; their mocks remain owned by the frontend.
- **Backend:** `backend/**`. Start with `src/data/provider.ts` and `src/data/seed.json`
  inside that folder. Its simulation changes do not need to touch screens.
- **Shared:** `contracts/**`. Agree on changes to structures or routes and check
  the backend's real responses with `npm run test:contracts`.

The initial API is read-only and uses fictional data. There is no database,
authentication, sensors, clinical alerts, treatments, offline sync or AI.

## Provisional data

The four demonstration indicators do not represent an approved clinical
selection. Each record includes subject, variable, state, a numeric value
(only when the state is `recorded`), unit and unit status, time, origin and source. The catalog contains name and unit;
units are not mixed in the values and no «normal/critical» states are invented.
The variable codes are extensible so the catalog can be adjusted without changing its structure.

- Vega: records of several indicators and a historical measurement.
- Lyra: one measurement that was not recorded (a record with state `not_recorded`, no value and no unit).
- Atlas: empty history to develop the no-data state.

The samples are fixed and reproducible. They do not simulate real time or update
on reload. `null` means missing value; `0` is a value. The latest record by date is
shown, without replacing a missing one with an older one.

Before incorporating interpretation, agree with the physician on: indicators and units,
frequency, signal quality, activity context, individual baseline,
alert criteria and permitted actions. Those agreements will be a later task.

## Next steps

1. Confirm the catalog and the scenarios with the physician.
2. Adjust mocks and develop the astronaut journey on this base.
3. Implement simulation/processing behind the contract, if time allows.
4. Add persistence, forms or libraries when there is a concrete need.
