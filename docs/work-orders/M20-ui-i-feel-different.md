# Work order M20 — I feel different view

Phase F4 · wave 3 · level 3 · contracts version 0.4

**Goal.** Take the astronaut from an observation to follow-up, in a complete episode.

**Owned paths.** `app/ui/i-feel-different/`, and the record `docs/experiments/M20.md`. Nothing outside them.

**Depends on.** M03 Catalogs, M07 Base interface, M16 Episode, M17 Copilot, M18 Summary. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/FINAL_PROPOSAL.md` (Proposed demo), `docs/PROPOSAL_IMPROVEMENTS.md` (M1, M4, M9).

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

## Experiments

Copy these predictions into `docs/experiments/M20.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M20-X1`, `M20-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M20-P1 | Order of the card's sections in the model and, in a browser, in the page | Data, gaps, then suggestion, in both. BROWSER level; if not run, the record says "not verified in a browser" for the page | Swap suggestion and data |
| M20-P2 | Card with no applicable rule | The exact text "There is no reviewed guidance for this" | Show an empty card |
| M20-P3 | Run "generate summary"; then "share" without confirming; then with confirmation | No `Shared` entry after the first two; exactly one after the third | Share when the summary is generated (R8) |
| M20-P4 | The same observation with each of the two configurations | The journey differs at the procedure step: startable in one, blocked in the other | Ignore the configuration |
| M20-P5 | Model in its initial state, before any answer | The action to ask for help is available | Enable it only after the questionnaire |
| M20-P6 | In a browser: complete an episode, close the browser, reopen | The episode is there, unchanged. BROWSER level; if not run, the record says "not verified in a browser" | Fresh profile: no episode |

## Out of scope

- A free-text clinical field.
- Chat.

**The costliest mistake.** Putting the suggestion first invites following it without looking at the data.

**Skills.** resilient-ui-states, frontend-accessibility-by-construction, non-overwhelming-ux.

Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
