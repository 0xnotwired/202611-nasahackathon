# Build roadmap for agents

Date: November 14, 2026. For any AI agent (or person) continuing Órbita. [ROADMAP.md](ROADMAP.md) defines the levels from the product side; this document says when each one is done; [ORCHESTRATION_PLAN.md](ORCHESTRATION_PLAN.md) splits the work into phases and modules.

**Before touching anything:** read [../CLAUDE.md](../CLAUDE.md) and [../AGENTS.md](../AGENTS.md). If this document contradicts AGENTS.md or FINAL_PROPOSAL.md, they win.

## Starting status (verified on 14/11/2026)

| Exists | Does not exist |
|---|---|
| `demo/orbita.html`: single-file mockup, fictional data, covers the check-in | Modular product code |
| Product documentation, evidence (S, A, B) and datasets | Implemented data model |
| `scripts/check_docs.py`: consistency between matrices and documents | Product tests |
| | Loaded NASA data; the originals are not in the repo |
| Orchestration plan, contracts and 25 work orders, as proposals | Chosen and reviewed clinical procedure |

## Destination

A local application that lets an astronaut complete a **care episode** from start to finish, with health, adaptation and habitat in a single history, and that changes its behavior according to the mission's equipment and communication.

It is built in levels. **No MVP is proposed.** If time runs out, the highest complete level is delivered and named as such. Unfinished levels are not replaced by approximations.

## Technical decisions and data model

They no longer live in this document, so there are not two copies that drift apart:

- **Decisions D1–D9** (language, dependencies, persistence, tests, structure, how it opens, data protection, history without editing, simulated sync): [ORCHESTRATION_PLAN.md](ORCHESTRATION_PLAN.md). D9 was chosen by the user; D1–D4 and D6 match the stack the user listed on 15/11; D5, D7 and D8 were confirmed on 15/11 by accepting the orchestrator's recommendation with its reasons. The evidence behind each one is in [IMPLEMENTATION_LAYERS.md](IMPLEMENTATION_LAYERS.md).
- **Data model, rules R1–R9 and interfaces:** [CONTRACTS.md](CONTRACTS.md).
- **Who builds what:** [modules.csv](modules.csv) and [work-orders/](work-orders/).

This document keeps what defines each **level** and the handoff log. The plan's gates refer to these checklists.

## Levels

Each level ends with: an adversarial review against the rules of the earlier levels, then the gate experiments of [IMPLEMENTATION_LAYERS.md](IMPLEMENTATION_LAYERS.md) recorded as [METHOD.md](METHOD.md) says, and this document's status table updated.

### Level 0 — Data core

**Phase F1, gate G1.** Modules M01 core, M02 mission, M03 catalogs, M04 store and M05 synthetic scenario. Before that, phase F0 (M00) puts the contracts into code.

**Done when:**
- [ ] A record without `origin`, `method` or `time` is rejected with a message that names the field.
- [ ] An identifier `007` is saved and retrieved as `007`.
- [ ] A missing value does not appear as 0 in any output.
- [ ] A saved record cannot be edited or deleted; a correction is a new record.
- [ ] The synthetic scenario is generated identically with the same seed and everything in it says `synthetic`.
- [ ] Save, close and reopen restores the same thing; if storage fails, the interface says so.
- [ ] Every test was seen failing against broken code before passing.

### Level 1 — Understand my situation

**Phase F2, gate G2.** Modules M06 readings, M07 base interface and views M08–M12: My health, Adaptation, Habitat, My progress and My day, reading from the same store. Labeled synthetic scenario. Three record states visible (improvement M2).

**Done when:**
- [ ] The same record shows the same value, unit and origin in every view.
- [ ] "Not recorded" and "confirmed nothing new" are distinguished by text, not just by color.
- [ ] An old exam appears as "last known assessment" with its date.
- [ ] An environment reading from another module does not appear as personal exposure.
- [ ] Cumulative dose, if shown, carries a unit and the program requirement label (M5).
- [ ] The whole journey works with the keyboard.

### Level 2 — Complete my plan

**Phase F3, gate G3.** Modules M13 procedures, M14 plan and M15 My plan and On board views. It uses the two-axis `MissionConfig` (improvement M3).

**Human blocker:** choose the demo procedure and its source (M6). An agent does not invent medical steps. Without that decision, the engine is built with a **demo procedure labeled as such** and with no clinical content.

**Done when:**
- [ ] With the equipment missing, the procedure is blocked, explains why and offers no invented alternative.
- [ ] An interrupted execution resumes where it left off and does not count as completed.
- [ ] "I could not complete it" is saved with the difficulty.
- [ ] Changing a procedure's version does not alter earlier executions.
- [ ] Assigned plan, action taken and observed result are three different things on screen.

### Level 3 — Review a change

**Phase F4, gate G4.** Modules M16 episode, M17 copilot, M18 summary, M19 privacy, M20 I feel different view and M24 simulated sync and ground panel, with the catalog (improvement M1), the copilot rules (M4) and the summary according to the communication mode.

**Done when:**
- [ ] The episode is completed from observation to follow-up and is restored after closing.
- [ ] The card shows data before the suggestion.
- [ ] With no applicable rule, it says "There is no reviewed guidance for this".
- [ ] An episode generates a single alert.
- [ ] The exported summary matches the history and separates synthetic, analog and flight data.
- [ ] With delayed communication, the summary can be understood without additional context.
- [ ] Generating the summary sends nothing.
- [ ] Sharing with medical support is an explicit action that gets logged (M9).
- [ ] Recording an observation does not ask to unlock again within the same session (M9).
- [ ] The simulated sync is labeled as such, keeps deliveries queued when there is no link, and the ground panel shows "nothing sent" for anyone who sent nothing (D9).

### Level 4 — Real NASA cases, kept separate

**Phase F5, gate G5.** Modules M21 importers and M22 NASA cases view: a CRF case and an adaptation case (MR079G, MR080G or MR035G), in a viewer separate from the synthetic scenario. It is a lane independent of F3 and F4.

**Blocker:** the original files are not in the repo. They are downloaded from the cards in [DATASETS.md](DATASETS.md), stored unmodified in `data/originals/` and that folder goes into `.gitignore` until redistribution permissions are resolved.

**Done when:**
- [ ] The values shown match the original file, checked by a test.
- [ ] `Test_Phase` is kept alongside the day.
- [ ] Free-text clinical comments from CRF are not imported.
- [ ] No NASA record appears in the synthetic scenario or is merged with another subject.

### Closing

**Phase F6, gate G6.** Module M23 packaging, if there is time. Integrated adversarial review of the levels reached, and only then the full test battery. Formative test with volunteers according to M7. Update README, DEMO_README and this document with what was **actually** run.

## Blockers only a person can resolve

| Blocker | Who | Affects |
|---|---|---|
| Resources list: first version in [RESOURCES_USED.md](RESOURCES_USED.md); dataset citations open | Any agent, reviewed by the team | Delivery |
| Choose the demo procedure and its clinical source | User, with competent review | Level 2 |
| Confirm [V1 4030] in NASA-STD-3001 vol. 1 rev. C | Anyone, by opening the S03 PDF | Level 1, radiation |
| Official 2026 challenge text and evaluation guide | User, from the browser | Presentation |
| Code license | Team | Publication |
| Event rules on AI use | User | Provenance record |

## Handoff protocol between agents

At the end of a session, the agent leaves in this file:

1. The status table updated with what was verified, not what was attempted, and the `status` of their module in [modules.csv](modules.csv) if the orchestrator asked for it.
2. Which checkbox of which level was left halfway and why.
3. What they assumed without confirmation.

Each agent checks the real status with `git status`, `git log` and the tests before believing what this document says. An agent does not assume another's step was done well.

## Handoff log

| Date | Agent | Done and verified | Pending |
|---|---|---|---|
| 2026-11-14 | Claude (web session) | Research series B, improvements M1–M8, this roadmap, CLAUDE.md, `scripts/check_docs.py` run green | Level 0 not started; no product code written |
| 2026-11-15 | Claude (web session) | B01, B03 and B06 read in full from the user's PDFs; B03 comparison corrected; privacy improvement M9; `check_docs.py` green | Level 0 not started; no product code written |
| 2026-11-14 | Claude (orchestrator, web session) | Orchestration plan, contracts v0.1, board and 24 work orders; AGENTS.md, README, TECHNICAL and CLAUDE.md updated; `check_docs.py` extended and seen failing in six ways; verified that `node --test` runs an ES module on Node 22 | Gate G0 not approved: D1–D8 not confirmed. No module started. Nothing verified in a browser |
| 2026-11-15 | Claude (orchestrator, web session) | Decision D9: sending to the ground via simulated sync (simulated option C), chosen by the user; module M24 in F4 wave 3, contracts v0.2 with `Delivery` shape and `sync` interface. A real server stays as a later level | D1–D8 still not confirmed. No module started |
| 2026-11-15 | Claude (orchestrator, web session) | Branch `english` created from `claude` at the user's request (the hackathon requires English); whole repo translated, including file names, folder names and contract identifiers (contracts v0.3), the three matrices (reading levels now FT/AB/S) and both demo pages. Verified: `check_docs.py` OK and seen failing on two deliberate breakages (unknown B id, link to an old Spanish file name); no Spanish text left outside proper nouns and the vision page's internal JS variable names; both demos walked through in headless Chrome with no console errors (check-in flow, summary export, all views). Not verified: wording reviewed by a native speaker | `english` is the integration branch from now on. D1–D8 still not confirmed. No module started |
| 2026-11-15 | Claude (orchestrator, web session) | Scientific method for the build: `METHOD.md`, `IMPLEMENTATION_LAYERS.md` (one falsifiable claim and gate experiments per layer, decisions with their evidence), 125 experiments added to the 25 work orders, `docs/experiments/` with record E00. E00 ran five foundation probes with predictions written first: all confirmed on Node 22 and Chrome 153, each with a negative control (RUN and BROWSER). `check_docs.py` now checks experiment ids and records: seen failing on five deliberate breakages and passing on two controls. AGENTS.md records the dependency rule as read in the 2026 terms and as reported by the user | Explicit confirmation of D5, D7 and D8; list of resources used; other browsers not tested; no product code written |
| 2026-11-15 | Claude (orchestrator, web session) | Method and layers committed (c1535d2). User decisions of the day recorded: no already-made projects from others except dependencies approved by name (default none); D5, D7 and D8 confirmed by accepting the recommendation; code license Apache-2.0 (`LICENSE`). First delivery list of resources in `RESOURCES_USED.md`, licenses read in the installed copies. Tried to install Firefox and WebKit for Playwright: refused by the network allowlist (403) | Gate G0 experiments and threat model not done; no product code written; Chrome for Testing is not open source (user decided on 15/11 to keep it as a development tool); dataset citation strings not written; the event rules on AI use and the meeting rule on already-made projects are not verified |
| 2026-11-15 | Claude (orchestrator, web session) | Challenge text supplied by the user compared with the plan; gaps closed by user decisions D10–D14 (data-state color, attention criteria as configuration, environment presets, blood sugar and mood, plan progress instead of gamification). Contracts 0.4; work orders M01, M02, M03, M05, M06, M07, M14, M15, M21 got new criteria and experiments. Dataset citations in `DATASET_CITATIONS.md`; blood sugar and mood research in DATASETS.md | Nothing built or run for these decisions; BUT CGM not downloaded or checked against its page; NLSP citation fields still missing; gate G0 open |
