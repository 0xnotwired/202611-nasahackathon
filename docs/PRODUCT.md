# Órbita: health, physical adaptation and habitat in one product

Date: November 14, 2026. Status: product direction extended by the user to integrate personal health, physical adaptation and habitat, with a copilot and On board procedures. The HTML mockup and the session video mainly illustrate the check-in and do not yet represent this whole scope. The following functional design is a proposal; it is not a validated clinical product.

## 1. Decision and scope

The user chose "Órbita with the On board procedures" and asked for it to be made concrete as an astronaut copilot. The confirmed journey is:

> I feel different → I record what is happening → the tool helps me measure correctly → I see my progress → I understand the next step.

Órbita is the astronaut's personal health product. It brings together their recorded status, the adaptation of their physical condition, the environment and the care plan during the mission. On board contains procedures that guide tasks. The copilot connects that information with relevant questions, explanations and accessible actions. A conversational form is an interface option, not an obligation to use a generative model.

**DEC-001 — Integrate tracking and procedures into that journey (historical; scope extended by DEC-002).** The initial choice connected Órbita and On board. The documentation treated physical adaptation and environment as extensions; the user later corrected that scope. The journey of recording, measuring, progress and action is kept.

**DEC-002 — Integrate health, physical adaptation and habitat as core scope.** The user expressly asked for a single product for the end user, incorporating the adaptation and habitat proposals and meeting the challenge goals provided in the session. These domains stop being optional extensions of the chosen concept. The copilot supports both the preventive routine and the review of a change; its role is not limited to chat or symptom recording. The specific choice of screens and sources is still proposed design. Merging the data depends on temporal, spatial and participant compatibility, not yet verified across all sources. Each case's integration will be revisited if compatible data is missing or task tests show confusion; this does not justify presenting the concept again as a mere check-in without stating the change. The mockup is reversible, but extending it requires changing and re-verifying the affected views and journeys. Final stack, mission, devices, generative AI, offline operation and clinical thresholds are not decided.

### 1.1. User and everyday usefulness

The main user is the astronaut. On entering, they should understand what health information they have available, what changed, which measurements or actions correspond to them and how to follow their plan. Two complementary entry points are proposed: "My day" for prevention, routine and follow-up, and "I feel different" to review an observation. The summary for the medical team is an outcome of the journey, not the center of the product.

### 1.2. Integrated domains and actions

| Domain | Relevant information | Use for the astronaut |
|---|---|---|
| Personal health | Vital signs, symptoms, rest and nutrition/activity context. | Record, understand progress and consult the applicable procedure. |
| Physical adaptation | Body mass, strength, endurance, aerobic capacity and bone history as different variables. | Compare compatible tests, review recorded exercise and nutrition and follow the assigned plan. |
| Habitat | Temperature, humidity, CO₂ and radiation when verified sources exist for the case. | Review the environment of the place and time, learn what it means and follow the relevant environmental procedure. |

The care plan connects the domains with actions: scheduled measurements and tests, prescribed exercise and nutrition, environmental review, follow-up and consultation. On board procedures explain purpose, equipment, instructions and care conditions with applicable sources. The design must provide guidance on prevention, improvements and documented treatments where appropriate, without inventing a prescription from a chart.

Frequencies depend on the protocol and the equipment. Do not turn every test into a daily task: a pre- or post-flight DXA can provide history, but must not be presented as equipment available on board without verification. A self-report of exercise is not a strength measurement, and weight or mass are not equivalent to bone density.

### 1.3. A single mission history

Progress must allow health, physical tests, activity/countermeasures and environmental events to be reviewed over the relevant period. Keep source, unit, method, subject, phase and, for environment, place/sensor and time. A piece of data is shared between views when its correspondence is verified; a temporal coincidence does not prove a cause. If the real datasets cannot be paired, keep the studies separate and use an identified simulation to show the integrated journey.

## 2. What the copilot does at each step

| Moment | Astronaut's action | Copilot support | Result kept |
|---|---|---|---|
| I feel different | Starts an observation or chooses a complaint. | Asks short questions about onset, progression and context according to the available procedure. | Self-reported observation, time and data still unknown. |
| I record what is happening | Completes the information they can provide. | Distinguishes symptoms, measurements and context; allows skipping what they do not know. | Record with provenance and explicit missing fields. |
| I measure correctly | Opens a procedure and records a reading. | Explains purpose, equipment, steps and unit from an applicable source. | Measurement linked to the procedure and the episode. |
| I see my progress | Checks the indicator's history. | Explains comparisons using only present values, with period, method and phase visible. | Trend and context; not an automatically derived diagnosis. |
| I understand the next step | Consults or performs a supported action. | Presents instructions and conditions of use with their source; points out the limits of the available support. | Action chosen, pending or done, and follow-up. |

If no applicable procedure exists, keep the observation and show that no specific guidance is available. Do not generate medical steps to fill that gap. Access to medical communication and available emergency procedures must be direct; completing the form must not be a requirement to reach them. Clinical activation conditions still need specific sources.

## 3. Proposed narrative example

A fictional interface situation, with no invented values attributed to NASA and no clinical conclusion:

1. The astronaut chooses "I feel different" and records "Today I feel more tired".
2. The copilot asks since when, what activity they did and how they rested. Whatever is unknown is left blank.
3. A measurement procedure is offered, to be selected and documented for the mission's equipment. The astronaut checks its instructions and enters a reading.
4. Órbita shows the reading together with earlier compatible ones. If comparable records are missing, it says so. If there is a change, it describes its size and period without inferring its cause.
5. On board presents the next step allowed by the reviewed procedure, or lets them prepare a consultation when no guidance applies.
6. The astronaut can save the action and generate a summary for medical communication. Generating or exporting is not the same as sending it automatically.

Examples of design microcopy: "Since when have you noticed it?", "This data is not recorded yet", "See how to measure", "See comparable records", "Check the procedure", "Prepare summary". They are not clinical recommendations.

## 4. Proposed visual organization

- **Home:** access to "I feel different", pending tasks and the latest record, with its date.
- **My body:** navigation by systems to measurements, context and related procedures. Also offer a text list. The map organizes information and does not locate diagnoses.
- **Guided measurement:** purpose, equipment, steps, input and review of the record in a single journey.
- **My progress:** charts, units, phase and provenance; separate personal observations from measurements.
- **Next step:** explained action, source, review status, follow-up and summary preparation.

The proposed screen architecture is extended with **Physical adaptation**, **Habitat** and **My plan**. Home must gather the next actions and relevant changes from all three domains. My progress must show their time context and provenance. A test's detail must link to the plan and the applicable procedure.

The copilot appears as contextual help in these views: it points out what is still to be measured, explains changes with their limits, links compatible information and opens the next grounded task. An initial interface with questions and buttons allows tasks to be done without requiring free text or conversation. Voice, avatar and open chat remain later possibilities, not confirmed features.

Separate data availability from clinical interpretation: "no measurement", "recorded" and "procedure pending" are information or task states. Any clinical attention state needs a specific reviewed rule. Always pair colors with text or symbols.

## 5. Role of AI and rules

The copilot concept does not require generative AI. As a design recommendation, the operations of saving, validating format/unit, selecting comparable data and running explicit conditions must be deterministic and traceable. A possible language model could help locate or explain reviewed content, showing its sources. It must not invent measurements, treatments, thresholds or references, or silently change an approved rule.

There are no clinical rules, comparison windows or alert values defined for the product yet. The academic review does not replace the development of that specific content.

## 6. Empirical and academic base

CRF Daily Vitals is the first candidate source to demonstrate a history of pulse, blood pressure, respiration, temperature and weight. It is a bed-rest ground analog; keep that identification. Its final selection depends on verifying units, coverage and permissions for the case. Do not attribute fictional sleep or fatigue self-reports to the original subjects.

MR079G, MR080G and MR035G are candidates for strength, aerobic capacity and densitometry history, respectively. Keep studies and subjects separate until their correspondence is verified. MSD007 and DTO 684 provide historical environmental cases from Mir and Shuttle; RadLab and EDA are candidates to investigate additional series. No paired series integrating all these variables for an astronaut has been verified. OSD-51/56 provide different molecular research and do not replace functional tests or dosimetry.

To present the case in a fictional mission, visibly separate the simulation from the viewer of real NASA data. Do not fabricate a personal history by merging cohorts. Keep originals intact and exclude CRF free-text clinical comments from the public demo by default.

Foundations and locators, developed in ACADEMIC_BASE.md:

- Preventive monitoring and continuity of care: S03, volume 1, requirements V1 3003/3004, PDF pages 18–21.
- Missing or old data and explainability: S04, volume 2, V2 10020 and V2 10170/10171, PDF pages 200 and 226–227.
- Integrated procedures and information management: S05, HIDH, sections 10.10 and 10.12.
- Nutrition and adaptation context: S01; sleep and medical capability: S09/S11, with their dates and limits.

## 7. Demonstrable result and checks

The target delivery must show an astronaut who understands their situation, checks adaptation and environment, follows their plan and completes the journey of observation, measurement, interpretation and action. The first mockup and its video only cover part of it. The integrated implementation and its final stack are still pending. The roadmap organizes complete outcomes, without presenting non-working buttons as delivered capabilities.

Check against the challenge: understandable visual assessment, feasible means of measurement, explanation of hazards and risks, guidance on applicable prevention/improvements/treatments, care conditions and follow-up. These are the goals and considerations shared by the user; no additional official scoring rubric has been verified.

Check when implemented: saving and restoring; editing a piece of data; incompatible unit; missing information; insufficient history; separation of subjects/phases; unavailable procedure; keyboard navigation; consistency between map, detail and summary; visible sources and no automatic sending. Comparison with a list and understanding of the next step require evaluation with tasks; they have not been run yet.

Related documents: REQUIREMENTS.md, ROADMAP.md, ACADEMIC_BASE.md and DATASETS.md.
