# Source selector: local simulation and backend

Date: November 15, 2026. Branch inspected: `frontend`, commit `c5f9882`.
Status: analysis and implementation plan; it does not enable the selector or modify code.

Follow-up: [delivery A implemented and scope of verification](data-source-switch-implementation.md).
Delivery B remains conditional on the contract and the real source described in this plan.

## 1. Proposed decision

Turn the top label into a control to toggle between **local simulation**
and **backend**, keeping the current sober appearance. Show **Real data**
only when the validated response identifies real records and their context.

The requested interaction is feasible, but there are three different concepts:

| Concept | Initial values | Who determines it |
| --- | --- | --- |
| Selected source | Local simulation / Backend | User, within the permitted configuration |
| Effective origin | Synthetic / Ground analog / Ground / Flight / Mixed / Undetermined | Validated response and visible records |
| Availability | Loading / Available / Empty / Not configured / Error | Result of the load |

The backend on this branch returns synthetic data from a seed file. Connecting it
does not by itself enable real data, live sensors, verified comparisons or
persistence of changes. The label expresses evidence, not the intent of the click.

**Delivery A:** fully functional mock/API selector with the current contract.
**Delivery B:** real origin, once its response and its reading are agreed on and implemented.
No new framework, Redux, API inside Next or plugin system is needed.

## 2. Repository findings

| File or area | Verified situation | Necessary change |
| --- | --- | --- |
| `components/dashboard.tsx:87` | The label is a `span`, not a button | Accessible control and independent source state |
| `src/lib/env.ts` | `HEALTH_DATA_SOURCE` chooses `mock` or `api` globally | Keep it as the default value; resolve the request without modifying `process.env` |
| `src/app/page.tsx:29–58` | Loads parameters and astronauts in parallel before knowing a source selection | Resolve source first, then catalog and detail from the same provider |
| `data/service.ts` | Each function queries configuration on its own | A single context/provider per screen load |
| `data/mission-projection.ts` | API 0.1 strictly validated and projected as a demo not verifiable per test | Keep compatibility and blocks; separate adapter for a future version |
| `contracts/models.ts`, `contracts/schemas.ts` | `dataKind` only admits `synthetic` | Agree on a new contract before admitting real data |
| `backend/src/data/provider.ts:10–40` | Catalog, measurements and mission come from `seed.json` | Today it only allows delivery A |
| `backend/src/app.ts:44–49` | `/health` reports technical health and version | Do not use it as proof that real datasets exist |
| `dashboard-state.ts`, dashboard links | They keep filters, but not source | Propagate a source parameter in all navigation |
| `use-demo-journal.ts:46–48` | Key `orbita-demo-journal-v1:${astronautId}` | Separate context of drafts and prepared copies |
| `src/app/error.tsx` | Generic error with retry; the selector disappears | Recovery that allows going back to simulation from API errors |
| `/investigacion` | Real reading absent; independent and synthetic example | Keep source coherence without turning that example into backend data |
| Texts and exports | There are fixed references to fictional data and demo program | Derive them from the context before enabling real records |

`getJson` already uses `cache: "no-store"`, an 8-second timeout and Zod validation.
The measurement and mission loads are already done in parallel after selecting a
person. Those patterns are kept.

The tree was clean when this analysis began. No fetch, branch change,
reading of originals, availability test of a running backend or
modification of `backend/` or `contracts/` was done.

## 3. Behavior of the top control

### 3.1 Action control, not a scientific-truth switch

Keep it at the top right, next to the theme. Use a styled `button type="button"`
with the existing tokens. Activating it requests the other source.
An ARIA switch represents on/off; here there is an asynchronous navigation
that can fail, and the origin is not binary. Do not use `role="switch"` nor change
`aria-checked` to declare that the data are already real.

The content must allow distinguishing two sources even if both are synthetic:

```text
Synthetic data                  Synthetic data
Source: Local simulation         Source: Backend

After the real integration:
Real data · ground analog
Source: Backend
```

The auxiliary text can be placed below or beside depending on available space.
It must be perceivable, not exist only in a tooltip. The accessible name will include
the visible text and the target action, for example: «Synthetic data. Source:
Local simulation. Switch to backend». Do not use `aria-pressed` with a label whose
meaning changes between source and origin.

The «Real data» part can keep the requested name, accompanied by the specific
origin. It must not suggest data from an astronaut in flight if it is a
ground analog. The future schema must allow mixed provenance: if only one section
is real, do not label the whole panel as real.

### 3.2 States and transitions

| State | Presentation | Permitted action |
| --- | --- | --- |
| Simulation loaded | Synthetic data · Local simulation | Request backend |
| Backend without valid URL | State «Backend not configured» when trying to connect; no numbers attributed to that source | Return to simulation |
| Transition to API | «Connecting to backend…» announced as a status | Prevent double activations while it resolves |
| API 0.1 loaded | Synthetic data · Backend | Return to simulation |
| Future validated real API | Real data + specific origin · Backend | Return to simulation |
| Valid API without records | Source Backend · No records; origin only if the valid envelope declares it | Change person if there is a catalog; return to simulation |
| API unreachable or timeout | Backend unavailable; no real-data label | Retry / Use local simulation |
| Incompatible response | Data format not compatible; no numbers from that response | Retry / Use local simulation |
| Catalog or sections of different provenance | Mixed origin or incompatible context per contract | Inspect sections; block mixes not agreed on |

During the transition, the previous screen can remain visible as content
previous to the update, but it keeps its original label and blocks exporting or
preparing reviews until the load is resolved. Do not rename mocks as real.
After a failure do not show a previous history as if it belonged to the backend.
The error keeps explicit access to simulation. There is no automatic fallback.

Accessibility sources: [MDN, switch semantics](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/switch_role)
and Modern Web Guidance `forms`, sections 1, 2, 5 and 7. Programmatic navigation is
checked against [Next.js useRouter](https://nextjs.org/docs/app/api-reference/functions/use-router)
and the documentation of the installed version.

## 4. Selection architecture

### 4.1 URL as navigation state

Proposal: `source=mock|api`. These are internal transport identifiers, not
scientific conclusions. Do not use `source=real` for the current synthetic API.

Navigation examples, not new endpoints:

```text
/?source=mock&view=summary&scenario=recovery
/?source=api&view=summary
/investigacion?source=mock&example=synthetic
/investigacion?source=api
```

Without a parameter: use `HEALTH_DATA_SOURCE`, `mock` by default. Validate the selection
on the server with a closed list. Reject duplicate parameters/arrays or unknown
values with an invalid-request state and recovery to simulation; do not
silently normalize them to a different mode. The client cannot send a
backend URL, a file name or a dataset path as a source.

The URL allows reload and use of back/forward. Do not store the mode only
in React or in localStorage, nor write environment variables from the button.
Only the source and navigation filters are part of this mechanism; do not add
notes, health values or credentials to the parameters.

### 4.2 Private server configuration

Keep `HEALTH_DATA_SOURCE` as the initial selection and `HEALTH_API_BASE_URL` as the
HTTP target configured by the team. Having a URL configures a target, it does not
demonstrate that it is connected or has real data. Do not add `NEXT_PUBLIC_`
to that URL nor expose it in browser messages.

Separate reading/validation of configuration and availability of the requested mode.
If the URL is missing and API is requested, return `not_configured`; simulation must
remain accessible, even if the initial environment value was `api`.
Do not fetch when the configuration is not valid. Prevent the API
configuration failure from also disabling the exit to mocks.

A capabilities endpoint is not needed in delivery A. If the team agrees on it
for delivery B, it will be a new contract: do not assume it exists nor use `/health`
to infer provenance, permissions or existence of tests.

### 4.3 One provider per request

Create a read context once, after validating the source. Pass it
explicitly to all calls or capture it in a **server-only** factory.
The following signature is a new proposal; it does not currently exist:

```ts
type DataSourceMode = "mock" | "api";
// createHealthDataReader(validatedContext) => {
//   listAstronauts(), getMeasurements(id), getMission(id, scenario?)
// }
```

Keep `data/service.ts` as the entry point for the pages. Neither components nor backend
import fixtures from the other side. Do not introduce `src/app/api/` to duplicate the API.

Load sequence:

1. Read `searchParams` and configuration; resolve the source for this request.
2. If unavailable due to configuration, return the recoverable state.
3. Load the catalog of the selected provider.
4. Resolve the person exclusively within that catalog.
5. Request measurements and mission in parallel from the same provider.
6. Validate responses and consistency of identity, version and declared provenance.
7. Build the screen context and the calculation capabilities.
8. Render effective source, data and controls together.

Do not mix API catalog with mock mission, nor complete a section missing from the API
with fixtures. In delivery A, a failure of any of the required reads
produces the load error state; a partial failure system is not needed.
A valid empty response is represented as empty. A 404 for a person is distinguished
from a network or format error. Future partial sources need an explicit
per-section rule, not an implicit mix.

## 5. Navigation, identity and drafts

### 5.1 Source change

When toggling, keep `view`, `period` and `scale`, which describe display
preferences. Remove `astronaut`, `reference`, `evaluation`, `group` and `scenario`:
those selections belong to the catalog/history of origin. Choose the initial
person from the new catalog and announce the resulting selection.

Do not associate Vega with a real participant for sharing a code or a position in
a list. An old URL with a person that does not exist in the source keeps the state
«person not available in this source», with a selector or return to its catalog.

Use a common function to build internal URLs with `URLSearchParams`. Copy
the existing patterns of `historyQuery`, but add the source in all paths:
main navigation, brand, person, filters, scenario, research and return.
`router.push` is proposed to change source and allow going back with back;
`router.replace` remains suitable for filters. Do not add `refresh()` after
each navigation: the new URL already triggers the server read.

In research, `source` and `example` cannot contradict each other. A link to the synthetic
example explicitly requests `source=mock`; with API selected and no real reader,
show «Research reading not integrated». Do not use the example as a fallback.
The source control must remain available also on that route and in empty states.

### 5.2 Local state isolation

The React key can no longer be just `selected.id`: it must include a data-context
and person identifier. This resets selection and in-memory drafts when
switching from mocks to API even if both use `astro-01`.

For delivery A, keep the current key of the mocks so as not to lose existing
notes and assign a different namespace to the synthetic backend. With a single configured
backend, an explicit context `api-demo-0.1` separate from `mock` is enough.
Before admitting several backends or datasets, the agreed contract/configuration
must provide a stable source identifier, without exposing its private URL.
Do not automatically migrate mock notes to that context.

A prepared copy includes mode, origin, contextual identity, version and sources.
Its export keeps the context with which it was prepared. Switching source does not
transform it nor overwrite it with another subject. Unsaved drafts must be
saved in their context or warn accessibly that they will be lost before an
exit that discards them; apply the same rule as for a change of person.

In delivery B, do not automatically inherit demo persistence in localStorage for
real data. Until storage and lifecycle are agreed with the team, propose a
read-only real view with explicit review/export and no automatic
persistence of real notes in the browser. If local editing is authorized, its memory
and retention are designed as part of that delivery, separate from the demo.

Demo activity marks are local changes. The current API only supports GET/HEAD:
do not pretend that a checkbox updates a server session. In API mode, show
the received state as read-only, or label a local annotation if that
function is agreed on. Do not invent a save endpoint.

## 6. Error and loading handling

Represent the expected failures as serializable load results, for example:
`not_configured`, `unavailable`, `timeout`, `invalid_response`, `subject_not_found`.
These are proposed names for the frontend, not codes already defined in the API.

The page must be able to present a minimal shell with selector, requested source,
explanation and recovery actions even if the catalog fails. The provider cannot
depend on having a valid astronaut to offer «Use local simulation».
Keep `error.tsx` as a last resort for unexpected exceptions and add an
explicit exit to `source=mock`. The installed version documents `retry()`; do not
replace it with APIs remembered from another version without reviewing the documentation.

Reuse timeout and `no-store`. Do not add polling nor promise real time.
A «Retry» or «Update data» action does an explicit read; show
the query date separate from the measurement date. Going back can recover
a router view: do not describe it as continuous synchronization.

Avoid crossed results on fast clicks: block repeated changes during
the transition and verify that the committed screen corresponds to its URL/context.
Keep a single `role="status"` region for loading and result, `aria-busy` on the
data area and recoverable focus after load/error. Do not announce the entire panel.

## 7. Delivery B: requirements to show real data

Coordinate with the backend owner. Do not unilaterally modify `contracts/`
nor extend the `synthetic` literal and assume the rest of the response is sufficient.

The agreed response must express, at least:

- Contextual identity of source/dataset, subject and test.
- Origin per set and per record/section when it can vary.
- Quantity, confirmed/unknown unit, peak versus stage and protocol.
- Availability state: zero, absence and no record are not equivalent.
- UTC time or source date, precision, zone, calendar and time scope.
- Source IDs, citation, release, import profile and applicable custody evidence.
- Technical verification, clinical review and projection version, as distinct states.
- Capabilities and block reasons; always consistent with the records.

Reuse the aerobic analysis and the local reading model as a discussion point,
not as an already approved contract. The new version requires models, schemas, OpenAPI,
fixtures and compatibility tests. Keep the 0.1 adapter separate while it is
needed, without transforming a real response into an old demo.

A ground analog of a single test can enable real inspection and keep the trend
blocked. The absence of a calendar or units is not resolved by switching
source. Real data does not mean clinical validation or suitability for a mission.

The global label is derived from the validated context, including the empty case. Do not take
the first assessment as proof of the origin of the whole panel. A mixed set is
identified as such and keeps provenance per section/record.

Review before enabling this delivery: `review.ts`, `historyCsv`, inspector, activity,
`about-system`, footer, additional measurements and downloaded copies. Currently there are
demo texts and UTC assumptions that are correct for 0.1 but not for every real source.

## 8. Plan by phases

### Phase 0 — Discovery and design decisions

Delivery of this document, with verification of configuration, routes, schemas,
persistence and APIs of the installed Next. A delegated documentary review
of the backend was done; the synthesis and the plan were prepared on those files.

Permitted references: `AGENTS.md`, `contracts/AGENTS.md`, `backend/AGENTS.md`,
`docs/team-workflow.md`, `docs/api.md`, Next documentation indicated in §11.
APIs verified: GET/HEAD `/api/v1/astronauts`, `/{id}/measurements` and `/{id}/mission`
under that catalog; `/api/v1/health` and `/api/v1/openapi.json` are auxiliary.

Acceptance: it is explicit what 0.1 allows and what requires future agreement.
No sources, research or write endpoint is assumed to exist.

### Phase 1 — Resolve source per request and centralize navigation

Planned files: new `data/source-context.ts` or pure equivalent,
`src/lib/env.ts`, `dashboard-state.ts`, `.env.example` and context tests.

Copy the enum validations of `env.ts` and the serialization of `historyQuery`.
Implement explicit resolution, private configuration and URL construction.
Do not include the source in `HistoryContext` if that mixes provider identity with
assessment filters: a higher-level context can contain both explicitly.

Verify: valid/absent/invalid/duplicate modes, environment default, API without URL,
clearing of IDs when switching source and preservation of the mode when changing view.
Guards: do not mutate environment variables nor accept a user URL as backend.

### Phase 2 — Read provider and consistent load result

Planned files: `data/service.ts`, `src/app/page.tsx`, `data/mission-projection.ts`,
load helper if it improves readability and provider tests.

Copy the `getJson` + schema pattern from `service.ts` and the detail `Promise.all`.
Resolve the source before loading the catalog and use it in all reads. Incorporate
a recoverable result for expected errors and effective presentation context.

Verify: no API request in mock mode; the three reads use the same mode;
API 0.1 is still synthetic; 404, empty, timeout and incompatible format are distinct.
Guards: no silent fallback nor inferences of provenance from `/health`.

### Phase 3 — Accessible control and screen states

Planned files: new `components/data-source-control.tsx`, `dashboard.tsx`,
`aerobic.css`, `page.tsx`, `loading.tsx` and `error.tsx` depending on the chosen shell.

Copy existing native buttons and `useTransition`, using `router.push` from
`next/navigation`. Add the explicit source change and loading feedback.
Keep the previous origin until having a validated result; represent failures with
access to simulation. Visible focus, redundant text and an activatable area of at least 3rem.

Verify: Enter/Space keyboard, focus after change/error, no duplicated announcements,
no mixing of old data and new label, control usable without records or catalog.
Guards: do not fabricate ARIA switch states nor block recovery from errors.

### Phase 4 — Draft isolation and coverage of all routes

Planned files: `use-demo-journal.ts`, `observation-panel.tsx`, `exercise-view.tsx`,
`followup-view.tsx`, `review.ts`, `dashboard.tsx`, `/investigacion/page.tsx` and tests.

Reuse the current observation/preparation separation and the immutable snapshot.
Add scope to React and local-state keys; keep old mock drafts.
Propagate source in all links and resolve `example` explicitly.
Represent API sessions as read-only and keep context in exports.

Verify: the same `astro-01` in both sources does not share notes or copies; mock
notes remain available on return; no review is attributed to the new context;
API research without integration does not show the example as a real source.
Guards: no migration of notes between sources nor pretending remote writes.

### Phase 5 — Verification and delivery A

Run `npm run check`, `npm run test:contracts`, `npm run build` and browser
checks. With the backend available, validate its synthetic API; for errors use
controlled responses and test cases. Consult `docs/api.md` and backend tests
as a reference, without modifying their implementation to make the frontend pass.

Update `docs/team-workflow.md`, `docs/api.md` and `.env.example` with selection
by URL, default value, private configuration and behavior without a backend.
Record that the selector is operational but no real source is connected.

Guards: do not consider an integration with a real backend passed from a test
fixture; do not publish data nor introduce new dependencies for this control.

### Phase 6 — Agreed contract and real integration, delivery B

Shared responsibility: backend delivers verifiable reading; both agree on
`contracts/`; frontend incorporates adapter and presentation. References: existing
aerobic analysis and implementation and requirements of §7.

Verify with restored sample and verified custody: grouping of tests,
contextual identity, absence/units/clock, origin and limits on screen and CSV.
If the original or endpoint does not exist yet, keep availability pending, without
declaring this phase complete nor enabling «Real data» with a synthetic example.

## 9. Acceptance matrix

| Case | Required result |
| --- | --- |
| Start without environment or backend | Fully functional demo |
| Click with unconfigured backend | Explanatory state and return to mocks; no request to an invented URL |
| API 0.1 connected | Synthetic data · Source Backend |
| Real response in parser 0.1 | Rejection of version/format; no degradation to mock |
| Future API with validated real origin | Real label + type of origin; capabilities according to evidence |
| Empty API with synthetic meta | No records, remains Backend/synthetic |
| API down, timeout or invalid JSON | Recoverable error; no mock history appears as an API response |
| Known person without assessments | Valid empty state; source and selector available |
| Nonexistent person in that source | Person-not-available state; no reassignment to Vega |
| Two concurrent users choose different sources | No global change nor contamination between requests |
| Same IDs in mocks and API | Separate selections, notes, sessions and reviews |
| Copy prepared before switching | Keeps original source and content |
| Navigation by filters, person and views | Keeps source; does not revert to the default by omission |
| Switching source | Keeps preferences; clears identities and protocols of the previous origin |
| Reload and back/forward | URL and effective source consistent |
| Fast clicks and delayed loads | Last committed context consistent; no relabel of previous content |
| API research without real reader | Pending state; no fallback to the example |
| One real test with four stages | One test; trend blocked; not four visits |
| Unknown or mixed origin | No unjustified global «Real data» label |
| Source changed during export/review | Action blocked while loading; snapshot tied to effective source |
| 320–1440 px, 200% text, themes | Control legible and no page overflow |
| Keyboard and screen reader | Clear action and target; state announced without depending on color |

## 10. Distribution and sequence of reviewable changes

Frontend can complete phases 1–5 with the current API 0.1. Backend keeps its provider
and contract unchanged. The backend owner can continue on their branch without
editing components or the root lockfile. Phase 6 is integrated after agreeing on the
response; it does not require merging entire branches nor importing main's browser store.

Proposed commits for delivery A:

1. Per-request source context, navigation and pure tests.
2. Consistent provider and recoverable errors.
3. Top control, loading and accessible navigation.
4. Isolation of drafts, research and reviews.
5. Integration check and usage documentation.

Each commit must leave types and tests consistent; these blocks can be grouped
if separating them produces a state that does not compile. No speculative
contract changes are included in those commits.

## 11. Technical documentation to execute the plan

Read the local versions before implementing, as `AGENTS.md` requires:

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`:
  asynchronous `searchParams` and server reading.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`:
  `push`, `replace`, `refresh` and safe construction of internal URLs.
- `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`:
  results for expected errors versus unexpected exceptions.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`:
  recovery with `retry()` of the installed version.
- `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`:
  private configuration; do not turn the API target into a public variable.
- `src/lib/api/client.ts`, `data/service.ts`, `dashboard-state.ts` and
  `tests/aerobic-evidence.test.ts`: real patterns of the repository.
- [Aerobic preparation](aerobic-data-integration-analysis.md) and
  [previous delivery](aerobic-data-integration-implementation.md): limits of origin,
  time, comparability and pending real reading.

The documentation consulted guides the plan; in this delivery no application tests
were run because only this document was added. The complete verification is part
of the implementation phases, not a claim about code that does not yet exist.
