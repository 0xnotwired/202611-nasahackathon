# Work order M02 — Mission

Phase F1 · wave 1 · level 0 · contracts version 0.3

**Goal.** Represent the mission configuration along its two axes: available equipment and communication mode.

**Owned paths.** `app/mission/`. Nothing outside them.

**Depends on.** M00 Foundation. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M3).

## Deliverables

- `validateConfig`, `hasEquipment`, `phaseAt`.

## Done when

- [ ] A configuration without `communication`, or with a value outside the three allowed, is rejected.
- [ ] `hasEquipment` returns `false` for equipment that is not listed; it never assumes it is there.
- [ ] `phaseAt` returns `null` outside every phase, not the nearest one.
- [ ] It passes the `mission` contract suite.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Deciding which procedure applies: that belongs to M13.

**The costliest mistake.** Assuming a piece of equipment is there when nobody knows enables a procedure that cannot be done.

**Skills.** validate-at-the-boundary, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
