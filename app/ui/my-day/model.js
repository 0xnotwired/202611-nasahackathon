// My day: what is known today, what is not recorded today, the day's tasks and one alert per open episode.
// No DOM. Nothing here adds up, scores or summarises the day (R6); a variable without a value today says "not recorded" (R2).
import {viewKit} from '../base/index.js';

const {contextOf, bannerSection, variablesOfType, recordEntry} = viewKit;
const isText = value => typeof value === 'string' && value.length > 0;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const LINKS = Object.freeze([['I feel different', '#/i-feel-different'], ['My health', '#/my-health'], ['Adaptation', '#/adaptation'], ['Habitat', '#/habitat'], ['My progress', '#/my-progress']]);

async function todaysRecords(ctx) {
  const listed = await ctx.store.list('records', {subject: ctx.subject});
  if (!listed.ok) return {ok: false, error: listed.error};
  const corrected = new Set(listed.value.filter(record => isText(record.corrects)).map(record => record.corrects));
  const from = Date.parse(ctx.today.from); const to = Date.parse(ctx.today.to);
  return {ok: true, value: listed.value.filter(record => {
    const ms = Date.parse(record.time ?? '');
    return record.type !== 'environment' && !corrected.has(record.id) && !Number.isNaN(ms) && ms >= from && ms < to;
  })};
}

async function recordSections(ctx, measurable) {
  const known = {id: 'known_today', title: 'Known today', state: 'ready', note: 'Records dated today, including a confirmed "nothing new". A value of another day is never shown here.', entries: []};
  const missing = {id: 'not_recorded_today', title: 'Not recorded today', state: 'ready', note: 'Not recorded is not the same as nothing new.', entries: []};
  const today = await todaysRecords(ctx);
  if (!today.ok) {
    const text = `Today's records could not be read: ${today.error.message}`;
    return [{...known, state: 'error', text}, {...missing, state: 'error', text}];
  }
  const held = today.value.filter(record => record.state === 'recorded' || record.state === 'confirmed_none')
    .sort((a, b) => (Date.parse(a.time) - Date.parse(b.time)) || (a.id < b.id ? -1 : 1));
  known.entries = held.map(record => recordEntry(record, {clock: ctx.clock}));
  if (!known.entries.length) { known.state = 'empty'; known.text = 'Nothing is recorded for today in this source.'; }
  const covered = new Set(today.value.filter(record => record.state === 'recorded').map(record => record.variable));
  missing.entries = measurable.filter(info => !covered.has(info.id)).map(info => recordEntry(null, {variable: info.id, label: info.label}));
  if (!missing.entries.length) { missing.state = 'empty'; missing.text = 'Every measurement variable has a value today.'; }
  return [known, missing];
}

async function tasksSection(ctx) {
  const section = {id: 'tasks', title: 'Tasks for today', state: 'ready', items: []};
  const door = ctx.plan;
  if (!door || typeof door.tasksFor !== 'function') return {...section, state: 'not_available', text: 'Tasks are not available yet.'};
  let result;
  try { result = await door.tasksFor(ctx.store, {subject: ctx.subject, day: ctx.today.from.slice(0, 10)}); } catch { return {...section, state: 'error', text: 'Tasks could not be read.'}; }
  if (!result || result.ok !== true) {
    const error = result && result.error ? result.error : null;
    if (error && error.code === 'not_implemented') return {...section, state: 'not_available', text: 'Tasks are not available yet.'};
    return {...section, state: 'error', text: `Tasks could not be read: ${error && isText(error.message) ? error.message : 'unknown problem'}`};
  }
  if (!Array.isArray(result.value)) return {...section, state: 'error', text: 'Tasks could not be read: the answer was not a list.'};
  section.items = result.value.map(task => ({id: task.id ?? null, text: `${task.description ?? 'Task without a description'} — ${task.completion ?? 'completion not stated'}`, completion: task.completion ?? null}));
  if (!section.items.length) { section.state = 'empty'; section.text = 'No task is listed for today.'; }
  return section;
}

// One alert per open episode, grouping its pending items (B13). Read from the collections because M14 and M16 do not exist yet.
async function alertsOf(ctx) {
  const section = {id: 'alerts', title: 'Alerts', state: 'ready', note: 'An alert is raised only from episodes recorded in this source; no alert is not a statement that all is well.', items: []};
  const [episodes, tasks] = await Promise.all([ctx.store.list('episodes', {subject: ctx.subject}), ctx.store.list('tasks', {subject: ctx.subject})]);
  if (!episodes.ok || !tasks.ok) return {alerts: [], section: {...section, state: 'error', text: `Episodes could not be read: ${(episodes.ok ? tasks : episodes).error.message}`}};
  const byId = new Map(tasks.value.map(task => [task.id, task]));
  const alerts = [];
  for (const episode of episodes.value) {
    if (episode.closed !== undefined && episode.closed !== null) continue;
    const ids = Array.isArray(episode.task_ids) ? episode.task_ids : [];
    const pending = ids.map(id => byId.get(id)).filter(task => task && task.completion === 'pending');
    if (!pending.length) continue;
    alerts.push({episode_id: episode.id, items: pending.map(task => ({id: task.id, text: task.description})),
      text: `Episode ${episode.id}: ${plural(pending.length, 'item is', 'items are')} pending.`});
  }
  section.items = alerts.map(alert => ({id: alert.episode_id, text: alert.text, items: alert.items}));
  if (!alerts.length) section.text = 'No open episode has pending items in this source.';
  return {alerts, section};
}

async function build(services) {
  const made = contextOf(services);
  if (!made.ok) return {state: 'error', title: 'My day', message: made.error.message};
  const ctx = made.value;
  const [known, missing] = await recordSections(ctx, variablesOfType(ctx, ['measurement']));
  const {alerts, section: alertSection} = await alertsOf(ctx);
  const access = {id: 'access', title: 'Go to', state: 'ready', links: LINKS.map(([label, href]) => ({label, href}))};
  return {state: 'ready', title: 'My day', alerts, sections: [bannerSection(ctx), alertSection, await tasksSection(ctx), known, missing, access], interactions: {}};
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  try { return await build(services); } catch { return {state: 'error', title: 'My day', message: 'My day could not be built.'}; }
}
