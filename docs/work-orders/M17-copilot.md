# Work order M17 — Copilot

Phase F4 · wave 2 · level 3 · contracts version 0.4

**Goal.** Turn an episode's situation into a card that shows data before suggestions and admits not knowing.

**Owned paths.** `app/copilot/`, and the record `docs/experiments/M17.md`. Nothing outside them.

**Depends on.** M02 Mission, M06 Readings, M16 Episode. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M4), `docs/EXTENDED_RESEARCH_B.md` (B12, B13).

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

## Experiments

Copy these predictions into `docs/experiments/M17.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M17-X1`, `M17-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M17-P1 | `card(situation, config, [])` | `suggestion` is `null`, `no_guidance` is `true`; `data` and `gaps` equal the situation's | Return a suggestion or `no_guidance: false` when no rule applies |
| M17-P2 | `card` with one toy rule that applies | The suggestion carries `source`, `version` and `review_status`; `not_assessed` is not empty | Drop `source` |
| M17-P3 | Load a rule with no source | Rejected | Accept it |
| M17-P4 | `card` for a situation whose episode already issued an alert | `alert` is `null` | Always return an alert |
| M17-P5 | `card` twice with the same inputs; then search the module's source | Deep-equal results; no `fetch`, `XMLHttpRequest`, `Date.now` or `Math.random` in the source | Read the clock inside `card` |

## Out of scope

- Clinical rules, thresholds, diagnoses.
- Generative AI.

**The costliest mistake.** The copilot's silence read as "all fine" is the omission error described in B12.

**Skills.** llm-out-of-the-loop, deterministic-core, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
