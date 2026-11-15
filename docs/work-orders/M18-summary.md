# Work order M18 — Summary

Phase F4 · wave 2 · level 3 · contracts version 0.3

**Goal.** Generate an episode summary for medical support that can be understood without back-and-forth.

**Owned paths.** `app/summary/`. Nothing outside them.

**Depends on.** M02 Mission, M16 Episode, M19 Privacy. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M3, M9), `docs/EXTENDED_RESEARCH_B.md` (B10, B11).

## Deliverables

- `generate` according to the contract, in plain text.

## Done when

- [ ] `generate` sends or shares nothing.
- [ ] The text separates synthetic, ground analog and flight data.
- [ ] "Not recorded" and "confirmed nothing new" appear in those words; a test fails if they are confused.
- [ ] With delayed communication, the text contains what happened, what was measured and how, what is missing and what is being asked.
- [ ] With "no link", `pending_send` is true.
- [ ] Each value in the summary matches the history (a test compares them one by one).
- [ ] It includes no free-text notes.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Sending over a network.
- Interpreting the data.

**The costliest mistake.** The summary is the only thing read by whoever does not see the screen: an extra "nothing new" there has nobody to correct it.

**Skills.** honest-degradation, claim-provenance-discipline, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
