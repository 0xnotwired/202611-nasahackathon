# Current implementation and handoff state

Verified November15,2026. This is the consolidated current-state index;
AGENTS.md retains instruction authority, CONTRACTS.md defines interfaces,
and modules.csv records module status. Historical experiment runs and older
acquisition manifests remain evidence of their recorded time, not competing
current-state summaries.

## Branch, modules and next work

Continue from GitHub branch **main**. PR#3 (634a489) already integrated f2,
including implementation177c03e and documentatione51f830. The user explicitly
requested main as the continuation base. Create a feature/module branch
(e.g. mod/f2-claude) from current origin/main for new development. Always inspect current HEAD
and git status rather than assuming a remembered hash or clean checkout.
The english and f2 branches retain prior work; do not reset or overwrite
them. Parallel work should use distinct working branches.

- M00 and M01–M05 are implemented and independently reviewed; G0/G1 accepted
  by the user, F1 closed.
- M21 was explicitly advanced by user instruction and is implemented/reviewed.
  This does not close F2–F5 or implement the later product views.
- F2 built on mod/f2-claude (local commits, not pushed): M06 readings, M07 base
  interface, M08–M12 views, shared view kit, data-source selector, M22 view.
  Records M06–M12 and G2 are in docs/experiments/. Statuses in modules.csv are
  still `pending`: independent review of M08–M12 and acceptance of G2 are for a
  person. G2 evidence: 230 Node tests; g2.test.js; g2-browser.py (Chromium only).
  F3 built on the same branch (user-authorized): M13 procedures, M14 plan and the
  My plan and On board views (M15), records M13–M15 and G3, contract 0.13.
  271 Node tests; g3.test.js; g3-browser.py (Chromium only). Statuses still
  `pending`. Next: independent review of M08–M15, then person acceptance of G2/G3.
  Minimal versions added on the user's request: procedure registry and editor (M13/M15),
  privacy (M19), simulated sync and ground panel (M24); contract 0.14 and IndexedDB
  schema v2 (an existing profile is upgraded on its next open and keeps its data).
  Minimal F4 added on request: episode (M16), copilot (M17, no clinical rule shipped), summary
  (M18) and the "I feel different" view (M20); contract 0.15. 419 Node tests; g3-extras-browser.py and
  g4-browser.py. G5 (NASA cases) checked on top of all views: `g5.test.js` and `g5-browser.py` (real BUT CGM file when present). F6: `npm run package` writes `dist/orbita.html` (one file, 59 modules, a content security policy that forbids remote loads); `g6-browser.py` compares it with the served app and records requests. Not done: G6-W3's independent review and G6-W4 (people). The summary text is not transmitted (only records).
- Contract version 0.22; current record schema2, with unchanged legacy1 readers.

## What actually runs

The product has original domain modules, memory/IndexedDB storage, a
16-record deterministic synthetic scenario and a minimal HTTP module shell.
The standalone HTML mockups are design/demonstration artifacts, not the
implemented modular product UI. No clinical thresholds, generative copilot,
real-device integration, encryption, real sync or deployment is implied.

M21 exposes pure synchronous importCRF, importAdaptation and importGlucose.
Supported selected source profiles: CRF Campaign3, MR079G, MR035G, the exact
verified MR080G test, and BUT CGM1.0.0. They retain source identities, original
numeric values/absence, unit uncertainty and source clock precision, exclude
clinical comments, reject malformed rows and do not write a database.

The separate development command `python3 scripts/import-real-samples.py`
verified original-file custody and persisted3861 records in a dedicated
local Chromium profile/database: CRF791, MR079G12, MR035G10, MR080G32,
BUT CGM3016. Independent rerun inserted0 and retained3861; restart readback
compared all records exactly.226 nonempty excluded CRF comment cells were
counted without retaining their content. There is no product import screen.
This profile is separate from synthetic data and the shared browser session.

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
python3 tests/walkthrough/g0-browser.py
python3 tests/walkthrough/g1-browser.py
```

Current suite:100 passed,0 failed,0 skipped; docs/diff checks pass. Chromium156
verified HTTP modules, real IndexedDB persistence/restart, profile isolation
and explicit storage failure paths. File-origin CORS control remains unverified
because managed policy blocks navigation before CORS. These observations are
platform-specific, not clinical or universal-browser validation.

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
