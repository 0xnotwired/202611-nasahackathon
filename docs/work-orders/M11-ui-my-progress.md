# Work order M11 — My progress view

Phase F2 · wave 2 · level 1 · contracts version 0.4

**Goal.** Bring observations, measurements, actions and results together on one timeline.

**Owned paths.** `app/ui/my-progress/`, and the record `docs/experiments/M11.md`. Nothing outside them.

**Depends on.** M06 Readings, M07 Base interface. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M3, M8).

## Deliverables

- `model.js` and `view.js` for My progress, with the mission phase as context.

## Done when

- [ ] The same record shows the same value, unit and origin as in the other views (cross-check of models).
- [ ] Each comparison with the baseline says how many measurements support it.
- [ ] The mission phase is shown as context and never with reassuring text.
- [ ] A correction appears next to the record it corrects; the original does not disappear.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M11.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M11-X1`, `M11-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M11-P1 | For every record in the model, compare with `valueWithContext(record)` from the base interface | Equal value, unit and origin | Round or format the value locally |
| M11-P2 | Model of a comparison with the baseline when `n` is 4, then when `n` is 0 | The text states 4 measurements; with 0 no comparison is shown and the model says why | Hide `n` |
| M11-P3 | Model with a record and its correction | Both appear, linked; the original is still there | Filter out corrected originals (R7) |
| M11-P4 | Every text attached to the mission phase | None contains "normal", "expected" or "nothing to worry" | Add "this is normal in this phase" |

## Out of scope

- Trends computed with filled-in gaps.

**The costliest mistake.** A continuous line over days without data invents a progression.

**Skills.** resilient-ui-states, non-overwhelming-ux.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
