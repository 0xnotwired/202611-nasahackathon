# Work order M05 — Synthetic scenario

Phase F1 · wave 2 · level 0 · contracts version 0.4

**Goal.** Generate the demo's fictional case: one astronaut, three domains, two mission configurations.

**Owned paths.** `app/scenario/`, and the record `docs/experiments/M05.md`. Nothing outside them.

**Depends on.** M01 Core, M02 Mission, M03 Catalogs. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/FINAL_PROPOSAL.md` (Proposed demo), `docs/DATASETS.md`.

## Deliverables

- Deterministic `generateScenario({ seed })`.
- Data with gaps, an old bone exam, an environment reading from another module of the spacecraft, an unfinished task and `confirmed_none` weeks.
- Two `MissionConfig` objects: one with the procedure's equipment and one without it; one in real time and one delayed.
- A procedure with `review_status: "demo"` and steps without clinical content.

## Done when

- [ ] The same seed produces exactly the same data.
- [ ] Every record passes `validateRecord` and carries `origin: "synthetic"`.
- [ ] No value comes from a NASA dataset.
- [ ] There is at least one record in each of the three states.
- [ ] The scenario includes one configuration per environment (station, spacecraft, rover, surface base) and synthetic `mood` records.
- [ ] At most two variables carry demo attention criteria, each with `review_status: "demo"` and `defined_by: "team demo"`.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M05.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M05-X1`, `M05-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M05-P1 | `generateScenario({ seed: 1 })` twice, and once with `seed: 2` | The two with seed 1 serialize to identical text; seed 2 gives different text | Use `Math.random()` or the clock anywhere: the first assertion goes red |
| M05-P2 | Run `validateRecord` on every record and read its `origin` | All valid; every `origin` is `synthetic` | Set one record's origin to `flight` (R4) |
| M05-P3 | Count records by state, by `place` among `environment` records, and tasks by `completion` | At least one record in each of the three states; `environment` records for at least two places; at least one `pending` task | Generate only `recorded` records |
| M05-P4 | Check both configurations against the demo procedure's `required_equipment` | Exactly one has all of it and one does not; one is `real_time` and one `delayed` | Give both configurations the equipment |
| M05-P5 | List the configurations and their `environment`; count `attention_criteria` across all | Four environments, one each; at most two criteria, all `demo` | Mark a demo criterion as `reviewed` |

## Out of scope

- Real medical steps.
- Values that look like thresholds.

**The costliest mistake.** Unlabeled fictional data can be presented as evidence.

**Skills.** deterministic-core, claim-provenance-discipline.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
