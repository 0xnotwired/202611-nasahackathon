// Pure chart and table models. The drawing is a plain tree of { tag, attrs, text, children }
// that dom.js renders with textContent and setAttribute, so no record text is ever parsed as markup.
// Rule: a gap is a gap. Segments never cross a missing day (R2) and every drawn value is also in the table.
import {ownValue} from './labels.js';

const WIDTH = 640;
const HEIGHT = 240;
const MARGIN = {left: 56, right: 16, top: 16, bottom: 32};
const MAX_ROWS = 20000; // technical bound on table size
const DAY_MS = 24 * 60 * 60 * 1000;

const fail = (code, field, message) => ({ok: false, error: {code, field, message}});
const isText = value => typeof value === 'string' && value.length > 0;
const num = value => Number(value.toFixed(2));
const minOf = list => list.reduce((a, b) => (b < a ? b : a), Infinity);
const maxOf = list => list.reduce((a, b) => (b > a ? b : a), -Infinity);
// Position between lo and hi without overflowing for values near the float limits (work in halves).
const ratioOf = (value, lo, hi) => (hi === lo ? 0.5 : (value / 2 - lo / 2) / (hi / 2 - lo / 2));
const hasClockKey = input => { try { return Object.getOwnPropertyDescriptor(input, 'clock') !== undefined; } catch { return false; } };

function dayNumber(day) {
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return NaN;
  const ms = Date.parse(`${day}T00:00:00.000Z`);
  return Number.isNaN(ms) || new Date(ms).toISOString().split('T')[0] !== day ? NaN : ms / DAY_MS;
}

/** A table with a caption, named columns and text cells; an absent cell is empty text, never 0. */
export function accessibleTable(spec) {
  if (spec === null || typeof spec !== 'object' || Array.isArray(spec)) return fail('invalid_table', 'table', 'A table needs { caption, columns, rows }');
  const caption = ownValue(spec, 'caption');
  const columns = ownValue(spec, 'columns');
  const rows = ownValue(spec, 'rows');
  if (!isText(caption)) return fail('invalid_table', 'caption', 'A table needs a caption so it can be named');
  if (!Array.isArray(columns) || columns.length === 0) return fail('invalid_table', 'columns', 'A table needs at least one column');
  if (!Array.isArray(rows) || rows.length > MAX_ROWS) return fail('invalid_table', 'rows', 'Rows must be a list within the technical bound');
  const cleanColumns = [];
  for (const column of columns) {
    const key = ownValue(column, 'key');
    const label = ownValue(column, 'label');
    if (!isText(key) || !isText(label)) return fail('invalid_table', 'columns', 'Each column needs a key and a label');
    if (cleanColumns.some(existing => existing.key === key)) return fail('invalid_table', 'columns', `Column key ${key.slice(0, 40)} is used twice`);
    cleanColumns.push({key, label});
  }
  const cleanRows = [];
  for (const row of rows) {
    if (row === null || typeof row !== 'object' || Array.isArray(row)) return fail('invalid_table', 'rows', 'Each row must be an object');
    const out = {};
    for (const {key} of cleanColumns) {
      const cell = ownValue(row, key);
      if (cell === undefined || cell === null) out[key] = '';
      else if (typeof cell === 'string') out[key] = cell;
      else if (typeof cell === 'number' && Number.isFinite(cell)) out[key] = String(cell);
      else return fail('invalid_table', key, 'Cells must be text or finite numbers');
    }
    cleanRows.push(out);
  }
  return {caption, columns: cleanColumns, rows: cleanRows};
}

const GAP_TEXT = Object.freeze({
  no_record: {value: 'not recorded', note: 'no entry for this day'},
  not_recorded: {value: 'not recorded', note: ''},
  confirmed_none: {value: 'confirmed nothing new', note: ''},
  no_value: {value: 'recorded without a number', note: 'the record has no numeric value'},
  other_group: {value: 'not on this line', note: 'measured with another method or unit'},
  superseded: {value: 'corrected', note: 'replaced by a later record'}
});
const gapText = reason => (typeof reason === 'string' && Object.hasOwn(GAP_TEXT, reason)) ? GAP_TEXT[reason] : {value: 'not drawn', note: 'reason not recognised'};
const node = (tag, attrs = {}, children = [], text) => ({tag, attrs, children, ...(text === undefined ? {} : {text})});

/**
 * lineChart(seriesResult, { unit, label }) → model with segments, gaps, an equivalent table and a drawing.
 * `seriesResult` is the output of readings.series. Only its primary group is drawn; the rest is named, not hidden.
 */
export function lineChart(input, options) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return fail('invalid_chart', 'series', 'A chart needs the result of a series query');
  const points = ownValue(input, 'points');
  const gaps = ownValue(input, 'gaps');
  const groups = ownValue(input, 'non_comparable_groups') ?? [];
  if (!Array.isArray(points) || !Array.isArray(gaps) || !Array.isArray(groups)) return fail('invalid_chart', 'series', 'points, gaps and non_comparable_groups must be lists');
  if (points.length + gaps.length > MAX_ROWS) return fail('too_many_points', 'series', `A chart holds at most ${MAX_ROWS} points and gaps; this series has ${points.length + gaps.length}. Choose a shorter range.`);
  const label = isText(ownValue(options, 'label')) ? ownValue(options, 'label') : 'Series';
  const unit = isText(ownValue(options, 'unit')) ? ownValue(options, 'unit') : '';
  const resolution = ownValue(options, 'resolution') ?? 'day';
  if (resolution !== 'day' && resolution !== 'time') return fail('invalid_chart', 'resolution', 'resolution must be "day" or "time"');
  const chosenDay = ownValue(options, 'day');
  if (resolution === 'time' && Number.isNaN(dayNumber(chosenDay))) return fail('invalid_chart', 'day', 'A time-of-day chart needs the day to draw, as YYYY-MM-DD');
  const sampling = ownValue(options, 'sampling');
  if (sampling !== undefined) {
    const interval = ownValue(sampling, 'interval_s');
    if (typeof interval !== 'number' || !Number.isFinite(interval) || interval <= 0 || !isText(ownValue(sampling, 'source')))
      return fail('invalid_chart', 'sampling', 'sampling must be { interval_s: a positive number of seconds, source: where that interval is stated }');
  }
  const cleanPoints = [];
  for (const point of points) {
    const day = ownValue(point, 'day');
    const value = ownValue(point, 'value');
    if (Number.isNaN(dayNumber(day))) return fail('invalid_chart', 'points', 'Every point needs a valid UTC day');
    if (typeof value !== 'number' || !Number.isFinite(value)) return fail('invalid_chart', 'points', 'Every point needs a finite numeric value');
    cleanPoints.push({day, value, id: ownValue(point, 'id'), n: dayNumber(day)});
  }
  const cleanGaps = [];
  for (const gap of gaps) {
    const day = ownValue(gap, 'day');
    if (Number.isNaN(dayNumber(day))) return fail('invalid_chart', 'gaps', 'Every gap needs a valid UTC day');
    const reason = ownValue(gap, 'reason');
    cleanGaps.push({day, reason, n: dayNumber(day), ...gapText(reason)});
  }
  // Values the query set aside (another method, an unknown unit) are never drawn, but each one stays readable in the table.
  const undrawn = [];
  for (const group of groups) {
    const groupPoints = ownValue(group, 'points') ?? [];
    if (!Array.isArray(groupPoints)) return fail('invalid_chart', 'non_comparable_groups', 'Group points must be a list');
    const reason = isText(ownValue(group, 'reason')) ? ownValue(group, 'reason') : 'not comparable';
    const unitUnknown = ownValue(ownValue(group, 'key'), 'unit_status') === 'unknown';
    for (const point of groupPoints) {
      const day = ownValue(point, 'day');
      const value = ownValue(point, 'value');
      if (Number.isNaN(dayNumber(day))) return fail('invalid_chart', 'non_comparable_groups', 'Every undrawn point needs a valid day');
      if (typeof value !== 'number' || !Number.isFinite(value)) return fail('invalid_chart', 'non_comparable_groups', 'Every undrawn point needs a finite numeric value');
      const pointUnit = ownValue(point, 'unit');
      undrawn.push({n: dayNumber(day), day, value: isText(pointUnit) && !unitUnknown ? `${value} ${pointUnit}` : `${value} (unit unknown)`, note: `not drawn: not comparable (${reason})`});
    }
  }
  cleanPoints.sort((a, b) => a.n - b.n);
  cleanGaps.sort((a, b) => a.n - b.n);
  if (resolution === 'time') {
    const clockInfo = ownValue(input, 'clock');
    const basis = hasClockKey(input) ? 'source' : 'utc';
    return timeOfDayChart(points, groups, {label, unit, day: chosenDay, sampling: sampling === undefined ? null : {interval_s: ownValue(sampling, 'interval_s'), source: ownValue(sampling, 'source')}, basis});
  }

  // A line may only join values on neighbouring days. Distance is read from the data, not only from the gap list.
  const segments = [];
  for (const point of cleanPoints) {
    const last = segments[segments.length - 1];
    if (last && point.n - last.points[last.points.length - 1].n <= 1) last.points.push(point); else segments.push({points: [point]});
  }

  const clock = ownValue(input, 'clock');
  const timeBasis = hasClockKey(input) ? 'source' : 'utc';
  const rows = [
    ...cleanPoints.map(p => ({n: p.n, day: p.day, value: unit ? `${p.value} ${unit}` : String(p.value), note: ''})),
    ...cleanGaps.map(g => ({n: g.n, day: g.day, value: g.value, note: g.note})),
    ...undrawn
  ].sort((a, b) => a.n - b.n);
  const table = accessibleTable({caption: `${label} by day`, columns: [{key: 'day', label: timeBasis === 'source' ? 'Source day (time zone not established)' : 'Day'}, {key: 'value', label: unit ? `Value (${unit})` : 'Value'}, {key: 'note', label: 'Note'}], rows});
  if (table.ok === false) return table;

  const droppedCount = groups.reduce((sum, group) => sum + (Number.isInteger(ownValue(group, 'n')) ? ownValue(group, 'n') : 0), 0);
  const reasons = [...new Set(groups.map(group => ownValue(group, 'reason')).filter(isText))];
  const notDrawn = {n: droppedCount, groups: groups.map(group => ({reason: ownValue(group, 'reason') ?? 'not comparable', n: ownValue(group, 'n') ?? 0})),
    text: droppedCount ? `${droppedCount} ${droppedCount === 1 ? 'value' : 'values'} taken with another method or unit are not drawn (${reasons.join('; ') || 'not comparable'}).` : ''};

  const empty = cleanPoints.length === 0;
  const summary = `${label}${timeBasis === 'source' ? ' (source dates, time zone not established)' : ''}: ${cleanPoints.length} ${cleanPoints.length === 1 ? 'value' : 'values'}, ${cleanGaps.length} ${cleanGaps.length === 1 ? 'day' : 'days'} without a value. The same information is in the table.`;
  const allDays = [...cleanPoints, ...cleanGaps].map(item => item.n);
  const minDay = minOf(allDays);
  const maxDay = maxOf(allDays);
  const plotW = WIDTH - MARGIN.left - MARGIN.right;
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const xFor = n => num(MARGIN.left + (maxDay === minDay ? plotW / 2 : ((n - minDay) / (maxDay - minDay)) * plotW));
  const values = cleanPoints.map(p => p.value);
  const lo = empty ? 0 : minOf(values);
  const hi = empty ? 0 : maxOf(values);
  const yFor = value => num(MARGIN.top + plotH - ratioOf(value, lo, hi) * plotH);

  const children = [node('title', {}, [], label), node('desc', {}, [], summary)];
  children.push(node('line', {class: 'axis', x1: MARGIN.left, y1: HEIGHT - MARGIN.bottom, x2: WIDTH - MARGIN.right, y2: HEIGHT - MARGIN.bottom}));
  children.push(node('line', {class: 'axis', x1: MARGIN.left, y1: MARGIN.top, x2: MARGIN.left, y2: HEIGHT - MARGIN.bottom}));
  if (allDays.length) {
    children.push(node('text', {class: 'tick', x: MARGIN.left, y: HEIGHT - 8, 'text-anchor': 'start'}, [], (cleanPoints.concat(cleanGaps).sort((a, b) => a.n - b.n))[0].day));
    children.push(node('text', {class: 'tick', x: WIDTH - MARGIN.right, y: HEIGHT - 8, 'text-anchor': 'end'}, [], (cleanPoints.concat(cleanGaps).sort((a, b) => a.n - b.n)).slice(-1)[0].day));
  }
  if (!empty) {
    children.push(node('text', {class: 'tick', x: MARGIN.left - 6, y: MARGIN.top + 4, 'text-anchor': 'end'}, [], `${hi}`));
    children.push(node('text', {class: 'tick', x: MARGIN.left - 6, y: HEIGHT - MARGIN.bottom, 'text-anchor': 'end'}, [], `${lo}`));
  }
  for (const gap of cleanGaps) {
    children.push(node('line', {class: 'gap', x1: xFor(gap.n), y1: MARGIN.top, x2: xFor(gap.n), y2: HEIGHT - MARGIN.bottom, 'stroke-dasharray': '4 4'},
      [node('title', {}, [], `${gap.day}: ${gap.value}${gap.note ? ` (${gap.note})` : ''}`)]));
  }
  for (const segment of segments) {
    if (segment.points.length > 1) children.push(node('path', {class: 'line', fill: 'none', d: segment.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.n)} ${yFor(p.value)}`).join(' ')}));
  }
  for (const point of cleanPoints) {
    children.push(node('circle', {class: 'point', cx: xFor(point.n), cy: yFor(point.value), r: 3.5}, [node('title', {}, [], `${point.day}: ${point.value}${unit ? ` ${unit}` : ''}`)]));
  }
  const svg = node('svg', {viewBox: `0 0 ${WIDTH} ${HEIGHT}`, role: 'img', 'aria-label': summary, class: 'chart'}, children);

  return {
    kind: 'line_chart', label, unit, time_basis: timeBasis,
    segments: segments.map(segment => ({points: segment.points.map(({day, value, id}) => ({day, value, id}))})),
    gaps: cleanGaps.map(({day, reason, value, note}) => ({day, reason, text: note ? `${value} (${note})` : value})),
    y: empty ? null : {min: lo, max: hi},
    table, not_drawn: notDrawn, empty,
    empty_text: empty ? 'No values to draw: every day in this range is without a value. The table says why.' : '',
    summary, svg
  };
}

const DAY_SECONDS = 24 * 60 * 60;
const JOIN_FACTOR = 1.5; // D-M07-6: midpoint between the next reading (1 interval) and one missed reading (2 intervals)
const pad = value => String(value).padStart(2, '0');
const clockText = seconds => `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
function duration(seconds) {
  const hours = Math.floor(seconds / 3600); const minutes = Math.floor((seconds % 3600) / 60); const rest = seconds % 60;
  return [hours ? `${hours} h` : '', minutes ? `${minutes} min` : '', rest ? `${rest} s` : ''].filter(Boolean).join(' ') || '0 s';
}

/** Date and second of the day as written by the source (source_time) or by UTC (time). Never invented. */
function placeOf(point) {
  const sourceTime = ownValue(point, 'source_time');
  const utc = ownValue(point, 'time');
  const text = typeof sourceTime === 'string' ? sourceTime : typeof utc === 'string' ? utc : null;
  if (text === null) return {date: ownValue(point, 'day'), seconds: null};
  const [date, clock] = text.split('T');
  if (!clock) return {date, seconds: null};
  const [hours, minutes, secs = '0'] = clock.replace(/Z$/, '').split(':');
  const seconds = Number(hours) * 3600 + Number(minutes) * 60 + Math.floor(Number(secs));
  return {date, seconds: Number.isFinite(seconds) && seconds >= 0 && seconds < DAY_SECONDS ? seconds : null};
}

function timeOfDayChart(points, groups, {label, unit, day, sampling, basis}) {
  const valueText = (value, pointUnit) => isText(pointUnit) ? `${value} ${pointUnit}` : unit ? `${value} ${unit}` : String(value);
  const placed = points.map(point => ({point, ...placeOf(point), value: ownValue(point, 'value')}));
  const days = [...new Set([...placed.map(p => p.date), ...groups.flatMap(group => (ownValue(group, 'points') ?? []).map(point => placeOf(point).date))])].filter(isText).sort();
  const onDay = placed.filter(p => p.date === day);
  const timed = onDay.filter(p => p.seconds !== null).sort((a, b) => a.seconds - b.seconds);
  const dateOnly = onDay.filter(p => p.seconds === null);

  const segments = []; const breaks = [];
  for (const reading of timed) {
    const last = segments[segments.length - 1];
    const previous = last ? last[last.length - 1] : null;
    const gap = previous ? reading.seconds - previous.seconds : 0;
    if (previous && sampling && gap <= JOIN_FACTOR * sampling.interval_s) last.push(reading);
    else {
      if (previous && sampling) breaks.push({from: clockText(previous.seconds), to: clockText(reading.seconds), text: `no reading for ${duration(gap)}`, mid: (previous.seconds + reading.seconds) / 2});
      segments.push([reading]);
    }
  }

  const rows = [
    ...timed.map(p => ({k: p.seconds, time: clockText(p.seconds), value: valueText(p.value, ownValue(p.point, 'unit')), note: ''})),
    ...breaks.map(b => ({k: b.mid, time: `${b.from}–${b.to}`, value: 'no reading', note: b.text})),
    ...dateOnly.map(p => ({k: -1, time: '', value: valueText(p.value, ownValue(p.point, 'unit')), note: 'no time of day in the source; not drawn'}))
  ];
  for (const group of groups) {
    const reason = isText(ownValue(group, 'reason')) ? ownValue(group, 'reason') : 'not comparable';
    const unknownUnit = ownValue(ownValue(group, 'key'), 'unit_status') === 'unknown';
    for (const point of ownValue(group, 'points') ?? []) {
      const where = placeOf(point);
      if (where.date !== day) continue;
      rows.push({k: where.seconds ?? -1, time: where.seconds === null ? '' : clockText(where.seconds),
        value: unknownUnit ? `${ownValue(point, 'value')} (unit unknown)` : valueText(ownValue(point, 'value'), ownValue(point, 'unit')), note: `not drawn: not comparable (${reason})`});
    }
  }
  rows.sort((a, b) => a.k - b.k);
  const timeLabel = basis === 'source' ? 'Source time of day (time zone not established)' : 'Time of day (UTC)';
  const table = accessibleTable({caption: `${label} on ${day}`, columns: [{key: 'time', label: timeLabel}, {key: 'value', label: unit ? `Value (${unit})` : 'Value'}, {key: 'note', label: 'Note'}],
    rows: rows.map(({time, value, note}) => ({time, value, note}))});
  if (table.ok === false) return table;

  const basisText = basis === 'source' ? ' (source clock, time zone not established)' : ' (UTC)';
  const joining = sampling
    ? `${breaks.length} ${breaks.length === 1 ? 'break' : 'breaks'} longer than one and a half sampling intervals (interval ${sampling.interval_s} s, stated by ${sampling.source})`
    : 'points are not joined because no sampling interval was given';
  const summary = `${label} on ${day}${basisText}: ${timed.length} ${timed.length === 1 ? 'reading' : 'readings'}; ${joining}. The same information is in the table.`;
  const plotW = WIDTH - MARGIN.left - MARGIN.right; const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const values = timed.map(p => p.value);
  const lo = values.length ? minOf(values) : 0; const hi = values.length ? maxOf(values) : 0;
  const xFor = seconds => num(MARGIN.left + (seconds / DAY_SECONDS) * plotW);
  const yFor = value => num(MARGIN.top + plotH - ratioOf(value, lo, hi) * plotH);
  const children = [node('title', {}, [], label), node('desc', {}, [], summary),
    node('line', {class: 'axis', x1: MARGIN.left, y1: HEIGHT - MARGIN.bottom, x2: WIDTH - MARGIN.right, y2: HEIGHT - MARGIN.bottom}),
    node('line', {class: 'axis', x1: MARGIN.left, y1: MARGIN.top, x2: MARGIN.left, y2: HEIGHT - MARGIN.bottom})];
  for (const hour of [0, 6, 12, 18, 24]) children.push(node('text', {class: 'tick', x: xFor(hour * 3600), y: HEIGHT - 8, 'text-anchor': hour === 0 ? 'start' : hour === 24 ? 'end' : 'middle'}, [], `${pad(hour)}:00`));
  if (values.length) {
    children.push(node('text', {class: 'tick', x: MARGIN.left - 6, y: MARGIN.top + 4, 'text-anchor': 'end'}, [], `${hi}`));
    children.push(node('text', {class: 'tick', x: MARGIN.left - 6, y: HEIGHT - MARGIN.bottom, 'text-anchor': 'end'}, [], `${lo}`));
  }
  for (const b of breaks) children.push(node('line', {class: 'gap', x1: xFor(b.mid), y1: MARGIN.top, x2: xFor(b.mid), y2: HEIGHT - MARGIN.bottom, 'stroke-dasharray': '4 4'}, [node('title', {}, [], `${b.from}–${b.to}: ${b.text}`)]));
  for (const segment of segments) if (segment.length > 1) children.push(node('path', {class: 'line', fill: 'none', d: segment.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.seconds)} ${yFor(p.value)}`).join(' ')}));
  for (const p of timed) children.push(node('circle', {class: 'point', cx: xFor(p.seconds), cy: yFor(p.value), r: 2.5}, [node('title', {}, [], `${clockText(p.seconds)}: ${valueText(p.value, ownValue(p.point, 'unit'))}`)]));
  const droppedCount = groups.reduce((sum, group) => sum + (Number.isInteger(ownValue(group, 'n')) ? ownValue(group, 'n') : 0), 0);
  return {
    kind: 'line_chart', resolution: 'time', label, unit, time_basis: basis, day, days, sampling,
    breaks: breaks.map(({from, to, text}) => ({from, to, text})),
    segments: segments.map(segment => ({points: segment.map(p => ({time: clockText(p.seconds), value: p.value, id: ownValue(p.point, 'id')}))})),
    gaps: breaks.map(b => ({day, reason: 'no_reading', text: `${b.from}–${b.to}: ${b.text}`})),
    y: values.length ? {min: lo, max: hi} : null, table,
    not_drawn: {n: droppedCount, groups: [], text: droppedCount ? `${droppedCount} ${droppedCount === 1 ? 'value' : 'values'} taken with another method or unit are not drawn.` : ''},
    empty: timed.length === 0, empty_text: timed.length === 0 ? 'No values with a time of day on this day. The table says why.' : '',
    summary, svg: node('svg', {viewBox: `0 0 ${WIDTH} ${HEIGHT}`, role: 'img', 'aria-label': summary, class: 'chart'}, children)
  };
}
