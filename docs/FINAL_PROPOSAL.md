# Órbita: final product proposal

Proposal version: November 14, 2026. It consolidates the integrated scope chosen by the user and the recommendations derived from the research. "Final" describes the proposal to present to the team; it does not mean an implemented or clinically validated product.

## The product

**Órbita would be a personal health application for astronauts that brings together their body, their physical adaptation and the mission environment to help them carry out and follow up on care actions.**

In **My day** the astronaut would find the available information, the changes observed and the tasks in their plan. They could continue their routine, explore their status or start **I feel different**. The copilot connects information and procedures with the next possible step in that mission.

> Órbita goes with the astronaut from what they feel to what they can do: it combines health, physical adaptation and habitat with guided procedures and personal follow-up during the mission.

## Integrated experience

| Part | Function for the astronaut |
|---|---|
| My health | Record symptoms, vital signs and rest; explore the body and understand the measurements. |
| Adaptation | Review strength, endurance, aerobic capacity and bone history, alongside recorded exercise and nutrition. |
| Habitat | Check temperature, humidity, CO₂ or radiation according to data available and compatible in place and time. |
| My plan | Follow assigned actions, record completion and difficulties and recover pending items. |
| On board | Run procedures with purpose, equipment, preparation, steps, source and a grounded next action. |
| My progress | Review observations, measurements, actions and results on a single timeline. |

Health, adaptation and habitat are confirmed core scope. The detail of screens, procedures, sensors and architecture is proposed design. The sections share records: an action is saved once and appears consistently in the plan, the episode and the history.

## The copilot and the care episode

An episode brings together six elements:

1. **What you recorded:** symptom or observation, time and context.
2. **What we know:** relevant measurements with origin, method, unit and age.
3. **What is missing:** information, equipment or review needed.
4. **What you can do:** a procedure applicable to the available resources.
5. **What happened:** result, difficulty, interruption or inability to complete.
6. **What comes next:** plan follow-up or support provided for by a reviewed guide.

**Observe → understand → take an action → record the result → continue care.**

The copilot is contextual help. It can start with our own explicit rules and reviewed content. Chat and generative AI are pending options; no generative model is needed to connect the journey. No source allows diagnoses, thresholds or treatments to be invented.

## What we aim to set apart

The proposal combines procedures adapted to resources, visible information quality and continuity after a result is recorded. If equipment is missing, the app explains the limitation and presents only a documented alternative or the need for support. If a task is interrupted, it keeps what was done and what is pending.

There is no proven world first: NASA has already researched autonomous guides such as AMOS. Our value hypothesis is that this integration helps people complete and understand actions better than a screen of metrics and static instructions. It must be evaluated.

## Research-backed design decisions

| Evidence | Proposal it motivates | Limit that must be kept |
|---|---|---|
| A01: AMOS, ISS demonstration | Check preparation and configuration; record difficulties | Small study, with exclusion due to deviation; it does not prove autonomous diagnosis |
| A02–A03: Sprint and multisystem study | Separate the plan, exercise performed and physical response | Self-selection/confounders; possible cohort overlap; no automatic individual prescription |
| A04: bone follow-up of 17 astronauts | History by region, method and date | One year of follow-up does not prove lifelong irreversibility; DXA is not equivalent to HR-pQCT |
| A05: sleep on Shuttle/ISS | Distinguish rest, self-report and instrument estimate | Actigraphy does not measure stages; the study did not directly measure operational errors |
| A06: ground CO₂ trial | Link compatible environmental context and show uncertainty | Acute ground exposure does not represent a long mission or prove individual causation |

References, methods and limits: [applied research](APPLIED_RESEARCH.md) and [matrix](APPLIED_RESEARCH_MATRIX.csv). The [academic base](ACADEMIC_BASE.md) keeps standards, books and HRP reports reviewed earlier. These are targeted reviews; they do not constitute clinical validation of the product.

## Proposed demo for the hackathon

**Synthetic integrated case:** an astronaut records fatigue. They check rest, unfinished exercise, a previous physical test and the module's environment. The bone history shows date and method without inventing a current result. The copilot identifies missing information and opens a relevant measurement procedure, whose content must be reviewed before being presented as applicable guidance.

The astronaut confirms equipment and preparation, completes the task or records a difficulty. My plan and My progress incorporate the result and the follow-up. A second configuration removes that equipment: the procedure changes to unavailable, explains why and keeps what is pending.

**Separate NASA cases:** add a reproducible CRF case and an adaptation case from MR079G, MR080G or MR035G depending on verified files. Keep their cohorts and their status as ground analogs. No real series pairing all domains for the same astronaut has been verified. Do not merge Mir, Shuttle, ISS and bed-rest data as a single person.

The NASA contribution must be visible in data, context and procedure rationale, not just in the references. Check [DATASETS.md](DATASETS.md) before integrating files. Do not include free-text clinical comments in the public demo.

## Relation to the challenge

The visual tool lets the astronaut explore indicators, understand their meaning and act with guidance. Each procedure must explain what is measured, why, with which equipment, how it relates to mission risks and which next step follows. Guidance on care and treatment requires specific reviewed procedures; storing symptoms alone does not meet that objective.

The official evaluation guide consulted is from **2025**: impact, creativity, validity, relevance and presentation serve here as a provisional reference. The 2026 guide could not be verified due to access errors. Do not automatically carry over format or eligibility requirements from the previous year.

Our submission should show usefulness through a complete journey, creativity in handling constraints, traceable scientific grounding, substantive use of NASA resources and a clear story with features that actually run.

## Proposed acceptance criteria

- Complete and recover an episode from observation to follow-up.
- Show health, adaptation and habitat connected to the same context, without fabricating correspondences.
- Block tasks that require missing equipment and explain why.
- Keep interruptions and difficulties without counting them as success.
- Distinguish current, old, missing and non-comparable data; pair colors with text.
- Keep consistency between record, plan, history and export.
- Show source, version and review status of procedures.
- Separate synthetic data, ground analog data and flight data both on screen and in exports.

### Criteria added by the third extension (series B)

Proposed on November 14, 2026 at the user's request; pending team review. Rationale and limits in [PROPOSAL_IMPROVEMENTS.md](PROPOSAL_IMPROVEMENTS.md) and [EXTENDED_RESEARCH_B.md](EXTENDED_RESEARCH_B.md).

- Distinguish three states in every record: recorded, confirmed nothing new and not recorded. "Not recorded" is never shown or exported as "nothing new" (B03).
- Offer in "I feel different" a catalog of observations with their source; record the observed symptom, not a diagnosis (B01, B02, B04–B06).
- Configure the mission along two axes: equipment and communication mode. With delayed communication, the summary can be understood without back-and-forth (B10, B11).
- Show the data before the suggestion and say "There is no reviewed guidance for this" when no rule applies (B12).
- Issue a single alert per episode, without repeating it (B13).
- Show how many measurements support each comparison with the personal baseline (B07, B09).
- If radiation is shown, present cumulative dose next to the career limit labeled as a program requirement; no personal cancer probability (B15, pending confirmation of [V1 4030] in S03).

We propose a formative test with 6–8 non-specialist volunteers and fictional cases, alternating the order between the guided journey and an interface of metrics with static instructions. Measure omissions, errors, time to find the next step and understanding of limits. The size is a usability proposal; it does not prove clinical efficacy or represent the astronaut population. With groups of that size an appreciable fraction of problems may go undetected (B14): prefer two rounds with fixes in between. The tests have not been run yet.

## Proposed operation and scalability

We recommend local operation with later sync, pending an architectural decision. For the hackathon, sending to the ground is a simulated sync (decision D9 in [ORCHESTRATION_PLAN.md](ORCHESTRATION_PLAN.md)), labeled as such on screen; a real server, backups and conflict resolution are a later level.

Our own core would manage measurements, episodes, tasks and executions. Our own sensor adapters, versioned procedures and mission configurations would be added. Each execution keeps the guide version used. Crew members' records and permissions remain separate. This describes extensibility; there are no load tests and no demonstrated scalability.

All functionality must be written by the team. External repositories only inspire concepts; their code or functional packages are not copied, adapted or incorporated. Keep source attributions and record AI use according to applicable rules.

## Current status and next delivery

There is an HTML mockup with synthetic data, a guided check-in, local demo storage and TXT export. It mainly covers the check-in. Full integration, resource-sensitive procedures, connectors and clinical validation are still pending.

The recommended next delivery is **a complete episode integrating the three domains, two resource configurations and follow-up of the result**, together with verifiable NASA cases. Before implementing it, the procedure, its sources, the equipment and the medical support criteria must be defined. Generative diagnosis, global scoring and clinical prediction from omics are outside that proposed delivery.

See [PRODUCT.md](PRODUCT.md) for historical decisions, [REQUIREMENTS.md](REQUIREMENTS.md) for the brief and [ROADMAP.md](ROADMAP.md) for the earlier sequence. This document consolidates the current proposal without turning technical options into approved decisions. The plan to build it by phases and modules is in [ORCHESTRATION_PLAN.md](ORCHESTRATION_PLAN.md).
