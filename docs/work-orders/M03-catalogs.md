# Work order M03 — Catalogs

Phase F1 · wave 1 · level 0 · contracts version 0.3

**Goal.** Gather the reference data: "I feel different" observations, variables, equipment and sources.

**Owned paths.** `app/catalogs/`. Nothing outside them.

**Depends on.** M00 Foundation. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M1), `docs/EXTENDED_RESEARCH_B.md` (B01–B06), `docs/RESEARCH_MATRIX_B.csv`.

## Deliverables

- `observations()`, `variables()`, `equipment()`, `sources()`.
- Observations catalog: skin, congestion, headache, back pain, sleep, nausea or dizziness, fatigue, vision and "other".
- Every source with its `reading_level` taken from the matrix.

## Done when

- [ ] Every observation has at least one source that exists in `sources()`.
- [ ] Fatigue and vision cite S09 and S12, not B01.
- [ ] No entry names a diagnosis or carries a range of normal values.
- [ ] A test walks the catalog and fails if a nonexistent source appears.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Inventing sources, authors or figures: only what is already in `docs/`.
- Copilot rules.

**The costliest mistake.** A catalog without sources looks like a validated clinical instrument, and it is not.

**Skills.** claim-provenance-discipline, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
