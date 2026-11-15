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

// One execution is changed by one caller at a time: read, check and write happen inside the same turn of its chain.
const chains = new Map();
function serial(key, work) {
  const run = (chains.get(key) ?? Promise.resolve()).then(work, work);
  const tail = run.catch(() => {});
  chains.set(key, tail); tail.then(() => { if (chains.get(key) === tail) chains.delete(key); });
  return run;
}

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
const write = (store, id, changes) => store.updateState('executions', id, changes);

/** start(store, procedure, config, { subject, clock, newId }) → Result<Execution>. Missing equipment gives a stored `blocked` execution. */
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
  const execution = {id, schema_version: 2, procedure_id: checked.value.id, procedure_version: checked.value.version, subject: context.subject, state: found.available ? 'in_progress' : 'blocked',
    current_step: 0, step_count: checked.value.steps.length, started: now, updated: now, difficulties: [], records: [], interruptions: []};
  if (!found.available) execution.missing = found.missing;
  return store.save('executions', execution);
}

/** advance(store, id, { record?, clock? }): one step forward; a produced record id is linked only if it exists and belongs to the subject. */
export function advance(store, executionId, input) {
  return serial(`executions/${executionId}`, async () => {
    const opts = options(input); if (!opts.ok) return opts;
    const time = stamp(opts.value); if (!time.ok) return time;
    const loaded = await load(store, executionId); if (!loaded.ok) return loaded;
    const e = loaded.value;
    if (!TRANSITIONS.advance.from.includes(e.state)) return refuse(e, 'advance');
    if (e.current_step >= e.step_count) return fail('no_more_steps', 'current_step', 'Every step has been done; finish the execution');
    let records = e.records;
    if (opts.value.record !== undefined) {
      if (!isText(opts.value.record)) return fail('invalid_record', 'record', 'record must be a record id');
      if (!storeOk(store, ['get'])) return fail('invalid_store', 'store', 'A store with get() is required');
      const found = await store.get('records', opts.value.record);
      if (!found.ok) return fail('unknown_record', 'record', 'No record has this id');
      if (found.value.subject !== e.subject) return fail('other_subject', 'record', 'The record belongs to another subject');
      records = e.records.includes(opts.value.record) ? e.records : [...e.records, opts.value.record];
    }
    return write(store, executionId, {current_step: e.current_step + 1, records, ...time.value});
  });
}

/** interrupt(store, id, { reason, clock? }): keeps the step; an interrupted execution is not completed. */
export function interrupt(store, executionId, input) {
  return serial(`executions/${executionId}`, async () => {
    const opts = options(input); if (!opts.ok) return opts;
    if (!isText(opts.value.reason)) return fail('invalid_reason', 'reason', 'A reason is required');
    const time = stamp(opts.value); if (!time.ok) return time;
    const loaded = await load(store, executionId); if (!loaded.ok) return loaded;
    const e = loaded.value;
    if (!TRANSITIONS.interrupt.from.includes(e.state)) return refuse(e, 'interrupt');
    return write(store, executionId, {state: TRANSITIONS.interrupt.to, interruptions: [...e.interruptions, {reason: opts.value.reason, step: e.current_step, at: time.value.updated ?? null}], ...time.value});
  });
}

/** resume(store, id, { clock? }): continues at the same step. */
export function resume(store, executionId, input) {
  return serial(`executions/${executionId}`, async () => {
    const opts = options(input); if (!opts.ok) return opts;
    const time = stamp(opts.value); if (!time.ok) return time;
    const loaded = await load(store, executionId); if (!loaded.ok) return loaded;
    if (!TRANSITIONS.resume.from.includes(loaded.value.state)) return refuse(loaded.value, 'resume');
    return write(store, executionId, {state: TRANSITIONS.resume.to, ...time.value});
  });
}

/** finish(store, id, { state: "completed" | "could_not", difficulties?, clock? }). `completed` needs every step done. */
export function finish(store, executionId, input) {
  return serial(`executions/${executionId}`, async () => {
    const opts = options(input); if (!opts.ok) return opts;
    const target = opts.value.state;
    if (target !== 'completed' && target !== 'could_not') return fail('invalid_state', 'state', 'state must be completed or could_not');
    const difficulties = opts.value.difficulties === undefined ? [] : opts.value.difficulties;
    if (!textList(difficulties)) return fail('invalid_difficulties', 'difficulties', 'difficulties must be a list of non-empty texts');
    const time = stamp(opts.value); if (!time.ok) return time;
    const loaded = await load(store, executionId); if (!loaded.ok) return loaded;
    const e = loaded.value;
    if (!TRANSITIONS.finish[target].includes(e.state)) return refuse(e, `finish as ${target}`);
    if (target === 'completed' && e.current_step < e.step_count) return fail('steps_remaining', 'current_step', `${e.step_count - e.current_step} step(s) are not done; it cannot be completed`);
    return write(store, executionId, {state: target, difficulties: [...difficulties], ...time.value});
  });
}
