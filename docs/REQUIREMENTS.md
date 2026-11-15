# Space Apps 2026 — criteria for choosing and building the solution

Source: challenge goals and considerations provided by the user in this session.
Challenge: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/

This document keeps the brief and distinguishes its goals from optional suggestions. The product direction chosen is recorded below; architecture and final dataset selection are still pending.

## Direction chosen by the user

On November 14, 2026 the user chose **Órbita with the On board procedures**, with the journey "I feel different → I record what is happening → the tool helps me measure correctly → I see my progress → I understand the next step", and asked for it to be made concrete as an astronaut copilot.

The copilot integrates recording, guided measurement, follow-up and traceable guidance. PRODUCT.md develops this choice and distinguishes the confirmed journey from the screens, technologies and rules still proposed. The choice does not fix generative AI, devices, mission, offline operation or clinical thresholds.

The user later extended the direction: integrate **personal health, muscle/bone/physical capacity adaptation and habitat** into a single product for the astronaut. Adaptation and environment move into core scope. The copilot must connect those domains with procedures and a care plan, both in the preventive routine and when recording a change. The current mockup and video mainly show the check-in and do not yet represent this full scope. PRODUCT.md, DEC-002, records the update.

## Core goals of the challenge

- Create a visual tool for astronauts to assess their own health during space missions.
- Provide guidance on treatments and health improvements.
- Present metrics and assessments clearly to the user.
- Work with data that represents health indicators; the input type is open.

## Questions that should guide the design

For each indicator, assessment or proposed action, explain:

1. Which measurement can be performed in space and which equipment or intervention it requires.
2. Why that measurement or exam is needed.
3. How spaceflight hazards can affect the indicator.
4. When a result deserves the attention of the crew or of physicians on Earth.
5. Which actions can prevent a critical condition or improve health.

Resources from the NASA Human Research Program and other space agencies can ground these answers. The astronaut is not assumed to have full medical knowledge.

## Suggested options, not mandatory requirements

- Input by text, clicks, camera or other means.
- Use of numeric values or medical images, as long as they represent health indicators.
- Human figure with selectable regions and an explanation of their function and status.
- Animations and interactivity to communicate information.
- Adaptation to spacecraft, station, rover or lunar/planetary base.
- Reminders of measurements and actions within the mission routine.
- Gamification to support health habits.
- Dynamic charts of change over time.
- Colors to make quick interpretation of status easier.
- Simple instructions on measurements, indicators and risks.

## Working criteria derived for our project

These are project criteria to make the brief concrete; they are not presented as additional requirements imposed by NASA:

- The journey must let the user understand what was observed, what it means and what the next step is.
- Measurements, their units and their context must be clear.
- Health explanations and guidance must keep their sources and evidence limits.
- Identify real, simulated, ground analog, flight and cell culture data.
- Distinguish observed changes, hypotheses and validated diagnoses.
- If measurements or context are missing, show that gap when assessing status.
- If colors are used, pair them with text or symbols.
- Choose optional features by their contribution to assessment and health actions.

## Evidence already reviewed

Review of the shared datasets: DATASETS.md

CRF Daily Vitals is a candidate source for daily monitoring with human bed-rest data. Its earlier recommendation is not a user decision to limit the project to that dataset or to a single body system.

## Checking a future proposal

Every proposal must make explicit its user, mission situation, indicators, means of measurement, visual assessment, guidance, medical attention criteria and the evidence used. The optional features chosen must contribute to that journey.

## Resource constraint

The user asks for free books and repositories. Select full texts accessible without payment or subscription and tools usable without mandatory commercial services.

## Language

On November 15, 2026 the user reported that the hackathon requires English. The repository was translated on the `english` branch, which is the integration branch from that date on. The official text of this requirement was not verified independently.
