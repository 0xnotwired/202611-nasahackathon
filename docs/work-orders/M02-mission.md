# Work order M02 — Mission

Phase F1 · wave 1 · level 0 · contracts version 0.4

**Goal.** Represent the mission configuration along its two axes: available equipment and communication mode.

**Owned paths.** `app/mission/`, and the record `docs/experiments/M02.md`. Nothing outside them.

**Depends on.** M00 Foundation. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M3).

## Deliverables

- `validateConfig`, `hasEquipment`, `phaseAt`.

## Done when

- [ ] A configuration without `communication`, or with a value outside the three allowed, is rejected.
- [ ] `hasEquipment` returns `false` for equipment that is not listed; it never assumes it is there.
- [ ] `phaseAt` returns `null` outside every phase, not the nearest one.
- [ ] It passes the `mission` contract suite.
- [ ] `environment` outside the four values is rejected; `attention_criteria` entries without `defined_by`, `source`, `review_status`, or with neither `low` nor `high`, are rejected.
- [ ] `gravity_note` is accepted as text and nothing reads it as a number.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M02.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M02-X1`, `M02-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M02-P1 | `validateConfig` with `communication: "sometimes"`, and with the field missing | Both rejected, `error.field` is `communication` | Accept any text |
| M02-P2 | `hasEquipment` for an id in the list, one not in the list, and one not in the catalog | `true`, `false`, `false` | Return `true` for an unknown id |
| M02-P3 | `phaseAt` at a time before the first phase and after the last | `null` both times | Fall back to the nearest phase |
| M02-P4 | `validateConfig` with `environment: "moon"`; then with an `attention_criteria` entry that has no `source` | Both rejected, naming `environment` and `source` | Accept the entry without `source` |
| M02-P5 | `validateConfig` with a criterion that has neither `low` nor `high` | Rejected, naming the criterion | Accept an empty criterion |

## Out of scope

- Deciding which procedure applies: that belongs to M13.

**The costliest mistake.** Assuming a piece of equipment is there when nobody knows enables a procedure that cannot be done.

**Skills.** validate-at-the-boundary, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
