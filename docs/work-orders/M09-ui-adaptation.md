# Work order M09 — Adaptation view

Phase F2 · wave 2 · level 1 · contracts version 0.3

**Goal.** Show strength, aerobic capacity and bone history together with the recorded exercise.

**Owned paths.** `app/ui/adaptation/`. Nothing outside them.

**Depends on.** M06 Readings, M07 Base interface. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/APPLIED_RESEARCH.md` (A02–A04).

## Deliverables

- `model.js` and `view.js` for Adaptation.

## Done when

- [ ] An old bone exam appears as "last known assessment" with date and method.
- [ ] Results from different methods are not plotted on the same line.
- [ ] Exercise performed and the result of a physical test are in separate sections.
- [ ] No exam that requires ground equipment is suggested for repetition.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Prescribing exercise.
- Estimating a current bone value.

**The costliest mistake.** Showing an old exam as the current state.

**Skills.** resilient-ui-states, honest-degradation.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
