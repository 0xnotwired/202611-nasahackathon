# Work order M10 — Habitat view

Phase F2 · wave 2 · level 1 · contracts version 0.3

**Goal.** Show the environmental conditions of the place and period, without turning them into personal exposure.

**Owned paths.** `app/ui/habitat/`, and the record `docs/experiments/M10.md`. Nothing outside them.

**Depends on.** M06 Readings, M07 Base interface. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/APPLIED_RESEARCH.md` (A06), `docs/PROPOSAL_IMPROVEMENTS.md` (M5), `docs/EXTENDED_RESEARCH_B.md` (B15).

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

## Experiments

Copy these predictions into `docs/experiments/M10.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M10-X1`, `M10-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M10-P1 | Model with an environment reading from another place of the spacecraft | It carries its place and is not in the astronaut's own section | Attribute readings by time only |
| M10-P2 | Model with the default configuration, serialized to text | No career limit field and no `600` anywhere | Switch the limit on by default |
| M10-P3 | Every text the model produces | None contains "because", "caused" or "due to", and no field grades a value as a health state | Add the sentence "due to CO₂" (R6) |
| M10-P4 | Radiation section with records, then with none | A total with unit, dose type and coverage; then "not recorded", not 0 | Show 0 when there is no data (R2) |

## Out of scope

- Personal cancer probability.
- Mixing absorbed, equivalent and effective dose.

**The costliest mistake.** A coincidence of dates presented as a cause.

**Skills.** claim-provenance-discipline, resilient-ui-states.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
