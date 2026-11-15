# Órbita: contracts between modules

Version 0.4 · November 15, 2026 · **proposal**, pending gate G0. Only the orchestrator edits this file. M00 turns it into `app/contracts/` (JSDoc definitions) and into contract tests in `tests/contract/`. If this document and those files disagree, this document wins and the code is fixed.

Plan and modules: [ORCHESTRATION_PLAN.md](ORCHESTRATION_PLAN.md). Rationale for the rules: [PROPOSAL_IMPROVEMENTS.md](PROPOSAL_IMPROVEMENTS.md) and [AGENTS.md](../AGENTS.md).

## 1. Conventions

- **ES modules**, `.js` files, `package.json` with `"type": "module"`. The same file runs in Node and in the browser.
- **A single door.** Each module exports through its `index.js`. Nobody imports another module's internal file.
- **Result, not exception.** Every function that can fail for a foreseen reason returns `{ ok: true, value }` or `{ ok: false, error: { code, field?, message } }`. Exceptions are reserved for programming errors.
- **`message` names the problem.** "Missing field `origin`", not "invalid data".
- **Time.** ISO 8601 strings in UTC. The domain does not read the clock: it receives `clock()` as a parameter. Identifiers are generated with an injected function.
- **Identifiers.** Always text. `"007"` is not `7`.
- **Names.** English identifiers in camelCase for functions and snake_case for data fields (`mission_phase`, `schema_version`).
- **Asynchronous.** The store and everything that uses it return promises.
- **No dependencies.** No `import` points outside the repo, except `node:` modules in tests and scripts.

## 2. Rules no module may break

| # | Rule | Where it is checked |
|---|---|---|
| R1 | `not_recorded` never turns into `confirmed_none`, whether on save, on screen or on export | M01 contract test; G1 and G4 walkthroughs |
| R2 | A missing value is not zero: it does not enter averages, sums or charts | M06 |
| R3 | Two records are compared only if subject, variable, unit and method match. Otherwise the reason is returned | M01, M06 |
| R4 | `origin` travels with the data to the screen and the export | All |
| R5 | An execution stores the version of the procedure it used | M13 |
| R6 | No module's code contains clinical thresholds, scores or diagnoses. A criterion for attention exists only as data in `MissionConfig.attention_criteria`, with who defined it, its source and its review status; a variable without one shows "no attention criterion defined for this mission". Nothing computes a mood or depression score | Review; M06 test that a variable with no criterion never returns `within` |
| R7 | A saved record is never modified or deleted. Correcting means adding a record with `corrects` | M04 |
| R8 | Nothing leaves the device without an explicit action by the astronaut, and that action is logged | M18, M19, M24 |
| R9 | One subject's data is never mixed with another's, and NASA data is never assigned to the synthetic subject | M04, M21 |

The two directions of error do not weigh the same. When in doubt, a module returns "not assessed" or "not comparable": it is visible and annoying. Returning "normal" without data is silent, and it is the failure the product exists to avoid.

## 3. Data

Every saved object carries `schema_version`. When reading an unknown or newer version, the store refuses and says so; it does not interpret it as the current one.

```
Record
  id              text
  schema_version  integer
  type            observation | measurement | action | environment | exam
  state           recorded | confirmed_none | not_recorded
  variable        catalog text (e.g. "pulse", "headache", "co2")
  value, unit     required if type is measurement, environment or exam and state is recorded
  method          instrument or "self_report"
  time            ISO 8601; for environment, also interval { from, to }
  origin          synthetic | ground_analog | terrestrial | flight | cell_culture
                  (terrestrial: people on Earth who are not in a spaceflight analog)
  source          id from the sources catalog, or "user_entered"
  mission_phase   text
  subject         text
  place, sensor   required if type is environment
  corrects        id of another record, optional
  note            short structured text, optional; never a free-text clinical comment

MissionConfig
  id, name
  available_equipment   list of ids from the equipment catalog
  communication         real_time | delayed | no_link
  phases                list of { name, from, to }
  environment           station | spacecraft | rover | surface_base
  gravity_note          text, optional; explanation only, changes no calculation
  attention_criteria    list of AttentionCriterion; may be empty

AttentionCriterion
  id, variable, unit
  low?, high?           at least one; compared only when the record's unit equals `unit`
  defined_by            who set it (e.g. "flight surgeons" or "team demo")
  source                citation or "team_defined"
  review_status         demo | reviewed

Procedure
  id, version, title, purpose
  required_equipment    list of equipment ids
  preparation           list of check steps
  steps                 list of { id, text, records?: variable }
  source, review_status draft | demo | reviewed
  documented_alternative  id of another procedure, optional; never inferred

Execution
  id, procedure_id, procedure_version, subject
  state           blocked | in_progress | interrupted | completed | could_not
  current_step, started, updated
  difficulties    list of structured texts
  records         ids of the Records produced

Task
  id, subject, day, procedure_id?, description
  assigned_by     source of the plan
  completion      pending | done | not_done
  execution_id?   link to what was done
  result_ids      links to what was observed afterwards

Episode
  id, subject, opened, closed?
  observation_id      the Record that started it
  execution_ids, record_ids, task_ids
  alert_issued        boolean

Shared
  id, subject, time, what (ids or "summary:<id>"), with, channel

Delivery
  id                  unique; the receiver uses it to avoid duplicates
  shared_id           the Shared entry that originated it
  subject, what
  created             when the content was generated
  sent                when it left the queue
  received?           when the ground received it; absent if it did not arrive
  state               queued | in_transit | received
```

"Assigned", "done" and "result" are three different things: `Task.completion`, `Execution` and `result_ids`. A completed task does not imply a result.

## 4. Interfaces

### core (M01)

```
STATES, TYPES, ORIGINS, SCHEMA_VERSION
validateRecord(data)                      → Result<Record>
createRecord(fields, { clock, newId })    → Result<Record>
areComparable(a, b)                       → { comparable: boolean, reason?: text }
```

### mission (M02)

```
validateConfig(data)                → Result<MissionConfig>
hasEquipment(config, equipmentId)   → boolean
phaseAt(config, time)               → text | null
```

### catalogs (M03)

```
observations()  → [{ id, label, source_ids }]      the "I feel different" catalog
variables()     → [{ id, label, unit, type }]
equipment()     → [{ id, label }]
sources()       → [{ id, citation, reading_level, url }]
```

Every entry in `observations()` carries at least one source. Catalog data is reviewable content, not rules.

### store (M04)

```
openStore({ kind: "indexeddb" | "memory", name }) → Promise<Result<Store>>

Store
  status()                          → { kind, persistent: boolean, reason?: text }
  save(collection, object)          → Promise<Result<object>>     fails if the id already exists
  get(collection, id)               → Promise<Result<object>>
  list(collection, filter)          → Promise<Result<object[]>>   filter by equality and time range
  saveBatch(collection, objects)    → Promise<Result<n>>          all or nothing
  updateState(collection, id, changes) → only for Execution, Task, Episode and Delivery
  close()                           → Promise<void>
```

Collections: `records`, `executions`, `tasks`, `episodes`, `shared`, `deliveries`, `config`. `records` and `shared` do not allow `updateState` (R7). If IndexedDB is missing, `openStore` with `"indexeddb"` returns an error; the caller decides to use `"memory"` and shows it.

### scenario (M05)

```
generateScenario({ seed }) → { config: MissionConfig[], records, tasks, procedures }
```

Deterministic: the same seed produces the same data. Every record carries `origin: "synthetic"`. It includes gaps, an old exam, an environment reading from another module and the demo's two configurations.

### readings (M06)

```
series(store, { subject, variable, from, to })
   → { points, gaps, n, non_comparable_groups }
latest(store, { subject, variable }, { clock })
   → { record | null, age_days | null }
baseline(store, { subject, variable, to })
   → { n, from, to }                       how many measurements exist; no judgment
environment(store, { place, interval })
   → { records, coverage: { from, to, sensors } }
cumulative(store, { subject, variable, from, to })
   → { total | null, unit, n, gaps }       total is null if there is no data at all
attention(record, config)
   → { status: "within" | "outside" | "no_criterion" | "not_assessed", criterion?, reason? }
```

`attention` only compares against a criterion present in the configuration. `not_recorded`, `confirmed_none`, a missing value or a different unit give `not_assessed` with the reason; no criterion gives `no_criterion`. It never returns `within` without a criterion.

`readings` does not decide what is normal. It returns data and how much supports it.

### procedures (M13)

```
validateProcedure(data)                → Result<Procedure>
availability(procedure, config)        → { available, missing: equipmentId[], alternative_id? }
start(store, procedure, config, { subject, clock, newId }) → Result<Execution>
advance(store, executionId, { record? })     → Result<Execution>
interrupt(store, executionId, { reason })    → Result<Execution>
resume(store, executionId)                   → Result<Execution>
finish(store, executionId, { state: "completed" | "could_not", difficulties })
```

With missing equipment, `start` returns a `blocked` execution with its `missing` list. `alternative_id` only appears if the procedure declares it.

### plan (M14)

```
tasksFor(store, { subject, day })                              → Result<Task[]>
progress(store, { subject, day })      → Result<{ total, done, not_done, pending }>
mark(store, taskId, { completion, execution_id?, note? })      → Result<Task>
linkResult(store, taskId, recordId)                            → Result<Task>
```

### privacy (M19)

```
createSession({ clock })           → Session
Session.unlock(), .active(), .close()
logShared(store, { subject, what, with, channel }, { clock, newId }) → Result<Shared>
sharedLog(store, { subject })      → Result<Shared[]>
```

An active session does not ask to unlock again. This module does not encrypt and must not claim to protect data on disk.

### episode (M16)

```
open(store, observation, { clock, newId })  → Result<Episode>
situation(store, episodeId, config, { clock })
   → { you_recorded, we_know, missing, you_can, happened, next }
link(store, episodeId, { execution_id?, record_id?, task_id? })
close(store, episodeId)
```

`situation` assembles the six parts of the episode. `missing` includes whatever is `not_recorded` and the missing equipment. `you_can` lists procedures with their `availability`.

### copilot (M17)

```
card(situation, config, rules)
   → { data, gaps, suggestion | null, no_guidance: boolean,
       not_assessed, alert: { text } | null }
```

Pure function. `data` and `gaps` come first. If no rule applies, `suggestion` is `null` and `no_guidance` is `true`. Every suggestion carries `source`, `version` and `review_status`. `alert` is `null` if the episode already issued one. The `rules` are data; the module ships no clinical rule.

### summary (M18)

```
generate(store, episodeId, config, { clock })
   → Result<{ id, text, origins, pending_send: boolean }>
```

`generate` sends nothing. The text separates synthetic, analog and flight data, and distinguishes the three record states. With `communication: "delayed"` the text stands on its own: what happened, what was measured and how, what is missing, what is being asked. Sharing goes through `privacy.logShared`.

### importers (M21)

```
importCRF(text)                      → Result<{ records, rejected, skipped }>
importAdaptation(text, { study })    → Result<{ records, rejected, skipped }>
importGlucose(text, { subject })     → Result<{ records, rejected, skipped }>
```

`importGlucose` reads the BUT CGM glucose files: records come out with `origin: "terrestrial"`, variable `glucose`, the file's unit, and `not_recorded` for empty or NaN values.

Imported text is untrusted input: it is validated row by row. Records come out with `origin: "ground_analog"`, the file's `subject` and `Test_Phase` in `mission_phase`. Free-text clinical comments are not imported; `skipped` says how many.

### sync (M24)

```
createLink({ clock, mode, delay_ms })          → Link     mode: real_time | delayed | no_link
Link.setMode(mode, delay_ms?)
enqueue(store, sharedId, { clock, newId })     → Result<Delivery>
advance(store, link, { clock })                → Result<Delivery[]>   delivers what is due according to the mode
received(store, { subject? })                  → Result<Delivery[]>   what the ground panel sees
```

Simulated: there is no network and no server. Only what already went through `privacy.logShared` can be enqueued; nothing leaves without that action. A delivery handed over twice is received once (by `id`). `received` does not include anyone who sent nothing, and the ground view shows "nothing sent" instead of an invented status. The user interface is labeled "simulated sync". A real server will implement these same functions.

## 5. User interface

Each view is a folder with two pieces:

```
model.js    model(services, params) → Promise<ViewModel>   no DOM; tested in Node
view.js     mount(element, viewModel, actions)             DOM only
```

`ViewModel.state` is one of `loading`, `empty`, `error`, `ready`. `empty` says why it is empty; `error` names the failure. A view that is not implemented shows "not available yet".

M07 delivers the components every view uses, so the same data looks the same everywhere:

- `stateLabel(record)`: recorded, confirmed nothing new, or not recorded, **with text**.
- `originLabel(origin)`: synthetic, ground analog or flight.
- `valueWithContext(record)`: value, unit, method, time and age.
- `accessibleTable`, `lineChart` (our own SVG, with visible gaps and an equivalent table).
- `dataStateBadge(record, { clock })`: color plus text for the state of the data — current, old, not recorded, confirmed nothing new, not comparable. Color never means "normal".
- `attentionBadge(result)`: shows the output of `readings.attention` with the criterion's `defined_by`, source and review status; `no_criterion` and `not_assessed` read as such. "demo" reads as such.
- Change from the personal baseline is shown as text with how many measurements support it, never as a color judgment.

Everything works with the keyboard. No state is conveyed by color alone. Views receive `services` as a parameter and do not import `store`.

## 6. Changing a contract

1. The builder describes the change in their report and does not apply it.
2. The orchestrator decides, edits this file and bumps the version.
3. The change is noted below and the affected modules are notified.

| Version | Date | Change | Affected modules |
|---|---|---|---|
| 0.1 | 2026-11-14 | Initial version | All |
| 0.2 | 2026-11-15 | `Delivery` shape and `sync` interface (D9, simulated option C) | M24; M19 and M18 only as providers |
| 0.3 | 2026-11-15 | Translated to English, including identifiers, data fields and folder names; `deliveries` collection added to the store | All |
| 0.4 | 2026-11-15 | User decisions D10–D14: R6 reworded (criteria only as configuration data); `terrestrial` origin; `environment`, `gravity_note`, `attention_criteria` in `MissionConfig`; `readings.attention`; `plan.progress`; `importGlucose`; `dataStateBadge` and `attentionBadge` | M01, M02, M03, M05, M06, M07, M14, M15, M21 |
