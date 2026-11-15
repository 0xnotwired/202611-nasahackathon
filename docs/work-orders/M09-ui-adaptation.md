# Work order M09 — Adaptation view

Phase F2 · wave 2 · level 1 · contracts version 0.3

**Goal.** Show strength, aerobic capacity and bone history together with the recorded exercise.

**Owned paths.** `app/ui/adaptation/`, and the record `docs/experiments/M09.md`. Nothing outside them.

**Depends on.** M06 Readings, M07 Base interface. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/APPLIED_RESEARCH.md` (A02–A04).

## Deliverables

- `model.js` and `view.js` for Adaptation.

## Done when

- [ ] An old bone exam appears as "last known assessment" with date and method.
- [ ] Results from different methods are not plotted on the same line.
- [ ] Exercise performed and the result of a physical test are in separate sections.
- [ ] No exam that requires ground equipment is suggested for repetition.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M09.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M09-X1`, `M09-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M09-P1 | Model for the scenario's old bone exam | Labeled "last known assessment", with its date, method and age in days | Label it as current |
| M09-P2 | Model for one variable measured with two methods | Two series, each named by its method; no series holds both | Group by variable only (R3) |
| M09-P3 | Model with exercise sessions and physical test results | Sessions under what was performed, results under results; no item in both | Put a session in the results section |
| M09-P4 | Model for an exam whose equipment is not in the configuration | No action offers to repeat it | Offer the action regardless of equipment |

## Out of scope

- Prescribing exercise.
- Estimating a current bone value.

**The costliest mistake.** Showing an old exam as the current state.

**Skills.** resilient-ui-states, honest-degradation.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
