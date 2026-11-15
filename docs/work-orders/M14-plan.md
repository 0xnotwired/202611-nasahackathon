# Work order M14 — Plan

Phase F3 · wave 1 · level 2 · contracts version 0.3

**Goal.** Keep track of assigned tasks and separate what was assigned, what was done and what was observed afterwards.

**Owned paths.** `app/plan/`. Nothing outside them.

**Depends on.** M01 Core, M04 Store. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/APPLIED_RESEARCH.md` (A02–A03).

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

## Out of scope

- Generating the plan: tasks come from the scenario or from a person.

**The costliest mistake.** Completing exercise does not prove recovery; merging them into a single value claims it does.

**Skills.** honest-degradation, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
