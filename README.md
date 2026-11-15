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

## Try the current mockup

1. Download [demo/orbita.html](demo/orbita.html) with **Download raw file** on GitHub.
2. Open the file in a current browser.
3. Explore the body and the charts, select **I feel different** and complete the check-in with fictional data.
4. Open **My progress** and prepare a TXT summary.

[demo/final-product-vision.html](demo/final-product-vision.html) shows how Órbita would look with the plan's 25 modules built, including the aerobic capacity tracking proposed by Iván. It is a visualization for the team, with synthetic data for four fictional crew members: it is not product code and does not replace the modules in `app/`.

No installation, server or account is needed. The interface is self-contained and the walkthrough works offline; external links to NASA require a connection. Saving and restoring depend on the storage the browser allows. Sharing the HTML does not share the records stored in another browser.

[Instructions and scope of the checks](docs/DEMO_README.md).

### Actual project status

| Available | Pending implementation |
|---|---|
| HTML mockup with synthetic data, interactive body and charts. | Integration of health, physical adaptation, habitat and a shared plan. |
| Guided check-in, local demo storage and TXT summary. | Procedures adapted to mission resources and integrated follow-up of results. |
| Product definition, roadmap and targeted academic review. | Sensor connectors, sync and a final persistence architecture. |
| Build plan in 25 modules, with contracts and work orders. | Later domain modules and product views: `app/` contains M00 plus M01–M05; the rest are placeholders. |

The mockup mainly shows the initial check-in. It has no sensor integration, loaded NASA data, medical communication, AI model or validated clinical protocols. Use only fictional information in the demo. Choosing NASA sources does not imply certification or endorsement of the tool.

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

M00 and the F1 data core (M01–M05) are implemented and independently reviewed; later modules remain placeholders. Further modules are built with AI agents under human review.

- **25 modules in 7 phases.** Each phase delivers something the astronaut can use: save records without losing their origin, see their situation, complete a procedure, close an episode.
- **One module, one agent, one folder.** Modules communicate through [contracts](docs/CONTRACTS.md) fixed in advance, and each agent receives a [work order](docs/work-orders/) with its acceptance criteria.
- **Whoever builds does not approve their own work.** Another agent reviews by running it, and a person approves each phase.
- **No MVP.** If time runs short, the last complete phase is delivered and named as such.

The details are in the [orchestration plan](docs/ORCHESTRATION_PLAN.md) and each module's status in [docs/modules.csv](docs/modules.csv). The proposed stack (HTML, CSS and JavaScript with no dependencies) awaits the team's confirmation.

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

The repository contains documentation, two mockups, M00 foundation and the implemented M01–M05 data core. The stack decisions are recorded in [IMPLEMENTATION_LAYERS.md](docs/IMPLEMENTATION_LAYERS.md). Run `node --test` for foundation, domain and G0/G1 checks, `python3 scripts/check_docs.py` for documentation consistency, and `npm run serve` for the minimal modular shell. No dependencies need installation. The [G0 record](docs/experiments/G0.md) documents user-authorized local integration, 37 passing tests, the HTTP browser check and the unverified file-origin CORS control. The [G1 record](docs/experiments/G1.md) adds 83 passing tests and actual IndexedDB persistence/restart checks. The user accepted and closed G1/F1 on November15; the [source-uncertainty follow-up](docs/experiments/SOURCE_UNCERTAINTY.md) brings the suite to87 passing tests. Branch `f2` is the starting point for the next phase; M06–M12 remain pending. Three small real CSV samples are now acquired; [schema2 preserves source dates without a known zone and explicit unknown units](docs/experiments/SOURCE_UNCERTAINTY.md); CRF units remain source-unconfirmed; no real-file importers, product views, clinical validation or deployment are included. To contribute, follow [AGENTS.md](AGENTS.md) and propose changes through branches and pull requests. The integration branch is `english`.

## License

Apache License 2.0. See [LICENSE](LICENSE). Third-party resources and their licenses are listed in [docs/RESOURCES_USED.md](docs/RESOURCES_USED.md).
