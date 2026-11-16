# Órbita Frontend

- `src/` belongs to the frontend. The independent API lives in `../backend/`.
- Access data through `features/health-monitoring/data/service.ts`.
- The mocks in this folder allow development without starting the backend.
- Do not import code, seeds or configuration from `../backend/`.
- `../contracts/` is shared. Coordinate any structural change with the backend.
- Integration is enabled with `.env.local`, without changing screens.
