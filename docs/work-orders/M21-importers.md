# Work order M21 — NASA importers

Phase F5 · wave 1 · level 4 · contracts version 0.4

**Goal.** Read real NASA files without altering their values or mixing their subjects.

**Owned paths.** `app/importers/`, and the record `docs/experiments/M21.md`. Nothing outside them.

**Depends on.** M01 Core, M04 Store. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/DATASETS.md`, `AGENTS.md` (Evidence and interface).

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
- [ ] `importGlucose` produces `origin: "terrestrial"`, variable `glucose`, the file's unit, and `not_recorded` for empty or NaN; the citation of BUT CGM travels with the records' `source`.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M21.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M21-X1`, `M21-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M21-P1 | Import a small file written by hand for the test, in the shape of the CRF, with known values | Each record's value equals the value written by hand in the test, row by row | Read the wrong column |
| M21-P2 | A row with an empty cell and one with `NA` | State `not_recorded` and no value, both times; never 0 | Convert with `Number("")`, which gives 0 (R2) |
| M21-P3 | A row whose subject is `007` | `subject` is `"007"` | Convert the subject with `Number()` |
| M21-P4 | A malformed row between two valid ones | It is in `rejected` with a reason; the other two are imported | Throw on the first bad row |
| M21-P5 | A file with a free-text comment column | No record holds that text; `skipped` equals the number of comment cells | Import the comment as `note` |
| M21-P6 | Read `origin`, `subject` and `mission_phase` of every imported record | `ground_analog`, the file's subject, and the row's `Test_Phase` | Default the origin to `synthetic` (R4) |
| M21-P7 | With the real file in `data/originals/`: compare imported values with the file | Equal row by row. If the file is not there, the record says "not verified against a real file" | — |
| M21-P8 | Import a hand-written glucose file in the BUT CGM shape with one NaN and one empty value | Two `not_recorded` records with no value; every record `terrestrial`; `source` points to BUT CGM | Parse NaN as 0 (R2) |

## Out of scope

- Merging different studies as one person.
- Uploading NASA files to the repo.

**The costliest mistake.** A bed-rest participant shown as an astronaut record.

**Skills.** validate-at-the-boundary, data-provenance-mapping, untrusted-sample-handling, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
