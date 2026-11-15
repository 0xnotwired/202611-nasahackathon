# Work order M13 — Procedures

Phase F3 · wave 1 · level 2 · contracts version 0.3

**Goal.** Run guided procedures that respect the mission's equipment and keep what happened.

**Owned paths.** `app/procedures/`. Nothing outside them.

**Depends on.** M01 Core, M02 Mission, M04 Store. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/APPLIED_RESEARCH.md` (A01), `docs/PROPOSAL_IMPROVEMENTS.md` (M6).

## Deliverables

- `validateProcedure`, `availability`, `start`, `advance`, `interrupt`, `resume`, `finish`.
- Our own explicit state machine.

## Done when

- [ ] With missing equipment the execution is `blocked`, with the list of what is missing.
- [ ] `alternative_id` only appears if the procedure declares it; the engine infers none.
- [ ] An interrupted execution resumes at the same step and is not counted as completed.
- [ ] `could_not` stores the difficulties.
- [ ] Publishing version 2 of a procedure does not change the `procedure_version` of an earlier execution.
- [ ] Every disallowed transition returns an error; there is one test for each.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Writing clinical steps.
- Using or imitating XState or another state library.

**The costliest mistake.** Counting an interrupted procedure as done.

**Skills.** atomic-state-mutation, falsifiable-testing, invariant-hunting.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
