# Órbita: contracts between modules

Version 0.9 · November 15, 2026 · G0 and G1 accepted; F1 closed by the user on November15, 2026. Only the orchestrator edits this file. M00 turns it into `app/contracts/` (JSDoc definitions) and into contract tests in `tests/contract/`. If this document and those files disagree, this document wins and the code is fixed.

Plan and modules: [ORCHESTRATION_PLAN.md](ORCHESTRATION_PLAN.md). Rationale for the rules: [PROPOSAL_IMPROVEMENTS.md](PROPOSAL_IMPROVEMENTS.md) and [AGENTS.md](../AGENTS.md).

## 1. Conventions

- **ES modules**, `.js` files, `package.json` with `"type": "module"`. The same file runs in Node and in the browser.
- **A single door.** Each module exports through its `index.js`. Nobody imports another module's internal file.
- **Result, not exception.** Every function that can fail for a foreseen reason returns `{ ok: true, value }` or `{ ok: false, error: { code, field?, message } }`. Exceptions are reserved for programming errors.
- **`message` names the problem.** "Missing field `origin`", not "invalid data".
- **Time.** Known instants use ISO8601 UTC strings. Record schema2 can explicitly preserve a source date/local datetime without known timezone using time:null plus source_time; it must not invent a UTC instant. Other clock-derived domain events remain UTC. The domain receives clock() and identifiers by injection.
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
  value, unit     required for recorded measurement/environment/exam; schema2 unit:null needs unit_status unknown
  unit_status     known | unknown, optional; schema2 only; unknown requires unit:null
  method          instrument or "self_report"
  time            UTC ISO8601 string, or schema2 null with source_time; environment also needs UTC interval { from, to }
  source_time     schema2 only, optional: { value, raw, precision, timezone, calendar, scope }
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

## Source uncertainty and schema compatibility

SCHEMA_VERSION is2 for new objects. Strict legacy schema1 UTC records remain
readable and return unchanged, including schema_version1; they are not
silently migrated on validation, get or list. Unknown/future versions fail.
Generic persisted objects and mission configurations support known1/2; a
missing generic version is stamped2. Existing schema1 records cannot acquire
schema2 fields without an explicit new record/correction.

For schema2, source_time is present exactly when time is null and has exactly:
value (canonical ISO date YYYY-MM-DD or local datetime YYYY-MM-DDTHH:mm for minute precision, or YYYY-MM-DDTHH:mm:ss
with optional1–3 fractional digits for second precision), raw (unchanged original field text),
precision (date, minute or second), timezone (null for unknown), calendar (original,
shifted or unknown), and scope (nonempty source clock/cohort namespace, at most512 characters;
raw is also nonempty and at most512 characters). A date-only
assessment does not get an invented midnight. Reject invalid calendar dates,
Z/offsets on unknown-zone values and contradictory UTC time/source_time.
No age, absolute-UTC interval or cross-source calendar alignment is inferred.

For a recorded numeric measurement, schema2 may retain unit:null only with
explicit unit_status:unknown. Omitted unit still fails normal validation;
this is not a way to accept accidental missing fields. Missing numerical
values remain absent according to the three states. Unknown units always
make records not comparable, even when both are unknown. Unknown calendar
also prevents comparison. Compatible source
time comparison requires matching subject/source-clock scope, calendar and
precision as well as the existing subject/variable/unit/method rules; mixing
UTC and unknown-zone bases is not comparable. Raw strings and calendar
values are preserved, never normalized into clinical certainty.

UTC from/to store queries return explicit unresolved_time if an otherwise
equality-matching record has unknown source time. Records belonging to other
subjects do not trigger that error. Unbounded/equality queries return the
source-aware record unchanged. Generic non-record objects without time keep
the previous exclusion behavior for time windows. Both backends behave alike.

Source files lacking CRF units remain unit-unknown until a source-specific
dictionary is supplied. This representation resolves honest storage and
review; it does not claim that missing source metadata was recovered.
Future M06/M07 consumers must surface these unknowns and avoid UTC age,
unit conversions, criterion comparisons or reassuring badges on that basis.

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
   → { n, from, to, excluded_non_comparable }
        n: how many comparable recorded values exist before `to`; no judgment.
        from, to: earliest and latest time of those values (null when n is 0).
        excluded_non_comparable: how many recorded values were left out because their
        method or unit differs, or their unit is unknown (0 when none).
environment(store, { place, interval })
   → { records, coverage: { from, to, sensors, segments } }
        segments: the merged intervals actually measured inside the asked interval, so a
        hole between two sensor windows is never reported as continuous coverage.
        from, to: first start and last end of the segments (null when there are none).
cumulative(store, { subject, variable, from, to })
   → { total | null, unit, n, gaps }       total is null if there is no data at all
attention(record, config)
   → { status: "within" | "outside" | "no_criterion" | "not_assessed", criterion?, reason? }
```

`attention` only compares against a criterion present in the configuration. `not_recorded`, `confirmed_none`, a missing value or a different unit give `not_assessed` with the reason; no criterion gives `no_criterion`. It never returns `within` without a criterion.

`readings` does not decide what is normal. It returns data and how much supports it.

A foreseen failure returns `{ ok: false, error: { code, field?, message } }` instead of the plain object, so a caller checks `ok === false` first. Records that carry only a source time (`time: null`) make `series`, `latest`, `baseline` and `cumulative` return `unresolved_time`: no UTC placement or age is invented for them. `cumulative` returns `not_comparable` rather than a partial total when the records in range differ in method or unit.

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

#### M21 implementation policy (user-authorized advance)

The user explicitly requested real import implementation while F2 is open.
This is a scoped M21 change order, not acceptance of F2–F5 or M22 views.
The three functions are synchronous, deterministic and pure: no clock,
randomness, network or database write. ImportReport contains records:Record[],
rejected:Array<{row:number,code:string,field:string}> and
skipped:Array<{row:number,column:string,reason:string}>. Row references are
one-based physical source start lines including the header; embedded quoted
newlines advance subsequent source line references. Never include raw
clinical text in rejection/skip reports. Count excluded nonempty cells
via skipped.length. Header-only input returns an empty report.

Input uses verified source headers: CRF Campaign3DailyVitals comma CSV,
MR079G/MR035G/MR080G adaptation CSV, BUT CGM1.0.0 semicolon CSV with optional
UTF8 BOM. CSV supports CRLF/LF and quoted delimiters/newlines/escaped quotes.
Input is bounded to5MiB UTF8 and10000 output records; capacity excess is an
explicit whole-import error, never silent truncation. Invalid input/header,
unsupported study/profile and unrecoverable CSV quotation errors fail the
whole call. Recoverable row shape/numeric/date errors go to rejected while
other rows continue. Invalid options/accessors must not execute user code.

All emitted records pass core schema2 validation. Source row numerals never
become identifiers; subject strings such as007 remain unchanged. Record IDs
bind a deterministic original-text fingerprint, adapter, caller-supplied identity where applicable, physical row and
measurement column so repeat imports are detectable and files do not share
row IDs. Source includes DOI/profile identity and original-text fingerprint;
source_time.scope includes study/release/cohort/subject clock identity.
No columns can supply arbitrary origin/schema/state fields. Clinical free
text never enters note/source/rejections. Method and bounded structured
context retain Test/Position/Stage and phase/day without clinical inference.

CRF maps Pulse/SysBP/DiaBP/Resp Rate/Weight/Body Temp/Height; units remain
explicitly unknown until an authoritative source-specific mapping exists.
Missing numeric cells/NA/NaN emit not_recorded without a value, while numeric
zero is preserved. Unknown-unit status is used only with numeric values;
missing unknown-unit measurements omit unit metadata according to core rules.
CRF dates use source-corroboratedMM/DD/YYYY and minute clock, MR079G uses
source-corroboratedMM/DD/YYYY date-only, MR035G uses ISO scan date-only.
Their offsets/calendar-shifting remain unknown; time:null/source_time avoids
inventing UTC or midnight. Unknown calendars/units stay non-comparable.

MR079G preserves source Value/Units, method Test+Position; MR035G retains
NET_AVG_BMD with unknown units. MR080G's selected verified Campaign3C,
subject7772,2006-05-07 test uses the unit-labelled companion profile; other
MR080G profiles fail rather than inherit units. VE retains BTPS. No physical
conversion is performed and distinct physiological quantities stay distinct.
BUT CGM produces terrestrial glucose in source-verifiedmmol/L, source-local
seconds with shifted calendar and participant-specific scope; no interpolation.

Protocol-relative immunity/ACTES axes, shifted-UTC ITBA provenance,
aggregate radiation/lung/index tables and omics arrays remain explicitly
unsupported by these public adapters. Do not fabricate ordinary health
Records for them. Original CSV/XLS/ZIP files remain outside tracked sources.

### sync (M24)

```
createLink({ clock, mode, delay_ms })          → Link     mode: real_time | delayed | no_link
Link.setMode(mode, delay_ms?)
enqueue(store, sharedId, { clock, newId })     → Result<Delivery>
advance(store, link, { clock })                → Result<Delivery[]>   delivers what is due according to the mode
received(store, { subject? })                  → Result<Delivery[]>   what the ground panel sees
```

Simulated: there is no network and no server. Only what already went through `privacy.logShared` can be enqueued; nothing leaves without that action. A delivery handed over twice is received once (by `id`). `received` does not include anyone who sent nothing, and the ground view shows "nothing sent" instead of an invented status. The user interface is labeled "simulated sync". A real server will implement these same functions.

## F1 implementation policies

These policies resolve representation details for M01–M05 without adding
clinical rules or data sources:

- Mission phase intervals and store time-range filters use UTC `[from,to)`;
  touching mission phases are allowed, overlapping phases are rejected.
  Equipment availability means explicit membership in available_equipment;
  unknown identifiers are never assumed present. Cross-catalog content
  references are checked by integration tests, not by an undeclared dependency.
- Synthetic nonclinical demo procedures may use `source: "team_defined"`
  as explicit team-authored provenance; research citations are not assigned
  as sources of invented procedures. This is not reviewed clinical content.
- The glucose catalog uses `unit: "as_recorded"` as unresolved metadata,
  never as a Record.unit. Actual measurements retain the verified input unit;
  the catalog does not select or convert units; the acquired BUT CGM
  sample unit is source-verified as mmol/L in the import-readiness manifest.
  Mood is the team's non-validated self-report scale, not a clinical score.
- Store `list` combines equality filters with optional `from` / `to` bounds
  on the object's `time`. Invalid UTC bounds or reversed ranges fail; no
  filter is silently discarded. A generic non-record object without time does not match a
  requested time range; a matching source-time record returns unresolved_time. `get` of an absent id returns a named error Result.
- Saved records must pass core validation with an explicit supported schema
  version (legacy1 or current2). For other collections the store stamps the current schema version
  if absent, rejects unknown versions, and preserves detached plain JSON
  data. Collection-specific business rules remain the owning module's job.
- `updateState` returns Promise<Result<object>> for executions, tasks,
  episodes and deliveries only. It cannot change id, subject or schema_version.
  Closed stores return named errors for data operations; close is idempotent.
- Within the records collection a known subject cannot cross between
  synthetic and non-synthetic provenance, including in a batch. Other real
  origins remain distinct on each record. This prevents attaching imported
  data to the already-established synthetic subject; it is not identity
  authentication or a claim about unknown subjects in external files.
- Both backends provide atomic batch insertion, reject duplicate ids and
  return detached values. IndexedDB failures are explicit; openStore never
  silently falls back to memory. Missing name defaults to `orbita`.
- Validation may reject bounded-size, cyclic, accessor-bearing or non-JSON
  structures at input boundaries. Such technical bounds are not medical
  ranges. UTC validation rejects nonexistent calendar dates. Neither missing
  states nor missing measurements are defaulted to a reassuring value.

## 5. User interface

Each view is a folder with two pieces:

```
model.js    model(services, params) → Promise<ViewModel>   no DOM; tested in Node
view.js     mount(element, viewModel, actions)             DOM only
```

M00 scope clarification (user authorized November 15, 2026): each view's
`index.js` re-exports `model` and `mount`. Before implementation, `model` is
async and resolves to `Result` with `not_implemented`; `mount` returns that
error synchronously. Once implemented, they follow the signatures above.
M07's base `index.js` exports the seven components named below; unspecified
component argument lists remain M07's responsibility. M00 creates only a
minimal `app/index.html` loading a module to demonstrate HTTP module loading,
with no product UI. Ownership of that shell passes to M07.

This clarification does not standardize unspecified domain error codes or
unspecified result fields. Placeholder functions always return a fresh
`not_implemented` Result, including normally non-Result functions; callers
must handle that temporary unavailable state explicitly. Core constants
are the documented enums and schema version2 for new records, not functions. All functions
that accept `store`, plus `openStore` and view `model`, are asynchronous;
other functions are synchronous.

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
| 0.5 | 2026-11-15 | User-authorized M00 clarification: view index exports, minimal shell ownership, placeholder behavior and async boundary; no domain behavior added | M00, M07–M12, M15, M20, M22, M24 |
| 0.6 | 2026-11-15 | F1 implementation policies: mission/time boundaries, source-unit metadata, explicit store errors/schema stamping/provenance isolation, atomic writes and detached plain data | M01–M05; future store consumers |
| 0.7 | 2026-11-15 | User-requested source-date model: schema2 preserves unknown-zone/date-only/shifted times and explicit unknown units; legacy1 unchanged; scoped comparison and explicit UTC-query errors | M01–M07 and future import consumers |

| 0.8 | 2026-11-15 | User-authorized M21 advance: deterministic source CSV adapters, bounded reports/rows, source-time and unknown-unit policy; selected adaptation profiles; no implicit persistence | M21, store/import consumers |
| 0.9 | 2026-11-15 | User-authorized after M06 delivery: `readings.baseline` gains `excluded_non_comparable`, `readings.environment` coverage gains `segments`; the readings failure shape (`{ ok:false, error }`), `unresolved_time` and `not_comparable` are documented. Additive: existing fields keep their meaning | M06, M07 and every future readings consumer |
