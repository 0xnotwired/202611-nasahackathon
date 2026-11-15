# Work order M14 — Plan

Phase F3 · wave 1 · level 2 · contracts version 0.3

**Goal.** Keep track of assigned tasks and separate what was assigned, what was done and what was observed afterwards.

**Owned paths.** `app/plan/`, and the record `docs/experiments/M14.md`. Nothing outside them.

**Depends on.** M01 Core, M04 Store. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/APPLIED_RESEARCH.md` (A02–A03).

## Deliverables

- `tasksFor`, `mark`, `linkResult`.

## Done when

- [ ] Marking a task as done does not create or imply a result.
- [ ] An unmarked task stays `pending`; it never turns into `not_done` by itself.
- [ ] `not_done` accepts a structured note with the reason.
- [ ] Each task keeps who assigned it.
- [ ] A periodic exam is not scheduled daily.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M14.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M14-X1`, `M14-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M14-P1 | `mark` a task as `done`, then count records | `result_ids` is still empty and the number of records did not change | Create a result record on `done` |
| M14-P2 | `tasksFor` the day after an unmarked task | Its `completion` is `pending` | Turn old tasks into `not_done` |
| M14-P3 | `mark` as `not_done` with a note | The note is stored and `assigned_by` is unchanged | Drop the note |
| M14-P4 | `linkResult` on a `pending` task | `result_ids` holds the id and `completion` is still `pending` | Set `done` when a result is linked |

## Out of scope

- Generating the plan: tasks come from the scenario or from a person.

**The costliest mistake.** Completing exercise does not prove recovery; merging them into a single value claims it does.

**Skills.** honest-degradation, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
