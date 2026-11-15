// Series for records that carry only a source time (time: null). Contract 0.10.
// The source clock is a namespace, not an instant: ordering and day counting happen only inside one clock
// (scope + calendar + precision), nothing is converted to UTC, and no age is ever computed.
import {DAY_MS, MAX_DAYS, analyzeRange, byTimeThenId, fail, isMeasured, isText, list, readSubjectVariable} from './analysis.js';

/**
 * A number used ONLY to order records and count source days inside one clock. It is never returned:
 * the result carries the source's own text. (Date arithmetic is the cheapest way to count calendar days.)
 */
function ordinal(sourceTime) {
  const [date, clock = ''] = sourceTime.value.split('T');
  const [year, month, dayOfMonth] = date.split('-').map(Number);
  const [hours = 0, minutes = 0, seconds = 0] = clock.split(':').map(Number);
  const whole = Math.floor(seconds);
  const moment = new Date(0);
  moment.setUTCFullYear(year, month - 1, dayOfMonth);
  moment.setUTCHours(hours, minutes, whole, Math.round((seconds - whole) * 1000));
  return moment.getTime();
}

const clockKey = record => JSON.stringify([record.source_time.scope, record.source_time.calendar, record.source_time.precision]);
const scopeOf = entries => entries[0].record.source_time.scope;
const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
/** Counts for a clock that was not chosen. An unordered clock may hand over its records: no order is claimed. */
const describe = (entries, orderable, withRecords = false) => {
  const {scope, calendar, precision} = entries[0].record.source_time;
  const summary = {scope, calendar, precision, n: entries.length, orderable};
  if (!orderable && withRecords) summary.records = entries.map(entry => entry.record).sort(byId);
  return summary;
};

export async function seriesBySourceTime(store, query) {
  const read = readSubjectVariable(query, ['scope']); if (!read.ok) return read;
  const wanted = read.value.scope;
  if (wanted !== undefined && !isText(wanted)) return fail('invalid_query', 'scope', 'Field scope must be non-empty text when given');
  const found = await list(store, {subject: read.value.subject, variable: read.value.variable}); if (!found.ok) return found;
  const records = found.value;
  const superseded = new Set(records.filter(record => typeof record.corrects === 'string').map(record => record.corrects));
  const utcRecords = records.filter(record => record.time !== null && !superseded.has(record.id)).length;
  const sourced = records.filter(record => record.time === null);
  const entries = sourced.map(record => ({record, ms: ordinal(record.source_time)})).sort(byTimeThenId);
  const active = entries.filter(entry => !superseded.has(entry.record.id));

  const groups = new Map();
  const unordered = new Map();
  for (const entry of active) {
    const bucket = entry.record.source_time.calendar === 'unknown' ? unordered : groups;
    const key = clockKey(entry.record);
    bucket.set(key, [...(bucket.get(key) ?? []), entry]);
  }
  // Primary clock: most measured values, then most records, then the stable key. Never merged with another clock.
  const ranked = [...groups.entries()].map(([key, list]) => ({key, list, measured: list.filter(entry => isMeasured(entry.record)).length}))
    .sort((a, b) => (b.measured - a.measured) || (b.list.length - a.list.length) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  const primary = ranked.find(group => wanted === undefined || scopeOf(group.list) === wanted);
  const otherClocks = [...ranked.filter(group => group !== primary).map(group => describe(group.list, true)),
    ...[...unordered.values()].map(list => describe(list, false, wanted === undefined || scopeOf(list) === wanted))]
    .sort((a, b) => (a.scope < b.scope ? -1 : a.scope > b.scope ? 1 : 0));
  const base = {other_clocks: otherClocks, utc_records: utcRecords};
  if (!primary) return {points: [], gaps: [], n: 0, non_comparable_groups: [], clock: null, ...base};

  const inClock = entries.filter(entry => clockKey(entry.record) === primary.key);
  const firstDay = Math.floor(inClock[0].ms / DAY_MS);
  const lastDay = Math.floor(inClock[inClock.length - 1].ms / DAY_MS);
  if (lastDay - firstDay + 1 > MAX_DAYS) return fail('range_too_large', 'time', `This source clock spans ${lastDay - firstDay + 1} days; the technical bound is ${MAX_DAYS}`);
  const result = analyzeRange({all: inClock, active: primary.list, superseded}, firstDay * DAY_MS, (lastDay + 1) * DAY_MS);
  const {scope, calendar, precision} = primary.list[0].record.source_time;
  return {points: result.points, gaps: result.gaps, n: result.n, non_comparable_groups: result.non_comparable_groups, clock: {scope, calendar, precision, timezone: null}, ...base};
}
