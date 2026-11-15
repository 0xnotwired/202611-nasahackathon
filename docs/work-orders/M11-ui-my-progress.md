# Work order M11 — My progress view

Phase F2 · wave 2 · level 1 · contracts version 0.3

**Goal.** Bring observations, measurements, actions and results together on one timeline.

**Owned paths.** `app/ui/my-progress/`. Nothing outside them.

**Depends on.** M06 Readings, M07 Base interface. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M3, M8).

## Deliverables

- `model.js` and `view.js` for My progress, with the mission phase as context.

## Done when

- [ ] The same record shows the same value, unit and origin as in the other views (cross-check of models).
- [ ] Each comparison with the baseline says how many measurements support it.
- [ ] The mission phase is shown as context and never with reassuring text.
- [ ] A correction appears next to the record it corrects; the original does not disappear.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Trends computed with filled-in gaps.

**The costliest mistake.** A continuous line over days without data invents a progression.

**Skills.** resilient-ui-states, non-overwhelming-ux.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
