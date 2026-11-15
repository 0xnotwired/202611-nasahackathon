# Work order M16 — Episode

Phase F4 · wave 1 · level 3 · contracts version 0.3

**Goal.** Assemble the care episode with its six parts from what is in the history.

**Owned paths.** `app/episode/`, and the record `docs/experiments/M16.md`. Nothing outside them.

**Depends on.** M01 Core, M04 Store, M06 Readings, M13 Procedures. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/FINAL_PROPOSAL.md` (The copilot and the care episode).

## Deliverables

- `open`, `situation`, `link`, `close`.

## Done when

- [ ] `situation` returns the six parts even if one is empty, and the empty one says why.
- [ ] `missing` includes `not_recorded` variables and missing equipment.
- [ ] `we_know` includes no data from another subject or environment from another place.
- [ ] `happened` distinguishes completed, interrupted and could not.
- [ ] Closing and reopening the app restores the episode unchanged (with a persistent store).
- [ ] `alert_issued` turns true only once.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M16.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M16-X1`, `M16-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M16-P1 | `situation` for an episode with nothing linked | Exactly the six parts; each empty one carries a reason | Leave empty parts out |
| M16-P2 | Episode of subject A; the store also holds B's records and an environment reading from another place | `we_know` has only A's ids and only the same place | Drop the subject filter (R9) |
| M16-P3 | Episode with a `not_recorded` variable and a procedure whose equipment is absent | `missing` lists that variable and that equipment | Treat `not_recorded` as nothing to report (R1) |
| M16-P4 | Issue the episode's alert twice, close the store, reopen | `alert_issued` is `true`; the second call changes nothing; it is still `true` after reopening | Reset the flag on reopen |
| M16-P5 | Link one completed, one interrupted and one `could_not` execution | `happened` shows three items with three different states | Reduce them to done and not done |

## Out of scope

- Suggestions: they belong to M17.
- Export text: it belongs to M18.

**The costliest mistake.** An empty part that is left out reads as "nothing to report".

**Skills.** honest-degradation, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
