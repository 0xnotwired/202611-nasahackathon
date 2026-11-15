# Work order M17 — Copilot

Phase F4 · wave 2 · level 3 · contracts version 0.3

**Goal.** Turn an episode's situation into a card that shows data before suggestions and admits not knowing.

**Owned paths.** `app/copilot/`. Nothing outside them.

**Depends on.** M02 Mission, M06 Readings, M16 Episode. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M4), `docs/EXTENDED_RESEARCH_B.md` (B12, B13).

## Deliverables

- `card(situation, config, rules)` as a pure function.
- Rule format: explicit condition, text, source, version, review status.

## Done when

- [ ] With no applicable rule: `suggestion` is `null` and `no_guidance` is `true`.
- [ ] `data` and `gaps` are always returned, with or without a suggestion.
- [ ] Every suggestion carries source, version and review status, and `not_assessed` says what was not looked at.
- [ ] A rule without a source is rejected on load.
- [ ] If the episode already issued an alert, `alert` is `null`.
- [ ] The module contains no rule: tests use labeled toy rules.
- [ ] There are no network calls and no language model.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Clinical rules, thresholds, diagnoses.
- Generative AI.

**The costliest mistake.** The copilot's silence read as "all fine" is the omission error described in B12.

**Skills.** llm-out-of-the-loop, deterministic-core, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
