# Aerobic integration: frontend delivery

Implementation of November 15, 2026 on the `frontend` branch.
Reference: [analysis and distribution of responsibilities](aerobic-data-integration-analysis.md).

## Available result

Personal follow-up keeps the six longitudinal scenarios, navigation,
selection, reference, local notes and themes. It now allows selecting a protocol
for the calculations without removing the other tests from the table or the CSV. The summary
indicates how many tests are inside and outside the group. Choosing a protocol does not change
the reference automatically: if it belongs to another protocol, the block is explained.

The inspector shows quantity, role of the result, contextual identity, source,
source records, time basis, technical verification and presentation version.
Differences and strokes respect context compatibility; a slope
does not determine clinical improvement or poor performance. No medical criterion has been defined.

The `/investigacion` route presents the availability of MR080G without real values.
The `/investigacion?example=synthetic` route demonstrates a test with four stages and
32 **entirely fictional** records, with a table of eight variables and provenance.
It explicitly selects the `Peak AVG` result; it does not use the maximum of all
rows as the peak. It keeps the source date without converting it to UTC. It does not calculate
age or longitudinal trend. It does not assign a power to `Peak AVG`.

The example uses values written for the interface, not data from participant
7772. Relative/absolute VO₂ and RER have arithmetic relationships documented in the
fixture; they do not represent a physiological model. The fictional mass used to produce
the values is not presented as a real measurement.

## Boundary between frontend and backend

`backend/`, `contracts/`, OpenAPI and the existing endpoints were not modified.
No code from main was imported nor was IndexedDB queried from Next.js. Components
obtain data exclusively through `data/service.ts`.

- `data/mission-projection.ts`: adapts the synthetic 0.1 response to the
  presentation context. It keeps its `meta` and distinguishes HTTP transport from provenance.
- `evidence.ts`: defines context and presentation compatibility blocks.
- `research-assessment.ts`: local reading-model proposal **not agreed as an
  HTTP contract**. It validates states, units, contextual identity, stages, records
  and provenance. It does not replace M21, a data repository or a hash verification.
- `data/research-mock.ts`: the only available stages case; synthetic and reproducible.
- `getResearchCase(false)`: returns explicit absence until the real reading is agreed on
  and connected. It does not call assumed endpoints nor return mocks as a fallback.

In API 0.1, quantity and identity per assessment cannot be verified: its values
can be inspected, but differences, comparative strokes and trend are blocked.
The assumed context of the demo catalog is marked as unverified. To enable
inference with HTTP data, the backend must deliver per-test evidence under an agreed
response. A change of `HEALTH_DATA_SOURCE` does not turn synthetic data
into real data.

The frontend's ingestion parser is strict for this 0.1 response: it rejects
undeclared fields or unknown versions, instead of discarding provenance and
relabeling it as synthetic. This requires coordinating any payload extension.
The shared contract and the backend consumers keep their current schemas.

## Exports and local review

Follow-up CSV: unrounded values, absence, quantity, role, identity,
IDs, origin, source, verification, calendar and version. The research CSV
adds stage, row, column, unit/state, original source date, time scope,
citation, hash when it exists, release and import profile. Text labels
are neutralized if they could be executed as formulas in a spreadsheet.

The prepared review incorporates a data and provenance annex, the selected
protocol and the version. A change of source or projection version alters the
current content and allows warning that it differs from the preserved local copy.
Preparing/exporting does not send information nor create an audited clinical record.

## Pending items that require data or team agreement

1. Restore the original MR080G and check hash and profile against the manifest.
2. Backend/M06: group canonical records into tests; preserve contextual subject,
   protocol, phase, stage, confirmed units, IDs and source time.
3. Agree on a new response with types, Zod, OpenAPI, examples and tests from both
   teams. The local model is a presentation proposal, not a unilateral change.
4. Connect that response in `data/service.ts`, with explicit errors and no fallback.
5. Resolve calendar/identity/protocol and have eligible independent tests
   available before enabling real longitudinal follow-up.
6. Domain review: performance criterion, peak identification and conditions
   of comparability. No thresholds, diagnoses or prescriptions were incorporated.

## Validation

Completed checks: `npm run check`, `npm run test:contracts` and
`npm run build`. Turbopack kept cached a port-opening failure of the
sandbox; the build passed after renewing that cache and running it with the required permissions.
The build configuration was not altered to avoid the error.

`tests/aerobic-evidence.test.ts` covers undeclared provenance, duplicate IDs,
identities from different studies, peak versus stage, unknown units/times,
API without verifiable evidence, protocol context, source changes in review,
one test/32 records, explicit peak selection, zero versus absences and CSV.

The Chromium verification covers protocol selection, excluded records,
context persistence between views, inspector, downloads, missing source state
and stages example. Widths of 320–1440 px, 200% text and dark theme are reviewed.

The design keeps the neutral and blue palette, system typography, tabular data and
states with text. The spatial reference guides clarity; it does not imply NASA
certification nor suitability for medical or operational use.
