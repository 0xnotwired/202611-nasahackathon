# Work order M03 — Catalogs

Phase F1 · wave 1 · level 0 · contracts version 0.4

**Goal.** Gather the reference data: "I feel different" observations, variables, equipment and sources.

**Owned paths.** `app/catalogs/`, and the record `docs/experiments/M03.md`. Nothing outside them.

**Depends on.** M00 Foundation. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M1), `docs/EXTENDED_RESEARCH_B.md` (B01–B06), `docs/RESEARCH_MATRIX_B.csv`.

## Deliverables

- `observations()`, `variables()`, `equipment()`, `sources()`.
- Observations catalog: skin, congestion, headache, back pain, sleep, nausea or dizziness, fatigue, vision and "other".
- Every source with its `reading_level` taken from the matrix.

## Done when

- [ ] Every observation has at least one source that exists in `sources()`.
- [ ] Fatigue and vision cite S09 and S12, not B01.
- [ ] No entry names a diagnosis or carries a range of normal values.
- [ ] A test walks the catalog and fails if a nonexistent source appears.
- [ ] `variables()` includes `glucose` (unit mg/dL or mmol/L, as recorded; no conversion) and `mood` (self_report, team scale 1–5, labeled "not validated, not a screening").
- [ ] No item of a published mood or depression questionnaire is reproduced.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M03.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M03-X1`, `M03-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M03-P1 | Walk `observations()` and look up every `source_ids` entry in `sources()` | Every id is found | Add an observation that cites `B99` |
| M03-P2 | Read the entries for fatigue and for vision | Fatigue cites S09, vision cites S12, neither cites B01 | Change the source of fatigue to B01 |
| M03-P3 | A test reads `docs/RESEARCH_MATRIX_B.csv` and compares `reading_level` with `sources()` | Equal for every B source in the catalog | Change one level in the catalog |
| M03-P4 | List the keys of every entry of `variables()` and `observations()` | Exactly the keys in the contract; none named like a range, limit or normal value | Add `normal_range` to one entry (R6) |
| M03-P5 | Read the `mood` entry of `variables()` | Its label says it is a team scale, not validated, not a screening; it has no score field | Rename it to a published instrument's name |

## Out of scope

- Inventing sources, authors or figures: only what is already in `docs/`.
- Copilot rules.

**The costliest mistake.** A catalog without sources looks like a validated clinical instrument, and it is not.

**Skills.** claim-provenance-discipline, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
