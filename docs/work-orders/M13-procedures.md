# Work order M13 — Procedures

Phase F3 · wave 1 · level 2 · contracts version 0.4

**Goal.** Run guided procedures that respect the mission's equipment and keep what happened.

**Owned paths.** `app/procedures/`, and the record `docs/experiments/M13.md`. Nothing outside them.

**Depends on.** M01 Core, M02 Mission, M04 Store. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/APPLIED_RESEARCH.md` (A01), `docs/PROPOSAL_IMPROVEMENTS.md` (M6).

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

## Experiments

Copy these predictions into `docs/experiments/M13.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M13-X1`, `M13-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M13-P1 | `start` with a configuration that lacks one required item | State `blocked`; `missing` is exactly that item; no record is created | Start anyway |
| M13-P2 | `availability` for a procedure with no `documented_alternative`, then for one that declares it | No `alternative_id`; then exactly the declared id | Pick an alternative by matching titles |
| M13-P3 | `start`, `advance` twice, `interrupt`, `resume` | `current_step` is 2 and the state is `in_progress`; the state was never `completed` | Reset the step on `resume`; mark `completed` on `interrupt` |
| M13-P4 | `start` with version 1, publish version 2 of the same procedure, read the execution | `procedure_version` is 1 | Read the version from the current procedure (R5) |
| M13-P5 | Each transition the contract does not allow, listed by hand in the test and not imported from the module | Each returns `ok: false` and leaves the state unchanged | Allow one of them: its own test goes red |
| M13-P6 | `finish` with `could_not` and one difficulty | State `could_not`; the stored difficulty is equal to the one given | Drop the difficulties |

## Out of scope

- Writing clinical steps.
- Using or imitating XState or another state library.

**The costliest mistake.** Counting an interrupted procedure as done.

**Skills.** atomic-state-mutation, falsifiable-testing, invariant-hunting.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
