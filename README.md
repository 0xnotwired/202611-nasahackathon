# Órbita — Your health, on board

[Final proposal](docs/FINAL_PROPOSAL.md) · [Build plan](docs/ORCHESTRATION_PLAN.md) · [Technical design](docs/TECHNICAL.md) · [Academic base](docs/ACADEMIC_BASE.md) · [Demo](demo/orbita.html) · [Final product vision](demo/final-product-vision.html)

During a space mission, an astronaut needs to understand how they are doing, what has changed and which care actions they can take with the resources at hand.

**Órbita is a proposed personal health application for astronauts that brings together their body, their physical adaptation and the mission environment to help them carry out and follow up on care actions.**

> Órbita goes with the astronaut from what they feel to what they can do: it combines health, physical adaptation and habitat with guided procedures and personal follow-up during the mission.

Proposal for the challenge [Create Health Monitoring Software for Astronauts on Space Missions — NASA Space Apps 2026](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/).

## The astronaut's experience

When the app opens, **My day** would gather the available information, the changes observed and the upcoming tasks. From there, the astronaut could check their body, review their progress, follow their routine or start **I feel different**.

| Part | What the astronaut can do |
|---|---|
| **My health** | Record symptoms, vital signs and rest; explore their body and understand the measurements. |
| **Adaptation** | Review strength, endurance, aerobic capacity and bone history, alongside recorded exercise and nutrition. |
| **Habitat** | Check environmental conditions for the place and period: temperature, humidity, CO₂ or radiation, depending on available data. |
| **My plan** | Follow assigned measurements, tests, exercise, nutrition and other actions; record completion and difficulties. |
| **On board** | Run guided procedures with their purpose, required equipment, instructions and a grounded next step. |
| **My progress** | See how observations, measurements and actions taken relate to each other over time. |

These parts share history, context and follow-up. Health, adaptation and habitat belong to the product's core scope.

### The copilot's role

The copilot is the contextual help that connects the journey. It uses the available information and applicable procedures to explain what to check, what is still unknown and which task can be done with that mission's equipment. A conversational interface and generative AI are options still to be decided; the concept does not depend on them.

The copilot would organize each episode around six questions: **what you recorded, what we know, what is missing, what you can do, what happened and what is still pending**. Preparation, difficulties and interruptions are part of the record, not just the measured value.

### A concrete walkthrough

In a demo scenario with fictional data:

1. The astronaut records that they feel more tired.
2. Órbita lets them review rest, recent measurements, physical tests, activity and the matching environment, when compatible information exists.
3. The copilot helps complete the context and opens the relevant procedure.
4. The astronaut performs the task and records the result.
5. The episode stays available for follow-up or medical consultation.

**Observe → understand → take an action → record the result → continue care.**

A temporal coincidence between environment and symptoms is presented as context; it does not prove their cause.

## What we aim to set apart

The proposal focuses on completing care actions and keeping their result. Charts and the body map let the astronaut explore information within that journey.

Procedures would take available resources into account. If a test requires missing equipment, the app would explain that limitation and present the documented alternative or the need for support. Each exam would keep its method and frequency: a DXA history does not mean a DXA can be done on board.

Every piece of guidance must keep its source, version and conditions of use. Specific clinical rules and care procedures require selection and review; they are not automatically derived from the datasets.

The proposed integrated demo would show the same episode under two mission configurations: with and without the required equipment. Behavior must change visibly while keeping the follow-up. This feature is pending; its usefulness would be evaluated against metrics and static instructions. NASA already researches autonomous guides such as AMOS: we do not claim a world first.

## Try it

Órbita exists in three forms, from the simplest to open to the most complete:

1. **One file, no installation.** Build it with `npm run package` and double-click `dist/orbita.html`. It is a single self-contained page; a content-security policy blocks remote loads, `eval` and form posts, and no network request was seen in Chromium, including with hostile files, rules and notes. The policy does not restrict top-level navigation or WebRTC, and it allows inline scripts, so a future unsafe DOM sink would not be stopped by it (none exists today). Records are kept in the browser if it allows IndexedDB; the page says on screen when it does not. **Every page opened from `file://` in the same Chromium shares that storage**: it is not encrypted and not isolated per file (other browsers were not tested).
2. **The same app served locally.** `npm run serve` serves `app/` over HTTP at a loopback address. This is the form most of the tests drive.
3. **The teammate's server edition.** `frontend/` is a Next.js app with its own Node backend for the aerobic-capacity follow-up ([how it relates to the rest](frontend/INTEGRATION.md)). It needs a Node server, so it cannot be inside the single file; what was useful in it was brought into the main app (the review and export view and the manual theme).

The original single-file mockup, [demo/orbita.html](demo/orbita.html), is kept as the design reference and is not modified. [demo/final-product-vision.html](demo/final-product-vision.html) is a visualization for the team, not product code.

Everything you can open starts on **synthetic, fictional data**. "My records" is a separate source that starts empty; there you say where your entries come from (terrestrial, ground analog or flight) before anything can be recorded, and nothing is assumed. NASA data goes in "NASA cases", apart from every other view.

## What is built

The product is built in layers, each with a gate that says what it must prove ([layers](docs/IMPLEMENTATION_LAYERS.md), [status by layer and what is still open](docs/AUDIT.md)). Everything below is **built and tested by the team's agents and reviewed by independent agents, but not accepted**: module statuses in [docs/modules.csv](docs/modules.csv) stay `pending` until a person accepts each gate.

| Layer | What the person can do | Evidence |
|---|---|---|
| F1 data core | Records with three states (recorded, confirmed nothing new, not recorded), origin, source clock and unit status; memory and IndexedDB stores; a synthetic scenario | accepted by the user (G0, G1) |
| F2 situation | My health, Adaptation, Habitat, My progress, My day: every value with its method, time and origin, "not recorded" never shown as "nothing new" | built, reviewed by an agent, G2 walkthrough |
| F3 plan and procedures | My plan (tasks, repeating exams, undo, results linked afterwards) and On board (procedures with equipment checks, preparation, steps that record a value, retirement); concurrent writers are safe across tabs | built, independent agent review with fixes, G3 |
| F4 episodes | "I feel different": an episode with what was recorded, what is known and what is missing before any suggestion; a copilot that only suggests from a rule that carries a source, version and review status (none is shipped for real use); a summary for the ground; simulated sync | built, independent agent review with fixes, G4 |
| F5 NASA cases | CRF, MR079G, MR035G, MR080G and BUT CGM files can be loaded in a viewer separate from every other view, optionally kept on the device | built, independent agent review (findings listed in [the audit](docs/AUDIT.md)), G5 |
| F6 closing | One packaged file; a review and export view; a manual theme | packaging checked against the served app (G6-W1, W2); an integrated adversarial review (G6-W3) attacked every layer and its findings were fixed except one (a damaged stored record has no in-app repair path); the volunteer test (G6-W4) is **not done** (see [G6](docs/experiments/G6.md)) |

What it deliberately does not do: it has no clinical rule, threshold or diagnosis, no generative model, no real network sync, no sensors and no encryption. A suggestion appears only from a rule that someone supplies with its source, and the screen says the app cannot verify a rule\'s review status. Data from NASA studies is never presented as an astronaut\'s own. See [the central rule](CLAUDE.md#the-central-rule).

## Offline operation and scalability

The architectural recommendation is **local operation with sync when connectivity is available**: browse history and procedures, record measurements and continue tasks locally; share records and receive updates when possible. For the hackathon, the trip to the ground team is a **simulated sync** (decision D9): a send queue, a simulated link and a ground panel inside the same app, labeled as such on screen. A real server, backups and conflict resolution are a later level.

To grow, we propose our own core to which the following can be added:

- **Sensors and sources**, through connectors with explicit provenance, units and methods.
- **Procedures**, with equipment requirements, steps, sources and versions.
- **Mission configurations**, according to environment, resources and available communication.
- **Crew members**, keeping their records and permissions separate.

This is a design direction; there are no load tests, concurrency figures or demonstrated scalability yet. See the [technical design](docs/TECHNICAL.md).

## Scientific basis and NASA data

The [academic base](docs/ACADEMIC_BASE.md) gathers a targeted review of books, standards, the Human Integration Design Handbook and eight HRP reports. It distinguishes scientific evidence, normative requirements and design inferences. It is neither a systematic review nor a clinical validation of the software.

The [extended research](docs/APPLIED_RESEARCH.md) adds a targeted reading of six full texts and a [matrix of findings and proposals](docs/APPLIED_RESEARCH_MATRIX.csv):

- **AMOS:** preparation, configuration and difficulties during procedures.
- **Sprint and multisystem study:** separate exercise performed from individual physical response.
- **Bone follow-up:** keep the exam's method, region and age.
- **Sleep:** distinguish rest, self-report and instrument estimates.
- **CO₂:** show environmental context without automatically attributing causation.

Sources ground design decisions; they do not validate Órbita. Specific procedures and medical care criteria are still pending selection and review. The official evaluation guide we could consult is from 2025; whether it matches 2026 remains to be verified.

| Candidate source | Relevant use |
|---|---|
| **CRF Daily Vitals** | Explore vital signs and mass/weight recorded in a bed-rest ground analog. |
| **MR079G / MR080G / MR035G** | Investigate strength, aerobic capacity and densitometry history, respectively. |
| **MSD007 / DTO 684** | Explore historical cases of Mir environment and Shuttle radiation. |
| **OSDR Environmental Data App** | Real ISS cabin temperature, humidity and CO₂ for Habitat (terms of use to be verified). |

Studies, participants, missions, methods and frequencies are kept separate unless a match is verified. No real paired series integrating all these variables for a single astronaut was found. An identified synthetic scenario allows the integrated journey to be demonstrated without fabricating that match.

[Dataset review](docs/DATASETS.md) · [Evidence matrix](docs/EVIDENCE_MATRIX.csv) · [BibTeX references](docs/REFERENCES.bib)

## How it is built

The product was built with AI agents under human direction, in the open, with the checks written down:

- **Layers and modules.** 26 modules in 7 phases, each with a [work order](docs/work-orders/) (predictions written before the code), a record of what was run in [docs/experiments/](docs/experiments/), and a place in the [module board](docs/modules.csv). Modules talk through the [contracts](docs/CONTRACTS.md) (currently 0.22) and import each other only through their public entry point.
- **Evidence levels.** Every claim in a record says whether it was run (RUN), seen in a browser (BROWSER), read (READ) or checked against a source document (SOURCE). A figure read in an abstract is not a verified figure.
- **Negative controls.** Tests are trusted only after they were seen failing against deliberately broken code. The controls are in [tests/controls/](tests/controls/) and can be re-run.
- **Whoever builds does not approve their own work.** Independent review agents audited F3, F4 and F5 (reports summarised in [the audit](docs/AUDIT.md)); their findings were fixed with a test each or listed as open. An agent\'s review is a judgment, not an acceptance.
- **No MVP.** If time runs short, the last complete layer is delivered and named as such.

AI use is recorded in [docs/RESOURCES_USED.md](docs/RESOURCES_USED.md), including the review agents. The details of the process are in the [orchestration plan](docs/ORCHESTRATION_PLAN.md) and the [method](docs/METHOD.md).

## Run the checks

```bash
npm test                          # 435 tests (Node 22, no dependencies)
python3 scripts/check_docs.py     # consistency of matrices, module board, work orders, links
npm run package                   # dist/orbita.html
npm run serve                     # the app over HTTP
# Browser walkthroughs (development only: Python Playwright and a Chromium; set ORBITA_CHROMIUM)
python3 tests/walkthrough/g6-browser.py       # packaged file against the served app
python3 tests/walkthrough/review-browser.py   # review, export and theme, served and packaged
python3 tests/walkthrough/contrast-browser.py # contrast in every view and theme
node tests/controls/f5-controls.mjs           # negative controls (others beside it)
```

The real NASA files are **not** in git. [Restore them and rebuild the local profile](docs/LOCAL_DATA_RESTORE.md) before expecting the real-file checks (`g5-realfiles.test.js`, `g5-real-browser.py`) to run; without the files they say so and skip or exit non-zero, never pass by default.

## Own implementation

**All product functionality must be written by the team. External repositories are consulted only for inspiration, comparison and research.**

By the user's instruction, in line with the reported rules, do not copy, adapt, port or incorporate code from those repositories, including packages used to implement Órbita features. Earlier integration recommendations are superseded by this rule, even if licenses allow reuse. Do not use AI to reproduce or transform that code either.

Working and provenance rules are in [AGENTS.md](AGENTS.md). AI use must be recorded according to the event's applicable rules. Our own code is licensed under Apache-2.0; see [LICENSE](LICENSE).

## Documentation and next results

- [Final proposal, demo and acceptance criteria](docs/FINAL_PROPOSAL.md).
- [What to improve from the original proposal](docs/PROPOSAL_IMPROVEMENTS.md) and [third academic extension, series B](docs/EXTENDED_RESEARCH_B.md) with its [matrix](docs/RESEARCH_MATRIX_B.csv).
- [Orchestration plan](docs/ORCHESTRATION_PLAN.md), [contracts between modules](docs/CONTRACTS.md), [work orders](docs/work-orders/) and [module board](docs/modules.csv).
- [Implementation layers](docs/IMPLEMENTATION_LAYERS.md): what each layer must prove; [method](docs/METHOD.md): how a claim is tested; [experiment records](docs/experiments/E00-foundation-probes.md).
- [Levels and criteria for each level](docs/AGENT_ROADMAP.md) and [session guide for agents](CLAUDE.md).
- [Product and scope decisions](docs/PRODUCT.md).
- [Challenge goals and project criteria](docs/REQUIREMENTS.md).
- [Roadmap and closing criteria](docs/ROADMAP.md).
- [Free sources and conceptual references](docs/RESOURCES.md); [resources used, with licenses (delivery list)](docs/RESOURCES_USED.md).
- [Proposed architecture and repository research](docs/TECHNICAL.md).

The next results are understanding the integrated mission situation, completing plan tasks and reviewing changes with applicable procedures and follow-up. Their verification must cover missing data, provenance, consistency across views, task recovery, accessibility and understanding of the next step.

Current implementation and handoff: [CURRENT_STATUS.md](docs/CURRENT_STATUS.md). What is audited, what is open and why: [AUDIT.md](docs/AUDIT.md).

To continue elsewhere, clone the repository, create a work branch and read [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md). The branch **final-claude** holds the delivered state of this build.

## License

Apache License 2.0. See [LICENSE](LICENSE). Third-party resources and their licenses are listed in [docs/RESOURCES_USED.md](docs/RESOURCES_USED.md).

Dataset preparation now includes EDA RR-1 telemetry/radiation and OSD-51/56
metadata. [The event-specific data review](docs/SPACE_APPS_DATA_REVIEW.md)
distinguishes verified licenses from event eligibility and lists remaining
OSDR policy/download redirects. The synthetic demo remains separate from the new optional real-source import workflow; the review does not certify an unbuilt final distribution.

Dataset preparation profiles and current technical limits are documented in
[DATA_IMPORT_PREPARATION.md](docs/DATA_IMPORT_PREPARATION.md). All180 genetic
raw files are now acquired and inspected; unresolved unit facts remain
explicit restrictions on scientific interpretation, not guessed defaults.

Real-source import: [M21](docs/experiments/M21.md) provides pure CSV adapters
for CRF, MR079G, MR035G, the verified MR080G test and BUT CGM. With original
samples available locally, run `python3 scripts/import-real-samples.py` to
verify custody and load the isolated local IndexedDB profile.
[Integration evidence](docs/experiments/REAL_IMPORT.md) records3861 exact
records, restart recovery and duplicate-free reruns. Unknown units remain
unknown; no clinical interpretation or source-data publication is implied.

[Claude Code continuation prompt](docs/CLAUDE_CONTINUATION_PROMPT.md) starts from main and includes local data/profile restoration.
