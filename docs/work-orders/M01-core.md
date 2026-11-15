# Work order M01 — Core

Phase F1 · wave 1 · level 0 · contracts version 0.4

**Goal.** Define what a valid record is and when two records can be compared.

**Owned paths.** `app/core/`, and the record `docs/experiments/M01.md`. Nothing outside them.

**Depends on.** M00 Foundation. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M2), `docs/DATASETS.md` (integration limits).

## Deliverables

- `validateRecord`, `createRecord`, `areComparable` and the contract constants.
- Field-by-field validation with messages that name the field.

## Done when

- [ ] A record without `origin`, `method`, `time` or `subject` is rejected, naming the field.
- [ ] A `recorded` measurement without `value` or `unit` is rejected.
- [ ] A `not_recorded` record with a `value` is rejected: absence carries no number.
- [ ] The id `"007"` is kept as text; a numeric id is rejected.
- [ ] `areComparable` returns the reason when unit, method, variable or subject differ.
- [ ] No function converts one state into another.
- [ ] It passes the `core` contract suite.
- [ ] `ORIGINS` includes `terrestrial`, and a record with it validates.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M01.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M01-X1`, `M01-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M01-P1 | `validateRecord` on the valid sample with `origin` removed; repeat for `method`, `time` and `subject` | `{ ok: false }` with `error.field` equal to the removed field, four times | Delete the `origin` check: its test goes red |
| M01-P2 | `validateRecord({ …, state: "not_recorded", value: 0 })` | Rejected, `error.field` is `value` | Allow a value when the state is `not_recorded` |
| M01-P3 | Create a record with id `"007"`; then with id `7` | The first keeps `id === "007"`; the second is rejected | Coerce the id with `String()` or `Number()` |
| M01-P4 | `areComparable(a, b)` where only `method` differs; then with subject, variable, unit and method equal | `{ comparable: false }` with a reason that names `method`; then `{ comparable: true }` | Leave `method` out of the comparison (R3) |
| M01-P5 | For every state in `STATES`, `createRecord` with that state; then with the state `"x"` and with no state | The record comes back with the same state, for all three; `"x"` and a missing state are rejected | Default a missing state to `confirmed_none` (R1) |
| M01-P6 | `validateRecord` with `origin: "terrestrial"`, then with `origin: "ground"` | The first is valid; the second is rejected with `error.field` equal to `origin` | Accept any origin text |

## Out of scope

- Persistence.
- Any judgment about whether a value is normal.

**The costliest mistake.** Accepting too much is the serious mistake: a malformed record that gets in contaminates every view. When a field is doubtful, reject.

**Skills.** validate-at-the-boundary, honest-degradation, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
