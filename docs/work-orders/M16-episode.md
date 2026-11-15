# Work order M16 — Episode

Phase F4 · wave 1 · level 3 · contracts version 0.3

**Goal.** Assemble the care episode with its six parts from what is in the history.

**Owned paths.** `app/episode/`. Nothing outside them.

**Depends on.** M01 Core, M04 Store, M06 Readings, M13 Procedures. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/FINAL_PROPOSAL.md` (The copilot and the care episode).

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

## Out of scope

- Suggestions: they belong to M17.
- Export text: it belongs to M18.

**The costliest mistake.** An empty part that is left out reads as "nothing to report".

**Skills.** honest-degradation, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
