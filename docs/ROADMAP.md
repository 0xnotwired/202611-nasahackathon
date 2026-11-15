# Órbita roadmap: health, physical adaptation and habitat

Implementation and verified handoff state: [CURRENT_STATUS.md](CURRENT_STATUS.md).
This document defines scope/design; planned capabilities are not completion claims.

Status: product direction chosen by the user; the implementation sequence is the assistant's proposal. The confirmed journey and the functional design are recorded in PRODUCT.md. There is an HTML mockup with synthetic data to present the concept (DEMO_README.md); it does not imply NASA integration or completion of the clinical levels described here. There is no final stack. The initial upload of documentation and demo to the repository was requested by the user; it does not authorize deploying the application. It is organized by product outcomes, following destination-driven-construction.

How this roadmap is split among agents, into phases and modules: [ORCHESTRATION_PLAN.md](ORCHESTRATION_PLAN.md).

## Destination

A personal visual tool that lets the astronaut understand their health, physical adaptation and environment; follow their care plan; measure, understand changes and consult grounded guidance. The map organizes the known status, the timeline keeps the context, the plan connects results with actions and On board guides the procedures. The same measurement and the same rule must mean the same thing on every screen. The three domains are core scope by the user's decision, not future extensions (PRODUCT.md, DEC-002).

The copilot connects the chosen journey: "I feel different → I record what is happening → the tool helps me measure correctly → I see my progress → I understand the next step". It also supports "My day": scheduled measurements, prescribed exercise/nutrition, periodic tests and environmental review. Its interventions are contextual help within each level; they do not require a chatbot or authorize the system to generate new medical criteria.

History, explanations and guides should be available offline. This is an architectural recommendation for the proposal, not a requirement confirmed by the user. The choice of technologies is pending a compatibility and license check.

## Preparation: define the demonstrable case

- Choose a mission situation and the indicators that can be measured with the available equipment.
- Take CRF Daily Vitals as the initial candidate for pulse, blood pressure, respiration, temperature and weight. Check units and protocols before using the values.
- Define physical adaptation with MR079G, MR080G and MR035G according to the chosen function. Distinguish mass, strength, endurance, aerobic capacity and bone density; verify which exams are possible on board and which provide pre/post history.
- Verify environmental sources for the case, sensor, place and time: MSD007/DTO 684 for historical cases; investigate RadLab/EDA for additional series. No paired integrated data between all sources has been verified.
- Audit a campaign's coverage and separate subject, phase, repeated measurements and gaps. The 113-row sample already reviewed allows the format to be explored, but does not replace this audit.
- Identify specific sources for each explanation, measurement guide and care guidance. Review their applicability to a space mission.
- Choose a scenario with real data and visibly distinguish ground origin. If synthetic cases are needed, identify them as such from creation.
- To demonstrate the three domains in the same fictional mission, use an identified simulation if there is no real match. Keep the original NASA cases separate to explore their evidence; do not merge cohorts as one astronaut.
- Define screens and journey content before choosing libraries: My day, body, physical adaptation, habitat, progress, My plan, procedures and communication summary.

Exit result: a case, its sources, its limits and verifiable acceptance criteria. There are no previously approved alert values or reference windows.

## Level 1: understand my mission situation

The astronaut checks personal health, physical adaptation and habitat in a coherent case, distinguishes what is known from what is pending and understands origin and context. They can explore periodic tests, activity and environment over time, with their limitations. The map and the text views access the same information. Phases, units and methods are visible; a statistical change is not presented as a diagnosis. If the case is simulated, the interface says so.

From this level on, original data, provenance, units, gaps and persistence of the necessary transformations are kept. If local operation is adopted, include the required resources without depending on a CDN during use.

Done when the charts match the case data; the real NASA exploration matches verified files; and phases, methods, environmental context, import errors, simulated data and missing information are distinguished. Missing exams do not appear as healthy results.

## Level 2: complete my routine and follow my plan

The astronaut checks which actions correspond to them according to the assigned plan and its frequencies: measurements, exercise, nutrition, physical tests and environmental review. On board explains the purpose, equipment and instructions of each supported task. They record value, unit, context and execution, correct invalid entries and recover follow-up. The copilot presents documented questions and procedures; unknown information stays explicit. Each type of exam keeps its real frequency; a daily DXA is not scheduled and equipment on board is not assumed without verification.

Each result has an explanation and a grounded next step: complete context, repeat under a documented procedure, follow a reviewed guide or prepare a medical consultation, depending on the case and the evidence. Experimental rules are identified and not presented as validated flight medical criteria.

Done when a plan task can be completed and recovered, its effect seen in the history and what is pending understood. Prescribed plan, recorded activity and observed result must be distinguished. Values are not invented when a measurement is missing.

## Level 3: review a change and continue care

The astronaut starts "I feel different" and the copilot links observation, measurements, physical tests, plan completion and the environment of the place/time when there is a match. It explains changes and limits, identifies missing information and opens an applicable procedure. Presenting data together does not prove causation. Communication or available help can also be reached without having to complete the questionnaire.

The user can review pending actions, record follow-up and export a summary with indicators, progress, missing data and relevant sources to communicate a concern. Free-text clinical comments from CRF are not included in the demo by default.

Done when the map, history, check-in and export show consistent results and the full journey is usable with the keyboard, with text in addition to any status color.

This integrated journey is the recommended goal for the delivery. The current mockup and video only show the check-in and do not complete this level or the full chosen scope. If time runs out, state the level reached and the pending scope without presenting the isolated check-in as fulfilling the full integration.

## Closing the hackathon delivery

Adversarially review each level as it is built and check that it keeps the earlier properties. Run the local checks required by each claim or change at the corresponding time. When the delivery horizon is reached, do an integrated review and then the relevant integrated tests; do not leave data correction or medical content review for this closing step.

Check the full journey with:

- Present and missing data; invalid file or input; ambiguous units and dates.
- Identifiers with leading zeros and separation of campaigns and phases.
- Distinction between observed change, experimental rule and diagnosis.
- Persistence and, if adopted, end-to-end offline use.
- Consistency of the map, charts, records and exported summary.
- Integration of health, physical tests, countermeasures and environment without duplicating or changing the meaning of the same record.
- Distinction between daily measurements, periodic assessments and history of exams that require ground equipment.
- Accessibility and understanding of the next step by someone without full medical knowledge.

Prepare a presentation with the problem, usage journey, concrete NASA contribution, evidence and limitations. Show features that actually run. Record sources, licenses and AI use according to the event rules. Publishing requires an applicable instruction from the user.

## Conditions for a coherent demo

The presentation must show the usefulness for the astronaut: understand their situation, perform a task, check adaptation and habitat and understand an action. NASA sources provide evidence and data in their original contexts; a synthetic case integrates the experience when there is no real paired data. The status of procedures and rules must be visible. Health, adaptation and habitat share history and plan; adding three independent panels does not demonstrate that integration.

Reserve time for review and presentation. Adjust the number of journeys implemented to the time available, without lowering integrity or silently removing domains from the chosen product. There is no validated estimate of working days without knowing the team, the time and the clinical/environmental case.
