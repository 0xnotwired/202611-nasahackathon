# Source-uncertainty change order

User request: resolve CRF units and preserve dates lacking timezone, 2026-11-15.
Orchestrator owns contract0.7; implementation change order explicitly covers
core, store, mission/scenario compatibility and their reusable/gate tests.
No other pending documentation changes may be overwritten. No publication,
configuration edits, author messages, commits or pushes are authorized here.

## Predictions (before implementation)

| Id | Expected behavior | Negative control |
|---|---|---|
| SU-P1 | Schema1 UTC records remain readable, unchanged through both stores | Reject or rewrite version1 |
| SU-P2 | Schema2 date/local/shifted source time round-trips unchanged with time:null | Convert to UTC or invent midnight |
| SU-P3 | Invalid calendar/offset/contradictory metadata rejected; callbacks do not overwrite source time | Skip source validation or use clock result |
| SU-P4 | Unit-null requires explicit unknown status and forbids comparability | Treat two null units as comparable |
| SU-P5 | UTC window on matching unknown-time record returns unresolved_time; other subjects isolated | Silently drop unknowns or ignore equality scope |
| SU-P6 | New schema2 fixtures and all existing contracts/gates/browser persistence pass | Accept future version3 |

## Runs

RUN (builder, orchestrator and independent reviewer, November15):
`node --test` passes87 tests, zero failures/skips. This extends the original
83-test F1 baseline with source uncertainty/calendar/minute cases.
`python3 scripts/check_docs.py` and `git diff --check` pass.

BROWSER: `python3 app/store/browser-check.py` passes memory and realIndexedDB,
restart recovery, fresh-profile isolation, future-version refusal and private
context checks. `python3 tests/walkthrough/g1-browser.py` passes in
Chromium156.0.8078.79, including the shared store suite against IndexedDB,
exact reads of legacy1 UTC and new2 source-time/unit records after browser
restart, future3 rejection and explicit unavailable-storage handling.
Builder also reran the existing G0 browser check; HTTP loading passes.
The inherited managed-policy file-origin CORS control remains unverified.

The parent independently reran87 Node tests and documentation/diff checks.
No packages/dependencies, importer, clinical interpretation or product view
were added. The synthetic scenario now emits schema2 through the core
constant; no source records were silently migrated.

## Negative controls

RUN: Builder observed the new preservation/calendar/minute assertions fail
before implementation. Temporary removal of unknown-unit comparison refusal
made its assertion fail; disabling the store unresolved-time guard made the
UTC-window assertion fail. Product sources were restored and the suite rerun.
Reviewer independently detected a disposable unknown-unit-guard mutation.

The independent reviewer found two issues before final acceptance: CRF
`Vitals Time` has minute precision, absent from the initial date/second
model; the standalone browser checker still injected version2 as a supposedly
future schema. Minute preservation was added with a failing-first test,
and the checker now injects future3. Both reruns pass.

## Refuted and surprises

Source metadata can remain genuinely unknown. Model support must not be
reported as confirmation of physical units or original UTC offsets.

## Not verified

No M21 importer or M06/M07 product view is implemented by this change.

## Replication

RUN: A separate reviewer who did not implement the change reran87 Node tests,
the standalone store browser checker, G1 browser and documentation checker.
Additional controls verified Gregorian leap boundaries (2000 versus2100),
invalid dates, source-clock scope separation, exact legacy1 memory reads,
and equality-first UTC query isolation by id, origin, schema, variable and
subject. Matching unresolved time returns the explicit error. Minute
precision accepts canonical09:40 without invented seconds and rejects
second components or out-of-range values. No outstanding material product
finding remained after the two corrections above.

Local investigation logs: `/tmp/source-time-implementation-log.txt` and
`/tmp/source-time-review.txt`; these are ephemeral. This tracked record and
the executable test cases retain the reproducible evidence.

## Source facts and limits

SOURCE: The exact CRF CSV plus official experiment, dataset and file metadata
were reviewed. The dataset parameter list supplies names without units;
linked experiment documents are absent. Weight, Body Temp, Height, Pulse,
SysBP, DiaBP and Resp Rate units remain unconfirmed. Supporting unit:null
with explicit unknown status permits preservation, not interpretation or
conversion. No source dictionary was invented or provider contacted.

NASA timezone and calendar-shifting semantics remain unestablished; calendar
unknown is supported and prevents comparison. MR079G slash dates are also
ambiguous in this12-row sample: retain raw text in staging until format
evidence exists. BUT CGM dates are participant-shifted, timezone unknown;
scopes must separate participants. See the readiness manifest for sources.
Rights/citations were verified separately and are not reopened by this task.
No commit, push, environment publication or gate approval was performed.

Skills applied: local versioned-schema-evolution (explicit schema2 and
unchanged legacy1 readers), falsifiable-testing (red/green and mutations),
with independent review required by AGENTS.md. All product code is original
and no skill helper or author companion implementation was copied into app/.
