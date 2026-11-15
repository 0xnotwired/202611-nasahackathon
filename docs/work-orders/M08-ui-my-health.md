# Work order M08 — My health view

Phase F2 · wave 2 · level 1 · contracts version 0.4

**Goal.** Show the astronaut's symptoms, vital signs and rest with their context.

**Owned paths.** `app/ui/my-health/`, and the record `docs/experiments/M08.md`. Nothing outside them.

**Depends on.** M06 Readings, M07 Base interface. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/FINAL_PROPOSAL.md`, `docs/APPLIED_RESEARCH.md` (A05).

## Deliverables

- `model.js` and `view.js` for My health, with recording of a measurement or of "nothing new".

## Done when

- [ ] Scheduled rest, sleep self-report and estimated sleep appear as three different things.
- [ ] A variable without data says "not recorded", not a dash or a zero.
- [ ] Recording "nothing new" creates a `confirmed_none` record.
- [ ] Every value shows method, time and origin using the M07 components.
- [ ] The model is tested in Node with the synthetic scenario.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M08.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M08-X1`, `M08-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M08-P1 | Model for a subject with scheduled rest, a sleep self-report and an estimated sleep value on the same night | Three separate entries, each with its method; none merged | Group by variable only (R3) |
| M08-P2 | Model for a variable with no data | The entry's text is "not recorded" and its value is `null`, not `0` or a dash | Render 0 (R2) |
| M08-P3 | Run the "nothing new" action and list the store | Exactly one new record, with state `confirmed_none` and no value | Create a `recorded` record with value 0 |
| M08-P4 | Walk every value in the model | Each has a non-empty method, time and origin | Drop `origin` (R4) |

## Out of scope

- Interpreting values.
- A body map with health-status colors.

**The costliest mistake.** A body area without measurement that shows up "in green" communicates health nobody measured.

**Skills.** resilient-ui-states, frontend-accessibility-by-construction.

Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
