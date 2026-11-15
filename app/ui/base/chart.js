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
  const label = isText(ownValue(options, 'label')) ? ownValue(options, 'label') : 'Series';
  const unit = isText(ownValue(options, 'unit')) ? ownValue(options, 'unit') : '';
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
  cleanPoints.sort((a, b) => a.n - b.n);
  cleanGaps.sort((a, b) => a.n - b.n);

  // A line may only join values on neighbouring days. Distance is read from the data, not only from the gap list.
  const segments = [];
  for (const point of cleanPoints) {
    const last = segments[segments.length - 1];
    if (last && point.n - last.points[last.points.length - 1].n <= 1) last.points.push(point); else segments.push({points: [point]});
  }

  const rows = [
    ...cleanPoints.map(p => ({n: p.n, day: p.day, value: unit ? `${p.value} ${unit}` : String(p.value), note: ''})),
    ...cleanGaps.map(g => ({n: g.n, day: g.day, value: g.value, note: g.note}))
  ].sort((a, b) => a.n - b.n);
  const table = accessibleTable({caption: `${label} by day`, columns: [{key: 'day', label: 'Day'}, {key: 'value', label: unit ? `Value (${unit})` : 'Value'}, {key: 'note', label: 'Note'}], rows});

  const droppedCount = groups.reduce((sum, group) => sum + (Number.isInteger(ownValue(group, 'n')) ? ownValue(group, 'n') : 0), 0);
  const reasons = [...new Set(groups.map(group => ownValue(group, 'reason')).filter(isText))];
  const notDrawn = {n: droppedCount, groups: groups.map(group => ({reason: ownValue(group, 'reason') ?? 'not comparable', n: ownValue(group, 'n') ?? 0})),
    text: droppedCount ? `${droppedCount} ${droppedCount === 1 ? 'value' : 'values'} taken with another method or unit are not drawn (${reasons.join('; ') || 'not comparable'}).` : ''};

  const empty = cleanPoints.length === 0;
  const summary = `${label}: ${cleanPoints.length} ${cleanPoints.length === 1 ? 'value' : 'values'}, ${cleanGaps.length} ${cleanGaps.length === 1 ? 'day' : 'days'} without a value. The same information is in the table.`;
  const allDays = [...cleanPoints, ...cleanGaps].map(item => item.n);
  const minDay = Math.min(...allDays);
  const maxDay = Math.max(...allDays);
  const plotW = WIDTH - MARGIN.left - MARGIN.right;
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const xFor = n => num(MARGIN.left + (maxDay === minDay ? plotW / 2 : ((n - minDay) / (maxDay - minDay)) * plotW));
  const values = cleanPoints.map(p => p.value);
  const lo = empty ? 0 : Math.min(...values);
  const hi = empty ? 0 : Math.max(...values);
  const yFor = value => num(MARGIN.top + plotH - (hi === lo ? plotH / 2 : ((value - lo) / (hi - lo)) * plotH));

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
    kind: 'line_chart', label, unit,
    segments: segments.map(segment => ({points: segment.points.map(({day, value, id}) => ({day, value, id}))})),
    gaps: cleanGaps.map(({day, reason, value, note}) => ({day, reason, text: note ? `${value} (${note})` : value})),
    y: empty ? null : {min: lo, max: hi},
    table, not_drawn: notDrawn, empty,
    empty_text: empty ? 'No values to draw: every day in this range is without a value. The table says why.' : '',
    summary, svg
  };
}
