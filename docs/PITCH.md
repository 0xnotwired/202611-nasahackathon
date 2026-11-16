# Órbita — pitch script

[Project README](../README.md) · [Spanish script](PITCH_ES.md)

Target: approximately three minutes, including short screen transitions. Timing is a rehearsal estimate, not a measured recording. Stage directions are not spoken. Use only the fictional demo; prepare the tabs and episode before presenting. Do not show personal profiles or original clinical comments.

## 0:00–0:25 — The problem

**Show:** project name, then My health.

> Imagine you are far from Earth and you feel unusually tired. You have a few measurements, a task plan and limited equipment. What do those numbers actually tell you? What is missing? What can you do next?
>
> We built Órbita to connect those questions in one visual health tool for astronauts.

## 0:25–1:00 — The solution

**Show:** My health, then My progress. Point to a date, method and chart gap.

> Órbita brings together health indicators, physical assessments and environmental context. Every measurement keeps its origin, method and time. A missing value stays missing: it does not become zero or a claim that everything is fine.
>
> The goal is to make the available information understandable, then connect it to an action and a result the person can follow up.

## 1:00–1:45 — The demonstration

**Show:** open a Fatigue episode in I feel different. Then show On board and My plan.

> Here, we report fatigue using fictional demo data. Órbita organizes what was recorded, what information is available and what is missing before showing a suggestion.
>
> Procedures check preparation and available equipment. Change the mission configuration and an unavailable procedure is identified. When a task is completed, its result is recorded separately: doing an activity is not proof of recovery.
>
> The demo rule is fictional. Real guidance requires reviewed content, with a source and version; the software does not diagnose or prescribe treatment.

## 1:45–2:15 — Follow-up and distance from Earth

**Show:** episode summary, Review and export, then the simulated ground panel.

> The episode can produce a structured summary, and records can be exported with their provenance. Preparing a summary does not send it. Sharing is a separate decision.
>
> The main application runs locally and can be packaged into one HTML file. Our ground panel demonstrates communication through an explicitly labeled simulation; it is not a live link to a medical team.

## 2:15–2:40 — What we built and why it matters

**Show:** architecture diagram or overview of the application.

> We built eleven connected views using JavaScript, browser storage and SVG, with no runtime dependencies in the main application. NASA research informed our design; source-specific imports keep research cases separate from personal records.
>
> Our contribution is the connection between information quality, available resources and follow-up. Human usability studies and clinical validation remain open.

## 2:40–3:00 — Close

**Show:** Órbita name and the journey: Observe → Review → Act → Record → Follow up.

> Órbita helps a crew member see what is known, recognize what is missing, and keep a traceable record of the next action and its result.
>
> Your health, on board.

## Prepared questions

| Question | Answer |
|---|---|
| Does it diagnose or recommend treatments? | No validated diagnostic or treatment engine is included. The rule mechanism accepts sourced, versioned content; real clinical content requires qualified review. |
| Is the copilot generative AI? | No. It uses explicit rules supplied as data. AI assistance was used during development, not as a clinical decision engine. |
| Are the demo records from an astronaut? | No. The integrated demo is fictional. Imported research files are separate and retain their actual origins. |
| Does it communicate with Earth? | The current transport is a labeled local simulation. |
| What hardware does it need? | A computer with a browser for the demo. We have not integrated medical devices. |
| Has it been validated with astronauts or patients? | No. Software checks and Chromium walkthroughs exist; human and clinical validation are not established. |
| Is local storage encrypted? | Not by the application. This is a stated limitation, not a clinical deployment claim. |
| Will this improve mission health outcomes? | We do not know yet. That requires a study; our demonstrated contribution is the implemented information-and-follow-up workflow. |

Evidence and remaining work: [Technical README](TECHNICAL_README.md), [audit](AUDIT.md) and [handoff](HANDOFF.md). Keep scientific references and dataset acknowledgments in the submission; a spoken pitch does not replace citations.
