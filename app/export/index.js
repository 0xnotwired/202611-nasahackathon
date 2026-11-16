// M25 export: records to CSV with their provenance. Pure: no DOM, no clock, no network, no store. The caller decides which records and what to do with the text.
// A value is written as the number it is; an absent state carries no value and no unit (it is not 0); the origin, the source clock and the unit status travel
// with every row, so a CSV opened elsewhere still says what each cell is. Text cells that a spreadsheet could read as a formula are neutralised.
export const COLUMNS = Object.freeze(['id', 'subject', 'type', 'state', 'variable', 'value', 'unit', 'unit_status', 'method', 'time_utc', 'source_time_raw', 'source_time_calendar',
  'source_time_scope', 'source_time_precision', 'origin', 'source', 'mission_phase', 'place', 'sensor', 'corrects', 'note']);

const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const FORMULA = /^[\s=+\-@\uFF1D\uFF0B\uFF0D\uFF20]/; // also a leading space or line break and the fullwidth look-alikes: some tools strip them before reading a formula

/** csvCell(value, { numeric }) → text for one cell. Numbers are written as they are; any other text that starts like a formula gets a leading apostrophe. */
export function csvCell(value, {numeric = false} = {}) {
  if (value === null || value === undefined) return '';
  let text = typeof value === 'number' ? (Number.isFinite(value) ? String(value) : '') : String(value);
  if (!(numeric && typeof value === 'number') && FORMULA.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function rowOf(record) {
  const clock = plain(record.source_time) ? record.source_time : {};
  const state = record.state;
  return [record.id, record.subject, record.type, state, record.variable, state === 'recorded' && typeof record.value === 'number' ? record.value : null,
    state === 'recorded' ? record.unit : null, record.unit_status ?? (state === 'recorded' && typeof record.unit === 'string' && record.unit ? 'known' : null), record.method, record.time, clock.raw, clock.calendar, clock.scope, clock.precision,
    record.origin, record.source, record.mission_phase, record.place, record.sensor, record.corrects, record.note];
}

/**
 * recordsToCsv(records) → { ok, value: text } | { ok: false, error }. Text starts with a byte-order mark (spreadsheets read UTF-8 with it) and uses CRLF line ends.
 * The list is not reordered and nothing is dropped, filtered or rounded: what the caller passes is what is written.
 */
export function recordsToCsv(records) {
  if (!Array.isArray(records) || records.length > 100000) return {ok: false, error: {code: 'invalid_records', message: 'records must be a list of at most 100000'}};
  const lines = [COLUMNS.join(',')];
  for (const record of records) {
    if (!plain(record) || typeof record.id !== 'string') return {ok: false, error: {code: 'invalid_record', message: 'every record needs an id'}};
    lines.push(rowOf(record).map((cell, index) => csvCell(cell, {numeric: index === 5})).join(','));
  }
  return {ok: true, value: `\uFEFF${lines.join('\r\n')}\r\n`};
}

/** safeFileName(parts) → a file name made of letters, digits, dashes and one ".csv"; nothing from a person's text can change the folder or the extension. */
export function safeFileName(...parts) {
  const base = parts.filter(part => typeof part === 'string').join('-').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  return `${base || 'orbita'}.csv`;
}
