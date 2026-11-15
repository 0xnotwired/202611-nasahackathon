# Proposed technical design and research

Status: proposal, without integrating any of the repositories consulted. The implementation must be our own, according to ../AGENTS.md.

## Proposed modular architecture

Construction is organized in 25 layered modules; a module only imports from lower layers and only through the other module's `index.js`. The details are in [ORCHESTRATION_PLAN.md](ORCHESTRATION_PLAN.md) and the interfaces in [CONTRACTS.md](CONTRACTS.md).

| Layer | Modules | What it guarantees |
|---|---|---|
| Base | core, mission, catalogs | What a valid record is; the mission's equipment and communication; reference data with sources |
| Persistence | store | The only door to data; does not edit or delete records; says when it is not persistent |
| Domain | readings, procedures, plan, privacy, importers | Queries without clinical judgment; executions that respect the equipment; assigned separated from done |
| Episode | episode, copilot, summary | The episode's six parts; data before suggestion; export faithful to the history |
| Sync | sync | Simulated send queue, link and ground panel (D9), behind an interface a real server can implement later |
| Interface | ui/base and one folder per view | The same data looks the same in every view; everything works with the keyboard |

Proposed and unconfirmed decisions: untranspiled JavaScript with no dependencies, IndexedDB behind our own interface, `node --test` for the domain, our own local static server, no encryption, simulated sync. ES modules do not load from `file://`, so single-file delivery is a separate module at the end. None of this has been run in a browser yet.

## Our own features to build

A procedure engine with steps, conditions, required resources, preserved state and versioned sources; a common measurement format with unit, time, method and provenance; independent connectors to import sources; a history that preserves observations and results; and a task plan linked to the procedures.

The recommended offline design requires persistence, backup, recovery and sync with explicit conflict rules. They are not implemented in the demo. Saving records in localStorage is not the same as solving that architecture. For the hackathon, sync is simulated and labeled as such (D9).

Scalability will be evaluated by adding a mission, procedure or source without rewriting the other functions. For multiple crew members, separate identity, permissions and records. Concurrent capacity and performance have not been measured.

## Repositories studied: inspiration only

- XState: https://github.com/statelyai/xstate — conceptual reference for states and transitions; write our own engine.
- LHC-Forms: https://github.com/LHNCBC/lforms — data-defined forms and partial FHIR SDC support; write our own forms.
- Open mHealth: https://github.com/openmhealth/schemas — reference on meaning, metadata and units; do not copy its schemas as code. Sleep and activity point to IEEE 1752.1 successors.
- CQL Execution: https://github.com/cqframework/cql-execution — reference for separating logic, data and terminology; it does not bring automatically applicable medical rules.
- Medplum: https://github.com/medplum/medplum — reference for interoperable health organization.
- Android FHIR SDK: https://github.com/ohs-foundation/android-fhir — reference for offline health operation on Android.
- Open MCT: https://github.com/nasa/openmct — reference for telemetry and time navigation.

ThingsBoard is not selected as a base: the README consulted declares BUSL since 4.4, while earlier versions keep Apache-2.0. In addition, no open license replaces the own-code rule.

## Comparison with other proposals in the track

Repositories found: https://github.com/quantum-astronauts/pulsar ; https://github.com/Yii0909/VitalOrbit ; https://github.com/mysunatislam/astrobone-space-apps-2026 . Their authors announce features such as maps, personal tracking and guidance. These are documentary claims, not results of independent tests; their code was not exhaustively inspected and permission to reuse was not checked.

The proposed differentiation is running procedures matched to the mission's equipment and keeping the result of each action, integrating health, adaptation and environment with compatible information. No exclusivity over other products is claimed.

## Evaluation case

Show the same synthetic episode with two resource configurations: identify what can be measured, point out missing information, offer a documented path, keep progress and record the result. Compare interpretation errors, task completion and understanding of the next step; do not invent numeric targets or clinical validation.
