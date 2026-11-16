// NASA cases: explore real imported records apart from the synthetic scenario. No DOM here.
// Rules: imported data lives only in a private in-memory store (R9); every card and panel names its study,
// the origin of its own records and its subject (R4); one subject is one panel, never overlaid on another;
// nothing is converted to UTC or given an age; CRF is offered with its unit and date caveats on the card; no citation is invented.
import {lineChart, originLabel, accessibleTable, stateLabel} from '../base/index.js';
import {PROFILES, UNSUPPORTED, profileById, describeSource} from './profiles.js';

const MAX_SUBJECTS = 4;   // technical bound on side-by-side panels, not a medical range
const BATCH = 256;        // records per store write
const MAX_TEXT = 512;     // bound on names and subject text
const MAX_FILES = 50;     // bound on file cards kept in one session
const MAX_FILE_CHARS = 5 * 1024 * 1024;
const NOTICE_SESSION = 'Real data from NASA bed-rest studies (ground analogs) and from terrestrial volunteers, kept apart from the synthetic demo. Nothing loaded here is saved, shared or shown in other views, and it is gone when the page closes.';
const NOTICE_KEEP = 'Real data from NASA bed-rest studies (ground analogs) and from terrestrial volunteers, kept apart from the synthetic demo. Nothing loaded here is shared or shown in other views. It is gone when the page closes unless you choose "Keep on this device" for a file: that saves its records in this browser, in a store of their own, not encrypted.';
const KEEP_BATCH = 256;       // records per write to the kept store (the store bounds the size of one batch; 1000 was refused as invalid_field in the browser run)
const fileKeyOf = record => String(record.source).split(';row=')[0]; // every record of one file shares this (it carries the file's hash)
const CARD_FIELDS = ['name', 'source_id', 'study', 'origin_text', 'subjects', 'records', 'rejected', 'skipped', 'unread_columns', 'doi', 'citation', 'license', 'caveats', 'subject_note', 'error_label', 'status', 'error_text', 'file_key'];

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
  const variable = selection.variables.get(summary.subject) ?? variables[0].variable;
  const first = records.find(record => record.subject === summary.subject && record.variable === variable);
  const source = describeSource(first ? first.source : undefined);
  const panel = {subject: summary.subject, study: [...summary.studies].join('; '), origin_text: originText(summary.origins), variable, variables,
    phases: counts(summary.phases, 'phase'), doi: source.doi, clock_text: 'no orderable source clock', chart: null, chart_error: null, unordered: [], other_clocks: [], notes: []};
  // The series depends only on the loaded records, so a selection change reuses it; loading a file clears the cache.
  const cacheKey = `${summary.subject}\u0000${variable}`;
  let series = session.cache.series.get(cacheKey);
  if (!series) {
    try { series = await readings.seriesBySourceTime(session.store, {subject: summary.subject, variable}); } catch { series = {ok: false, error: {message: 'the readings query failed'}}; }
    session.cache.series.set(cacheKey, series);
  }
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

/** Records and their per-subject summary, read from the private store once until something is loaded. */
async function loadedRecords(session) {
  if (!session.cache.records) {
    const listed = await session.store.list('records', {});
    const records = listed.ok ? listed.value : [];
    session.cache.records = {records, summaries: summarize(records)};
  }
  return session.cache.records;
}
const clearCache = session => { session.cache.records = null; session.cache.series = new Map(); };

async function buildViewModel(services, session, note) {
  await refreshKept(services, session);
  const {records, summaries} = await loadedRecords(session);
  const subjects = [...summaries.values()].map(entry => ({subject: entry.subject, origin_text: originText(entry.origins), study: [...entry.studies].join('; '),
    variables: counts(entry.variables, 'variable'), phases: counts(entry.phases, 'phase')}));
  const panels = [];
  for (const subject of session.selection.subjects) if (summaries.has(subject)) panels.push(await buildPanel(services, session, records, summaries.get(subject), session.selection));
  return {state: 'ready', title: 'NASA cases', notice: session.kept ? NOTICE_KEEP : NOTICE_SESSION, keep: {available: session.kept !== null && !session.kept.unreadable, removable: session.kept !== null, unreadable: Boolean(session.kept && session.kept.unreadable), unavailable_reason: session.kept_reason ?? null}, loader: loaderModel(), files: session.files.map(file => ({...file})), subjects,
    selection: {subjects: [...session.selection.subjects], variables: Object.fromEntries(session.selection.variables), day: session.selection.day},
    limits: {max_file_bytes: MAX_FILE_CHARS}, panels, empty_reason: panels.length ? null : (session.files.length ? 'No subject is selected. Choose one to see its series.' : 'No file loaded yet. Choose a verified source and a file below.'),
    message: note ?? null, interactions: interactions(services, session)};
}

async function loadFile(services, session, input) {
  const sourceId = own(input, 'source_id');
  const name = own(input, 'name');
  const text = own(input, 'text');
  const subject = own(input, 'subject');
  if (session.files.length >= MAX_FILES) return message('error', `At most ${MAX_FILES} file cards are kept in one session; reload the page to start again.`);
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
      doi: profile.doi, citation: [...profile.citation], license: profile.license, caveats: [...(profile.caveats ?? [])], subject_note: 'No subject was loaded.', error_label: 'Refused as a whole', status: 'refused', error_text: `${error.code}: ${error.message}`});
    return message('error', `${name} was refused as a whole and nothing was loaded: ${error.code}.`);
  }
  const {records, rejected, skipped} = result.value;
  const unread = Array.isArray(result.value.unread_columns) ? result.value.unread_columns.map(String).slice(0, 50) : [];
  const known = await session.store.list('records', {});
  const existing = new Set(known.ok ? known.value.map(record => record.id) : []);
  if (profile.needs_subject && records.length && known.ok) {
    const first = records[0];
    const fileKey = record => String(record.source).split(';row=')[0]; // every record of one file shares this
    const sameFile = known.value.find(record => fileKey(record) === fileKey(first));
    if (sameFile && sameFile.subject !== first.subject) return message('error', `Already loaded under subject ${sameFile.subject.slice(0, 60)} as ${sameFile.subject === first.subject ? 'this identifier' : 'another identifier'}; nothing was added, so one participant is not split into two subjects.`);
    const otherFile = known.value.find(record => record.subject === first.subject && fileKey(record) !== fileKey(first));
    if (otherFile) return message('error', `Subject ${first.subject.slice(0, 60)} already holds records from another file; loading this one under the same identifier would merge two participants. Use a different identifier.`);
  }
  const already = records.filter(record => existing.has(record.id)).length;
  if (records.length && already === records.length) return message('info', 'Already loaded: these records are already in this session. Nothing was added.');
  if (already) return message('error', 'Part of this file overlaps records already loaded, so nothing was added.');
  let kept = 0; let failure = null;
  for (let start = 0; start < records.length; start += BATCH) {
    const slice = records.slice(start, start + BATCH);
    const saved = await session.store.saveBatch('records', slice);
    if (!saved.ok) { failure = saved.error.code; break; }
    kept += slice.length;
  }
  clearCache(session); // records were written (fully or partly): every cached read and series is stale
  if (failure && kept === 0) return message('error', `The records could not be kept in this session (${failure}); nothing was loaded.`);
  const partial = failure !== null;
  const keptRecords = records.slice(0, kept);
  const subjects = [...new Set(keptRecords.map(record => record.subject))];
  const source = describeSource(keptRecords.length ? keptRecords[0].source : undefined);
  session.files.push({id, name, source_id: profile.id, study: profile.label, origin_text: originText(new Set(keptRecords.map(record => record.origin))), subjects, records: kept,
    rejected: rejected.map(row => ({row: row.row, code: row.code, field: row.field, text: `row ${row.row}: ${row.code} (${row.field})`})), skipped: skipped.length, unread_columns: unread, file_key: keptRecords.length ? fileKeyOf(keptRecords[0]) : null, kept: false,
    doi: source.doi ?? profile.doi, citation: [...(source.profile ? source.citation : profile.citation)], license: source.profile ? source.license : profile.license, caveats: [...(profile.caveats ?? [])],
    subject_note: profile.needs_subject ? 'The subject identifier was typed by you; the file carries none.' : 'The subject identifier comes from the file.',
    error_label: partial ? 'Only partly loaded' : null, status: partial ? 'partial' : rejected.length ? (records.length ? 'loaded_with_rejections' : 'all_rows_rejected') : 'loaded',
    error_text: partial ? `only ${kept} of ${records.length} records were kept (${failure})` : null});
  if (subjects.length) { session.selection.subjects = subjects.slice(0, MAX_SUBJECTS); session.selection.variables = new Map(); session.selection.day = null; }
  if (partial) return message('error', `Only ${kept} of ${records.length} records from ${name} could be kept (${failure}). The file is only partly loaded.`);
  return message('info', `Loaded ${records.length} records from ${name}${rejected.length ? `; ${rejected.length} rows were rejected (listed on its card)` : ''}.`);
}

/** Opens the separate kept store, when the page offers one, and puts what it holds back into this session. Failure is said, never hidden. */
async function restoreKept(services, session) {
  const door = own(services, 'keptCases');
  if (!plain(door) || typeof own(door, 'open') !== 'function') return null;
  let opened; try { opened = await door.open(); } catch { opened = null; }
  if (!opened || opened.ok !== true) { session.kept_reason = `Keeping a case on this device is not available here${opened && opened.error ? ` (${String(opened.error.message).slice(0, 120)})` : ''}.`; return null; }
  // The kept store stays reachable even when it cannot be read, so the person can still remove it (the only way out of a corrupt one).
  session.kept = {store: opened.value, unreadable: false};
  let records; let cards;
  try { records = await opened.value.list('records', {}); cards = await opened.value.list('config', {}); } catch { records = null; cards = null; }
  if (!records || !cards || !records.ok || !cards.ok) { session.kept.unreadable = true; session.kept_reason = 'The cases kept on this device could not be read, so nothing was restored. You can remove everything kept on this device below.'; return message('error', session.kept_reason); }
  let saved = 0; let skippedRecords = 0;
  for (let start = 0; start < records.value.length; start += BATCH) {
    const slice = records.value.slice(start, start + BATCH);
    const out = await session.store.saveBatch('records', slice);
    if (out.ok) saved += slice.length; else skippedRecords += slice.length;
  }
  const good = []; let bad = 0;
  for (const entry of cards.value.filter(item => plain(item) && typeof item.id === 'string' && item.id.startsWith('nasa-file:')).sort((a, b) => (a.id < b.id ? -1 : 1))) {
    const card = cleanCard(entry.card); if (card) good.push(card); else bad += 1;
  }
  // Records whose file has no card (an interrupted keep) come back with a card that says so, never as an unexplained series.
  const have = new Set(good.map(card => card.file_key)); const orphans = new Map();
  for (const record of records.value) { const key = fileKeyOf(record); if (!have.has(key)) { if (!orphans.has(key)) orphans.set(key, []); orphans.get(key).push(record); } }
  for (const [key, list] of orphans) good.push(orphanCard(key, list));
  for (const card of good) session.files.push({...card, id: `file-${session.files.length + 1}`, kept: true});
  clearCache(session);
  const subjects = [...new Set(records.value.map(record => record.subject))];
  if (subjects.length) session.selection.subjects = subjects.slice(0, MAX_SUBJECTS);
  const problems = [bad ? `${bad} kept file card(s) were unreadable and skipped` : null, orphans.size ? `${orphans.size} kept file(s) have no card (an earlier keep was interrupted) and are marked as only partly kept` : null, skippedRecords ? `${skippedRecords} kept record(s) could not be restored` : null].filter(Boolean);
  if (problems.length) return message('error', `Restored ${session.files.length} case file(s) kept on this device, but ${problems.join('; ')}.`);
  return session.files.length ? message('info', `Restored ${session.files.length} case file(s) kept on this device.`) : null;
}

const short = (value, max = MAX_TEXT) => (typeof value === 'string' && value.length > 0 ? value.slice(0, max) : null);
const list = (value, max, item) => (Array.isArray(value) ? value.slice(0, max).map(item).filter(entry => entry !== null) : []);
/** A card read back from the kept store is data from outside: only known fields, with types and bounds, or nothing. */
function cleanCard(card) {
  if (!plain(card) || !short(card.name) || !short(card.file_key) || !short(card.source_id, 40) || !Number.isInteger(card.records) || card.records < 0) return null;
  return {name: short(card.name), source_id: short(card.source_id, 40), study: short(card.study) ?? 'study not recorded', origin_text: short(card.origin_text) ?? 'origin not recorded',
    subjects: list(card.subjects, 20, value => short(value)), records: card.records, skipped: Number.isInteger(card.skipped) ? card.skipped : 0,
    unread_columns: list(card.unread_columns, 50, value => short(value, 120)), doi: short(card.doi, 200), citation: list(card.citation, 20, value => short(value, 2000)),
    license: short(card.license, 300) ?? 'licence not available', caveats: list(card.caveats, 10, value => short(value, 1000)), subject_note: short(card.subject_note) ?? '',
    rejected: list(card.rejected, 200, row => (plain(row) && Number.isInteger(row.row) && short(row.code, 60) && short(row.field, 60) ? {row: row.row, code: short(row.code, 60), field: short(row.field, 60), text: `row ${row.row}: ${short(row.code, 60)} (${short(row.field, 60)})`} : null)),
    error_label: short(card.error_label, 80), status: short(card.status, 40) ?? 'loaded', error_text: short(card.error_text, 500), file_key: short(card.file_key)};
}
function orphanCard(key, records) {
  const source = describeSource(records[0].source);
  return {name: `A kept file without its card (${key.slice(-12)})`, source_id: source.profile ? source.profile.id : 'unknown', study: source.study, origin_text: originText(new Set(records.map(record => record.origin))),
    subjects: [...new Set(records.map(record => record.subject))].slice(0, 20), records: records.length, skipped: 0, unread_columns: [], doi: source.doi, citation: [...source.citation], license: source.license,
    caveats: ['Only part of this file may have been kept: an earlier keep was interrupted before its card was saved, so the record count and the series may be incomplete. Load the file again and keep it again to complete it.', ...(source.profile && source.profile.caveats ? source.profile.caveats : [])],
    subject_note: 'The subject identifier comes from the kept records.', rejected: [], error_label: 'Only partly kept', status: 'partial', error_text: 'the card of this file was not saved', file_key: key};
}

/** Checks, once per interaction, which cards are really kept and re-opens the kept store if another tab closed it. */
async function refreshKept(services, session) {
  if (!session.kept || session.kept.unreadable) return;
  const door = own(services, 'keptCases');
  let cards; try { cards = await session.kept.store.list('config', {}); } catch { cards = null; }
  if (!cards || !cards.ok) {
    let reopened = null; try { reopened = typeof own(door, 'open') === 'function' ? await door.open() : null; } catch { reopened = null; }
    if (reopened && reopened.ok === true) { session.kept.store = reopened.value; try { cards = await reopened.value.list('config', {}); } catch { cards = null; } }
  }
  if (!cards || !cards.ok) { for (const card of session.files) card.kept = false; session.kept_reason = 'The kept store is no longer reachable from this tab (another tab may have removed it). Reload the page.'; session.kept = null; return; }
  const keys = new Set(cards.value.filter(item => plain(item) && typeof item.id === 'string').map(item => item.id));
  for (const card of session.files) if (card.file_key) card.kept = keys.has(`nasa-file:${card.file_key}`) || (card.status === 'partial' && card.kept === true);
}

async function keepFile(session, fileId) {
  if (!session.kept || session.kept.unreadable) return message('error', session.kept_reason ?? 'Keeping a case on this device is not available here.');
  const card = session.files.find(file => file.id === fileId);
  if (!card) return message('error', 'Choose one of the file cards.');
  if (!card.file_key || !card.records) return message('error', 'This file has no records to keep.');
  if (card.kept) return message('info', 'This file is already kept on this device.');
  const all = await session.store.list('records', {}); if (!all.ok) return message('error', 'The loaded records could not be read; nothing was kept.');
  const mine = all.value.filter(record => fileKeyOf(record) === card.file_key);
  const there = await session.kept.store.list('records', {}); if (!there.ok) return message('error', 'The kept store could not be read; nothing was kept.');
  const have = new Set(there.value.map(record => record.id)); const fresh = mine.filter(record => !have.has(record.id));
  let kept = 0;
  for (let start = 0; start < fresh.length; start += KEEP_BATCH) {
    const saved = await session.kept.store.saveBatch('records', fresh.slice(start, start + KEEP_BATCH));
    if (!saved.ok) return message('error', `Only ${mine.length - fresh.length + kept} of ${mine.length} records could be kept (${saved.error.code}${saved.error.field ? `: ${saved.error.field}` : ""}); the file is not marked as kept. Try again to finish it.`);
    kept += Math.min(KEEP_BATCH, fresh.length - start);
  }
  const entry = {id: `nasa-file:${card.file_key}`, schema_version: 2, card: Object.fromEntries(CARD_FIELDS.map(key => [key, card[key] ?? null]))};
  const stored = await session.kept.store.get('config', entry.id);
  if (!stored.ok) { const saved = await session.kept.store.save('config', entry); if (!saved.ok) return message('error', `The records were kept but the file card could not be (${saved.error.code}); try again.`); }
  card.kept = true;
  return message('info', `Kept ${card.name} on this device (${mine.length} records, not encrypted). It will be here when you open this page again.`);
}

async function removeKept(services, session, input) {
  if (!session.kept) return message('error', session.kept_reason ?? 'Nothing is kept on this device.');
  if (!plain(input) || own(input, 'confirmed') !== true) return message('error', 'Not removed: confirm that you want to delete every kept case from this device.');
  const door = own(services, 'keptCases');
  if (typeof own(door, 'clear') !== 'function') return message('error', 'Removing kept cases is not available here.');
  let cleared; try { cleared = await door.clear(session.kept.store); } catch { cleared = null; }
  if (!cleared || cleared.ok !== true) {
    let again = null; try { again = await door.open(); } catch { again = null; }
    if (again && again.ok === true) session.kept.store = again.value; // the old connection was closed to try the deletion: hold a live one
    return message('error', `The kept cases could not be removed${cleared && cleared.error ? ` (${String(cleared.error.message).slice(0, 120)})` : ''}. Nothing was deleted.`);
  }
  const reopened = await door.open(); session.kept = reopened && reopened.ok === true ? {store: reopened.value, unreadable: false} : null; session.kept_reason = undefined; if (!session.kept) session.kept_reason = 'Keeping a case on this device is not available after the removal; reload the page.';
  for (const card of session.files) card.kept = false;
  return message('info', 'Every kept case was deleted from this device. What is loaded now stays until you close the page.');
}

async function select(services, session, input) {
  if (!plain(input)) return message('error', 'Nothing to select.');
  const known = (await loadedRecords(session)).summaries;
  const next = {subjects: [...session.selection.subjects], variables: new Map(session.selection.variables), day: session.selection.day};
  const subjects = own(input, 'subjects');
  if (subjects !== undefined) {
    if (!Array.isArray(subjects) || subjects.some(subject => !isText(subject))) return message('error', 'Subjects must be a list of subject identifiers.');
    const unique = [...new Set(subjects)];
    const missing = unique.find(subject => !known.has(subject));
    if (missing !== undefined) return message('error', `Subject ${missing.slice(0, 60)} is not in the loaded files.`);
    if (unique.length > MAX_SUBJECTS) return message('error', `At most ${MAX_SUBJECTS} subjects can be shown at once, each in its own panel.`);
    next.subjects = unique; next.variables = new Map(); next.day = null;
  }
  const variables = own(input, 'variables');
  if (variables !== undefined) {
    if (!plain(variables)) return message('error', 'Variables must map a subject to one of its variables.');
    let descriptors;
    try { descriptors = Object.getOwnPropertyDescriptors(variables); } catch { return message('error', 'Variables could not be read.'); }
    for (const [subject, descriptor] of Object.entries(descriptors)) {
      if (!Object.hasOwn(descriptor, 'value')) return message('error', 'Variables must be plain values, not accessors.');
      const variable = descriptor.value;
      if (!known.has(subject) || !known.get(subject).variables.has(variable)) return message('error', `Subject ${subject.slice(0, 60)} has no variable ${String(variable).slice(0, 60)}.`);
      next.variables.set(subject, variable);
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
    select: input => safe(async () => buildViewModel(services, session, await select(services, session, input))),
    keep: fileId => safe(async () => buildViewModel(services, session, await keepFile(session, fileId))),
    removeKept: input => safe(async () => buildViewModel(services, session, await removeKept(services, session, input)))
  };
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  const missing = missingPart(services);
  if (missing) return errorModel(`NASA cases cannot start: ${missing}.`);
  let opened;
  try { opened = await services.openMemoryStore(); } catch { opened = null; }
  if (!opened || opened.ok !== true) return errorModel(`NASA cases cannot start: its private store did not open${opened && opened.error ? ` (${opened.error.message})` : ''}.`);
  const session = {store: opened.value, files: [], selection: {subjects: [], variables: new Map(), day: null}, cache: {records: null, series: new Map()}, kept: null};
  const restored = await restoreKept(services, session);
  return buildViewModel(services, session, restored);
}
