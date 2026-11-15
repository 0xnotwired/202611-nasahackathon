# Work order M22 — NASA cases view

Phase F5 · wave 2 · level 4 · contracts version 0.4

**Goal.** Explore the real cases in a viewer separate from the fictional scenario.

**Owned paths.** `app/ui/nasa-cases/`, and the record `docs/experiments/M22.md`. Nothing outside them.

**Depends on.** M06 Readings, M07 Base interface, M21 NASA importers. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/DATASETS.md`.

## Deliverables

- View with file loading, exploration by subject and phase, and a study card.

## Done when

- [ ] No imported data appears in the synthetic astronaut's views.
- [ ] Every screen states the study, that it is a ground analog, and the subject.
- [ ] One subject cannot be overlaid on another as if they were the same.
- [ ] An invalid file shows which rows were rejected and why.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M22.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M22-X1`, `M22-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M22-P1 | After an import, query the synthetic subject through `readings` | No imported id comes back | Assign imported records to the synthetic subject (R9) |
| M22-P2 | Walk every screen model of the view | Each names the study, says "ground analog" and names the subject | Drop the origin label (R4) |
| M22-P3 | Select two subjects | Two separate series; never one | Merge them into one series (R9) |
| M22-P4 | Load a file with two bad rows | The model lists both rows with their reasons | Show only a count |

## Out of scope

- Comparing the cases with the synthetic scenario.

**The costliest mistake.** Mixing the real and the fictional on the same screen.

**Skills.** resilient-ui-states, claim-provenance-discipline.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
