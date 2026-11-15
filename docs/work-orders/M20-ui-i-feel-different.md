# Work order M20 — I feel different view

Phase F4 · wave 3 · level 3 · contracts version 0.3

**Goal.** Take the astronaut from an observation to follow-up, in a complete episode.

**Owned paths.** `app/ui/i-feel-different/`. Nothing outside them.

**Depends on.** M03 Catalogs, M07 Base interface, M16 Episode, M17 Copilot, M18 Summary. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/FINAL_PROPOSAL.md` (Proposed demo), `docs/PROPOSAL_IMPROVEMENTS.md` (M1, M4, M9).

## Deliverables

- Episode view: catalog, copilot card, access to the procedure, result, summary and sharing.

## Done when

- [ ] The episode is completed from observation to follow-up and is restored after closing.
- [ ] On the card, data and gaps come before the suggestion, also in screen-reader order.
- [ ] With no guidance, it reads "There is no reviewed guidance for this".
- [ ] Generating the summary and sharing it are two separate actions; sharing asks for confirmation.
- [ ] Help can be requested without completing the questionnaire.
- [ ] The demo's two configurations produce two visibly different journeys.
- [ ] The whole journey works with the keyboard.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- A free-text clinical field.
- Chat.

**The costliest mistake.** Putting the suggestion first invites following it without looking at the data.

**Skills.** resilient-ui-states, frontend-accessibility-by-construction, non-overwhelming-ux.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
