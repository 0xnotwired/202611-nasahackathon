# Órbita: implementation layers

Date: November 15, 2026. Maintained by the orchestrator. This document says, layer by layer, **what the product claims once that layer is built and which experiment could prove the claim false**. Who builds what, in which order and on which branch is in [ORCHESTRATION_PLAN.md](ORCHESTRATION_PLAN.md); how to run an experiment and record it is in [METHOD.md](METHOD.md); each module's own experiments are in its [work order](work-orders/).

An implementation layer is a phase of the plan (F0–F6). It is not the same thing as the import layers of the architecture (core, store, readings…), which say who may import whom.

## Rules for every layer

1. **A layer is a complete state of the product.** It is useful by itself and nothing above it has to rebuild it. There is no MVP: under time pressure fewer layers are built, each one whole.
2. **A layer inherits every rule of the layers below.** R1–R9 are not added later. The gate of a layer reruns the gate experiments of the layers below it.
3. **A layer closes on evidence, not on effort.** Its gate is a set of experiments with a prediction written beforehand and a negative control. A person approves it.
4. **Order at a gate:** adversarial review of the layer against the inherited rules first, integrated experiments second.
5. **A refuted claim stops the layer.** It is recorded and the plan changes; the layer above does not start on top of it.

Gate experiments are walkthrough tests in `tests/walkthrough/`, written by the orchestrator, and their record is `docs/experiments/G<n>.md`.

## Decisions under the whole build

Each decision is a bet about the future. This table says what it rests on and what would reopen it.

| # | Decision | Rests on | Evidence today | Reopen if |
|---|---|---|---|---|
| D1 | Untranspiled ES modules | The same file runs in Node and in the browser | BROWSER and RUN: [E00-P2](experiments/E00-foundation-probes.md), Chrome 153 and Node 22 | A browser the team presents on fails to load them |
| D2 | No product dependencies | Everything needed is in the platform | The event rules allow open-source, cited dependencies (see AGENTS.md); the user decided on 15/11/2026 that no already-made project is used, except necessary dependencies and libraries (npm); the default stays none | The user approves a named dependency as necessary; it then needs an OSI license read in its repository, a pinned version, a citation and an experiment |
| D3 | IndexedDB behind our own interface | It persists across a browser restart | BROWSER: E00-P4 and E00-P5, Chrome 153 only | It fails in a presentation browser or in the packaged file |
| D4 | `node --test` for the domain | It runs with nothing installed | RUN: E00-P1, with its negative control | A domain rule cannot be tested without a DOM |
| D5 | New `app/`; the mockup is not touched | The mockup stays as a reference | Not an empirical claim | — |
| D6 | Local server; single file only at the end | Modules do not load from `file://` | BROWSER: E00-P3, with the exact CORS error | M23 is cut: then the presentation uses the server |
| D7 | Per-session unlock, sharing log, **no encryption** | The app promises no confidentiality it lacks | Not an empirical claim; stated on screen | A real server is added, or real personal data is entered |
| D8 | Records are never edited or deleted | A correction is a new record | To be shown by M04-P1 and M04-P2 | Storage size becomes a problem on the device |
| D9 | Simulated sync | The `sync` interface can be reimplemented by a real server | To be shown by M24 | The team builds the server: reopens D7 |
| D10 | Color shows the state of the data, not "normal" | The central rule; the challenge suggests color for status at a glance | User decision, 15/11/2026 | A clinical reviewer joins and defines what a status color may mean |
| D11 | Attention criteria only as configuration data, set per mission by flight surgeons; demo criteria labeled "team demo, not clinical" | R6 and the challenge's question on when a result warrants attention | User decision, 15/11/2026; contracts 0.4 | A reviewed clinical source is adopted |
| D12 | Environments (station, spacecraft, rover, surface base) as `MissionConfig` presets, not separate screens | The equipment and communication axes already model them | User decision, 15/11/2026 | A demo needs behavior the two axes cannot express |
| D13 | Blood sugar from BUT CGM (CC BY 4.0, `terrestrial` origin); mood as a team self-report 1–5, synthetic, no score | Both named by the challenge; no open mood data; published questionnaires are not free to copy | User decision, 15/11/2026; DATASETS.md | An open flight or analog dataset for either appears |
| D14 | Gamification limited to the day's plan progress ("n of m done"); no streaks, points or rewards for results | Streaks push measuring for its own sake; rewards for results would grade health | User decision, 15/11/2026 | First thing cut if time runs short |

Status on 15/11/2026: D9 was chosen by the user. D1, D2, D3, D4 and D6 match the stack the user listed and asked to continue with on 15/11/2026. D5, D7 and D8 were confirmed by the user on 15/11/2026 by accepting the orchestrator's recommendation with its reasons; gate G0 still needs its experiments and the threat model.

## F0 — Foundation

**Claim.** Modules can be built in parallel against the contracts, and a contract suite can tell a real implementation from an empty one.

**Modules.** M00.

| Id | Experiment | Prediction | Negative control |
|---|---|---|---|
| G0-W1 | Run all contract suites against the placeholders | Every suite fails on an assertion | The `core` suite passes against the reference fake |
| G0-W2 | Open the shell through the server in a real browser | The shell's modules run (BROWSER) | From `file://` they do not (E00-P3) |
| G0-W3 | `python3 scripts/check_docs.py` | OK | Mark a module `in_review` with no record: the script fails |

**The claim is false if** two modules need to write the same file, or a suite passes against a placeholder.

**Closes when** G0-W1 to G0-W3 are recorded, `docs/THREAT_MODEL.md` exists, (D5, D7 and D8 were confirmed on 15/11/2026).

## F1 — Data core (level 0)

**Claim.** A record that enters the store comes out with the same id, state, origin and subject, and a malformed record cannot enter at all.

**Modules.** Wave 1: M01, M02, M03. Wave 2: M04, M05. **Rules that start here:** R1, R3, R4, R7, R9.

| Id | Experiment | Prediction | Negative control |
|---|---|---|---|
| G1-W1 | Generate the scenario with seed 1, save it, list it | Every record comes back deep-equal; the count per state and per origin is the same before and after | Make the store turn `not_recorded` into `confirmed_none`: red |
| G1-W2 | Try to change and to delete a saved record through every store function | No function does it; the record is unchanged | Allow `updateState` on `records`: red |
| G1-W3 | Save a record with a missing field through every door that accepts records | None accepts it | Remove validation from `saveBatch`: red |
| G1-W4 | In a browser: save, close, reopen | The same records (BROWSER) | Fresh profile: empty |

**The claim is false if** any path lets a record in without validation, or any output differs from what was saved.

## F2 — Understand my situation (level 1)

**Claim.** The same record means the same thing in every view, and what is missing is visible as missing in all of them.

**Modules.** Wave 1: M06, M07. Wave 2: M08, M09, M10, M11, M12. **Rules that start here:** R2, R6.

| Id | Experiment | Prediction | Negative control |
|---|---|---|---|
| G2-W1 | For every record id that appears in more than one view model | Equal value, unit, origin and state text in all of them | Format a value differently in one view: red |
| G2-W2 | Compare each view model with the gaps `readings` reports | Every gap appears as "not recorded"; no model holds a 0 for a gap | Put 0 for a gap in one model: red |
| G2-W3 | The scenario's old exam and its reading from another place | "Last known assessment" with its date; the reading is not in the astronaut's own section | Attribute the reading by time only: red |
| G2-W4 | Search every text of every view model | No score, no grade of a value, no causal sentence | Add a `score` field: red |
| G2-W5 | In a browser: walk all five views with the keyboard only | Every action is reachable and focus is visible (BROWSER) | — |

**The claim is false if** two views disagree about one record, or any view shows a number where nothing was measured.

Do not cut a view to reach F3 sooner: this layer needs health, adaptation and habitat together.

## F3 — Complete my plan (level 2)

**Claim.** What a procedure lets the astronaut do is decided by the mission's equipment, and doing a task is never recorded as a result.

**Modules.** Wave 1: M13, M14. Wave 2: M15. **Rules that start here:** R5.

| Id | Experiment | Prediction | Negative control |
|---|---|---|---|
| G3-W1 | The day's task with the configuration that lacks the equipment | Execution `blocked` with the missing item; the task stays `pending`; no result exists | Start anyway: red |
| G3-W2 | The same task with the equipment: start, interrupt, resume, finish, mark done | One `completed` execution; the task is `done`; `result_ids` is empty until a result is linked | Create a result on `done`: red |
| G3-W3 | Publish version 2 of the procedure after G3-W2 | The execution still says version 1 | Read the current version: red |
| G3-W4 | Rerun G1 and G2 | Still green | — |

**The claim is false if** the two configurations produce the same journey, or a completed task shows a result nobody measured.

The demo procedure has no clinical content. A person chooses the real one; no agent writes medical steps.

## F4 — Review a change (level 3)

**Claim.** An episode goes from "I feel different" to the ground panel without the app claiming anything it does not know, and nothing leaves the device unasked.

**Modules.** Wave 1: M16, M19. Wave 2: M17, M18. Wave 3: M20, M24. **Rules that start here:** R8.

| Id | Experiment | Prediction | Negative control |
|---|---|---|---|
| G4-W1 | Whole episode: observation, situation, card, procedure, result, summary, share, enqueue, advance, ground | Exactly one alert, one `Shared` entry and one delivery received; every value in the summary equals the history | Share when the summary is generated: red |
| G4-W2 | Stop G4-W1 before "share" | Nothing in `shared`, nothing in `deliveries`, nothing on the ground panel | Enqueue from `generate`: red |
| G4-W3 | An episode with one `not_recorded` variable, followed to the ground panel | It reads "not recorded" on the card, in the summary and on the panel | Rewrite the state at any of the three steps: red |
| G4-W4 | The same observation with the delayed configuration that lacks the equipment | The card says there is no reviewed guidance; the procedure is blocked; the summary has its four parts; the delivery is `in_transit` until the delay passes | Ignore the configuration: red |
| G4-W5 | In a browser: close and reopen in the middle of the episode | The episode is restored at the same point (BROWSER) | Fresh profile: no episode |
| G4-W6 | Rerun G1, G2 and G3 | Still green | — |

**The claim is false if** anything reaches `shared` or the ground without the astronaut's action, or the copilot's silence can be read as "all fine".

## F5 — NASA cases (level 4)

**Claim.** Real NASA data can be explored without ever becoming part of the fictional astronaut's history.

**Modules.** Wave 1: M21. Wave 2: M22. Independent of F3 and F4. Blocked until a person downloads the files; the licenses are in [DATASETS.md](DATASETS.md).

| Id | Experiment | Prediction | Negative control |
|---|---|---|---|
| G5-W1 | Build every F2 view model for the synthetic subject, import a file, build them again | Deep-equal before and after | Assign imported rows to the synthetic subject: red |
| G5-W2 | Compare what the viewer shows with the original file | Equal row by row; empty cells are "not recorded" | Convert an empty cell to 0: red |
| G5-W3 | Search the imported records for comment text | None | Import comments as notes: red |

**The claim is false if** one imported value appears in a view of the synthetic astronaut.

## F6 — Closing

**Claim.** What is delivered behaves like what was tested.

**Modules.** M23.

| Id | Experiment | Prediction | Negative control |
|---|---|---|---|
| G6-W1 | Run the manual script on the served app and on `dist/orbita.html` | The same results line by line (BROWSER) | — |
| G6-W2 | Record the network requests of the packaged file | Only the file itself | Add a remote resource: a second request |
| G6-W3 | Integrated adversarial review of every layer reached, then every gate experiment again | All green | — |
| G6-W4 | Formative test with 6–8 volunteers | Problems found are listed; the limit of that sample size is stated (B14) | — |

## If time runs short

Cut whole layers from the end: first F6 (present with the local server), then F5, then F4. Whatever layer is reached is delivered and named as that layer. A layer that did not pass its gate is not presented as built.
