# Órbita: contracts between modules

Version 0.21 · November 15, 2026 · G0 and G1 accepted; F1 closed by the user on November15, 2026. Only the orchestrator edits this file. M00 turns it into `app/contracts/` (JSDoc definitions) and into contract tests in `tests/contract/`. If this document and those files disagree, this document wins and the code is fixed.

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
| R9 | One subject's data is never mixed with another's, and NASA data is never assigned to the synthetic subject. NASA data lives in a store of its own: in memory for the session, and, only if the person chooses "Keep on this device", also in a separate persistent store that no other view reads | M04, M21, M22 |

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

Summary
  id              "<episodeId>:<instant>", with "~<n>" when the instant repeats (stored summary text, added 0.18)
  schema_version, subject, episode_id, text, origins, generated

RuleEntry
  id              "<rule id>@<version>" (stored guidance rule, added 0.18)
  schema_version, saved
  rule            { id, when, suggestion, source, version, review_status, alert? }; the app does not verify review_status

ProcedureEntry
  id              "<procedure id>@<version>" (registry entry, added 0.19)
  schema_version, published, procedure_id, version
  procedure       the Procedure above, unchanged

ProcedureRetirement
  id              "retired:<procedure id>@<version>" (registry entry, added 0.19)
  schema_version, procedure_id, version, retired, reason
  kind            retirement

Execution
  id, procedure_id, procedure_version, subject
  state           blocked | in_progress | interrupted | completed | could_not
  current_step, started, updated
  difficulties    list of structured texts
  records         ids of the Records produced
  step_count      number of steps of the version it started with (added 0.13)
  interruptions   list of { reason, step, at|null } (added 0.13)
  missing?        equipment ids, only on a blocked execution (added 0.13)
  rev?            whole number, +1 on each change; the guard of concurrent writers (added 0.17)
  step_records?   per step, the variable it must record or null (copied from the version at start; added 0.17)
  unrecorded_steps? indexes of steps finished with an explicit "nothing recorded" (added 0.17)
  preparation_confirmed? true when the person confirmed every preparation check before starting (added 0.17)

Task
  id, subject, day, procedure_id?, description
  assigned_by     source of the plan
  completion      pending | done | not_done
  execution_id?   link to what was done
  result_ids      links to what was observed afterwards
  not_done_note?  { reason } only on a not_done task (added 0.13)
  scheduled_at?   ISO8601 UTC instant the task is planned for (added 0.16; `day` stays the date key)
  planned_minutes? positive number of minutes planned (added 0.16)
  history?        list of { completion, at, reason? }: every undo of a mark, in order (added 0.17)
  series_id?      shared by the tasks of one periodic series (added 0.17)
  rev?            whole number, +1 on each change; the guard of concurrent writers (added 0.17)

Episode
  id, subject, opened, closed?
  observation_id      the Record that started it
  execution_ids, record_ids, task_ids
  alert_issued        boolean
  reopened?           list of { previous_closed, at|null, reason }: every reopening of a closed episode (added 0.18)

Shared
  id, subject, time, what (ids or "summary:<id>"), with, channel

Delivery
  id                  unique; the receiver uses it to avoid duplicates
  shared_id           the Shared entry that originated it
  subject, what
  created             when the content was generated
  sent?               when it left the queue; absent while queued (0.14)
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
  updateState(collection, id, changes, { expect? }) → only for Execution, Task, Episode and Delivery.
      `expect` is { field: string|number|boolean|null }: the change applies only if the stored object still has those values (null = absent), checked in the same transaction as the write; otherwise `conflict` (added 0.17)
  close()                           → Promise<void>
```

Collections: `records`, `executions`, `tasks`, `episodes`, `shared`, `deliveries`, `config`, `procedures` (added 0.14), `summaries` and `rules` (added 0.18, IndexedDB schema v3; both immutable; an upgrade from v2 keeps the data). `summaries` holds `{ id: "<episodeId>:<instant>", subject, episode_id, text, origins, generated }`; `rules` holds `{ id: "<ruleId>@<version>", saved, rule }`. `procedures` is immutable like `records`: `updateState` is refused. The IndexedDB schema is version 2 since 0.14: opening a version 1 database upgrades it by creating the missing collection and keeps its data (BROWSER-checked in `tests/walkthrough/g3-extras-browser.py`). `records` and `shared` do not allow `updateState` (R7). If IndexedDB is missing, `openStore` with `"indexeddb"` returns an error; the caller decides to use `"memory"` and shows it.

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
seriesBySourceTime(store, { subject, variable, scope? })
   → { points, gaps, n, non_comparable_groups, clock, other_clocks, utc_records }
        for records that carry only a source time (time: null); see below
attention(record, config)
   → { status: "within" | "outside" | "no_criterion" | "not_assessed", criterion?, reason? }
```

`attention` only compares against a criterion present in the configuration. `not_recorded`, `confirmed_none`, a missing value or a different unit give `not_assessed` with the reason; no criterion gives `no_criterion`. It never returns `within` without a criterion.

`readings` does not decide what is normal. It returns data and how much supports it.

`environment` also takes optional `subject` and `variable`. With records of several variables and no `variable`, `coverage.segments` is `[]` and `coverage.segments_note` says why: cover is never claimed across variables. Query bounds must be UTC instants (text ending in `Z`).

A foreseen failure returns `{ ok: false, error: { code, field?, message } }` instead of the plain object, so a caller checks `ok === false` first. Records that carry only a source time (`time: null`) make `series`, `latest`, `baseline` and `cumulative` return `unresolved_time`: no UTC placement or age is invented for them. `cumulative` returns `not_comparable` rather than a partial total when the records in range differ in method or unit.

`seriesBySourceTime` is the series for records with `time: null`, which the UTC queries refuse. It has the same `points`, `gaps`, `n` and `non_comparable_groups` as `series`, and takes no range. A source clock is `scope` + `calendar` + `precision`; ordering and day counting happen only inside one clock, and nothing is converted to UTC or given an age. Points carry `time: null` and `source_time`, the source's own text, and `day` is a source day, not a UTC date. `clock` is `{ scope, calendar, precision, timezone: null }` for the clock that was used, or `null` when no clock can be ordered. The primary clock has the most measured values (then the most records, then the key), unless the optional `scope` selects among clocks with that scope. `gaps` cover the days between that clock's first and last record. Every other clock is listed in `other_clocks` as `{ scope, calendar, precision, n, orderable }`; clocks are never merged. A clock with `calendar: "unknown"` is never ordered or placed on a day: it appears in `other_clocks` with `orderable: false` and `records`, the stored records themselves, sorted by id only for stable output, so no order is claimed. `utc_records` counts the records with a UTC time that were left out. Unit-unknown values are never points; they come back in `non_comparable_groups`. A source clock spanning more than 3650 days returns `range_too_large`.

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

Since 0.13: `advance`, `interrupt`, `resume` and `finish` accept an optional `clock` in their options; `updated` changes only when one is given, so no time is invented. `advance` stops at the last step (`no_more_steps`); `finish` as `completed` needs every step done (`steps_remaining`) and is allowed only from `in_progress`; `could_not` from `in_progress` or `interrupted`. A `blocked` execution is stored and allows no transition. `advance({ record })` links a record id only if it exists and belongs to the execution's subject. Each execution is changed by one caller at a time.

Since 0.17: `start(..., { preparation_confirmed })` refuses (`preparation_not_confirmed`) a procedure with preparation checks unless the caller says the person confirmed them; `advance` on a step that declares `records` needs `{ record }` of that variable (`wrong_variable` otherwise) or an explicit `{ no_record: true }` (kept in `unrecorded_steps`), else `record_required`; `retireProcedure(store, id, version, { clock, reason }) → Result` stores an immutable retirement entry: `listProcedures` no longer offers that version, `{ all: true }` still returns it, executions keep reading it. Executions are changed with the same `rev` guard as tasks. Retiring the latest version makes the previous version that is not retired the one offered (`listProcedures`); the screen names that version in its message; with none left, nothing is offered. A retired version stays readable through `{ all: true }`.

Registry (added 0.14): `publishProcedure(store, procedure, { clock }) → Result<Procedure>` stores one immutable entry per `id@version` (neither may contain `@`) and refuses a second publication of the same version (`version_exists`); `listProcedures(store, { all? }) → Result<Procedure[]>` gives the latest published version of each procedure, or every version with `all`; `getProcedure(store, id, version) → Result<Procedure>` gives that exact version. A stored entry that cannot be read is an error (`corrupt_procedure`), never skipped. Executions are read against `getProcedure(store, procedure_id, procedure_version)`.

### plan (M14)

```
tasksFor(store, { subject, day })                              → Result<Task[]>
progress(store, { subject, day })      → Result<{ total, done, not_done, pending }>
mark(store, taskId, { completion, execution_id?, note? })      → Result<Task>
linkResult(store, taskId, recordId)                            → Result<Task>
```

Since 0.17: `createTask(store, { subject, description, scheduled_at, planned_minutes, procedure_id?, assigned_by? }, { newId })` (`assigned_by` defaults to `self`; minutes are required, never assumed); `scheduleSeries(store, { ...task, first_scheduled_at, every_days, count }, { newId })` creates `count` tasks (2–52) exactly `every_days` (1–365) apart with one `series_id`, all or none; `reopenTask(store, taskId, { reason, clock? })` returns a marked task to `pending`, clears `execution_id` and `not_done_note`, keeps `result_ids` and appends the undo with its reason to `history`; `mark` also appends to `history`. A `history` entry is `{ completion, at|null, reason?, note?, execution_id? }`; `at` is the clock's instant, or null when none was given. A retirement entry in the registry is `{ id: "retired:<id>@<version>", kind: "retirement", procedure_id, version, retired, reason }`, and ids starting with `retired:` are refused. Contention: a change retries up to 12 times with a short growing pause before it reports `conflict`. `linkResult` needs the value to have an established `time` not before the task's `scheduled_at` (or the start of its `day`): `time_not_established` or `observed_before` otherwise. `planned_minutes` is a whole number of minutes, 1 to 1440. Writers no longer queue in one process: each change reads the task, decides, writes with `expect: { rev }` and reads again on `conflict` (up to 5 tries), so it holds across tabs.

Since 0.13: `mark` accepts `done` or `not_done` only and only on a `pending` task (`already_marked` otherwise); `note` is `{ reason }` and belongs to `not_done`; `execution_id` must exist, belong to the task's subject and procedure, and for `done` be `completed`. `linkResult` accepts only a `recorded` Record of the same subject, never changes `completion`, and ignores a repeated link. `tasksFor` returns stored tasks of that day only and reports a corrupt task instead of dropping it. Concurrent changes: see 0.17 above.

### privacy (M19)

```
createSession({ clock })           → Session
Session.unlock(), .active(), .close()
logShared(store, { subject, what, with, channel }, { clock, newId }) → Result<Shared>
sharedLog(store, { subject })      → Result<Shared[]>
```

`logShared` takes an optional `session` in its context: when given, it must be active (`session_locked` otherwise). The `Shared` entry it writes has `schema_version: 1`, and the log has no edit and no delete.

An active session does not ask to unlock again. This module does not encrypt and must not claim to protect data on disk.

### episode (M16)

```
open(store, observation, { clock, newId })  → Result<Episode>
situation(store, episodeId, config, { clock })
   → { you_recorded, we_know, missing, you_can, happened, next }
link(store, episodeId, { execution_id?, record_id?, task_id? })
close(store, episodeId)
reopen(store, episodeId, { reason, clock? })   → Result<Episode>   (added 0.18; `open` and `reopen` of one subject share one lock, so one episode of a subject is open at a time within a process; `open` refuses with `another_episode_open`; `close` writes with `expect` on `closed`)
listEpisodes(store, { subject })               → Result<{ id, opened, closed, is_closed, observation_id, reopened }[]>   (added 0.18)
```

Since 0.15: `open` reads the observation back from the store and needs a **recorded** observation of the same subject. `situation` returns the six parts as plain lists (empty ones allowed) plus `why_empty` (a text for each empty part) and `alert_issued`; a failure is `{ ok: false, error }`. `we_know` holds the newest recorded measurement or exam of the subject, and environment readings only from the observation's own `place` (none when it states no place); `missing` lists `{ kind: "not_recorded", variable }`, `{ kind: "equipment", item, needed_by }` and `{ kind: "time_not_established", count }`; `you_can` lists the published procedures with `available`, `missing` and `alternative_id`; `happened` keeps each linked execution's own state; `next` lists linked pending tasks. `link` needs the item to exist and belong to the subject, and an open episode (`episode_closed`). `close(store, id, { clock? })` writes `closed` as the clock's instant, or `true` when no clock is given (no time is invented). `issueAlert(store, id) → Result<{ issued, episode }>` turns `alert_issued` true once; a second call returns `issued: false` and changes nothing. Each episode is changed by one caller at a time.

`situation` assembles the six parts of the episode. `missing` includes whatever is `not_recorded` and the missing equipment. `you_can` lists procedures with their `availability`.

### copilot (M17)

```
card(situation, config, rules)
parseRules(text) → Result<Rule[]>   (added 0.18)
saveRules(store, rules, { clock }) → Result<Rule[]>
loadRules(store) → Result<Rule[]>
   → { data, gaps, suggestion | null, no_guidance: boolean,
       not_assessed, alert: { text } | null }
```

Since 0.20: a rule accepts only the fields id, when, suggestion, source, version, review_status and alert; `id` (at most 100 characters) and `version` (at most 50) must not contain `@`; a card's `alert` is `{ text, rule_id, source, version, review_status }`; `saveRules` writes all or none; `loadRules` breaks a tie in `saved` by version in numeric order. A review status is what the rule's file declares: the app cannot verify it, and the screen says so beside every suggestion and alert, `reviewed` included.

Since 0.15: `validateRules(rules) → Result<Rule[]>`. A rule is data: `{ id, when: { recorded_variable }, suggestion, source, version, review_status: demo | draft | reviewed, alert? }`; one without a source (or version, or review status) is rejected, and `card` leaves it out and says so in `not_assessed`. A rule matches only a variable the person recorded; nothing is compared with a limit. `suggestion` is `{ rule_id, text, source, version, review_status }`; `alert` is `{ text }` only when the applicable rule has an `alert` text and the situation's `alert_issued` is not true. The module ships no rule.

Pure function. `data` and `gaps` come first. If no rule applies, `suggestion` is `null` and `no_guidance` is `true`. Every suggestion carries `source`, `version` and `review_status`. `alert` is `null` if the episode already issued one. The `rules` are data; the module ships no clinical rule.

### summary (M18)

```
generate(store, episodeId, config, { clock })
keep(store, episodeId, config, { clock }) → Result<{ id, text, origins, pending_send, saved }>   (added 0.18)
   → Result<{ id, text, origins, pending_send: boolean }>
```

Since 0.15 the text has four numbered parts (what happened, what was measured and how, what is missing, what is being asked), one `Origin:` block per origin present, the three record states in their own words ("not recorded", "confirmed nothing new"), values with their unit or "(unit unknown)", and no free-text notes. `pending_send` is true unless the link is `real_time`. `generate` stores and shares nothing. Since 0.18 `keep` also stores the text, immutably, in `summaries` under `<episodeId>:<instant>` (a counter `~2`, `~3` when the clock gives the same instant and the text differs; an identical text is not stored twice), and the "I feel different" view shares the episode's records plus `summary:<id>` of the newest summary. The text is free of record notes, but it does include what the person typed as a difficulty of an execution and the description of a pending task linked to the episode; the person sees the whole text before sharing. Environment readings are labelled "environment reading at <place>, not a personal measurement".

`generate` sends nothing. The text separates synthetic, analog and flight data, and distinguishes the three record states. With `communication: "delayed"` the text stands on its own: what happened, what was measured and how, what is missing, what is being asked. Sharing goes through `privacy.logShared`.

### importers (M21)

```
importCRF(text)                      → Result<{ records, rejected, skipped, unread_columns }>
importAdaptation(text, { study })    → Result<{ records, rejected, skipped, unread_columns }>
importGlucose(text, { subject })     → Result<{ records, rejected, skipped, unread_columns }>
```

`importGlucose` reads the BUT CGM glucose files: records come out with `origin: "terrestrial"`, variable `glucose`, the file's unit, and `not_recorded` for empty or NaN values.

Imported text is untrusted input: it is validated row by row. Since 0.21 `unread_columns` lists the header columns the importer does not read (for the real CRF file: `Head Down Tilt Verified`, `Bowel Movement`, `Quantity`), so no column is dropped silently. Records come out with `origin: "ground_analog"`, the file's `subject` and `Test_Phase` in `mission_phase`. Free-text clinical comments are not imported; `skipped` says how many.

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

Since 0.14: `createLink` throws a `TypeError` on invalid options (it is called once, where the application is assembled) and a `delayed` link needs `delay_ms`; `Link.mode()`, `Link.delay_ms()` and `Link.setMode(mode, delay_ms?) → Result` (a bad mode or a missing delay changes nothing). `enqueue` returns the existing delivery when the same `Shared` entry is enqueued again. `deliveries(store, { subject? }) → Result<Delivery[]>` lists every delivery in any state (what a sender still has queued or in transit); `received` lists only the received ones. A queued delivery has no `sent` yet. With `real_time`, `advance` receives what is queued; with `delayed`, a queued delivery becomes `in_transit` (with `sent`) and is received when the injected clock reaches `sent + delay_ms` (`>=`); with `no_link` nothing moves and nothing is lost.

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
- `renderChart(doc, chartModel)`, `renderTable(doc, tableModel)` and `renderBadge(doc, badge)`: DOM renderers for the models above, exported so that a view never imports a file inside this module. They build elements with `textContent` and `setAttribute` only; record text is never parsed as markup. `renderTable` returns the table inside a keyboard-reachable, named region (`role="region"`, `tabindex="0"`, `aria-label` equal to the caption) so that a wide table scrolls inside itself instead of widening the page.

- `renderEntry(doc, entry)` and `renderSection(doc, section)`: DOM renderers for one record as a list item and for one view section (`{ id, title, state?, text?, note?, entries?, charts?, tables? }`); a section that is not available, empty or in error says so in words.
- `viewKit`: pure model helpers shared by every view. `recordEntry(record, { clock, label?, variable? })` turns one record into the one entry every view shows (value text equal to `valueWithContext`; an absent or invalid record is the absent entry, "not recorded", never "nothing new"); `contextOf(services)` checks what a view needs and names what is missing; `textsOf(model)` and `keysOf(model)` list every string and key of a model, for tests that scan whole screens.

`services` also carries `readings`, `importers` (M21), `catalogs`, `core`, `plan`, `subject`, `data_source`, `writable`, `record_origin`, `flags` and `openMemoryStore()`, which opens a private memory store. The shell offers two data sources: a synthetic demo (fictional scenario records in a memory store, with a clock fixed at the scenario's "now") and "My records" (the persistent store, where recording is not available in F2). Every view names its source. A view that handles imported real data (M22) keeps it in that private store and never writes it to `services.store`.

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
| 0.10 | 2026-11-15 | User-authorized: `readings.seriesBySourceTime` reads records that carry only a source time without inventing UTC or ages; clocks are never merged and an unknown calendar is listed unordered with its records. `lineChart` labels source days and keeps undrawn values in its table | M06, M07; every view over imported data (M08, M09, M11, M22) |
| 0.11 | 2026-11-15 | User-authorized with the M22 advance: `ui/base` also exports the DOM renderers `renderChart`, `renderTable`, `renderBadge`; services carry `importers` and `openMemoryStore`. M22 (NASA cases) is implemented ahead of its phase; this does not close F5 | M07, M22; every view that draws charts or tables |
| 0.12 | 2026-11-15 | User-authorized with the start of F2 (M08–M12): `ui/base` also exports `renderEntry`, `renderSection` and `viewKit`; services carry the data-source fields and the `catalogs`, `core` and `plan` collaborators; the shell offers a synthetic demo source and "My records" | M07, M08–M12 |
| 0.13 | 2026-11-15 | User-authorized with the start of F3 (M13–M15): optional `clock` in the procedure transitions; Execution gains `step_count`, `interruptions` and `missing`; Task gains `not_done_note`; the rules of `mark`, `linkResult` and `finish` above; services may carry `procedures` and `procedure_list`; `ui/my-plan` and `ui/on-board` are implemented. Consistency review only, no approval. |
| 0.14 | 2026-11-15 | User-authorized ("agrega versiones mínimas"): `procedures` collection and IndexedDB schema v2 with an upgrade; the procedure registry (`publishProcedure`, `listProcedures`, `getProcedure`); `privacy` (`createSession`, `logShared`, `sharedLog`) and `sync` (`createLink`, `enqueue`, `advance`, `received`, `deliveries`) implemented as above; `Delivery.sent` optional; `ui/ground` implemented; the On board editor. Consistency review only, no approval. |
| 0.15 | 2026-11-15 | User-authorized ("versiones mínimas de F4"): `episode`, `copilot` and `summary` implemented as above (`issueAlert` and `validateRules` added); services may carry `episode`, `copilot`, `summary` and `rules`; `ui/i-feel-different` implemented. Consistency review only, no approval. |
| 0.16 | 2026-11-15 | User-authorized with the incorporation of the teammate's frontend ("usar nuestro modelo de datos, incorporando lo que él usa"): `Task` gains optional `scheduled_at` and `planned_minutes`, which its exercise plan needs. Optional, so earlier tasks stay valid. Consistency review only, no approval. |
| 0.17 | 2026-11-16 | User-authorized ("lo recortado modificarlo para que sea de verdad, después F3 que funcione"): store `updateState` accepts `expect` (compare-and-set); Task gains `history`, `series_id`, `rev`; Execution gains `rev`, `step_records`, `unrecorded_steps`, `preparation_confirmed`; plan gains `createTask`, `scheduleSeries`, `reopenTask`; procedures gain `retireProcedure` and the preparation/recording rules above. All optional or additive. Consistency review only, no approval. |
| 0.18 | 2026-11-16 | User-authorized ("fijate como solucionar esto … despues resolve el resto"): store collections `summaries` and `rules` (IndexedDB v3); `Episode.reopened`; `episode.reopen`/`listEpisodes`; `summary.keep`; `copilot.parseRules`/`saveRules`/`loadRules` (a rules file is untrusted text of at most 200 KB; stored rules are immutable per `id@version`; the app cannot verify a review status); `Shared.what` may carry `summary:<id>`, which the ground panel resolves from `summaries`. Fixes from the F3 independent review: `advance` refuses a record that is not `recorded`; ids starting with `retired:` are refused; instants must round-trip as real dates. Consistency review only, no approval. |
| 0.19 | 2026-11-16 | User-authorized ("Arregla F7, F10, F11 y F12"): retries 5 → 12 with a pause (F7); retirement semantics stated (F10); `linkResult` observed-afterwards rule, whole-number minutes, digits-only inputs, other-tab origin lock (F11); data typedefs `ProcedureEntry`, `ProcedureRetirement`, nullable `execution_id`/`not_done_note`, full `history` entry (F12). Consistency review only, no approval. |
| 0.21 | 2026-11-16 | User-authorized ("usar skills y resolver todo lo que falta o está pendiente en F5"): importers also return `unread_columns`; the NASA cases view offers CRF with caveats on its card and lists omics as not offered; `services.keptCases` (`open()`, `clear(store)`) lets a person keep an imported file in a separate persistent store (`orbita-nasa-cases`, IndexedDB), which the view restores on the next visit; the memory store no longer revalidates a whole collection on every write. R9 keeps its meaning: imported records never enter the synthetic or the "My records" store. Consistency review only, no approval. |
| 0.20 | 2026-11-16 | User-authorized ("arreglalos en ese orden", the F4 review): one open episode per subject under one lock and `close` guarded by `expect`; rule fields are an allowlist, `@` refused in ids and versions, `saveRules` all or none, numeric version tie-break; an alert carries its source, version and declared status; summary ids get a counter and an identical text is not stored twice; environment readings are labelled in the summary text; data shapes `Summary` and `RuleEntry`. Consistency review only, no approval. |
