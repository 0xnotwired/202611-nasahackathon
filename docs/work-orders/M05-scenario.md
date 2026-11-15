# Work order M05 — Synthetic scenario

Phase F1 · wave 2 · level 0 · contracts version 0.3

**Goal.** Generate the demo's fictional case: one astronaut, three domains, two mission configurations.

**Owned paths.** `app/scenario/`. Nothing outside them.

**Depends on.** M01 Core, M02 Mission, M03 Catalogs. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/FINAL_PROPOSAL.md` (Proposed demo), `docs/DATASETS.md`.

## Deliverables

- Deterministic `generateScenario({ seed })`.
- Data with gaps, an old bone exam, an environment reading from another module of the spacecraft, an unfinished task and `confirmed_none` weeks.
- Two `MissionConfig` objects: one with the procedure's equipment and one without it; one in real time and one delayed.
- A procedure with `review_status: "demo"` and steps without clinical content.

## Done when

- [ ] The same seed produces exactly the same data.
- [ ] Every record passes `validateRecord` and carries `origin: "synthetic"`.
- [ ] No value comes from a NASA dataset.
- [ ] There is at least one record in each of the three states.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Real medical steps.
- Values that look like thresholds.

**The costliest mistake.** Unlabeled fictional data can be presented as evidence.

**Skills.** deterministic-core, claim-provenance-discipline.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
