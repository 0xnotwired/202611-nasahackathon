# Frontend and backend without stepping on each other

## File distribution

| Area              | Owner               | Usual files                                                                                                                                          |
| ----------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend          | Frontend person     | `src/`, `public/`, `tests/`, root package.json/lockfile, `tsconfig.json`, Next/ESLint configuration, root `.env.example`, `.github/workflows/ci.yml` |
| Backend           | Backend person      | `backend/**`, including its package.json/lockfile, `.env.example`, tests and README; `.github/workflows/backend.yml`                                 |
| Contract          | Both, coordinated   | `contracts/**`, `docs/api.md`, `../.github/workflows/frontend-contracts.yml` (repository root)                                                                                     |
| Repo agreements   | Coordinate changes  | Root README, root AGENTS, `.gitignore`, this guide                                                                                                   |

The backend does not import frontend components or mocks. The frontend does not import
the backend implementation or seeds. In integration mode they communicate
over HTTP and the shared contract checks compatibility.

The separation reduces the usual conflict zones. Git does not prevent editing
someone else's folder nor guarantee a conflict-free merge: respecting the distribution and
agreeing on shared changes remains part of the team's work.

## Publish this base first

Your teammate only receives published commits. Local files without a commit or
without a push will not appear when cloning or when creating their branch from origin/frontend.

From `frontend`, review the content and select the files of this base
for the commit; then publish that branch:

```bash
git status
# git add <archivos que revisaste>
git commit -m "chore: separar frontend backend y contrato de API"
git push -u origin frontend
```

Do not run the commit if the selection does not include the necessary base. Local
`.env` files and `node_modules` are ignored; `.env.example` files are versioned.

## Your teammate: clone and create the backend branch

```bash
git clone git@github.com:0xnotwired/202611-nasahackathon.git
cd 202611-nasahackathon
git fetch origin
git switch --no-track -c backend/api origin/frontend
npm --prefix backend ci
npm --prefix backend run dev
```

`--no-track` prevents their new branch from accidentally tracking
`origin/frontend`. When they want to publish their work:

```bash
git add backend/
git commit -m "feat(backend): describir el cambio"
git push -u origin backend/api
```

Open a **backend/api → frontend** PR to integrate with your current work.
If you agree on another integration branch, change the PR base explicitly.

To bring frontend progress into their backend branch without rewriting published commits:

```bash
git fetch origin
git switch backend/api
git merge origin/frontend
```

Do this with their changes saved in commits. Resolve conflicts by reviewing
the content; do not use strategies that automatically discard an entire side.

## Your frontend work

You can stay on `frontend`, as before. For an isolated task you can also
create a `frontend/<task>` branch from the current base and open a PR to `frontend`.
Your environment remains:

```bash
npm ci
npm run dev
```

It works with mocks without starting the backend. Do not change the backend lockfile
to install a visual dependency.

## Integrate both processes locally

- Backend in one terminal: `npm --prefix backend run dev` → port 4000.
- Frontend in another: `npm run dev` → port 3000.
- To consume the API, set in the root `.env.local`:

```dotenv
HEALTH_DATA_SOURCE=mock
HEALTH_API_BASE_URL=http://127.0.0.1:4000/api/v1
```

Restart Next.js when you change this configuration. The top button toggles between
local simulation and backend. You can also open `/?source=mock` or `/?source=api`;
the parameter is kept while navigating and takes precedence over the initial environment value.
API 0.1 is still synthetic: the button shows «Synthetic data · Source: Backend».
If configuration is missing, the connection fails or the response is incompatible, a
recoverable state is shown with an explicit return to simulation, with no automatic fallback.

 In API mode the aerobic
assessments and sessions are also read from the backend; they are not mixed with local fixtures
to hide errors. The user's activity and review drafts remain
local to the browser, isolated by source and person, until a write contract
is agreed. Session states received through the API are read-only.
The previous mock keys are kept; notes are not copied between sources.

To return to independent development: open `/?source=mock`; no restart is required.

## Checks before integrating

| Change                       | Command                                                         |
| ---------------------------- | --------------------------------------------------------------- |
| Frontend                     | `npm run check` and `npm run build`, at the root                |
| Backend                      | `npm --prefix backend run check`                                |
| Contract or API responses    | `npm run test:contracts`, at the root                           |
| Contract changes             | Also `npm run contracts:export` and version the generated JSON  |

CI separates frontend, backend and compatibility. Backend-only changes do not
run the frontend build, but they do run the compatibility check. The backend
CI installs only its own dependencies.

The per-area AGENTS files document the limits for assistants. CODEOWNERS is not
enabled with invented users: to assign reviewers automatically you need
to agree on the real GitHub handles and the repository rules.
