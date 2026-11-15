# Work order M06 — Readings

Phase F2 · wave 1 · level 1 · contracts version 0.3

**Goal.** Answer the queries every view uses, so that the same data means the same thing in all of them.

**Owned paths.** `app/readings/`, and the record `docs/experiments/M06.md`. Nothing outside them.

**Depends on.** M01 Core, M04 Store. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M5, M8), `docs/EXTENDED_RESEARCH_B.md` (B07, B09).

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

## Experiments

Copy these predictions into `docs/experiments/M06.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M06-X1`, `M06-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M06-P1 | `series` over days 1–5 where day 3 has no record and day 4 is `not_recorded` | `points` has days 1, 2 and 5; `gaps` has days 3 and 4; `n` is 3; no point has value 0 | Put `0` where the value is missing (R2) |
| M06-P2 | `series` with two records taken with method A and one with method B | The three are never in one `points` list; `non_comparable_groups` has a group whose reason names `method` | Ignore `method` when grouping (R3) |
| M06-P3 | `latest` for a variable with no records | `{ record: null, age_days: null }` | Return an age of 0 |
| M06-P4 | `cumulative` over values 2 and 3 plus one `not_recorded` day; then over no data | `{ total: 5, n: 2, gaps: 1 }`; then `total` is `null` | Return 0 when there is no data (R2) |
| M06-P5 | `environment({ place: "A", interval })` with a record from place B inside the interval | Only the ids from place A; `coverage` names the sensors | Drop the place filter |
| M06-P6 | `series` for subject A with records of subject B in the store | No id of B in `points` or in any group | Drop the subject filter (R9) |

## Out of scope

- Deciding what is normal or concerning.
- HRV from a daily pulse reading.

**The costliest mistake.** An average that treats a gap as zero lowers the value and looks like an improvement or a decline that does not exist.

**Skills.** honest-degradation, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
