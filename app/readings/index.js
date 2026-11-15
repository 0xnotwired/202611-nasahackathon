// M06 readings: the queries every view uses, so the same data means the same thing everywhere.
// Success returns the plain object of CONTRACTS.md; a foreseen failure returns { ok:false, error }.
// Nothing here decides what is normal or concerning (R6); `attention` only compares with configured data.
import {DAY_MS, analyzeRange, fail, groupMeasured, isText, list, loadActive, readQuery, readRange, readSubjectVariable, readUpTo, instant} from './analysis.js';
import {attention} from './attention.js';

export {attention};

export async function series(store, query) {
  const range = readRange(query); if (!range.ok) return range;
  const loaded = await loadActive(store, range.value.subject, range.value.variable); if (!loaded.ok) return loaded;
  const {points, gaps, n, non_comparable_groups} = analyzeRange(loaded.value, range.value.fromMs, range.value.toMs);
  return {points, gaps, n, non_comparable_groups};
}

export async function latest(store, query, context) {
  const read = readSubjectVariable(query); if (!read.ok) return read;
  const clockRead = readQuery(context, ['clock']);
  if (!clockRead.ok || typeof clockRead.value.clock !== 'function') return fail('invalid_clock', 'clock', 'A context with a clock function is required');
  let now;
  try { now = instant(clockRead.value.clock(), 'clock'); } catch { return fail('invalid_clock', 'clock', 'The clock failed'); }
  if (!now.ok) return fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
  const loaded = await loadActive(store, read.value.subject, read.value.variable); if (!loaded.ok) return loaded;
  const newest = loaded.value.active[loaded.value.active.length - 1];
  if (!newest) return {record: null, age_days: null};
  if (newest.ms > now.value) return fail('record_in_future', 'time', 'The newest record is dated after the clock; no age is computed');
  return {record: newest.record, age_days: Math.floor((now.value - newest.ms) / DAY_MS)};
}

export async function baseline(store, query) {
  const read = readUpTo(query); if (!read.ok) return read;
  const loaded = await loadActive(store, read.value.subject, read.value.variable); if (!loaded.ok) return loaded;
  const measured = loaded.value.active.filter(entry => entry.ms < read.value.toMs && entry.record.state === 'recorded' && typeof entry.record.value === 'number');
  const {primary, others} = groupMeasured(measured);
  const excluded = others.reduce((sum, group) => sum + group.entries.length, 0);
  if (!primary.length) return {n: 0, from: null, to: null, excluded_non_comparable: excluded};
  return {n: primary.length, from: primary[0].record.time, to: primary[primary.length - 1].record.time, excluded_non_comparable: excluded};
}

export async function cumulative(store, query) {
  const range = readRange(query); if (!range.ok) return range;
  const loaded = await loadActive(store, range.value.subject, range.value.variable); if (!loaded.ok) return loaded;
  const result = analyzeRange(loaded.value, range.value.fromMs, range.value.toMs);
  if (result.others.length) return fail('not_comparable', 'variable', 'The records in this range are not all comparable (method, unit or unknown unit); no partial total is given');
  if (!result.primary.length) return {total: null, unit: null, n: 0, gaps: result.gaps.length};
  return {total: result.primary.reduce((sum, entry) => sum + entry.record.value, 0), unit: result.primary[0].record.unit, n: result.n, gaps: result.gaps.length};
}

export async function environment(store, query) {
  const read = readQuery(query, ['place', 'interval']);
  if (!read.ok) return read;
  if (!isText(read.value.place)) return fail('invalid_query', 'place', 'Field place must be non-empty text');
  const span = readQuery(read.value.interval, ['from', 'to']);
  if (!span.ok || Object.keys(read.value.interval).sort().join(',') !== 'from,to') return fail('invalid_query', 'interval', 'Field interval must be { from, to }');
  const from = instant(span.value.from, 'interval.from'); if (!from.ok) return from;
  const to = instant(span.value.to, 'interval.to'); if (!to.ok) return to;
  if (from.value >= to.value) return fail('invalid_query', 'interval', 'Interval end must be after its start');

  const found = await list(store, {type: 'environment', place: read.value.place}); if (!found.ok) return found;
  const superseded = new Set(found.value.filter(record => typeof record.corrects === 'string').map(record => record.corrects));
  const overlapping = [];
  for (const record of found.value) {
    if (superseded.has(record.id) || !record.interval) continue;
    const start = Date.parse(record.interval.from); const end = Date.parse(record.interval.to);
    const touches = start === end ? start >= from.value && start < to.value : start < to.value && end > from.value;
    if (touches) overlapping.push({record, start, end});
  }
  overlapping.sort((a, b) => (a.start - b.start) || (a.record.id < b.record.id ? -1 : 1));
  const measured = overlapping.filter(entry => entry.record.state === 'recorded');
  const segments = [];
  for (const entry of measured) {
    const start = Math.max(entry.start, from.value); const end = Math.min(entry.end, to.value);
    const last = segments[segments.length - 1];
    if (last && start <= last.end) last.end = Math.max(last.end, end); else segments.push({start, end});
  }
  const iso = ms => new Date(ms).toISOString();
  return {
    records: overlapping.map(entry => entry.record),
    coverage: {
      from: segments.length ? iso(segments[0].start) : null,
      to: segments.length ? iso(segments[segments.length - 1].end) : null,
      sensors: [...new Set(measured.map(entry => entry.record.sensor))].sort(),
      segments: segments.map(segment => ({from: iso(segment.start), to: iso(segment.end)}))
    }
  };
}
