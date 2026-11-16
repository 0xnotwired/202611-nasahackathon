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

## Current integration status — November15,2026

[CURRENT_STATUS.md](CURRENT_STATUS.md) consolidates the present state and
links reproducible evidence. M00/M01–M05 and user-advanced M21 are reviewed
and integrated into main through PR#3; G0/G1 accepted.100 Node tests pass; real-source
CSV import/persistence verified3861 records with exact restart readback and
idempotent repeats. This is an isolated local profile, not a product UI.

Next: F2 M06/M07, then M08–M12. Original files/browser state are excluded from
Git; [LOCAL_DATA_RESTORE.md](LOCAL_DATA_RESTORE.md) explains reconstruction.
All180 genomic raw files were acquired and inspected, but no omics adapter
exists. CRF/BMD units and immune denominator/export binding remain unresolved;
MR079G date ordering is now corroborated. PhysioNet use is provisional by user
instruction. Earlier handoff entries below are dated history, not competing
current-state summaries. They must not be silently rewritten as later facts.

## Destination

A local application that lets an astronaut complete a **care episode** from start to finish, with health, adaptation and habitat in a single history, and that changes its behavior according to the mission's equipment and communication.

It is built in levels. **No MVP is proposed.** If time runs out, the highest complete level is delivered and named as such. Unfinished levels are not replaced by approximations.

## Technical decisions and data model

They no longer live in this document, so there are not two copies that drift apart:

- **Decisions D1–D14** (language, dependencies, persistence, tests, structure, how it opens, data protection, history without editing, simulated sync; D10–D14 close the challenge gaps): [ORCHESTRATION_PLAN.md](ORCHESTRATION_PLAN.md). D9 was chosen by the user; D1–D4 and D6 match the stack the user listed on 15/11; D5, D7 and D8 were confirmed on 15/11 by accepting the orchestrator's recommendation with its reasons. The evidence behind each one is in [IMPLEMENTATION_LAYERS.md](IMPLEMENTATION_LAYERS.md).
- **Data model, rules R1–R9 and interfaces:** [CONTRACTS.md](CONTRACTS.md).
- **Who builds what:** [modules.csv](modules.csv) and [work-orders/](work-orders/).

This document keeps what defines each **level** and the handoff log. The plan's gates refer to these checklists.

## Levels

Each level ends with: an adversarial review against the rules of the earlier levels, then the gate experiments of [IMPLEMENTATION_LAYERS.md](IMPLEMENTATION_LAYERS.md) recorded as [METHOD.md](METHOD.md) says, and this document's status table updated.

### Level 0 — Data core

**Phase F1, gate G1.** Modules M01 core, M02 mission, M03 catalogs, M04 store and M05 synthetic scenario. Before that, phase F0 (M00) puts the contracts into code.

**Done when:**
- [x] A record without `origin`, `method` or `time` is rejected with a message that names the field.
- [x] An identifier `007` is saved and retrieved as `007`.
- [x] A missing value does not appear as 0 in any output.
- [x] A saved record cannot be edited or deleted; a correction is a new record.
- [x] The synthetic scenario is generated identically with the same seed and everything in it says `synthetic`.
- [x] Save, close and browser reopen restores the same thing; the store API returns explicit errors and a nonpersistent status/reason. Browser-gate notices demonstrate propagation; the product warning UI remains M07 work.
- [x] Every test was seen failing against broken code before passing.

RUN/BROWSER evidence is in [G1](experiments/G1.md) and the individual module records. These checks establish the data core, not clinical correctness or an implemented product UI. The user accepted G1 on November15; F1 is closed.

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
| Resources list: [RESOURCES_USED.md](RESOURCES_USED.md) and [DATASET_CITATIONS.md](DATASET_CITATIONS.md); NLSP and OSDR citation fields open | Any agent, reviewed by the team | Delivery |
| Choose the demo procedure and its clinical source | User, with competent review | Level 2 |
| Confirm [V1 4030] in NASA-STD-3001 vol. 1 rev. C | Anyone, by opening the S03 PDF | Level 1, radiation |
| Evaluation guide for 2026 (the challenge text was supplied on 15/11) | User, from the browser | Presentation |
| One BUT CGM `*_CGM.csv` file | User | M21 `importGlucose` |
| Text of the eight NLSP study cards | User | Dataset citations |
| Organizers' answer on already-made projects, dependencies and attribution-only datasets | User | D2 and PhysioNet datasets |
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
| 2026-11-15 | Claude (orchestrator, web session) | BUT CGM citation compared with its page by elements (authors, year, title, version, RRID, DOI) and the standard PhysioNet citation added; license CC BY 4.0 confirmed. Handoff updated: AGENTS.md (D10–D14 rules, terrestrial origin, mood and gamification limits), CLAUDE.md ("Where to pick up"), blockers in the plan and here | BUT CGM not downloaded: physionet.org and its AWS bucket refused by the network; its columns and unit unknown. Nothing built |
| 2026-11-15 | OpenAI Codex (M00 builder and orchestration); independent Codex reviewer | RUN: M00 foundation, JSDoc contracts 0.5, all 25 placeholders, loopback static server, core reference and negative controls. Independent review found and verified fixes for directory, missing-state and missing-export test gaps. RUN: G0-W1/W3 and 37 tests pass. BROWSER: G0-W2 HTTP shell and blocked-import control pass in Chromium 156. User instructed local integration/G0 closure with "hacelo" after results were reported | file:// CORS remains unverified under managed policy. No remote push. No F1 module implemented; no storage, sharing, clinical or product-level validation. Records: M00.md and G0.md in docs/experiments/ |
| 2026-11-15 | OpenAI Codex orchestrator, M01–M05 builders and independent reviewers | RUN: M01–M05 implemented and independently reviewed; copied predictions precede code in module history. All 83 tests, shared contracts, mutations and documentation checks pass. BROWSER: actual IndexedDB round-trip, restart and profile isolation in Chromium156. Local F1 integration and G1 evidence prepared. User-requested full local skill snapshot: 264 verbatim upstream files, 199 SKILL.md definitions, licenses and SHA-256 manifest | Human G1 acceptance before F2; original dataset downloads blocked by runtime policy (draft domains saved, not applied); M07 product warning UI pending; no remote push or clinical validation |
| 2026-11-15 | OpenAI Codex | RUN: acquired3 original CSV samples (CRF113rows, MR079G12, BUTCGM3016), official metadata and BUTCGM README/license/checksum list. Parent re-fetched and verified NASA originals in the current published environment; all8files ignored by Git. BUTCSV/README/license match publishedSHA256; metadata-only manifest records URLs/times/hashes/headers | CRF/glucose unit dictionaries, UTC interpretation and complete NASA citation/terms remain unresolved. No importers, configuration changes, publication, commit or push performed for acquisition |
| 2026-11-15 | OpenAI Codex | SOURCE: linked author companion declares BUT CGM mmol/L; pinned URLs/hashes recorded without copying its code into product. RUN: official NASA file-level MD5s match both CSVs; SHA-256 custody hashes retained. Documented preserve-source-time policy with no fabricated UTC conversion | CRF unit dictionary and original UTC/timezone semantics not established by reviewed metadata; source records stay outside UTC Record imports. No contacts, configuration changes, commits, pushes or publication |

| 2026-11-15 | OpenAI Codex orchestrator, source-uncertainty builder and independent reviewer | RUN: contract0.7/schema2 preserves unknown-zone dates at date/minute/second precision, shifted/unknown calendars and explicit unknown units; legacy1 reads remain exact. 87 Node tests, standalone store/G1 browsers, documentation checks and negative controls pass; see experiments/SOURCE_UNCERTAINTY.md | CRF units still need source-specific dictionary; MR079G slash format requires evidence before canonical import. Model/storage support implemented; no importer/product views, clinical interpretation, commit, push or publication |

| 2026-11-15 | User and OpenAI Codex orchestrator | USER: explicitly accepted and closed G1/F1, authorized branch f2 and commit/push of all current project changes. Gate record and current status updated; original CSVs excluded | F2 M06–M12 pending; source metadata limits retained. No deployment or environment publication authorized. Local git-discipline and decision-record-discipline skills applied |

| 2026-11-15 | OpenAI Codex | RUN/SOURCE: acquired and inspected small samples for six remaining NLSP studies plus ACTES and ITBA; metadata-only manifest records48 artifacts, hashes, available publisher checksums, primary citations/licenses and per-file limits. Eleven studies now have local samples including the earlier3 | OSD-51/56 and EDA blocked by current network policy. Several units, protocol-relative axes, aggregate/graph-only files and shifted-UTC import context need handling before integration. No app changes, dependency installation, commit, push or environment publication |

| 2026-11-15 | OpenAI Codex and independent dataset-terms reviewer | RUN/SOURCE: published host grants verified; acquired OSD51/56 metadata/DOIs and EDA RR-1 API12087 telemetry+39 radiation rows. Reviewed14 sources against user-supplied2026 terms, verified8 NLSP CC0 declarations and3 PhysioNet license checksums, completed requested citations and corrected overbroad eligibility statements | NASA S3 download/science.nasa.gov policy redirects need saved draft activation; OSDR rights still pending, PhysioNet event interpretation conditional. Synthetic delivery scope retained; no real importer, code change, commit, push or publication. claim-provenance-discipline and independent read-only review applied |

| 2026-11-15 | OpenAI Codex and independent policy reviewer | SOURCE/RUN: found pinned NASA-managed AWS OSDR declaration of unrestricted use and corroborating NASA primary guide; verified OSD51/56 version2 public/nonrestricted records with empty license fields. Rejected frontend-generated CC BY1 fallback as a license grant; retained16 hashed research responses | Scope is public covered AWS distribution; selected download/file notices and EDA applicability remain to verify. Existing redirect-domain draft not reapplied; no app changes, contacts, commits, push or publication. claim-provenance-discipline applied |

| 2026-11-15 | OpenAI Codex | RUN/SOURCE: downloaded both OSD51/56 ISA metadata ZIPs and verified CRC; read direct OSDR redistribution/citation terms and linked SMD policy. EDA's linked OSDR policy now available; response hashes retained | Quantitative microarray archives not downloaded; annotation redirect still blocked. Preserve citations/notices and final-package review; no app change, commit, push or environment publication |

| 2026-11-15 | User and OpenAI Codex with technical-source investigator | User authorizes provisional PhysioNet use with notices and removal if declined. Source date formats corroborated; parent verified MR079G controls and corrected second-control subject scope | Physical units still need dictionaries before interpretation. Raw geneticZIPs blocked at newly discoveredhost; additive draft saved, publication required. No app changes, commit or push |

| 2026-11-15 | OpenAI Codex | RUN: closed quantitative archive documentation, reverified3 SHA/size receipts, mapped170/170 and10/10 ISA references, prepared14 source profiles. Actual header checks plus negative controls caught/corrected3 GPR channel variants and optional Agilent annotations. Documentation/link/diff checks pass | No M21/product importer or DB writes; unresolved physical-unit dictionaries remain required before interpretation. Plan distinguishes preserved unknown clocks, relative axes, shifted UTC and aggregate/omics adapters. No commit, push or publication |

| 2026-11-15 | OpenAI Codex | SOURCE/RUN: retrieved19 same-test MR080G companion files; unit-labelled summary and four-row correspondence establish selected gas/ventilation/% units, preserving VE BTPS; plots corroborate L/min and bpm. Preparation profile updated | CRF/BMD/immunity original linked papers need newly requested NTRS/PubMed/PMC host activation; no guessed units, conversions, external messages, app code, commit, push or publication |

| 2026-11-15 | User, OpenAI Codex M21 builder, source-paper investigator and independent reviewer | USER: explicitly advances M21, confirms provisional PhysioNet use pending organizer response. RUN/BROWSER: CSV APIs implemented;100 Node tests pass, real source values checked,3861records persisted/restarted exactly; independent rerun inserts0. Four boundary/identity/profile findings corrected and mutations detected. PrimaryNASA papers read but no new CRF/BMD/immune export units claimed | M21 only, no F2/F5 gate or views. Unknown units preserved; aggregate/relative/omics adapters pending. Local originals/profile ignored; no external messages, commit, push or publication |

| 2026-11-15 | User and OpenAI Codex | USER: explicitly authorizes committing and pushing all current code/tests/dataset documentation to f2. Pre-push Node suite100/100 and documentation/diff checks pass; earlier independent M21/source/browser verification retained | Original datasets, local IndexedDB/browser profiles and trial state excluded by Git. No deployment or environment publication; git-discipline applied |

| 2026-11-15 | User and OpenAI Codex | USER: requests current-state AGENTS/documentation refresh and push to f2. Added consolidated CURRENT_STATUS and LOCAL_DATA_RESTORE; corrected active handoff summaries while preserving historical evidence.100 Node tests, documentation links and diff checks pass; documented restoration recipe verified against five existing local sample hashes | No product behavior change or fresh-machine/browser claim. Originals/local profiles remain ignored. writing-agents-md and git-discipline applied; Git publication authorized, environment publication/deployment not requested |

| 2026-11-15 | User and OpenAI Codex | USER requests all work on main and updated Claude prompt. Remote main already includes f2 via PR#3; ancestry checked. Current handoff now uses main with a separate module/feature branch. Git integration is authorized, without history rewriting | No deployment or environment publication; source originals/browser state remain excluded.100 tests and documentation checks repeated before push |

| 2026-11-15 | Claude (Sonnet 5.5) | RUN/BROWSER: built M08–M12 views, shared view kit, data-source selector and G2 walkthrough (g2.test.js 4/4; g2-browser.py 50/50 in Chromium). 230 Node tests pass; negative controls caught except one explained equivalent mutant (M08-X2). Not verified: independent review of M08–M12, second browser, screen reader, persistent-source walk. G2 not accepted; modules.csv unchanged. Local commit only. |

| 2026-11-15 | Claude (Sonnet 5.5) | USER authorizes F3. RUN/BROWSER: M13 procedures, M14 plan, M15 My plan and On board, contract 0.13, G3 walkthrough (g3.test.js 4/4; g3-browser.py 42/42 in Chromium). 271 Node tests pass; 27 module controls and 12 view controls caught, plus 3 gate controls; two equivalent mutants noted; one browser control (C3) not caught by the walk. Not verified: independent review of M08–M15, second browser, screen reader, procedure registry, cross-tab locking. G3 not accepted; modules.csv unchanged. Local commit only. |

| 2026-11-15 | Claude (Sonnet 5.5) | USER asks for minimal versions of the procedure registry, editor and sync. RUN/BROWSER: registry (M13), editor (M15), privacy (M19), simulated sync and ground panel (M24), IndexedDB schema v2 with a checked upgrade, contract 0.14. 305 Node tests; g3-extras-browser.py 39/39 in Chromium; 23 module controls and 2 browser controls caught; every earlier browser check re-run green after fixing one stale. A browser walk found a real defect (delayed link shown as no link), fixed and pinned. Not verified: independent review of M08–M24 parts built here, two-tab locking, real network (none exists), screen reader, second browser. Gates and statuses unchanged. Local commit only. |

| 2026-11-15 | Claude (Sonnet 5.5) | USER asks for minimal versions of F4 without dropping functions or quality. RUN/BROWSER: episode (M16), copilot (M17, pure, no clinical rule), summary (M18) and the "I feel different" view (M20), contract 0.15. 334 Node tests; g4-browser.py 28/28 in Chromium; 25 controls plus 2 browser controls caught (one weak test strengthened first); every earlier browser check re-run green after replacing two stale ones. Not verified: independent review of M16–M20, any clinical rule (none exists), transmission of the summary text, screen reader, second browser. Gates and statuses unchanged. Local commit only. |

| 2026-11-15 | Claude (Sonnet 5.5) | F5 gate G5 written and run on top of F2–F4: g5.test.js 4/4 and g5-browser.py 15/15 (real BUT CGM file); 4 controls caught plus a browser control that fails at M22's own subject guard rather than at the view comparison. One prediction refuted (M22 does not refuse the synthetic subject's identifier; isolation is by store). Browser scripts renamed so g4/g5 mean their gates. 338 Node tests; every earlier browser check re-run green. Not verified: whole real files, independent review of M22, citations re-read. G5 not accepted; statuses unchanged. Local commit only. |

| 2026-11-15 | Claude (Sonnet 5.5) | USER asks to write F6. M23 packaging: scripts/package.mjs (node: modules only) builds dist/orbita.html (59 modules, blob ES modules, CSP forbidding remote loads); 5 tests and 8 controls caught (2 first uncaught, fixed by pinning each defence's message); g6-browser.py 10/10: same 16 lines served and packaged (random ids normalized), one request (the file), remote stylesheet detected without the policy and refused with it. 343 Node tests; every browser script re-run green. Not done: G6-W3 independent adversarial review, G6-W4 volunteers; other browsers unknown. Gates and statuses unchanged. Local commit only. |

| 2026-11-15 | Claude (Sonnet 5.5) | USER delivers a teammate's Next.js frontend (zip, no git history) to review and incorporate. Reviewed in an isolated copy (`npm ci --ignore-scripts`): its checks pass (32 + 3 + 4 tests, lint, types, production build), the served build shows no console error, no outside request and no overflow at 320 px, and no clinical threshold or score was found by search. Incorporated unchanged as `frontend/` (four root paths collide, so no root file was replaced) with `frontend/INTEGRATION.md` (provenance, findings, options). Side effects fixed: a bare `node --test` now also found frontend's TypeScript tests, so `npm test` runs explicit folders (package.json, docs and the foundation assertion updated); G0-W3's control no longer needs an unrecorded module, which stopped existing when M23 got its record. 343 Node tests pass. Not verified: the frontend's keyboard use, contrast, API mode, other browsers; it needs a Node server and is outside F6's packaged file. Spanish UI and docs vs the repository's English rule is open. Local commit only. |

| 2026-11-16 | Claude (Sonnet 5.5) and a documentation-translation subagent | USER decides on the teammate's frontend: everything in English, dependencies approved, Node server incorporated, workflows namespaced, our data model if superior. DONE in `frontend/`: UI, tests, comments, config and all docs translated (a scan of 22 rendered pages in mock and API mode plus their attributes found no Spanish; the route `/investigacion` stays); contract 0.2 now carries the main app's records and tasks (his 0.1 had no state, per-record origin, unit status or source time); his `Evidence` is derived from each record instead of assumed; our contract 0.16 gained `Task.scheduled_at` and `planned_minutes`; `oxygen_saturation` is flagged as not in our catalog. Frontend: lint, types, 33 + 5 + 4 tests and the build pass, and the real backend plus the frontend were served together. Workflows moved to the root as `frontend-*.yml` with an `app.yml` for ours (none of them has run on GitHub yet). Root scripts `frontend:*` added. Not verified: keyboard and contrast of the frontend, other browsers, a dependency audit, the workflows on GitHub. Local commit only. |
