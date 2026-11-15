# Work order M06 — Readings

Phase F2 · wave 1 · level 1 · contracts version 0.3

**Goal.** Answer the queries every view uses, so that the same data means the same thing in all of them.

**Owned paths.** `app/readings/`. Nothing outside them.

**Depends on.** M01 Core, M04 Store. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M5, M8), `docs/EXTENDED_RESEARCH_B.md` (B07, B09).

## Deliverables

- `series`, `latest`, `baseline`, `environment`, `cumulative`.

## Done when

- [ ] A day without data appears in `gaps`, not as a point at zero.
- [ ] `series` separates into `non_comparable_groups` whatever was measured with another method or unit.
- [ ] `latest` returns `null` and age `null` when there is no data.
- [ ] `baseline` returns how many measurements exist and their range, without grading them.
- [ ] `environment` from another place is not returned as the subject's exposure.
- [ ] `cumulative` returns `total: null` with no data, and counts the gaps when there are some.
- [ ] There is no threshold constant anywhere in the module.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Deciding what is normal or concerning.
- HRV from a daily pulse reading.

**The costliest mistake.** An average that treats a gap as zero lowers the value and looks like an improvement or a decline that does not exist.

**Skills.** honest-degradation, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
