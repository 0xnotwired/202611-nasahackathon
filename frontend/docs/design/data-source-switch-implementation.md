# Source selector: implementation

Delivery of November 16, 2026. Reference:
[implementation plan](data-source-switch-implementation-plan.md).

## Available function

The top control toggles between local simulation and backend through
`source=mock|api`. The source is resolved per request; it does not modify `process.env`
nor change the mode of other users. The HTTP target stays on the server.

`HEALTH_DATA_SOURCE` is the initial value if the URL does not include a source.
`HEALTH_API_BASE_URL` configures the backend target. If it is missing or invalid,
selecting API shows a recoverable state. `source=mock` works even
when the initial value is API and has no valid configuration.

Backend 0.1 is still synthetic and is identified as «Synthetic data» and
«Source: Backend». The label is not obtained from the first assessment: it comes
from the validated load context, also if the person has no assessments.
The selected source does not change the comparison blocks of contract 0.1.

## Files and responsibilities

- `data/source-context.ts`: mode/configuration validation, construction of internal
  URLs and draft namespaces. It only accepts configured HTTP/HTTPS targets;
  the request URL cannot supply the API target.
- `data/reader.ts`: immutable per-request reader and loading of catalog/details from the
  same provider. It keeps the independent detail reads in parallel.
- `data/service.ts`: server-only entry point; hands the reader to the pages without
  exposing private configuration to the components.
- `components/data-source-control.tsx`: native control with a GET action and client
  navigation enhancement; includes a visible source and an accessible target action.
- `components/source-navigation.tsx`: shared transition, announced state and
  focus recovery. During the switch, the previous content keeps its
  label and is made inert to prevent exports/reviews with ambiguous context.
- `components/source-state.tsx`: recoverable states without needing a valid
  astronaut. It allows explicitly returning to simulation, retrying a read or
  going back to the source catalog when the requested person does not exist.
- `src/app/page.tsx` and `/investigacion/page.tsx`: source resolution before reading
  data; control available on both routes and in empty/error states.

`backend/`, `contracts/`, HTTP routes and OpenAPI were not modified. No
dependencies or Next.js endpoints were added to duplicate the backend.

## Context and navigation

Switching the source keeps view, period and scale; it clears person, assessment,
reference, protocol and scenario. A person from the target catalog is selected.
Links for views, person, scenarios and research keep the source.
The browser history allows going back to the previous selection.

API research shows «Research reading not integrated». The stages example
only opens with `source=mock&example=synthetic`. It does not become a
backend response nor replace a missing real sample.

Mock drafts keep their historical key. Those of the synthetic backend use
`orbita-api-demo-0.1-journal-v1:` and do not inherit notes, marks or reviews from mocks.
React keys include source and person. This delivery contemplates a single configured
backend; before incorporating several datasets/instances, a stable
source identifier agreed with the backend is needed.

The observation text being edited is kept as a local draft associated with the
assessment where it began. It is recovered on return and is not confirmed as a saved
observation until the explicit action. Reviews include that draft identified
as such, source, version and provenance; a prepared copy keeps its context.
If the browser blocks storage, the user is warned of the loss when leaving and
may export the review. Remote persistence is not promised.

API sessions are read-only. Observations and reviews remain
local; there are no writes to the backend nor sending to specialists.

## Failures and absence

The following are distinguished: invalid/duplicate selection, unconfigured backend, connection
unavailable, timeout, incompatible format, empty catalog and person not found.
A failure of a required read prevents presenting the set as a valid load.
An API response is not completed with fixtures. Unexpected errors keep
the Next error boundary, with a link back to simulation.

`no-store` and the 8-second timeout are kept. There is no polling, sensor streaming or
dataset verification through `/health`.

## Verification

`tests/data-source.test.ts` verifies selection/configuration, context clearing,
preservation of preferences, namespaces, concurrent sources, absence of HTTP in
mocks, empty catalog, missing person, failures, incompatible response versions,
measurements of another subject and duplicate IDs. The previous suites are kept.

Checks: `npm run check`, `npm run test:contracts` and `npm run build`.

The browser check is done on an isolated local production build, using the
backend's real router over HTTP and controlled failure responses. It covers:
switching and loading, inert previous content, API synthetic label, clearing of
identities, separate drafts and copies, read-only sessions, errors and
retry, timeout, empty, unknown person, research, reload and back/forward.
Keyboard, themes, widths of 320–1440 px and 200% text are reviewed.

The application uses JavaScript for the interactive panels and Next navigation.
The control's GET action avoids depending on a write or a Server Action;
a complete dashboard experience without JavaScript is not claimed.

## Real delivery pending

Phases 1–5 of the plan correspond to this delivery A. Phase 6 requires an agreed
versioned response, a research reader and restoration/verification of sources.
Schema 0.1 rejects real data or incompatible versions. That
contract was not changed nor was «Real data» enabled from a seed or a synthetic example.

A future integration must preserve contextual identity, quantity/peak/stage,
protocol, origin, clock, absence, citations and source IDs, with the same blocks
described in the aerobic analysis. It must also agree on the lifecycle of real
notes before enabling their persistence; do not automatically inherit demo localStorage.
