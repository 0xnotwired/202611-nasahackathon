// Shared model helpers for the views. One place decides how a record becomes a screen entry, so the same record
// reads the same in every view (the F2 claim). Pure: no DOM, no imports from other modules, the clock is injected.
import {ownValue, stateLabel, originLabel, valueText, valueWithContext, dataStateBadge, attentionBadge, isRecordShape} from './labels.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const isText = value => typeof value === 'string' && value.length > 0;
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const ABSENT_BADGE = Object.freeze({kind: 'not_recorded', symbol: '○', tone: 'absent', text: 'not recorded'});

/**
 * recordEntry(record, { clock, label?, variable?, old_after_days?, comparable?, reason? }) → entry.
 * A valid record gives its entry; anything else gives the absent entry for `variable`: "not recorded", never "nothing new".
 */
export function recordEntry(record, context) {
  const variable = ownValue(context, 'variable');
  const label = ownValue(context, 'label');
  if (!isRecordShape(record)) {
    const name = isText(variable) ? variable : null;
    const shown = isText(label) ? label : name;
    return {kind: 'record', has_record: false, id: null, subject: null, variable: name, label: shown, type: null, state: 'not_recorded', state_text: 'not recorded',
      origin: null, origin_text: 'no record', method: null, time: null, source_time_raw: null, place: null, sensor: null, value: null, unit: null, value_text: 'not recorded',
      text: shown ? `${shown}: not recorded` : 'not recorded', age_days: null, badge: ABSENT_BADGE, corrects: null};
  }
  const clock = ownValue(context, 'clock');
  const shown = ownValue(record, 'value');
  const text = valueText(record);
  const withContext = valueWithContext(record, {clock});
  const raw = ownValue(ownValue(record, 'source_time'), 'raw');
  return {
    kind: 'record', has_record: true, id: ownValue(record, 'id') ?? null, subject: ownValue(record, 'subject') ?? null,
    variable: ownValue(record, 'variable') ?? null, label: isText(label) ? label : ownValue(record, 'variable') ?? null, type: ownValue(record, 'type') ?? null,
    state: ownValue(record, 'state'), state_text: stateLabel(record), origin: ownValue(record, 'origin') ?? null, origin_text: originLabel(ownValue(record, 'origin')),
    method: ownValue(record, 'method') ?? null, time: ownValue(record, 'time') ?? null, source_time_raw: isText(raw) ? raw : null,
    place: ownValue(record, 'place') ?? null, sensor: ownValue(record, 'sensor') ?? null,
    value: typeof shown === 'number' && text.value !== null ? text.value : null, unit: text.unit, value_text: text.text, text: withContext.text, age_days: withContext.parts.age_days,
    badge: dataStateBadge(record, {clock, old_after_days: ownValue(context, 'old_after_days'), comparable: ownValue(context, 'comparable'), reason: ownValue(context, 'reason')}),
    corrects: ownValue(record, 'corrects') ?? null
  };
}

const READINGS = ['series', 'latest', 'baseline', 'environment', 'cumulative', 'attention'];

/** What every view needs from services, checked once. Names what is missing; assumes no subject, no clock, no default. */
export function contextOf(services) {
  const fail = (field, message) => ({ok: false, error: {code: 'invalid_services', field, message}});
  if (!plain(services)) return fail('services', 'services were not provided');
  const store = ownValue(services, 'store');
  if (!plain(store) || typeof ownValue(store, 'list') !== 'function') return fail('store', 'services.store with list() is missing');
  const readings = ownValue(services, 'readings');
  if (!plain(readings) || READINGS.some(name => typeof ownValue(readings, name) !== 'function')) return fail('readings', 'services.readings is missing or incomplete');
  const catalogs = ownValue(services, 'catalogs');
  if (!plain(catalogs) || typeof ownValue(catalogs, 'variables') !== 'function') return fail('catalogs', 'services.catalogs with variables() is missing');
  const subject = ownValue(services, 'subject');
  if (!isText(subject)) return fail('subject', 'a subject is required; none is assumed');
  const clock = ownValue(services, 'clock');
  if (typeof clock !== 'function') return fail('clock', 'services.clock is missing');
  let now;
  try { now = Date.parse(clock()); } catch { return fail('clock', 'the clock failed'); }
  if (Number.isNaN(now)) return fail('clock', 'the clock did not return an ISO8601 UTC instant');
  const start = Math.floor(now / DAY_MS) * DAY_MS;
  return {ok: true, value: {store, readings, catalogs, subject, clock, now_ms: now, now_iso: new Date(now).toISOString(),
    today: {from: new Date(start).toISOString(), to: new Date(start + DAY_MS).toISOString()},
    config: ownValue(services, 'config') ?? null, data_source: ownValue(services, 'data_source') ?? null, writable: ownValue(services, 'writable') === true,
    record_origin: ownValue(services, 'record_origin') ?? null, flags: ownValue(services, 'flags') ?? {}, core: ownValue(services, 'core') ?? null,
    plan: ownValue(services, 'plan') ?? null, newId: ownValue(services, 'newId') ?? null,
    procedures: ownValue(services, 'procedures') ?? null, procedure_list: Array.isArray(ownValue(services, 'procedure_list')) ? ownValue(services, 'procedure_list') : []}};
}

function walk(value, visit, seen) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) { for (const item of value) { visit.value(item); walk(item, visit, seen); } return; }
  for (const [key, item] of Object.entries(value)) { visit.key(key); visit.value(item); walk(item, visit, seen); }
}
/** Every string in a model (keys excluded). Used by tests that scan whole screens for forbidden words. */
export function textsOf(model) {
  const found = [];
  const visit = {key() {}, value(item) { if (typeof item === 'string') found.push(item); }};
  visit.value(model); walk(model, visit, new Set());
  return found;
}
/** Every key in a model, at any depth. Used by tests that look for a `score` or a traffic-light field. */
export function keysOf(model) {
  const found = new Set();
  walk(model, {key(key) { found.add(key); }, value() {}}, new Set());
  return [...found];
}

/** The first section of every view: whose data this is and where it comes from. Nothing is shown without it. */
export function bannerSection(ctx) {
  const source = ctx.data_source;
  const where = source ? `${ownValue(source, 'label') ?? 'unnamed source'}. ${ownValue(source, 'note') ?? ''}`.trim() : 'The data source is not named.';
  return {id: 'source', title: 'Whose data and from where', state: 'ready', note: `Subject ${ctx.subject}. Source: ${where}`, entries: []};
}

/** One sentence, once per section, when the mission defines no attention criterion (R6: a variable without one says so). */
export function attentionNote(ctx) {
  const criteria = ownValue(ctx.config, 'attention_criteria');
  return Array.isArray(criteria) && criteria.length ? null : 'No attention criteria are defined for this mission, so nothing here is compared with a criterion.';
}

/** Catalog labels carry an instruction after a dash ("Radiation dose — retain recorded dose type and unit"); a screen shows only the name. */
export const cleanLabel = label => (typeof label === 'string' ? label.split(' — ')[0] : label);

/** Catalog variables of the given types, as { id, label, unit, type }. A broken catalog gives an empty list, never an exception. */
export function variablesOfType(ctx, types) {
  let all;
  try { all = ctx.catalogs.variables(); } catch { return []; }
  return Array.isArray(all) ? all.filter(item => item && types.includes(item.type)).map(item => ({id: item.id, label: cleanLabel(item.label), unit: item.unit, type: item.type})) : [];
}

/**
 * The newest record of one variable of the subject (any state) as an entry, or the absent entry. When the record is a measured
 * value, the entry also carries the mission's attention result for it. A failed query is a visible problem, not a blank.
 */
export async function latestEntry(ctx, info) {
  const base = {clock: ctx.clock, variable: info.id, label: info.label ?? info.id};
  let result;
  try { result = await ctx.readings.latest(ctx.store, {subject: ctx.subject, variable: info.id}, {clock: ctx.clock}); } catch { result = {ok: false, error: {message: 'the query failed'}}; }
  if (!result || result.ok === false) {
    const code = ownValue(ownValue(result, 'error'), 'code');
    const why = code === 'unresolved_time' ? 'records exist but their time is not established' : 'could not be read';
    return {...recordEntry(null, base), state: 'unreadable', state_text: why, value_text: why, text: `${base.label}: ${why}`, problem: why,
      badge: {kind: 'unknown', symbol: '?', tone: 'unknown', text: why}};
  }
  const record = ownValue(result, 'record');
  const entry = recordEntry(record ?? null, base);
  if (record && entry.has_record && entry.state === 'recorded' && ['measurement', 'environment', 'exam'].includes(entry.type)) {
    let judged; try { judged = ctx.readings.attention(record, ctx.config); } catch { judged = {status: 'not_assessed', reason: 'the attention check failed'}; }
    entry.attention = attentionBadge(judged);
  } else entry.attention = null;
  return entry;
}
