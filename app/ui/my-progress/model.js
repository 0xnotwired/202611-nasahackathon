// My progress: the subject's own timeline, a comparison with their earlier values, and a chart of one chosen variable.
// No DOM. The comparison is a count, a period and a range of earlier comparable values; it gives no judgement (R6).
// Superseded originals stay on the timeline, marked "corrected by" (R7). Environment records are not the subject's own (R9).
import {viewKit, lineChart} from '../base/index.js';

const {contextOf, bannerSection, attentionNote, variablesOfType, latestEntry, recordEntry} = viewKit;
const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_DAYS = 30; // how far back the chart looks: a window, not a health value
const isText = value => typeof value === 'string' && value.length > 0;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const dayOf = iso => String(iso).slice(0, 10);

function phaseText(ctx, record) {
  if (isText(record.mission_phase)) return `Mission phase: ${record.mission_phase}`;
  const phases = ctx.config && Array.isArray(ctx.config.phases) ? ctx.config.phases : [];
  const ms = Date.parse(record.time ?? '');
  const found = Number.isNaN(ms) ? null : phases.find(phase => Date.parse(phase.from) <= ms && ms < Date.parse(phase.to));
  return found ? `Mission phase: ${found.name}` : 'Mission phase: not stated';
}

async function timelineSection(ctx) {
  const section = {id: 'timeline', title: 'My records, newest first', state: 'ready', note: 'Every record of this subject, whatever its state. A corrected record stays here, marked.', entries: []};
  const listed = await ctx.store.list('records', {subject: ctx.subject});
  if (!listed.ok) return {...section, state: 'error', text: `The timeline could not be read: ${listed.error.message}`};
  const own = listed.value.filter(record => record.type !== 'environment');
  const correctedBy = new Map(own.filter(record => isText(record.corrects)).map(record => [record.corrects, record.id]));
  const ranked = [...own].sort((a, b) => {
    const ta = Date.parse(a.time ?? ''); const tb = Date.parse(b.time ?? '');
    if (Number.isNaN(ta) !== Number.isNaN(tb)) return Number.isNaN(ta) ? 1 : -1;
    return (tb - ta) || (a.id < b.id ? -1 : 1);
  });
  const labels = new Map(variablesOfType(ctx, ['measurement', 'observation', 'exam', 'action', 'environment']).map(item => [item.id, item.label]));
  section.entries = ranked.map(record => {
    const entry = recordEntry(record, {clock: ctx.clock, label: labels.get(record.variable)});
    const by = correctedBy.get(record.id) ?? null;
    return {...entry, phase_text: phaseText(ctx, record), superseded: by !== null, corrected_by: by,
      correction_text: by ? `This record was corrected by ${by}; it is kept.` : isText(record.corrects) ? `This record corrects ${record.corrects}.` : null};
  });
  if (!section.entries.length) { section.state = 'empty'; section.text = 'No record of this subject exists in this source.'; }
  return section;
}

async function compare(ctx, info) {
  const latest = await latestEntry(ctx, info);
  const base = {kind: 'comparison', variable: info.id, label: info.label, latest, comparison: null, reason: null};
  if (!latest.has_record) return {...base, reason: latest.problem ? `Latest value ${latest.problem}.` : 'Not recorded, so there is nothing to compare.'};
  if (latest.state !== 'recorded' || typeof latest.value !== 'number') return {...base, reason: 'The newest record has no measured value to compare.'};
  if (!isText(latest.time)) return {...base, reason: 'The time of the newest record is not established, so earlier values cannot be located.'};
  let earlier;
  try { earlier = await ctx.readings.baseline(ctx.store, {subject: ctx.subject, variable: info.id, to: latest.time}); } catch { earlier = {ok: false, error: {message: 'the query failed'}}; }
  if (!earlier || earlier.ok === false) return {...base, reason: `Earlier values could not be read: ${earlier && earlier.error ? earlier.error.message : 'unknown'}.`};
  if (earlier.n === 0) return {...base, reason: `No earlier comparable measurement exists${earlier.excluded_non_comparable ? ` (${plural(earlier.excluded_non_comparable, 'earlier measurement')} used another method or unit and is not counted)` : ''}.`};
  let span;
  try { span = await ctx.readings.series(ctx.store, {subject: ctx.subject, variable: info.id, from: earlier.from, to: latest.time}); } catch { span = {ok: false}; }
  if (!span || span.ok === false || !span.points.length) return {...base, reason: 'The range of earlier values could not be read.'};
  const values = span.points.map(point => point.value);
  const unit = span.points[0].unit ? ` ${span.points[0].unit}` : '';
  const extra = earlier.excluded_non_comparable ? ` ${plural(earlier.excluded_non_comparable, 'earlier measurement')} with another method or unit are not counted.` : '';
  return {...base, comparison: {n: earlier.n, from: earlier.from, to: earlier.to,
    text: `${plural(earlier.n, 'earlier measurement')} of ${info.label}, ${dayOf(earlier.from)} to ${dayOf(earlier.to)}, ranged from ${Math.min(...values)} to ${Math.max(...values)}${unit}.${extra}`}};
}

async function chartSection(ctx, measurable, chosen) {
  const info = measurable.find(item => item.id === chosen);
  const section = {id: 'chart', title: `Chart: ${info ? info.label : 'no variable'}`, state: 'ready', variable: chosen, options: measurable.map(({id, label}) => ({id, label})), note: 'A day without a value is drawn as a gap, never as zero.', charts: []};
  if (!info) return {...section, state: 'empty', text: 'No measurement variable is defined.'};
  const from = new Date(ctx.today.to).getTime() - CHART_DAYS * DAY_MS;
  let series;
  try { series = await ctx.readings.series(ctx.store, {subject: ctx.subject, variable: info.id, from: new Date(from).toISOString(), to: ctx.today.to}); } catch { series = {ok: false, error: {message: 'the query failed'}}; }
  if (!series || series.ok === false) return {...section, state: 'error', text: `The chart could not be built: ${series && series.error ? series.error.message : 'unknown'}`};
  const unit = (series.points[0] && series.points[0].unit) ?? (info.unit === 'as_recorded' ? '' : info.unit);
  const chart = lineChart(series, {unit: unit ?? '', label: info.label});
  if (chart.ok === false) return {...section, state: 'error', text: chart.error.message};
  section.charts.push(chart);
  return section;
}

async function build(services, params) {
  const made = contextOf(services);
  if (!made.ok) return {state: 'error', title: 'My progress', message: made.error.message};
  const ctx = made.value;
  const measurable = variablesOfType(ctx, ['measurement']);
  const asked = params !== null && typeof params === 'object' && !Array.isArray(params) && Object.hasOwn(params, 'variable') ? params.variable : null;
  const chosen = measurable.some(item => item.id === asked) ? asked : (measurable[0] ? measurable[0].id : null);
  const baseline = {id: 'baseline', title: 'Latest value against my earlier values', state: 'ready', note: [attentionNote(ctx), 'A comparison states how many earlier measurements support it and says nothing about what they mean.'].filter(Boolean).join(' '),
    entries: await Promise.all(measurable.map(info => compare(ctx, info)))};
  const sections = [bannerSection(ctx), await chartSection(ctx, measurable, chosen), baseline, await timelineSection(ctx)];
  return {state: 'ready', title: 'My progress', sections, chart_variable: chosen,
    interactions: {chooseVariable: variable => build(services, {variable})}};
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services, params) {
  try { return await build(services, params); } catch { return {state: 'error', title: 'My progress', message: 'My progress could not be built.'}; }
}
