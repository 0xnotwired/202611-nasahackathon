// M16 episode: one thing the person reports, with what was recorded, what is known, what is missing, what can be done and what happened.
// Everything lives in the store (nothing is held here), so a closed and reopened app restores the same episode. `situation` returns plain
// lists for the six parts; an empty part says why in `why_empty`. A not-recorded variable and absent equipment are gaps, never "nothing to report".
import {listProcedures, availability} from '../procedures/index.js';

const MAX_TEXT = 500;
const fail = (code, field, message) => ({ok: false, error: {code, field, message}});
const ok = value => ({ok: true, value});
const isText = value => typeof value === 'string' && value.length > 0 && value.length <= MAX_TEXT;
const isPlain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isInstant = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(value) && !Number.isNaN(Date.parse(value));
const has = (store, names) => isPlain(store) && names.every(name => typeof store[name] === 'function');

const chains = new Map();
function serial(key, work) {
  const run = (chains.get(key) ?? Promise.resolve()).then(work, work);
  const tail = run.catch(() => {});
  chains.set(key, tail); tail.then(() => { if (chains.get(key) === tail) chains.delete(key); });
  return run;
}
async function load(store, id) {
  if (!has(store, ['get', 'updateState'])) return fail('invalid_store', 'store', 'A store with get() and updateState() is required');
  if (!isText(id)) return fail('invalid_id', 'episodeId', 'An episode id is required');
  const found = await store.get('episodes', id);
  if (!found.ok) return found.error && found.error.code === 'not_found' ? fail('not_found', 'episodeId', 'No episode has this id') : found;
  const e = found.value;
  if (!isPlain(e) || !isText(e.subject) || !isText(e.observation_id) || ![e.execution_ids, e.record_ids, e.task_ids].every(Array.isArray) || typeof e.alert_issued !== 'boolean') return fail('corrupt_episode', 'episodeId', 'The stored episode is not readable');
  return ok(e);
}
const closed = e => e.closed !== undefined && e.closed !== null && e.closed !== false;

/** open(store, observation, { clock, newId }) → Result<Episode>. The observation is read back from the store: it must be a recorded observation of that subject. */
export async function open(store, observation, context) {
  if (!has(store, ['get', 'save'])) return fail('invalid_store', 'store', 'A store with get() and save() is required');
  if (!isPlain(observation) || !isText(observation.id) || !isText(observation.subject)) return fail('invalid_observation', 'observation', 'An observation record is required');
  if (!isPlain(context) || typeof context.clock !== 'function' || typeof context.newId !== 'function') return fail('invalid_context', 'context', 'A clock and an id generator are required');
  const stored = await store.get('records', observation.id);
  if (!stored.ok) return fail('unknown_record', 'observation', 'The observation is not in the store');
  const r = stored.value;
  if (r.type !== 'observation' || r.state !== 'recorded' || r.subject !== observation.subject) return fail('invalid_observation', 'observation', 'An episode starts from a recorded observation of the same subject');
  let opened; let id;
  try { opened = context.clock(); id = context.newId(); } catch { return fail('invalid_context', 'context', 'The clock or the id generator failed'); }
  if (!isInstant(opened)) return fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
  if (!isText(id)) return fail('invalid_id', 'newId', 'The id generator did not return text');
  return store.save('episodes', {id, schema_version: 2, subject: r.subject, opened, observation_id: r.id, execution_ids: [], record_ids: [], task_ids: [], alert_issued: false});
}

const SOURCES = [['execution_id', 'executions', 'execution_ids'], ['record_id', 'records', 'record_ids'], ['task_id', 'tasks', 'task_ids']];
/** link(store, episodeId, { execution_id?, record_id?, task_id? }): links something that exists and belongs to the same subject. */
export function link(store, episodeId, input) {
  return serial(`episodes/${episodeId}`, async () => {
    if (!isPlain(input) || !SOURCES.some(([key]) => input[key] !== undefined)) return fail('invalid_input', 'input', 'Give an execution_id, a record_id or a task_id');
    const loaded = await load(store, episodeId); if (!loaded.ok) return loaded;
    const e = loaded.value;
    if (closed(e)) return fail('episode_closed', 'episodeId', 'The episode is closed');
    const changes = {};
    for (const [key, collection, field] of SOURCES) {
      if (input[key] === undefined) continue;
      if (!isText(input[key])) return fail('invalid_input', key, `${key} must be an id`);
      const found = await store.get(collection, input[key]);
      if (!found.ok) return fail(`unknown_${key.replace('_id', '')}`, key, 'Nothing has this id');
      if (found.value.subject !== e.subject) return fail('other_subject', key, 'It belongs to another subject');
      changes[field] = e[field].includes(input[key]) ? e[field] : [...e[field], input[key]];
    }
    return store.updateState('episodes', episodeId, changes);
  });
}

/** close(store, episodeId, { clock? }): `closed` is the instant given by the clock, or `true` when no clock is given (no time is invented). */
export function close(store, episodeId, options) {
  return serial(`episodes/${episodeId}`, async () => {
    let stamp = true;
    if (isPlain(options) && options.clock !== undefined) {
      let now; try { now = typeof options.clock === 'function' ? options.clock() : undefined; } catch { now = undefined; }
      if (!isInstant(now)) return fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
      stamp = now;
    }
    const loaded = await load(store, episodeId); if (!loaded.ok) return loaded;
    if (closed(loaded.value)) return fail('episode_closed', 'episodeId', 'The episode is already closed');
    return store.updateState('episodes', episodeId, {closed: stamp});
  });
}

/**
 * reopen(store, episodeId, { reason, clock? }) → Result<Episode>. Undoes a close with a stated reason; the earlier close stays in `reopened`.
 * Refused while another episode of the same subject is open (one open episode at a time), and when the episode is not closed.
 */
export function reopen(store, episodeId, options) {
  return serial(`episodes/${episodeId}`, async () => {
    if (!isPlain(options) || !isText(options.reason)) return fail('invalid_reason', 'reason', 'Say why the episode is being reopened');
    let at = null;
    if (options.clock !== undefined) {
      let now; try { now = typeof options.clock === 'function' ? options.clock() : undefined; } catch { now = undefined; }
      if (!isInstant(now)) return fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
      at = now;
    }
    const loaded = await load(store, episodeId); if (!loaded.ok) return loaded;
    const e = loaded.value;
    if (!closed(e)) return fail('episode_not_closed', 'episodeId', 'The episode is not closed, so there is nothing to reopen');
    if (!has(store, ['list'])) return fail('invalid_store', 'store', 'A store with list() is required');
    const others = await store.list('episodes', {subject: e.subject}); if (!others.ok) return others;
    if (others.value.some(o => o.id !== e.id && !closed(o))) return fail('another_episode_open', 'episodeId', 'Another episode is open; close it first');
    const history = Array.isArray(e.reopened) ? e.reopened : [];
    return store.updateState('episodes', episodeId, {closed: null, reopened: [...history, {previous_closed: e.closed, at, reason: options.reason}]}, {expect: {closed: e.closed}});
  });
}

/** listEpisodes(store, { subject }) → Result<{ id, opened, closed, observation_id, reopened }[]>, newest first. Reads only. */
export async function listEpisodes(store, query) {
  if (!has(store, ['list'])) return fail('invalid_store', 'store', 'A store with list() is required');
  if (!isPlain(query) || !isText(query.subject)) return fail('invalid_input', 'subject', 'A subject is required');
  const listed = await store.list('episodes', {subject: query.subject}); if (!listed.ok) return listed;
  return ok(listed.value.map(e => ({id: e.id, opened: e.opened, closed: closed(e) ? e.closed : null, is_closed: closed(e), observation_id: e.observation_id, reopened: Array.isArray(e.reopened) ? e.reopened : []}))
    .sort((a, b) => (a.opened < b.opened ? 1 : a.opened > b.opened ? -1 : a.id < b.id ? -1 : 1)));
}

/** issueAlert(store, episodeId) → Result<{ issued, episode }>: `alert_issued` turns true once; a second call changes nothing. */
export function issueAlert(store, episodeId) {
  return serial(`episodes/${episodeId}`, async () => {
    const loaded = await load(store, episodeId); if (!loaded.ok) return loaded;
    if (closed(loaded.value)) return fail('episode_closed', 'episodeId', 'The episode is closed');
    if (loaded.value.alert_issued) return ok({issued: false, episode: loaded.value});
    const updated = await store.updateState('episodes', episodeId, {alert_issued: true}); if (!updated.ok) return updated;
    return ok({issued: true, episode: updated.value});
  });
}

const brief = r => ({id: r.id, variable: r.variable ?? null, type: r.type, state: r.state, value: r.state === 'recorded' && typeof r.value === 'number' ? r.value : null, unit: r.unit ?? null, method: r.method ?? null, time: r.time ?? null, origin: r.origin ?? null, place: r.place ?? null});
const ms = r => Date.parse(r.time ?? '');

/** situation(store, episodeId, config, { clock }) → the six parts (lists), plus `why_empty` and `alert_issued`. A failure is { ok: false, error }. */
export async function situation(store, episodeId, config, context) {
  const loaded = await load(store, episodeId); if (!loaded.ok) return loaded;
  if (!has(store, ['list'])) return fail('invalid_store', 'store', 'A store with list() is required');
  if (!isPlain(config) || !Array.isArray(config.available_equipment)) return fail('invalid_config', 'config', 'The mission configuration must list its equipment');
  if (!isPlain(context) || typeof context.clock !== 'function') return fail('invalid_context', 'clock', 'A clock is required');
  const e = loaded.value;
  const listed = await store.list('records', {subject: e.subject}); if (!listed.ok) return listed;
  const corrected = new Set(listed.value.filter(r => isText(r.corrects)).map(r => r.corrects));
  const own = listed.value.filter(r => !corrected.has(r.id));
  const byId = new Map(own.map(r => [r.id, r]));
  const observation = byId.get(e.observation_id);
  const youRecorded = [e.observation_id, ...e.record_ids].filter((id, i, all) => all.indexOf(id) === i).map(id => byId.get(id)).filter(Boolean).map(brief);
  const shown = new Set(youRecorded.map(r => r.id));
  const place = observation && isText(observation.place) ? observation.place : null;

  const newest = new Map();
  for (const r of own) {
    if (r.type === 'observation' || Number.isNaN(ms(r))) continue;
    if (r.type === 'environment' && (place === null || r.place !== place)) continue;
    const key = `${r.type === 'environment' ? `env:${r.place}` : 'own'}:${r.variable}`;
    if (!newest.has(key) || ms(r) > ms(newest.get(key))) newest.set(key, r);
  }
  const weKnow = [...newest.values()].filter(r => r.state === 'recorded' && !shown.has(r.id)).sort((a, b) => (a.variable < b.variable ? -1 : 1)).map(brief);
  const missing = [...newest.values()].filter(r => r.state === 'not_recorded' && r.type !== 'environment').sort((a, b) => (a.variable < b.variable ? -1 : 1)).map(r => ({kind: 'not_recorded', variable: r.variable, last_attempt: r.time}));
  const unplaced = own.filter(r => r.type !== 'observation' && r.type !== 'environment' && Number.isNaN(ms(r))).length;
  if (unplaced) missing.push({kind: 'time_not_established', count: unplaced});

  const procedures = await listProcedures(store);
  const youCan = procedures.ok ? procedures.value.map(p => { const a = availability(p, config); return {procedure_id: p.id, title: p.title, version: p.version, available: a.available, missing: a.missing, ...(a.alternative_id ? {alternative_id: a.alternative_id} : {})}; }) : [];
  const equipment = new Map();
  for (const c of youCan) for (const item of c.missing) equipment.set(item, [...(equipment.get(item) ?? []), c.procedure_id]);
  for (const [item, needed_by] of equipment) missing.push({kind: 'equipment', item, needed_by});

  const happened = [];
  for (const id of e.execution_ids) { const f = await store.get('executions', id); if (f.ok) happened.push({id, procedure_id: f.value.procedure_id, procedure_version: f.value.procedure_version, state: f.value.state, current_step: f.value.current_step, step_count: f.value.step_count, difficulties: [...(f.value.difficulties ?? [])]}); }
  const next = [];
  for (const id of e.task_ids) { const f = await store.get('tasks', id); if (f.ok && f.value.completion === 'pending') next.push({id, description: f.value.description}); }

  const why = {};
  if (!youRecorded.length) why.you_recorded = 'The observation that started this episode is not readable in the store.';
  if (!weKnow.length) why.we_know = place === null ? 'No recorded measurement is known, and no place is stated for the observation, so no environment reading is used.' : 'No recorded measurement or reading from this place is known.';
  if (!missing.length) why.missing = 'Nothing was found missing among the measurements of this subject and the procedures published here.';
  if (!youCan.length) why.you_can = procedures.ok ? 'No procedure is published in this data source.' : `Procedures could not be read: ${procedures.error.message}`;
  if (!happened.length) why.happened = 'No execution is linked to this episode.';
  if (!next.length) why.next = 'No pending task is linked to this episode.';
  return {you_recorded: youRecorded, we_know: weKnow, missing, you_can: youCan, happened, next, why_empty: why, alert_issued: e.alert_issued};
}
