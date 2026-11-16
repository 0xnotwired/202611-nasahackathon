// Adaptation: strength, aerobic capacity and bone history with the recorded exercise.
// No DOM. An exam is always a "last known assessment" with its date, method and age, never a current state; results of
// different methods are never on one line (R3); performed exercise and test results are separate; a repeat is offered only
// when the exam's equipment is in the mission configuration, and as text, because procedures arrive in a later level.
import {viewKit, lineChart} from '../base/index.js';

const {contextOf, bannerSection, variablesOfType, recordEntry} = viewKit;
const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_DAYS = 730; // how far back the history looks; a window, not a health value
const isText = value => typeof value === 'string' && value.length > 0;

async function recordsOf(ctx, filter) {
  const listed = await ctx.store.list('records', {subject: ctx.subject, ...filter});
  if (!listed.ok) return {ok: false, error: listed.error};
  const corrected = new Set(listed.value.filter(record => isText(record.corrects)).map(record => record.corrects));
  return {ok: true, value: listed.value.filter(record => !corrected.has(record.id))};
}

function repeatOf(ctx, method) {
  const equipment = ctx.config && Array.isArray(ctx.config.available_equipment) ? ctx.config.available_equipment : [];
  const available = isText(method) && equipment.includes(method);
  return {available, text: available ? 'The equipment for this exam is available in this configuration. Guided procedures arrive in a later level.'
    : 'Not offered: the equipment for this exam is not in this mission configuration.'};
}

async function build(services) {
  const made = contextOf(services);
  if (!made.ok) return {state: 'error', title: 'Adaptation', message: made.error.message};
  const ctx = made.value;
  const exams = variablesOfType(ctx, ['exam']);
  const results = []; const repeatOptions = []; const charts = []; const notes = [];
  for (const info of exams) {
    const found = await recordsOf(ctx, {variable: info.id});
    if (!found.ok) { results.push({...recordEntry(null, {variable: info.id, label: info.label}), assessment_label: null, repeat: null}); notes.push(`${info.label} could not be read: ${found.error.message}`); continue; }
    const byMethod = new Map();
    for (const record of found.value) {
      const kept = byMethod.get(record.method);
      if (!kept || Date.parse(record.time ?? '') > Date.parse(kept.time ?? '')) byMethod.set(record.method, record);
    }
    if (!byMethod.size) { results.push({...recordEntry(null, {variable: info.id, label: info.label}), assessment_label: null, repeat: null}); continue; }
    for (const method of [...byMethod.keys()].sort()) {
      const entry = recordEntry(byMethod.get(method), {clock: ctx.clock, label: info.label});
      const repeat = repeatOf(ctx, method);
      results.push({...entry, assessment_label: entry.state === 'recorded' ? 'last known assessment' : null, repeat});
      if (repeat.available) repeatOptions.push({variable: info.id, method, text: repeat.text});
    }
    // One series per method, so two methods are never on one line. Exams are occasional, so no gap days are drawn.
    const from = new Date(ctx.now_ms - HISTORY_DAYS * DAY_MS).toISOString();
    let series;
    try { series = await ctx.readings.series(ctx.store, {subject: ctx.subject, variable: info.id, from, to: ctx.today.to}); } catch { series = {ok: false, error: {message: 'the query failed'}}; }
    if (series.ok === false) { notes.push(`${info.label} history could not be built: ${series.error.message}`); continue; }
    const groups = [{method: series.points[0] ? series.points[0].method : null, unit: series.points[0] ? series.points[0].unit : null, points: series.points},
      ...series.non_comparable_groups.map(group => ({method: group.key ? group.key.method : null, unit: group.key ? group.key.unit : null, points: group.points}))];
    for (const group of groups.filter(item => item.points.length)) {
      const chart = lineChart({points: group.points, gaps: [], n: group.points.length, non_comparable_groups: []}, {unit: group.unit ?? '', label: `${info.label}, method ${group.method ?? 'not stated'}`});
      if (chart.ok !== false) charts.push(chart); else notes.push(chart.error.message);
    }
  }
  const performed = await recordsOf(ctx, {type: 'action'});
  const performedEntries = performed.ok ? performed.value.sort((a, b) => Date.parse(b.time ?? '') - Date.parse(a.time ?? '')).map(record => recordEntry(record, {clock: ctx.clock, label: record.variable})) : [];
  const sections = [bannerSection(ctx),
    {id: 'results', title: 'Results of physical tests and exams', state: 'ready', note: 'Each line is the last known assessment of one method, with its date and age. It is not the current state and nothing here estimates one.', entries: results},
    {id: 'history', title: 'History by method', state: charts.length ? 'ready' : 'empty', text: 'No exam with a numeric result has been recorded.', note: 'Every method is its own series; results from different methods are never drawn on one line.', charts},
    {id: 'performed', title: 'Exercise performed', state: performedEntries.length ? 'ready' : 'empty', text: 'No exercise session has been recorded.', note: 'What was done is kept apart from what was measured.', entries: performedEntries}];
  if (notes.length) sections.push({id: 'problems', title: 'Could not be shown', state: 'error', text: notes.join(' '), entries: []});
  return {state: 'ready', title: 'Adaptation', sections, repeat_options: repeatOptions};
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  try { return await build(services); } catch { return {state: 'error', title: 'Adaptation', message: 'Adaptation could not be built.'}; }
}
