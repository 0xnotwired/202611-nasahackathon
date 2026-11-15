# Work order M08 — My health view

Phase F2 · wave 2 · level 1 · contracts version 0.3

**Goal.** Show the astronaut's symptoms, vital signs and rest with their context.

**Owned paths.** `app/ui/my-health/`. Nothing outside them.

**Depends on.** M06 Readings, M07 Base interface. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/FINAL_PROPOSAL.md`, `docs/APPLIED_RESEARCH.md` (A05).

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

## Out of scope

- Interpreting values.
- A body map with health-status colors.

**The costliest mistake.** A body area without measurement that shows up "in green" communicates health nobody measured.

**Skills.** resilient-ui-states, frontend-accessibility-by-construction.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
