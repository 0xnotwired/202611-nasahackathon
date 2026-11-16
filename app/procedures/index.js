// M13 procedures: what a procedure lets the person do is decided by the mission's equipment, and what happened is kept.
// An execution stores the procedure version it started with (R5). Every transition is listed in TRANSITIONS; one that
// is not listed is refused and changes nothing. Time is stamped only from an injected clock, never invented.
// This module writes no Record: it links the ids of Records that the caller produced, after checking they exist.
const MAX_TEXT = 500;
const MAX_LIST = 50;
const STATES = Object.freeze(['blocked', 'in_progress', 'interrupted', 'completed', 'could_not']);
const REVIEW = Object.freeze(['draft', 'demo', 'reviewed']);
// action → { from: [states it may start from], to: state it leads to }. `finish` is checked separately because it has two targets.
const TRANSITIONS = Object.freeze({advance: {from: ['in_progress']}, interrupt: {from: ['in_progress'], to: 'interrupted'}, resume: {from: ['interrupted'], to: 'in_progress'},
  finish: {completed: ['in_progress'], could_not: ['in_progress', 'interrupted']}});

const fail = (code, field, message) => ({ok: false, error: {code, field, message}});
const ok = value => ({ok: true, value});
const isText = value => typeof value === 'string' && value.length > 0 && value.length <= MAX_TEXT;
const isPlain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isInstant = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(value) && !Number.isNaN(Date.parse(value));
const textList = value => Array.isArray(value) && value.length <= MAX_LIST && value.every(isText);

function copyOf(data) { try { return structuredClone(data); } catch { return undefined; } }

/** validateProcedure(data) → Result<Procedure>: a copy holding only the contract's fields. */
export function validateProcedure(data) {
  const copy = copyOf(data);
  if (!isPlain(copy)) return fail('invalid_procedure', 'procedure', 'A procedure must be an object');
  for (const field of ['id', 'version', 'title', 'purpose', 'source']) if (!isText(copy[field])) return fail('invalid_procedure', field, `Field ${field} must be non-empty text`);
  if (!REVIEW.includes(copy.review_status)) return fail('invalid_procedure', 'review_status', 'Field review_status must be draft, demo or reviewed');
  if (!textList(copy.required_equipment)) return fail('invalid_procedure', 'required_equipment', 'Field required_equipment must be a list of equipment ids');
  if (!textList(copy.preparation)) return fail('invalid_procedure', 'preparation', 'Field preparation must be a list of texts');
  if (!Array.isArray(copy.steps) || !copy.steps.length || copy.steps.length > MAX_LIST) return fail('invalid_procedure', 'steps', 'Field steps must be a non-empty list');
  const seen = new Set();
  for (const step of copy.steps) {
    if (!isPlain(step) || !isText(step.id) || !isText(step.text) || (step.records !== undefined && !isText(step.records))) return fail('invalid_procedure', 'steps', 'Every step needs an id and a text; records, if given, names a variable');
    if (seen.has(step.id)) return fail('invalid_procedure', 'steps', `Step id ${step.id.slice(0, 40)} is used twice`);
    seen.add(step.id);
  }
  if (copy.documented_alternative !== undefined && (!isText(copy.documented_alternative) || copy.documented_alternative === copy.id)) return fail('invalid_procedure', 'documented_alternative', 'documented_alternative must be the id of another procedure');
  const value = {id: copy.id, version: copy.version, title: copy.title, purpose: copy.purpose, required_equipment: copy.required_equipment, preparation: copy.preparation,
    steps: copy.steps.map(step => ({id: step.id, text: step.text, ...(step.records !== undefined ? {records: step.records} : {})})), source: copy.source, review_status: copy.review_status};
  if (copy.documented_alternative !== undefined) value.documented_alternative = copy.documented_alternative;
  if (typeof copy.schema_version === 'number') value.schema_version = copy.schema_version;
  return ok(value);
}

/** availability(procedure, config) → { available, missing, alternative_id? }. An unreadable procedure or configuration is "not available", with the reason. */
export function availability(procedure, config) {
  const checked = validateProcedure(procedure);
  if (!checked.ok) return {available: false, missing: [], problem: `The procedure is not valid: ${checked.error.message}`};
  const equipment = isPlain(config) ? config.available_equipment : undefined;
  if (!textList(equipment)) return {available: false, missing: [], problem: 'The mission configuration does not list its equipment, so availability cannot be decided.'};
  const missing = [...new Set(checked.value.required_equipment.filter(item => !equipment.includes(item)))];
  const result = {available: missing.length === 0, missing};
  if (!result.available && checked.value.documented_alternative) result.alternative_id = checked.value.documented_alternative;
  return result;
}

const storeOk = (store, names) => isPlain(store) && names.every(name => typeof store[name] === 'function');
function stamp(options) {
  if (options.clock === undefined) return ok({});
  if (typeof options.clock !== 'function') return fail('invalid_clock', 'clock', 'clock must be a function');
  let now; try { now = options.clock(); } catch { return fail('invalid_clock', 'clock', 'The clock failed'); }
  return isInstant(now) ? ok({updated: now}) : fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
}

const RETRIES = 5;
async function load(store, id) {
  if (!storeOk(store, ['get', 'updateState'])) return fail('invalid_store', 'store', 'A store with get() and updateState() is required');
  if (!isText(id)) return fail('invalid_id', 'executionId', 'An execution id is required');
  const found = await store.get('executions', id);
  if (!found.ok) return found.error && found.error.code === 'not_found' ? fail('not_found', 'executionId', 'No execution has this id') : found;
  const e = found.value;
  if (!isPlain(e) || !STATES.includes(e.state) || !Number.isInteger(e.current_step) || !Number.isInteger(e.step_count) || !Array.isArray(e.records) || !Array.isArray(e.interruptions)) return fail('corrupt_execution', 'executionId', 'The stored execution is not readable');
  return ok(e);
}
const refuse = (execution, action) => fail('transition_not_allowed', 'state', `A ${execution.state} execution cannot ${action}`);
const options = input => (input === undefined ? ok({}) : isPlain(input) ? ok(input) : fail('invalid_options', 'options', 'Options must be an object'));

// Read, decide, then write conditionally on the revision that was read. If another writer (another call, or another browser tab) changed the
// execution in between, the write is refused by the store and the decision is made again on the new state. Nothing is lost and nothing is applied twice.
async function change(store, executionId, decide) {
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    const loaded = await load(store, executionId); if (!loaded.ok) return loaded;
    const e = loaded.value;
    const decided = await decide(e); if (!decided.ok) return decided;
    const written = await store.updateState('executions', executionId, {...decided.value, rev: (Number.isInteger(e.rev) ? e.rev : 0) + 1}, {expect: {rev: Number.isInteger(e.rev) ? e.rev : null}});
    if (written.ok || !written.error || written.error.code !== 'conflict') return written;
  }
  return fail('conflict', 'executionId', 'The execution kept changing under another writer; try again');
}

/** start(store, procedure, config, { subject, clock, newId, preparation_confirmed? }) → Result<Execution>. Missing equipment gives a stored `blocked` execution; a procedure with preparation checks starts only once they are confirmed. */
export async function start(store, procedure, config, context) {
  if (!storeOk(store, ['save'])) return fail('invalid_store', 'store', 'A store with save() is required');
  const checked = validateProcedure(procedure); if (!checked.ok) return checked;
  if (!isPlain(config) || !textList(config.available_equipment)) return fail('invalid_config', 'config', 'The configuration must list its equipment');
  if (!isPlain(context) || !isText(context.subject)) return fail('invalid_context', 'subject', 'A subject is required; none is assumed');
  if (typeof context.clock !== 'function' || typeof context.newId !== 'function') return fail('invalid_context', 'context', 'A clock and an id generator are required');
  let now; let id;
  try { now = context.clock(); id = context.newId(); } catch { return fail('invalid_context', 'context', 'The clock or the id generator failed'); }
  if (!isInstant(now)) return fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
  if (!isText(id)) return fail('invalid_id', 'newId', 'The id generator did not return text');
  const found = availability(checked.value, config);
  if (found.available && checked.value.preparation.length && context.preparation_confirmed !== true) return fail('preparation_not_confirmed', 'preparation_confirmed', 'Confirm the preparation checks before starting');
  const execution = {id, schema_version: 2, procedure_id: checked.value.id, procedure_version: checked.value.version, subject: context.subject, state: found.available ? 'in_progress' : 'blocked',
    current_step: 0, step_count: checked.value.steps.length, step_records: checked.value.steps.map(step => step.records ?? null), unrecorded_steps: [], preparation_confirmed: found.available && checked.value.preparation.length > 0,
    started: now, updated: now, difficulties: [], records: [], interruptions: [], rev: 0};
  if (!found.available) execution.missing = found.missing;
  return store.save('executions', execution);
}

/**
 * advance(store, id, { record?, no_record?, clock? }): one step forward. A step that declares a variable to record needs a record of that variable
 * (it must exist and belong to the subject) or an explicit `no_record: true`, which is kept in `unrecorded_steps`: a step done without its value is never counted as recorded.
 */
export async function advance(store, executionId, input) {
  const opts = options(input); if (!opts.ok) return opts;
  const time = stamp(opts.value); if (!time.ok) return time;
  if (opts.value.record !== undefined && !isText(opts.value.record)) return fail('invalid_record', 'record', 'record must be a record id');
  return change(store, executionId, async e => {
    if (!TRANSITIONS.advance.from.includes(e.state)) return refuse(e, 'advance');
    if (e.current_step >= e.step_count) return fail('no_more_steps', 'current_step', 'Every step has been done; finish the execution');
    const declared = Array.isArray(e.step_records) ? e.step_records[e.current_step] ?? null : null;
    let records = e.records; let unrecorded = Array.isArray(e.unrecorded_steps) ? e.unrecorded_steps : [];
    if (opts.value.record !== undefined) {
      if (!storeOk(store, ['get'])) return fail('invalid_store', 'store', 'A store with get() is required');
      const found = await store.get('records', opts.value.record);
      if (!found.ok) return fail('unknown_record', 'record', 'No record has this id');
      if (found.value.subject !== e.subject) return fail('other_subject', 'record', 'The record belongs to another subject');
      if (declared !== null && found.value.variable !== declared) return fail('wrong_variable', 'record', `This step records ${declared}, not ${String(found.value.variable).slice(0, 40)}`);
      records = e.records.includes(opts.value.record) ? e.records : [...e.records, opts.value.record];
    } else if (declared !== null) {
      if (opts.value.no_record !== true) return fail('record_required', 'record', `This step records ${declared}: link the record, or say explicitly that nothing was recorded`);
      unrecorded = [...unrecorded, e.current_step];
    }
    return ok({current_step: e.current_step + 1, records, unrecorded_steps: unrecorded, ...time.value});
  });
}

/** interrupt(store, id, { reason, clock? }): keeps the step; an interrupted execution is not completed. */
export async function interrupt(store, executionId, input) {
  const opts = options(input); if (!opts.ok) return opts;
  if (!isText(opts.value.reason)) return fail('invalid_reason', 'reason', 'A reason is required');
  const time = stamp(opts.value); if (!time.ok) return time;
  return change(store, executionId, async e => {
    if (!TRANSITIONS.interrupt.from.includes(e.state)) return refuse(e, 'interrupt');
    return ok({state: TRANSITIONS.interrupt.to, interruptions: [...e.interruptions, {reason: opts.value.reason, step: e.current_step, at: time.value.updated ?? null}], ...time.value});
  });
}

/** resume(store, id, { clock? }): continues at the same step. */
export async function resume(store, executionId, input) {
  const opts = options(input); if (!opts.ok) return opts;
  const time = stamp(opts.value); if (!time.ok) return time;
  return change(store, executionId, async e => (TRANSITIONS.resume.from.includes(e.state) ? ok({state: TRANSITIONS.resume.to, ...time.value}) : refuse(e, 'resume')));
}

/** finish(store, id, { state: "completed" | "could_not", difficulties?, clock? }). `completed` needs every step done. */
export async function finish(store, executionId, input) {
  const opts = options(input); if (!opts.ok) return opts;
  const target = opts.value.state;
  if (target !== 'completed' && target !== 'could_not') return fail('invalid_state', 'state', 'state must be completed or could_not');
  const difficulties = opts.value.difficulties === undefined ? [] : opts.value.difficulties;
  if (!textList(difficulties)) return fail('invalid_difficulties', 'difficulties', 'difficulties must be a list of non-empty texts');
  const time = stamp(opts.value); if (!time.ok) return time;
  return change(store, executionId, async e => {
    if (!TRANSITIONS.finish[target].includes(e.state)) return refuse(e, `finish as ${target}`);
    if (target === 'completed' && e.current_step < e.step_count) return fail('steps_remaining', 'current_step', `${e.step_count - e.current_step} step(s) are not done; it cannot be completed`);
    return ok({state: target, difficulties: [...difficulties], ...time.value});
  });
}

// ---- Registry: every published version is kept, so an execution can always be read against the version it started with (R5). ----
const keyOf = (id, version) => `${id}@${version}`;
const wrapperOk = w => isPlain(w) && isText(w.id) && isText(w.procedure_id) && isText(w.version) && isText(w.published) && validateProcedure(w.procedure).ok && w.id === keyOf(w.procedure_id, w.version) && w.procedure.id === w.procedure_id && w.procedure.version === w.version;

/** publishProcedure(store, procedure, { clock }) → Result<Procedure>. A published version is never replaced; publish a new version instead. */
export async function publishProcedure(store, procedure, options) {
  if (!storeOk(store, ['save'])) return fail('invalid_store', 'store', 'A store with save() is required');
  const checked = validateProcedure(procedure); if (!checked.ok) return checked;
  if (checked.value.id.includes('@') || checked.value.version.includes('@')) return fail('invalid_procedure', 'id', 'id and version must not contain "@"');
  if (!isPlain(options) || typeof options.clock !== 'function') return fail('invalid_clock', 'clock', 'A clock is required to date a publication');
  let now; try { now = options.clock(); } catch { return fail('invalid_clock', 'clock', 'The clock failed'); }
  if (!isInstant(now)) return fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
  const saved = await store.save('procedures', {id: keyOf(checked.value.id, checked.value.version), schema_version: 2, procedure_id: checked.value.id, version: checked.value.version, published: now, procedure: checked.value});
  if (!saved.ok) return saved.error && saved.error.code === 'duplicate' ? fail('version_exists', 'version', `Version ${checked.value.version} of ${checked.value.id} is already published; publish a new version`) : saved;
  return ok(checked.value);
}

/** listProcedures(store, { all? }) → Result<Procedure[]>: the latest published version of each procedure that is not retired, or every version, retired ones included, with `all`. */
export async function listProcedures(store, options) {
  if (!storeOk(store, ['list'])) return fail('invalid_store', 'store', 'A store with list() is required');
  const listed = await store.list('procedures', {}); if (!listed.ok) return listed;
  const retirements = listed.value.filter(w => isPlain(w) && w.kind === 'retirement');
  for (const r of retirements) if (!(isText(r.procedure_id) && isText(r.version) && isText(r.retired) && isText(r.reason) && r.id === `retired:${keyOf(r.procedure_id, r.version)}`)) return fail('corrupt_procedure', 'procedures', `Stored retirement ${typeof r.id === 'string' ? r.id.slice(0, 60) : '(no id)'} is not readable`);
  const versions = listed.value.filter(w => !(isPlain(w) && w.kind === 'retirement'));
  for (const w of versions) if (!wrapperOk(w)) return fail('corrupt_procedure', 'procedures', `Stored procedure ${isPlain(w) && typeof w.id === 'string' ? w.id.slice(0, 60) : '(no id)'} is not readable`);
  const ordered = [...versions].sort((a, b) => (a.published < b.published ? -1 : a.published > b.published ? 1 : a.version.localeCompare(b.version, 'en', {numeric: true})));
  if (isPlain(options) && options.all === true) return ok(ordered.map(w => w.procedure));
  const retired = new Set(retirements.map(r => keyOf(r.procedure_id, r.version)));
  const latest = new Map(); for (const w of ordered) if (!retired.has(w.id)) latest.set(w.procedure_id, w.procedure);
  return ok([...latest.values()].sort((a, b) => (a.id < b.id ? -1 : 1)));
}

/**
 * retireProcedure(store, id, version, { clock, reason }) → Result<{ id, version, retired }>. A retired version is no longer offered to start or to change, but it stays
 * readable (getProcedure, listProcedures with `all`) so every execution that used it can still be read against it. It is a new immutable entry; nothing is deleted.
 */
export async function retireProcedure(store, id, version, options) {
  if (!storeOk(store, ['get', 'save'])) return fail('invalid_store', 'store', 'A store with get() and save() is required');
  if (!isPlain(options) || !isText(options.reason)) return fail('invalid_reason', 'reason', 'Say why this version is retired');
  if (typeof options.clock !== 'function') return fail('invalid_clock', 'clock', 'A clock is required to date a retirement');
  let now; try { now = options.clock(); } catch { now = undefined; }
  if (!isInstant(now)) return fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
  const existing = await getProcedure(store, id, version); if (!existing.ok) return existing;
  const saved = await store.save('procedures', {id: `retired:${keyOf(id, version)}`, schema_version: 2, kind: 'retirement', procedure_id: id, version, retired: now, reason: options.reason});
  if (!saved.ok) return saved.error && saved.error.code === 'duplicate' ? fail('already_retired', 'version', `Version ${version} of ${id.slice(0, 60)} is already retired`) : saved;
  return ok({id, version, retired: now});
}

/** getProcedure(store, id, version) → Result<Procedure>: that exact published version. */
export async function getProcedure(store, id, version) {
  if (!storeOk(store, ['get'])) return fail('invalid_store', 'store', 'A store with get() is required');
  if (!isText(id) || !isText(version)) return fail('invalid_id', 'id', 'An id and a version are required');
  const found = await store.get('procedures', keyOf(id, version));
  if (!found.ok) return found.error && found.error.code === 'not_found' ? fail('not_found', 'version', `Version ${version} of ${id.slice(0, 60)} is not published`) : found;
  return wrapperOk(found.value) ? ok(found.value.procedure) : fail('corrupt_procedure', 'procedures', 'The stored procedure is not readable');
}
