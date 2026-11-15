# Work order M22 — NASA cases view

Phase F5 · wave 2 · level 4 · contracts version 0.3

**Goal.** Explore the real cases in a viewer separate from the fictional scenario.

**Owned paths.** `app/ui/nasa-cases/`. Nothing outside them.

**Depends on.** M06 Readings, M07 Base interface, M21 NASA importers. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/DATASETS.md`.

## Deliverables

- View with file loading, exploration by subject and phase, and a study card.

## Done when

- [ ] No imported data appears in the synthetic astronaut's views.
- [ ] Every screen states the study, that it is a ground analog, and the subject.
- [ ] One subject cannot be overlaid on another as if they were the same.
- [ ] An invalid file shows which rows were rejected and why.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Comparing the cases with the synthetic scenario.

**The costliest mistake.** Mixing the real and the fictional on the same screen.

**Skills.** resilient-ui-states, claim-provenance-discipline.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
