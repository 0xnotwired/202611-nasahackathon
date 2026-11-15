# Work order M12 — My day view

Phase F2 · wave 2 · level 1 · contracts version 0.3

**Goal.** Be the entry screen: what is known today, what changed and what is pending.

**Owned paths.** `app/ui/my-day/`. Nothing outside them.

**Depends on.** M06 Readings, M07 Base interface. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/FINAL_PROPOSAL.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M4).

## Deliverables

- `model.js` and `view.js` for My day, with access to "I feel different" and to the other views.

## Done when

- [ ] While `plan` answers "not implemented", the tasks section says "not available yet".
- [ ] Whatever is still missing today is listed as "not recorded".
- [ ] There is no global score or health traffic light.
- [ ] An episode's pending items appear grouped in a single alert.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Task logic: it belongs to M14.

**The costliest mistake.** An optimistic summary on the first screen makes the astronaut stop looking.

**Skills.** non-overwhelming-ux, resilient-ui-states.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
