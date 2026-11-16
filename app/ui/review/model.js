// Review and export: prepare, on this device, a review of one variable's recorded values for a specialist, and download the records with their provenance.
// No DOM. Adapted from the teammate's Follow-up, Evolution and export views onto this app's records. The review is descriptive: a difference between two values
// only when they can be compared (same subject, variable, unit, method, origin and time basis), otherwise the reason it is not. No criterion defines good or bad
// here, nothing is sent, and values outside the period or without an established time are named, never dropped silently.
import {viewKit} from '../base/index.js';

const {contextOf, bannerSection, attentionNote, variablesOfType, recordEntry} = viewKit;
const PERIODS = Object.freeze([{months: 0, label: 'All recorded values'}, {months: 3, label: 'Last 3 months'}, {months: 6, label: 'Last 6 months'}, {months: 12, label: 'Last 12 months'}]);
const isText = value => typeof value === 'string' && value.length > 0;
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const msg = (kind, text) => ({kind, text});
const number = new Intl.NumberFormat('en', {maximumFractionDigits: 6});

function periodStart(latestMs, months) {
  if (months === 0) return -Infinity;
  const end = new Date(latestMs); const day = end.getUTCDate(); end.setUTCDate(1); end.setUTCMonth(end.getUTCMonth() - months);
  end.setUTCDate(Math.min(day, new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate()));
  return end.getTime();
}

/** Own records of one variable (a corrected original is left out, as everywhere), split into those with an established UTC time and those without. */
async function seriesOf(ctx, variable) {
  const listed = await ctx.store.list('records', {subject: ctx.subject, variable});
  if (!listed.ok) return {ok: false, error: listed.error};
  const corrected = new Set(listed.value.filter(record => isText(record.corrects)).map(record => record.corrects));
  const own = listed.value.filter(record => !corrected.has(record.id) && record.type !== 'environment');
  const timed = own.filter(record => typeof record.time === 'string' && !Number.isNaN(Date.parse(record.time))).sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : a.id < b.id ? -1 : 1));
  return {ok: true, timed, untimed: own.filter(record => !timed.includes(record))};
}

function compare(ctx, reference, latest) {
  if (!reference || !latest || reference.id === latest.id) return {difference: null, text: 'No second value to compare with the reference in this selection.'};
  if (reference.state !== 'recorded' || latest.state !== 'recorded') return {difference: null, text: 'Not compared: one of the two has no recorded value (a not-recorded or nothing-new entry is not a number).'};
  const verdict = ctx.core && typeof ctx.core.areComparable === 'function' ? ctx.core.areComparable(reference, latest) : {comparable: false, reason: 'the comparison rules are not available'};
  if (!verdict.comparable) return {difference: null, text: `Not compared: ${String(verdict.reason).toLowerCase()}.`};
  if (reference.origin !== latest.origin) return {difference: null, text: 'Not compared: different origin.'};
  const difference = latest.value - reference.value;
  return {difference, text: `Difference from the reference: ${difference > 0 ? '+' : ''}${number.format(difference)} ${latest.unit}. Descriptive only: no criterion is applied and it has no clinical meaning.`};
}

async function build(services, session, message) {
  const made = contextOf(services);
  if (!made.ok) return {state: 'error', title: 'Review and export', message: made.error.message};
  const ctx = made.value;
  const sections = [bannerSection(ctx)];
  const candidates = variablesOfType(ctx, ['measurement', 'exam']);
  const withData = [];
  for (const info of candidates) { const found = await seriesOf(ctx, info.id); if (found.ok && (found.timed.length || found.untimed.length)) withData.push({...info, n: found.timed.length + found.untimed.length}); }
  const noteAttention = attentionNote(ctx);
  const exports = {all: {enabled: Boolean(ctx.exporter), reason: ctx.exporter ? null : 'Export is not available yet.'}};
  if (!withData.length) {
    sections.push({id: 'review', title: 'Review for a specialist', state: 'empty', text: 'No measurement or exam is recorded for this subject yet, so there is nothing to review. This is not "nothing new": nothing was recorded.'});
    return {state: 'ready', title: 'Review and export', sections, selection: null, review: null, exports, message: message ?? null, interactions: interactions(services, session)};
  }
  const variable = withData.some(item => item.id === session.variable) ? session.variable : withData[0].id;
  const info = withData.find(item => item.id === variable);
  const found = await seriesOf(ctx, variable);
  if (!found.ok) { sections.push({id: 'review', title: 'Review for a specialist', state: 'error', text: `The records could not be read: ${found.error.message}`}); return {state: 'ready', title: 'Review and export', sections, selection: null, review: null, exports, message: message ?? null, interactions: interactions(services, session)}; }
  const methods = [...new Set(found.timed.map(record => record.method))].sort();
  const latestAny = found.timed.at(-1);
  const method = methods.includes(session.method) ? session.method : latestAny ? latestAny.method : null;
  const months = PERIODS.some(period => period.months === session.months) ? session.months : 0;
  const latestMs = latestAny ? Date.parse(latestAny.time) : 0;
  const start = latestAny ? periodStart(latestMs, months) : -Infinity;
  const inPeriod = found.timed.filter(record => Date.parse(record.time) >= start);
  const group = inPeriod.filter(record => record.method === method);
  const outsideMethod = inPeriod.length - group.length;
  const reference = group.find(record => record.id === session.reference) ?? group.find(record => record.state === 'recorded') ?? group[0] ?? null;
  const latest = [...group].reverse().find(record => record.state === 'recorded' && (!reference || record.id !== reference.id)) ?? null;
  const change = compare(ctx, reference, latest);
  const recordedInGroup = group.filter(record => record.state === 'recorded').length;
  const description = recordedInGroup < 2 ? 'Not enough recorded values in this selection to describe a change (two or more are needed). This is not "no change".' : change.text;
  const entry = record => recordEntry(record, {clock: ctx.clock, variable, label: info.label});
  const outsidePeriod = found.timed.length - inPeriod.length;
  const origins = [...new Set(inPeriod.map(record => record.origin))].sort();
  const csv = ctx.exporter ? ctx.exporter.recordsToCsv(inPeriod) : {ok: false};
  const lines = [
    `Órbita · Review of ${info.label} · subject ${ctx.subject}`,
    `Prepared on this device at ${ctx.now_iso}. Not sent. ${ctx.data_source && ctx.data_source.synthetic === true ? 'Fictional data. ' : ''}Data source: ${ctx.data_source ? ctx.data_source.label : 'not named'}.`,
    `Variable: ${info.label} (${info.unit === 'as_recorded' ? 'unit as recorded' : info.unit}). Origin of the records: ${origins.join(', ') || 'none in this selection'}.`,
    `Period: ${PERIODS.find(period => period.months === months).label}${group.length ? `, ${group[0].time} to ${group.at(-1).time}` : ''}. Method: ${method ?? 'none'}. Values in this selection: ${group.length} (${recordedInGroup} recorded).`,
    outsideMethod ? `${outsideMethod} value(s) of other methods in this period are not included: methods are never put on one line.` : null,
    outsidePeriod ? `${outsidePeriod} value(s) before the period are not included.` : null,
    found.untimed.length ? `${found.untimed.length} value(s) have no established time and are not placed in any period.` : null,
    'Performance criterion: not configured. No value is graded here.',
    `Reference: ${reference ? `${reference.time} · ${reference.state === 'recorded' ? `${reference.value} ${reference.unit}` : reference.state.replace('_', ' ')}` : 'not available'}.`,
    description, '', 'Values in this selection:',
    ...group.map(record => `${record.id} · ${record.time} · ${record.state === 'recorded' ? `${record.value} ${record.unit}` : record.state.replace('_', ' ')} · ${record.method} · ${record.origin}`),
    '', 'Data and provenance annex (unrounded values, CSV):', csv.ok ? csv.value.replace(/^﻿/, '').trimEnd() : 'The annex could not be prepared.'
  ].filter(line => line !== null);
  sections.push({id: 'select', title: 'What to review', state: 'ready', note: 'Choose one variable, a period and one method. Values of different methods are never compared with each other.',
    variables: withData.map(({id, label, n}) => ({id, label: `${label} (${n})`})), periods: PERIODS.map(({months: m, label}) => ({months: m, label})), methods: methods.map(item => ({id: item, label: item})),
    chosen: {variable, months, method, reference: reference ? reference.id : null}, references: group.map(record => ({id: record.id, label: `${record.time} · ${record.state === 'recorded' ? `${record.value} ${record.unit}` : record.state.replace('_', ' ')}`}))});
  sections.push({id: 'values', title: 'Values in this selection', state: group.length ? 'ready' : 'empty', text: group.length ? '' : 'No value of this method falls in this period.', note: noteAttention, entries: group.map(entry),
    outside: {other_methods: outsideMethod, before_period: outsidePeriod, no_time: found.untimed.length}, untimed: found.untimed.map(entry)});
  sections.push({id: 'change', title: 'Change from the reference', state: 'ready', text: description, difference: recordedInGroup < 2 ? null : change.difference});
  const review = {text: lines.join('\n'), filename: `review-${variable}`};
  return {state: 'ready', title: 'Review and export', sections, selection: {variable, months, method, reference: reference ? reference.id : null}, review,
    exports: {all: exports.all, series: {enabled: csv.ok, reason: csv.ok ? null : 'The annex could not be prepared.'}}, message: message ?? null, interactions: interactions(services, session)};
}

function interactions(services, session) {
  const run = async work => {
    let note = null; try { note = await work(); } catch { note = msg('error', 'Something went wrong; nothing was changed.'); }
    return build(services, session, note);
  };
  return {
    select: input => run(async () => {
      if (!plain(input)) return msg('error', 'Nothing to select.');
      const made = contextOf(services); if (!made.ok) return msg('error', made.error.message);
      if (input.variable !== undefined) { if (!isText(input.variable) || !variablesOfType(made.value, ['measurement', 'exam']).some(item => item.id === input.variable)) return msg('error', 'Choose one of the listed variables.'); Object.assign(session, {variable: input.variable, method: null, reference: null}); }
      if (input.months !== undefined) { if (!PERIODS.some(period => period.months === input.months)) return msg('error', 'Choose one of the listed periods.'); session.months = input.months; session.reference = null; }
      if (input.method !== undefined) { if (!isText(input.method)) return msg('error', 'Choose one of the listed methods.'); session.method = input.method; session.reference = null; }
      if (input.reference !== undefined) { if (!isText(input.reference)) return msg('error', 'Choose one of the listed values.'); session.reference = input.reference; }
      return null;
    }),
    /** The whole subject's records as CSV, for the person to download. Reads only; nothing is sent. */
    exportAll: async () => {
      const made = contextOf(services); if (!made.ok) return {ok: false, error: {message: made.error.message}};
      const ctx = made.value; if (!ctx.exporter) return {ok: false, error: {message: 'Export is not available yet.'}};
      const listed = await ctx.store.list('records', {subject: ctx.subject}); if (!listed.ok) return {ok: false, error: {message: `The records could not be read: ${listed.error.message}`}};
      const csv = ctx.exporter.recordsToCsv(listed.value); if (!csv.ok) return {ok: false, error: {message: csv.error.message}};
      return {ok: true, value: {filename: ctx.exporter.safeFileName('orbita', ctx.subject, 'records'), text: csv.value, records: listed.value.length}};
    },
    exportSeries: async () => {
      const made = contextOf(services); if (!made.ok) return {ok: false, error: {message: made.error.message}};
      const ctx = made.value; if (!ctx.exporter || !session.variable) return {ok: false, error: {message: 'Nothing to export in this selection.'}};
      const vm = await build(services, session, null); const values = vm.sections.find(s => s.id === 'values');
      if (!values || !values.entries.length) return {ok: false, error: {message: 'No value in this selection.'}};
      const listed = await ctx.store.list('records', {subject: ctx.subject, variable: vm.selection.variable}); if (!listed.ok) return {ok: false, error: {message: `The records could not be read: ${listed.error.message}`}};
      const ids = new Set(values.entries.map(item => item.id)); const rows = listed.value.filter(record => ids.has(record.id));
      const csv = ctx.exporter.recordsToCsv(rows); return csv.ok ? {ok: true, value: {filename: ctx.exporter.safeFileName('orbita', ctx.subject, vm.selection.variable), text: csv.value, records: rows.length}} : {ok: false, error: {message: csv.error.message}};
    }
  };
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  const session = {variable: null, months: 0, method: null, reference: null};
  try { return await build(services, session, null); } catch { return {state: 'error', title: 'Review and export', message: 'Review and export could not be built.'}; }
}
