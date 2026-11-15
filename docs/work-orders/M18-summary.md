# Work order M18 — Summary

Phase F4 · wave 2 · level 3 · contracts version 0.4

**Goal.** Generate an episode summary for medical support that can be understood without back-and-forth.

**Owned paths.** `app/summary/`, and the record `docs/experiments/M18.md`. Nothing outside them.

**Depends on.** M02 Mission, M16 Episode, M19 Privacy. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M3, M9), `docs/EXTENDED_RESEARCH_B.md` (B10, B11).

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

## Experiments

Copy these predictions into `docs/experiments/M18.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M18-X1`, `M18-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M18-P1 | Count `shared` and `deliveries`, call `generate`, count again | Both counts unchanged | Call `logShared` inside `generate` (R8) |
| M18-P2 | Episode with one `not_recorded` variable and one `confirmed_none` | The text has "not recorded" next to the first and "confirmed nothing new" next to the second | Print both as "nothing new" (R1) |
| M18-P3 | Compare every value in the text with the fixture's values, written by hand in the test | Equal one by one, with unit | Round a value |
| M18-P4 | `generate` with `communication: "delayed"` for an episode with nothing missing | Four labeled parts: what happened, what was measured and how, what is missing, what is being asked. The third is present and says nothing was found missing among what was looked at | Leave the third part out when it is empty |
| M18-P5 | `generate` with `no_link`, then with `real_time` | `pending_send` is `true`, then `false` | Return a constant |
| M18-P6 | Episode with synthetic and ground analog records | `origins` is exactly those two; the text has one block per origin | Merge the blocks (R4) |
| M18-P7 | Episode whose record has a `note` | The note's text is not in the summary | Include notes |

## Out of scope

- Sending over a network.
- Interpreting the data.

**The costliest mistake.** The summary is the only thing read by whoever does not see the screen: an extra "nothing new" there has nobody to correct it.

**Skills.** honest-degradation, claim-provenance-discipline, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
