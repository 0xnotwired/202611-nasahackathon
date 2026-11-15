# Work order M12 — My day view

Phase F2 · wave 2 · level 1 · contracts version 0.4

**Goal.** Be the entry screen: what is known today, what changed and what is pending.

**Owned paths.** `app/ui/my-day/`, and the record `docs/experiments/M12.md`. Nothing outside them.

**Depends on.** M06 Readings, M07 Base interface. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/FINAL_PROPOSAL.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M4).

## Deliverables

- `model.js` and `view.js` for My day, with access to "I feel different" and to the other views.

## Done when

- [ ] While `plan` answers "not implemented", the tasks section says "not available yet".
- [ ] Whatever is still missing today is listed as "not recorded".
- [ ] There is no global score or health traffic light.
- [ ] An episode's pending items appear grouped in a single alert.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M12.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M12-X1`, `M12-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M12-P1 | Model when `plan` answers `not_implemented` | The tasks section says "not available yet"; the other sections are ready | Let the error empty the whole view |
| M12-P2 | Model on a day with no sleep entry | Sleep is listed as "not recorded" | List it as "nothing new" (R1) |
| M12-P3 | List the model's keys | No score, total status or traffic-light field | Add a `score` field (R6) |
| M12-P4 | Model for an open episode with three pending items | Exactly one alert, which groups the three | Issue one alert per item |

## Out of scope

- Task logic: it belongs to M14.

**The costliest mistake.** An optimistic summary on the first screen makes the astronaut stop looking.

**Skills.** non-overwhelming-ux, resilient-ui-states.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
