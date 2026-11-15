# Work order M10 — Habitat view

Phase F2 · wave 2 · level 1 · contracts version 0.3

**Goal.** Show the environmental conditions of the place and period, without turning them into personal exposure.

**Owned paths.** `app/ui/habitat/`. Nothing outside them.

**Depends on.** M06 Readings, M07 Base interface. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/APPLIED_RESEARCH.md` (A06), `docs/PROPOSAL_IMPROVEMENTS.md` (M5), `docs/EXTENDED_RESEARCH_B.md` (B15).

## Deliverables

- `model.js` and `view.js` for Habitat, with place, sensor and coverage for each reading.

## Done when

- [ ] A reading from another module of the spacecraft is labeled with its place and not attributed to the astronaut.
- [ ] Radiation, if shown, is cumulative dose with unit, dose type and coverage.
- [ ] The career limit **is not shown** while [V1 4030] remains unconfirmed; the code keeps it switched off by configuration.
- [ ] No environmental value is colored as a health state.
- [ ] No causal sentence appears between environment and symptom.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Personal cancer probability.
- Mixing absorbed, equivalent and effective dose.

**The costliest mistake.** A coincidence of dates presented as a cause.

**Skills.** claim-provenance-discipline, resilient-ui-states.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
