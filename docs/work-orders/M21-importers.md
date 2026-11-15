# Work order M21 — NASA importers

Phase F5 · wave 1 · level 4 · contracts version 0.3

**Goal.** Read real NASA files without altering their values or mixing their subjects.

**Owned paths.** `app/importers/`. Nothing outside them.

**Depends on.** M01 Core, M04 Store. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/DATASETS.md`, `AGENTS.md` (Evidence and interface).

## Deliverables

- `importCRF` and `importAdaptation` for whichever study has been downloaded.

## Done when

- [ ] Imported values match the original file, checked row by row.
- [ ] `Test_Phase` is kept alongside the day.
- [ ] Free-text clinical comments are not imported and `skipped` says how many there were.
- [ ] An empty cell or `NA` produces `not_recorded`, never zero.
- [ ] A malformed row goes to `rejected` with its reason and does not stop the rest.
- [ ] Every record comes out with `origin: "ground_analog"` and the file's subject.
- [ ] The original files are in `data/originals/`, outside the repo.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Merging different studies as one person.
- Uploading NASA files to the repo.

**The costliest mistake.** A bed-rest participant shown as an astronaut record.

**Skills.** validate-at-the-boundary, data-provenance-mapping, untrusted-sample-handling, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
