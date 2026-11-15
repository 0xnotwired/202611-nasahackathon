// My health: symptoms, vital signs and rest with their context, and recording of a measurement or of "nothing new".
// No DOM. Every record becomes an entry through viewKit.recordEntry, so it reads the same here as in every other view.
// Rules: a variable without data says "not recorded" (R2); rest kinds are never merged (R3); every value carries method,
// time and origin (R4); "nothing new" is its own state, never a zero (R1); nothing is graded or coloured as health.
import {viewKit} from '../base/index.js';

const {contextOf, bannerSection, attentionNote, variablesOfType, latestEntry, recordEntry} = viewKit;

// Rest is three different things (A05): what was scheduled, what the person reported and what an instrument estimated.
const REST_KINDS = Object.freeze({scheduled_rest: 'Scheduled rest', schedule: 'Scheduled rest', self_report: 'Sleep self-report',
  instrument_estimate: 'Estimated sleep (instrument)', actigraphy: 'Estimated sleep (instrument)'});
const MOOD_NOTE = 'Mood is a team self-report on a 1–5 scale; it is not validated and not a screening.';
const isText = value => typeof value === 'string' && value.length > 0;
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const msg = (kind, text) => ({kind, text});

async function restSection(ctx) {
  const listed = await ctx.store.list('records', {subject: ctx.subject, variable: 'sleep_hours'});
  const section = {id: 'rest', title: 'Rest and sleep', state: 'ready', note: 'Scheduled rest, sleep self-report and estimated sleep are different things and are never merged.', entries: []};
  if (!listed.ok) return {...section, state: 'error', text: `Rest could not be read: ${listed.error.message}`};
  const corrected = new Set(listed.value.filter(record => isText(record.corrects)).map(record => record.corrects));
  const byMethod = new Map();
  for (const record of listed.value.filter(record => !corrected.has(record.id))) {
    const kept = byMethod.get(record.method);
    if (!kept || Date.parse(record.time ?? '') > Date.parse(kept.time ?? '') || kept.time === null) byMethod.set(record.method, record);
  }
  for (const method of [...byMethod.keys()].sort()) section.entries.push(recordEntry(byMethod.get(method), {clock: ctx.clock, label: REST_KINDS[method] ?? `Rest, method ${method}`}));
  if (!section.entries.length) section.entries.push(recordEntry(null, {variable: 'sleep_hours', label: 'Rest and sleep'}));
  return section;
}

function phaseName(ctx) {
  const phases = ctx.config && Array.isArray(ctx.config.phases) ? ctx.config.phases : [];
  const found = phases.find(phase => Date.parse(phase.from) <= ctx.now_ms && ctx.now_ms < Date.parse(phase.to));
  return found ? found.name : 'mission';
}

function actionsOf(ctx, measurable) {
  const blocked = !ctx.writable ? 'Recording is not available for this data source yet.' : !ctx.core || !ctx.newId ? 'Recording needs the core and an identifier generator, which are not available.' : null;
  return {nothing_new: {enabled: blocked === null, reason: blocked}, measurement: {enabled: blocked === null, reason: blocked, variables: measurable.map(({id, label, unit}) => ({id, label, unit}))}};
}

async function build(services, note) {
  const made = contextOf(services);
  if (!made.ok) return {state: 'error', title: 'My health', message: made.error.message};
  const ctx = made.value;
  const observations = variablesOfType(ctx, ['observation']);
  const measurable = variablesOfType(ctx, ['measurement']);
  const vitals = measurable.filter(variable => variable.id !== 'sleep_hours');
  const sections = [bannerSection(ctx)];
  const note1 = attentionNote(ctx);
  sections.push({id: 'symptoms', title: 'Symptoms and observations', state: 'ready', note: `Each line is the newest record of any state. ${MOOD_NOTE}`, entries: await Promise.all(observations.map(variable => latestEntry(ctx, variable)))});
  sections.push({id: 'vitals', title: 'Vital signs and measurements', state: 'ready', note: note1, entries: await Promise.all(vitals.map(variable => latestEntry(ctx, variable)))});
  sections.push(await restSection(ctx));
  return {state: 'ready', title: 'My health', sections, actions: actionsOf(ctx, measurable), message: note ?? null, interactions: interactions(services)};
}

async function save(ctx, fields) {
  const created = ctx.core.createRecord({...fields, origin: ctx.record_origin, source: 'user_entered', mission_phase: phaseName(ctx), subject: ctx.subject}, {clock: ctx.clock, newId: ctx.newId});
  if (!created.ok) return msg('error', `Not saved: ${created.error.message}`);
  const saved = await ctx.store.save('records', created.value);
  return saved.ok ? msg('info', fields.state === 'confirmed_none' ? 'Saved: nothing new, confirmed.' : `Saved: ${fields.variable}.`) : msg('error', `Not saved: ${saved.error.message}`);
}

function interactions(services) {
  const run = async work => {
    const made = contextOf(services);
    if (!made.ok) return build(services, msg('error', made.error.message));
    const ctx = made.value;
    const blocked = actionsOf(ctx, []).nothing_new.reason;
    if (blocked) return build(services, msg('error', blocked));
    let result;
    try { result = await work(ctx); } catch { result = msg('error', 'Not saved: something went wrong.'); }
    return build(services, result);
  };
  return {
    recordNothingNew: () => run(ctx => save(ctx, {type: 'observation', state: 'confirmed_none', variable: 'other', method: 'self_report', note: 'Confirmed nothing new.'})),
    recordMeasurement: input => run(async ctx => {
      if (!plain(input)) return msg('error', 'Not saved: give a variable and a value.');
      const {variable, value, unit} = input;
      const method = isText(input.method) ? input.method : (input.method === undefined ? 'self_report' : null);
      const info = variablesOfType(ctx, ['measurement']).find(item => item.id === variable);
      if (!info) return msg('error', 'Not saved: choose one of the listed variables.');
      if (typeof value !== 'number' || !Number.isFinite(value)) return msg('error', 'Not saved: the value must be a number.');
      if (method === null) return msg('error', 'Not saved: the method must be text.');
      const shownUnit = info.unit === 'as_recorded' ? unit : info.unit;
      if (!isText(shownUnit)) return msg('error', `Not saved: ${info.label} needs the unit it was recorded in.`);
      return save(ctx, {type: 'measurement', state: 'recorded', variable, value, unit: shownUnit, method});
    })
  };
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  try { return await build(services, null); } catch { return {state: 'error', title: 'My health', message: 'My health could not be built.'}; }
}
