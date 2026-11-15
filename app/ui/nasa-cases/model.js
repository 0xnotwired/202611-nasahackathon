// NASA cases: explore real imported records apart from the synthetic scenario. No DOM here.
// Rules: imported data lives only in a private in-memory store (R9); every card and panel names its study,
// the origin of its own records and its subject (R4); one subject is one panel, never overlaid on another;
// nothing is converted to UTC or given an age; CRF is not offered; no citation is invented.
import {lineChart, originLabel, accessibleTable, stateLabel} from '../base/index.js';
import {PROFILES, UNSUPPORTED, profileById, describeSource} from './profiles.js';

const MAX_SUBJECTS = 4;   // technical bound on side-by-side panels, not a medical range
const BATCH = 256;        // records per store write
const MAX_TEXT = 512;     // bound on names and subject text
const MAX_FILE_CHARS = 5 * 1024 * 1024;
const NOTICE = 'Real data from NASA bed-rest studies (ground analogs) and from terrestrial volunteers, kept apart from the synthetic demo. Nothing loaded here is saved, shared or shown in other views, and it is gone when the page closes.';

const isText = value => typeof value === 'string' && value.length > 0 && value.length <= MAX_TEXT;
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function own(object, key) {
  if (!plain(object)) return undefined;
  try {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    return descriptor && Object.hasOwn(descriptor, 'value') ? descriptor.value : undefined;
  } catch { return undefined; }
}
const message = (kind, text) => ({kind, text});
const errorModel = text => ({state: 'error', title: 'NASA cases', message: text});

function missingPart(services) {
  if (!plain(services)) return 'services were not provided';
  const importers = own(services, 'importers');
  if (!plain(importers) || typeof own(importers, 'importGlucose') !== 'function' || typeof own(importers, 'importAdaptation') !== 'function') return 'services.importers is missing';
  const readings = own(services, 'readings');
  if (!plain(readings) || typeof own(readings, 'seriesBySourceTime') !== 'function') return 'services.readings is missing';
  if (typeof own(services, 'openMemoryStore') !== 'function') return 'services.openMemoryStore is missing';
  return null;
}

const originText = origins => [...origins].map(originLabel).join('; ') || 'no records loaded';

function loaderModel() {
  return {
    sources: [...PROFILES.map(p => ({id: p.id, label: p.label, supported: true, needs_subject: p.needs_subject, accepts: p.accepts})),
      ...UNSUPPORTED.map(u => ({id: u.id, label: u.label, supported: false, needs_subject: false, reason: u.reason}))]
  };
}

function summarize(records) {
  const subjects = new Map();
  for (const record of records) {
    if (!subjects.has(record.subject)) subjects.set(record.subject, {subject: record.subject, origins: new Set(), studies: new Set(), variables: new Map(), phases: new Map()});
    const entry = subjects.get(record.subject);
    entry.origins.add(record.origin);
    entry.studies.add(describeSource(record.source).study);
    entry.variables.set(record.variable, (entry.variables.get(record.variable) ?? 0) + 1);
    entry.phases.set(record.mission_phase, (entry.phases.get(record.mission_phase) ?? 0) + 1);
  }
  return subjects;
}
const counts = (map, key) => [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([name, n]) => ({[key]: name, n}));

function valueText(record) {
  if (record.state !== 'recorded') return stateLabel(record);
  if (typeof record.value !== 'number') return 'recorded (no numeric value)';
  if (record.unit_status === 'unknown') return `${record.value} (unit unknown)`;
  return `${record.value} ${record.unit}`;
}

async function buildPanel(services, session, records, summary, selection) {
  const readings = own(services, 'readings');
  const variables = counts(summary.variables, 'variable');
  const variable = selection.variables[summary.subject] ?? variables[0].variable;
  const first = records.find(record => record.subject === summary.subject && record.variable === variable);
  const source = describeSource(first ? first.source : undefined);
  const panel = {subject: summary.subject, study: [...summary.studies].join('; '), origin_text: originText(summary.origins), variable, variables,
    phases: counts(summary.phases, 'phase'), doi: source.doi, clock_text: 'no orderable source clock', chart: null, chart_error: null, unordered: [], other_clocks: [], notes: []};
  let series;
  try { series = await readings.seriesBySourceTime(session.store, {subject: summary.subject, variable}); } catch { series = {ok: false, error: {message: 'the readings query failed'}}; }
  if (series.ok === false) { panel.chart_error = `This series could not be built: ${series.error.message}`; return panel; }
  if (series.clock) panel.clock_text = `source clock ${series.clock.scope}: ${series.clock.calendar} calendar, ${series.clock.precision} precision, time zone not established`;
  panel.other_clocks = series.other_clocks.filter(clock => clock.orderable).map(({scope, n}) => ({scope, n}));
  if (panel.other_clocks.length) panel.notes.push(`${panel.other_clocks.reduce((sum, c) => sum + c.n, 0)} records belong to other source clocks and are not drawn.`);
  if (series.utc_records > 0) panel.notes.push(`${series.utc_records} records with a UTC time are not part of this source-clock series.`);
  for (const clock of series.other_clocks.filter(entry => !entry.orderable && Array.isArray(entry.records))) {
    const table = accessibleTable({caption: `${variable}: ${clock.n} records of clock ${clock.scope}, listed by id; no time order is claimed`,
      columns: [{key: 'raw', label: 'Date as written in the source'}, {key: 'value', label: 'Value'}, {key: 'method', label: 'Method'}],
      rows: clock.records.map(record => ({raw: record.source_time.raw, value: valueText(record), method: record.method}))});
    panel.unordered.push({scope: clock.scope, calendar: clock.calendar, precision: clock.precision, n: clock.n, orderable: false,
      order_note: `order not established (calendar ${clock.calendar})`, table});
  }
  if (!series.clock) return panel;
  const unit = series.points.length ? series.points[0].unit ?? '' : '';
  const label = `${variable}, subject ${summary.subject}`;
  const timed = series.clock.precision === 'second' || series.clock.precision === 'minute';
  const days = [...new Set(series.points.map(point => point.day))];
  let chart;
  if (timed && days.length) {
    const day = days.includes(selection.day) ? selection.day : days[0];
    chart = lineChart(series, {unit, label, resolution: 'time', day, ...(source.profile && source.profile.sampling ? {sampling: source.profile.sampling} : {})});
    if (chart.ok !== false) { chart.available_days = days; panel.day_missing = selection.day !== null && !days.includes(selection.day); }
  } else chart = lineChart(series, {unit, label});
  if (chart.ok === false) panel.chart_error = `The chart could not be drawn: ${chart.error.message}`; else panel.chart = chart;
  return panel;
}

async function buildViewModel(services, session, note) {
  const listed = await session.store.list('records', {});
  const records = listed.ok ? listed.value : [];
  const summaries = summarize(records);
  const subjects = [...summaries.values()].map(entry => ({subject: entry.subject, origin_text: originText(entry.origins), study: [...entry.studies].join('; '),
    variables: counts(entry.variables, 'variable'), phases: counts(entry.phases, 'phase')}));
  const panels = [];
  for (const subject of session.selection.subjects) if (summaries.has(subject)) panels.push(await buildPanel(services, session, records, summaries.get(subject), session.selection));
  return {state: 'ready', title: 'NASA cases', notice: NOTICE, loader: loaderModel(), files: session.files.map(file => ({...file})), subjects,
    selection: {subjects: [...session.selection.subjects], variables: {...session.selection.variables}, day: session.selection.day},
    panels, empty_reason: panels.length ? null : (session.files.length ? 'No subject is selected. Choose one to see its series.' : 'No file loaded yet. Choose a verified source and a file below.'),
    message: note ?? null, interactions: interactions(services, session)};
}

async function loadFile(services, session, input) {
  const sourceId = own(input, 'source_id');
  const name = own(input, 'name');
  const text = own(input, 'text');
  const subject = own(input, 'subject');
  const unsupported = UNSUPPORTED.find(entry => entry.id === sourceId);
  if (unsupported) return message('error', `${unsupported.label} cannot be loaded. ${unsupported.reason}`);
  const profile = typeof sourceId === 'string' ? profileById(sourceId) : null;
  if (!profile) return message('error', 'Choose one of the listed sources before loading a file.');
  if (!isText(name)) return message('error', 'The file needs a name of at most 512 characters.');
  if (typeof text !== 'string' || text.length === 0 || text.length > MAX_FILE_CHARS) return message('error', 'The file must be non-empty text of at most 5 MiB.');
  if (profile.needs_subject && !isText(subject)) return message('error', `${profile.label} needs a subject identifier for this file (the source file does not carry one).`);
  let result;
  try {
    const importers = own(services, 'importers');
    result = profile.needs_subject ? importers[profile.importer](text, {subject}) : importers[profile.importer](text, {...profile.options});
  } catch { result = {ok: false, error: {code: 'import_failed', message: 'the importer failed on this file'}}; }
  const id = `file-${session.files.length + 1}`;
  if (!result || result.ok !== true) {
    const error = result && result.error ? result.error : {code: 'import_failed', message: 'the importer refused this file'};
    session.files.push({id, name, source_id: profile.id, study: profile.label, origin_text: 'no records were loaded', subjects: [], records: 0, rejected: [], skipped: 0,
      doi: profile.doi, citation: [...profile.citation], license: profile.license, status: 'refused', error_text: `${error.code}: ${error.message}`});
    return message('error', `${name} was refused as a whole and nothing was loaded: ${error.code}.`);
  }
  const {records, rejected, skipped} = result.value;
  const known = await session.store.list('records', {});
  const existing = new Set(known.ok ? known.value.map(record => record.id) : []);
  const already = records.filter(record => existing.has(record.id)).length;
  if (records.length && already === records.length) return message('info', 'Already loaded: these records are already in this session. Nothing was added.');
  if (already) return message('error', 'Part of this file overlaps records already loaded, so nothing was added.');
  for (let start = 0; start < records.length; start += BATCH) {
    const saved = await session.store.saveBatch('records', records.slice(start, start + BATCH));
    if (!saved.ok) return message('error', `The records could not be kept in this session (${saved.error.code}).`);
  }
  const subjects = [...new Set(records.map(record => record.subject))];
  const source = describeSource(records.length ? records[0].source : undefined);
  session.files.push({id, name, source_id: profile.id, study: profile.label, origin_text: originText(new Set(records.map(record => record.origin))), subjects, records: records.length,
    rejected: rejected.map(row => ({row: row.row, code: row.code, field: row.field, text: `row ${row.row}: ${row.code} (${row.field})`})), skipped: skipped.length,
    doi: source.doi ?? profile.doi, citation: [...(source.profile ? source.citation : profile.citation)], license: source.profile ? source.license : profile.license,
    status: rejected.length ? (records.length ? 'loaded_with_rejections' : 'all_rows_rejected') : 'loaded', error_text: null});
  if (subjects.length) { session.selection.subjects = subjects.slice(0, MAX_SUBJECTS); session.selection.variables = {}; session.selection.day = null; }
  return message('info', `Loaded ${records.length} records from ${name}${rejected.length ? `; ${rejected.length} rows were rejected (listed on its card)` : ''}.`);
}

async function select(services, session, input) {
  if (!plain(input)) return message('error', 'Nothing to select.');
  const known = summarize((await session.store.list('records', {})).value ?? []);
  const next = {subjects: [...session.selection.subjects], variables: {...session.selection.variables}, day: session.selection.day};
  const subjects = own(input, 'subjects');
  if (subjects !== undefined) {
    if (!Array.isArray(subjects) || subjects.some(subject => !isText(subject))) return message('error', 'Subjects must be a list of subject identifiers.');
    const unique = [...new Set(subjects)];
    const missing = unique.find(subject => !known.has(subject));
    if (missing !== undefined) return message('error', `Subject ${missing.slice(0, 60)} is not in the loaded files.`);
    if (unique.length > MAX_SUBJECTS) return message('error', `At most ${MAX_SUBJECTS} subjects can be shown at once, each in its own panel.`);
    next.subjects = unique; next.variables = {}; next.day = null;
  }
  const variables = own(input, 'variables');
  if (variables !== undefined) {
    if (!plain(variables)) return message('error', 'Variables must map a subject to one of its variables.');
    for (const [subject, variable] of Object.entries(variables)) {
      if (!known.has(subject) || !known.get(subject).variables.has(variable)) return message('error', `Subject ${subject.slice(0, 60)} has no variable ${String(variable).slice(0, 60)}.`);
      next.variables[subject] = variable;
    }
  }
  const day = own(input, 'day');
  if (day !== undefined) {
    if (!isText(day)) return message('error', 'The day must be text such as 2100-01-01.');
    next.day = day;
  }
  const before = session.selection;
  session.selection = next;
  const probe = await buildViewModel(services, session, null);
  if (next.day !== null && next.day !== before.day && probe.panels.some(panel => panel.day_missing)) {
    session.selection = {...next, day: before.day};
    return message('error', `No reading exists on ${next.day} in the selected series; the first available day is shown.`);
  }
  return null;
}

function interactions(services, session) {
  const safe = async work => {
    try { return await work(); } catch { return message('error', 'Something went wrong; nothing was changed.'); }
  };
  return {
    loadFile: input => safe(async () => buildViewModel(services, session, await loadFile(services, session, input))),
    select: input => safe(async () => buildViewModel(services, session, await select(services, session, input)))
  };
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  const missing = missingPart(services);
  if (missing) return errorModel(`NASA cases cannot start: ${missing}.`);
  let opened;
  try { opened = await services.openMemoryStore(); } catch { opened = null; }
  if (!opened || opened.ok !== true) return errorModel(`NASA cases cannot start: its private store did not open${opened && opened.error ? ` (${opened.error.message})` : ''}.`);
  const session = {store: opened.value, files: [], selection: {subjects: [], variables: {}, day: null}};
  return buildViewModel(services, session, null);
}
