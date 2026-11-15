// Shared query machinery for readings. Internal to M06: index.js is the only door.
// Rules: a missing value is not zero (R2); comparability is decided only by core (R3);
// one subject's records never reach another's result (R9); source time is never turned into UTC.
import {areComparable} from '../core/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAYS = 3650; // technical size bound on a day grid; not a medical range
const MAX_TEXT = 512;  // technical bound on identifier text

export function fail(code, field, message) { return {ok: false, error: {code, field, message}}; }

const isText = value => typeof value === 'string' && value.length > 0 && value.length <= MAX_TEXT;
const byTimeThenId = (a, b) => (a.ms - b.ms) || (a.record.id < b.record.id ? -1 : a.record.id > b.record.id ? 1 : 0);

/** Read named own data properties. Accessors are refused and never executed. */
export function readQuery(input, keys) {
  const out = {};
  try {
    if (input === null || typeof input !== 'object' || Array.isArray(input)) return fail('invalid_query', 'query', 'Query must be a plain object');
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      if (!descriptor) continue;
      if (!Object.hasOwn(descriptor, 'value')) return fail('invalid_query', key, `Field ${key} must be a plain value, not an accessor`);
      out[key] = descriptor.value;
    }
  } catch { return fail('invalid_query', 'query', 'Query could not be read safely'); }
  return {ok: true, value: out};
}

export function readSubjectVariable(input, extraKeys = []) {
  const read = readQuery(input, ['subject', 'variable', ...extraKeys]);
  if (!read.ok) return read;
  for (const key of ['subject', 'variable']) if (!isText(read.value[key])) return fail('invalid_query', key, `Field ${key} must be non-empty text`);
  return read;
}

function instant(value, field) {
  // Bounds are UTC instants: text without a trailing Z (date-only, local time, an offset) would mean different instants in different time zones.
  const ms = typeof value === 'string' && value.includes('T') && value.endsWith('Z') ? Date.parse(value) : NaN;
  return Number.isNaN(ms) ? fail('invalid_query', field, `Field ${field} must be an ISO8601 UTC instant`) : {ok: true, value: ms};
}

export function readRange(input) {
  const read = readSubjectVariable(input, ['from', 'to']);
  if (!read.ok) return read;
  const from = instant(read.value.from, 'from'); if (!from.ok) return from;
  const to = instant(read.value.to, 'to'); if (!to.ok) return to;
  if (from.value >= to.value) return fail('invalid_query', 'to', 'Range end must be after its start');
  const days = Math.floor((to.value - 1) / DAY_MS) - Math.floor(from.value / DAY_MS) + 1;
  if (days > MAX_DAYS) return fail('range_too_large', 'to', `Range spans ${days} days; the technical bound is ${MAX_DAYS}`);
  return {ok: true, value: {subject: read.value.subject, variable: read.value.variable, fromMs: from.value, toMs: to.value}};
}

export function readUpTo(input) {
  const read = readSubjectVariable(input, ['to']);
  if (!read.ok) return read;
  const to = instant(read.value.to, 'to'); if (!to.ok) return to;
  return {ok: true, value: {subject: read.value.subject, variable: read.value.variable, toMs: to.value}};
}

async function list(store, filter) {
  if (!store || typeof store !== 'object' || typeof store.list !== 'function') return fail('invalid_store', 'store', 'A store with list() is required');
  let result;
  try { result = await store.list('records', filter); } catch { return fail('store_error', 'store', 'The store failed while reading records'); }
  if (result && result.ok === false && result.error) return result;
  if (!result || result.ok !== true || !Array.isArray(result.value)) return fail('store_error', 'store', 'The store returned an unexpected answer');
  return result;
}

/**
 * Every record of one subject and variable, with corrections applied. Reading without a time
 * bound on purpose: a later correction of an earlier record must not be missed by a window.
 */
export async function loadActive(store, subject, variable) {
  const result = await list(store, {subject, variable});
  if (!result.ok) return result;
  if (result.value.some(record => record.time === null))
    return fail('unresolved_time', 'time', 'A record of this subject and variable has only a source time; no UTC placement or age is invented');
  const superseded = new Set(result.value.filter(record => typeof record.corrects === 'string').map(record => record.corrects));
  const all = result.value.map(record => ({record, ms: Date.parse(record.time)})).sort(byTimeThenId);
  return {ok: true, value: {all, active: all.filter(entry => !superseded.has(entry.record.id)), superseded}};
}

const dayKey = ms => new Date(ms).toISOString().split('T')[0];
const dayIndex = ms => Math.floor(ms / DAY_MS);

function toPoint(entry) {
  const {record} = entry;
  const point = {id: record.id, day: dayKey(entry.ms), time: record.time, value: record.value, unit: record.unit, method: record.method, origin: record.origin};
  // A source-time record keeps its own text; the day above is a source day, never a UTC date.
  if (record.time === null) point.source_time = record.source_time.value;
  return point;
}

function isMeasured(record) { return record.state === 'recorded' && typeof record.value === 'number'; }

/** Group measured entries with core.areComparable; never compare by hand. */
export function groupMeasured(entries) {
  const known = entries.filter(entry => entry.record.unit_status !== 'unknown');
  const unknown = entries.filter(entry => entry.record.unit_status === 'unknown');
  const groups = [];
  for (const entry of known) {
    const home = groups.find(group => areComparable(group.entries[0].record, entry.record).comparable);
    if (home) home.entries.push(entry); else groups.push({entries: [entry]});
  }
  let primary = null;
  for (const group of groups) {
    const latestMs = group.entries[group.entries.length - 1].ms;
    group.latestMs = latestMs;
    if (!primary || group.entries.length > primary.entries.length
      || (group.entries.length === primary.entries.length && (latestMs > primary.latestMs
        || (latestMs === primary.latestMs && group.entries[0].record.id < primary.entries[0].record.id)))) primary = group;
  }
  const others = groups.filter(group => group !== primary).map(group => ({
    reason: areComparable(primary.entries[0].record, group.entries[0].record).reason ?? 'Not comparable',
    key: {method: group.entries[0].record.method, unit: group.entries[0].record.unit},
    entries: group.entries
  }));
  if (unknown.length) others.push({reason: 'Unknown unit: these values cannot be compared with each other or with any other record', key: {method: null, unit: null, unit_status: 'unknown'}, entries: unknown});
  return {primary: primary ? primary.entries : [], others};
}

/** Points, gaps and groups for one subject/variable over UTC days in [from, to). */
export function analyzeRange(loaded, fromMs, toMs) {
  const inside = entry => entry.ms >= fromMs && entry.ms < toMs;
  const activeInside = loaded.active.filter(inside);
  const measured = activeInside.filter(entry => isMeasured(entry.record));
  const {primary, others} = groupMeasured(measured);
  const primaryDays = new Set(primary.map(entry => dayIndex(entry.ms)));
  const otherDays = new Set(others.flatMap(group => group.entries.map(entry => dayIndex(entry.ms))));
  const supersededDays = new Set(loaded.all.filter(inside).filter(entry => loaded.superseded.has(entry.record.id)).map(entry => dayIndex(entry.ms)));
  const gaps = [];
  for (let index = dayIndex(fromMs); index <= dayIndex(toMs - 1); index++) {
    if (primaryDays.has(index)) continue;
    const states = activeInside.filter(entry => dayIndex(entry.ms) === index).map(entry => entry.record.state);
    let reason = 'no_record';
    if (otherDays.has(index)) reason = 'other_group';
    else if (states.includes('not_recorded')) reason = 'not_recorded';
    else if (states.includes('confirmed_none')) reason = 'confirmed_none';
    else if (states.length) reason = 'no_value';
    else if (supersededDays.has(index)) reason = 'superseded';
    gaps.push({day: dayKey(index * DAY_MS), reason});
  }
  return {
    points: primary.map(toPoint),
    gaps,
    n: primary.length,
    non_comparable_groups: others.map(group => ({reason: group.reason, key: group.key, n: group.entries.length, points: group.entries.map(toPoint)})),
    primary,
    others
  };
}

export {DAY_MS, MAX_DAYS, byTimeThenId, isMeasured, list, isText, instant};
