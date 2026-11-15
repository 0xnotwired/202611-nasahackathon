// Habitat: environmental conditions of a place and period, without turning them into personal exposure.
// No DOM. The view does not know where the person is (A06: a coincidence in time is not exposure): the person chooses their
// place, and until then every reading is "not attributed to you". Radiation is cumulative per dose type and unit, never
// summed across them. No career limit and no number for it exists in this module; no value is graded and no sentence links
// a condition to a symptom.
import {viewKit} from '../base/index.js';

const {contextOf, bannerSection, recordEntry, cleanLabel} = viewKit;
const isText = value => typeof value === 'string' && value.length > 0 && value.length <= 512;
const RADIATION = 'radiation_dose';
const UNATTRIBUTED = 'Not attributed to you: Órbita does not know that you were in this place.';
const hhmm = iso => iso.slice(11, 16);

function coverageText(env) {
  const segments = env.coverage.segments.map(segment => `${hhmm(segment.from)}–${hhmm(segment.to)} UTC`);
  const sensors = env.coverage.sensors.length ? `sensor ${env.coverage.sensors.join(', ')}` : 'no sensor named';
  return `Measured ${segments.length ? segments.join(', ') : 'no interval'} today; ${sensors}`;
}

async function placeEntries(ctx, labels, place) {
  const listed = await ctx.store.list('records', {type: 'environment', place});
  if (!listed.ok) return {ok: false, error: listed.error};
  const variables = [...new Set(listed.value.filter(record => record.variable !== RADIATION).map(record => record.variable))].sort();
  const entries = [];
  for (const variable of variables) {
    let env;
    try { env = await ctx.readings.environment(ctx.store, {place, variable, interval: ctx.today}); } catch { env = {ok: false, error: {message: 'the query failed'}}; }
    if (env.ok === false) return {ok: false, error: env.error};
    for (const record of env.records) entries.push({...recordEntry(record, {clock: ctx.clock, label: labels.get(variable) ?? variable}), coverage_text: coverageText(env)});
  }
  return {ok: true, entries};
}

async function radiationSection(ctx, labels) {
  const label = labels.get(RADIATION) ?? 'Radiation dose';
  const section = {id: 'radiation', title: 'Radiation', state: 'ready', note: 'Cumulative dose per dose type and unit. Absorbed, equivalent and effective dose are kept apart and never added together.', entries: []};
  const listed = await ctx.store.list('records', {subject: ctx.subject, variable: RADIATION});
  if (!listed.ok) return {...section, state: 'error', text: `Radiation could not be read: ${listed.error.message}`};
  const corrected = new Set(listed.value.filter(record => isText(record.corrects)).map(record => record.corrects));
  const active = listed.value.filter(record => !corrected.has(record.id) && record.state === 'recorded' && typeof record.value === 'number');
  const unknown = active.filter(record => record.unit_status === 'unknown');
  const groups = new Map();
  for (const record of active.filter(record => record.unit_status !== 'unknown')) {
    const key = `${record.method}\u0000${record.unit}`;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  for (const key of [...groups.keys()].sort()) {
    const records = groups.get(key);
    const newest = records.reduce((a, b) => (Date.parse(b.time ?? '') > Date.parse(a.time ?? '') ? b : a));
    const total = Number(records.reduce((sum, record) => sum + record.value, 0).toFixed(6));
    const days = new Set(records.map(record => (record.time ?? '').slice(0, 10))).size;
    const coverage = `${records.length} ${records.length === 1 ? 'reading' : 'readings'} on ${days} ${days === 1 ? 'day' : 'days'}`;
    const entry = recordEntry(newest, {clock: ctx.clock, label});
    section.entries.push({...entry, value: total, unit: newest.unit, value_text: `${total} ${newest.unit}`, dose_type: newest.method, readings: records.length, days, coverage_text: coverage,
      text: `${label}: ${total} ${newest.unit} cumulative · dose type ${newest.method} · ${coverage}`});
  }
  if (!section.entries.length) section.entries.push(recordEntry(null, {variable: RADIATION, label}));
  if (unknown.length) section.note += ` ${unknown.length} ${unknown.length === 1 ? 'reading has' : 'readings have'} an unknown unit and ${unknown.length === 1 ? 'is' : 'are'} not added into any total.`;
  return section;
}

async function build(services, params, makeInteractions) {
  const made = contextOf(services);
  if (!made.ok) return {state: 'error', title: 'Habitat', message: made.error.message};
  const ctx = made.value;
  let catalog = []; try { catalog = ctx.catalogs.variables(); } catch { catalog = []; }
  const labels = new Map(catalog.map(item => [item.id, cleanLabel(item.label)]));
  const all = await ctx.store.list('records', {type: 'environment'});
  const places = all.ok ? [...new Set(all.value.filter(record => record.variable !== RADIATION).map(record => record.place))].sort() : [];
  let wanted; try { wanted = params && typeof params === 'object' ? Object.getOwnPropertyDescriptor(params, 'place')?.value : undefined; } catch { wanted = undefined; }
  const chosen = isText(wanted) && places.includes(wanted) ? wanted : null;
  const sections = [bannerSection(ctx)];
  const own = {id: 'own', title: 'Your place', state: 'ready', note: chosen ? `Readings from ${chosen}, the place you chose. A reading shows the place and time it was taken; it says nothing about how you feel.`
    : 'Órbita does not know where you are. Choose your place to see its readings here; until then nothing is attributed to you.', entries: []};
  sections.push(own);
  for (const place of places) {
    const found = await placeEntries(ctx, labels, place);
    const target = place === chosen ? own : {id: `place-${place}`, title: `Place ${place}`, state: 'ready', note: UNATTRIBUTED, entries: []};
    if (!found.ok) { target.state = 'error'; target.text = `Readings of ${place} could not be read: ${found.error.message}`; } else target.entries = found.entries;
    if (place !== chosen) sections.push(target);
  }
  if (!places.length) sections.push({id: 'no-places', title: 'Places', state: 'empty', text: 'No environment reading has been recorded.', entries: []});
  sections.push(await radiationSection(ctx, labels));
  const vm = {state: 'ready', title: 'Habitat', places, chosen_place: chosen, sections, interactions: makeInteractions(services)};
  if (ctx.flags && ctx.flags.career_limit === true) vm.career_limit = {text: 'The program requirement for a career limit is not confirmed yet, so no value is shown.'};
  return vm;
}

/** model(services, params) → ViewModel. params.place is the place the person chose; anything else is ignored. */
export async function model(services, params) {
  const interactions = svc => ({choosePlace: place => model(svc, {place})});
  try { return await build(services, params, interactions); } catch { return {state: 'error', title: 'Habitat', message: 'Habitat could not be built.'}; }
}
