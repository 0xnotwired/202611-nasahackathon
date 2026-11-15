# Work order M01 — Core

Phase F1 · wave 1 · level 0 · contracts version 0.3

**Goal.** Define what a valid record is and when two records can be compared.

**Owned paths.** `app/core/`. Nothing outside them.

**Depends on.** M00 Foundation. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M2), `docs/DATASETS.md` (integration limits).

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
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Persistence.
- Any judgment about whether a value is normal.

**The costliest mistake.** Accepting too much is the serious mistake: a malformed record that gets in contaminates every view. When a field is doubtful, reject.

**Skills.** validate-at-the-boundary, honest-degradation, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
