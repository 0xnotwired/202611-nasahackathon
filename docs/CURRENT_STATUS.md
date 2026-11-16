# Current implementation and handoff state

Verified November 16, 2026. This is the consolidated current-state index; AGENTS.md retains instruction authority, CONTRACTS.md defines interfaces, modules.csv records module status and [AUDIT.md](AUDIT.md) lists, layer by layer, what is open and why. Historical experiment runs and older acquisition manifests remain evidence of their recorded time, not competing current-state summaries.

## Branch and state

The delivered state is on the GitHub branch **final-claude**, built on mod/f2-claude (which was never pushed) from the integrated `main`. Always inspect the current HEAD and `git status` instead of assuming a remembered hash. `main`, `english`, `f2` and `claude` keep earlier work; do not reset or overwrite them.

- Contract version 0.22; record schema 2 with unchanged legacy 1 readers; IndexedDB schema v3 (a v1 or v2 profile is upgraded on its next open and keeps its data).
- 26 modules (M00–M25). Every module is `pending` in modules.csv except those the user accepted earlier (M00–M05, M21): independent review by agents happened for F3, F4 and F5 and is summarised in AUDIT.md; **no layer after F1 has been accepted by a person**.
- 419 Node tests (`npm test`), `check_docs.py` OK, and browser walkthroughs for every gate (Chromium only, no screen reader, no second browser engine).

## What runs

The modular product: `npm run serve` serves it over HTTP; `npm run package` writes `dist/orbita.html`, one file that opens from `file://` and makes no network request. Views: My health, Adaptation, Habitat, My progress, My day, My plan, On board, I feel different, NASA cases, Review and export, Ground panel (simulated sync). Data sources: a synthetic demo (fictional, in memory) and "My records" (IndexedDB; recording stays off until the person states where their entries come from). NASA files load only in "NASA cases", in a store of their own; a person may keep a file on the device (opt-in, not encrypted).

The copilot ships **no clinical rule**. One fictional rule with status `demo` exists for the synthetic source only, so the suggestion path can be seen working; a person can load a rules file, and the screen says the app cannot verify a rule's declared review status.

The teammate's Next.js frontend lives in `frontend/` as a separate server edition ([how it relates](../frontend/INTEGRATION.md)); its useful parts were ported into the main app as M25.

The standalone HTML mockups under `demo/` are design artifacts, not the product UI. No clinical thresholds, generative model, real-device integration, encryption, real sync or deployment is implied.

## Open, in one place

Real guidance rules (nobody has supplied any); the volunteer test (G6-W4); other browsers and screen readers; units for CRF and MR035G and the immune denominators; omics adapters; MR080G beyond its one verified test; PhysioNet use is provisional under the user's decision, not an organizer answer; the teammate's backend does not read the main app's store; acceptance of every gate after G1 by a person. The reasons and the evidence are in [AUDIT.md](AUDIT.md) and in each experiment record's "Not verified".

## Datasets, evidence and remaining limits

Fourteen source profiles are prepared. The three quantitative OSD51/56 ZIPs
are acquired and all170 GenePix plus10 Agilent files structurally inspected;
raw member references match ISA metadata exactly. GPR has three channel-header
variants; five Agilent files omit optional GeneName. Raw scanner values are
not assumed to be the separately documented normalized/log-transformed data.

CRF physical units, selected MR035G BMD units and the immune assay's scale/
denominator/export binding remain unconfirmed. Related primary NASA papers
were read but did not establish those exact assignments; some requested final
papers encountered a browser challenge. Preserve unknowns, never infer units
from customary practice or magnitude. MR080G units are confirmed only for
its exact source-linked test. Calendar ordering is source-corroborated where
recorded; unknown zones and shifted/relative clocks are not invented UTC.

Eight NLSP study-specific CC0 declarations are verified. Direct OSDR terms
and linked SMD policy are read, with study citation/acknowledgment requirements.
PhysioNet licenses are retained: BUT CGM CC BY4.0; ACTES/ITBA ODC Attribution1.0.
The user explicitly permits provisional use, retaining all conditions and
removing affected datasets if the organization declines. No official answer
or acceptance is claimed. Real charts/exports must retain applicable notices.

Aggregate, protocol-relative, shifted-UTC-context and omics adapters remain
unsupported by current M21 APIs; don't coerce them into patient Records.
Product views, final archive/media review and M23 packaging are pending.

## Reproduce and verify

```bash
npm test
python3 scripts/check_docs.py
npm run package && python3 tests/walkthrough/g6-browser.py
python3 tests/walkthrough/g5-real-browser.py      # needs data/originals (outside git)
```

Browser scripts need Python Playwright and a Chromium (`ORBITA_CHROMIUM`); their findings are platform-specific, not clinical or universal-browser validation. File-origin CORS remains unverified because the managed policy blocks navigation before CORS.

For real import, originals and preinstalled development Chromium/Playwright
must be available. Use [local data restoration](LOCAL_DATA_RESTORE.md).
Original files, data/imported/, data/local-import-profile/ and Python caches
are ignored and are not downloaded by cloning GitHub. A new machine must
restore original files and generate its own IndexedDB profile; never claim
those local3861 records exist just because the code was cloned. Fixed source
hashes and the loading script verify that workflow before reporting success.
The script currently expects Linux /usr/bin/chromium; do not pretend another
OS/browser setup is already verified or silently install product dependencies.

## Primary evidence

- [Module/importer experiment](experiments/M21.md)
- [Actual local persistence and negative controls](experiments/REAL_IMPORT.md)
- [Technical source resolution](DATA_TECHNICAL_RESOLUTION.md)
- [Primary-paper unit investigation](SOURCE_PAPER_UNITS.md)
- [Genetic archive/measurement inspection](GENETIC_DATA_INSPECTION.md)
- [Source-specific preparation profiles](DATA_IMPORT_PREPARATION.md)
- [Licenses/event conditions](SPACE_APPS_DATA_REVIEW.md) and [attributions](DATA_ATTRIBUTIONS.md)

Do not carry transient /tmp logs, running processes, local authentication or
network grants to another machine by assumption. Git commit/push and
environment publication are distinct actions requiring task authorization;
the current task authorizes main integration/documentation publication, not deployment.

Portable agent instructions: [Claude Code continuation prompt](CLAUDE_CONTINUATION_PROMPT.md).

## The teammate's frontend

`frontend/` is a separate Next.js prototype with its own Node backend, translated to English and moved onto the main app's record model (its contract 0.2). See `frontend/INTEGRATION.md` for the decisions, the model comparison and what is still open. Use `npm run frontend:install`, then `npm run frontend:dev` and `npm run frontend:backend`, or `npm run frontend:check`. The main app's `npm test` does not run it.
