// My plan: the day's tasks. What was assigned, what was done and what was observed afterwards are three separate fields.
// No DOM. Progress is "n of m done" with the not done and pending tasks named; nothing is scored, streaked or rewarded.
import {viewKit} from '../base/index.js';

const {contextOf, bannerSection, loadProcedures} = viewKit;
const isText = value => typeof value === 'string' && value.length > 0;
const DONE_TEXT = Object.freeze({pending: 'Pending', done: 'Done', not_done: 'Not done'});
const msg = (kind, text) => ({kind, text});
const NOT_WRITABLE = 'Marking tasks is not available for this data source yet.';

function planProblem(result) {
  const code = result && result.error ? result.error.code : null;
  return code === 'not_implemented' ? {state: 'not_available', text: 'The plan is not available yet.'} : {state: 'error', text: `The plan could not be read: ${result && result.error ? result.error.message : 'unknown problem'}`};
}

async function completedList(ctx) {
  const listed = await ctx.store.list('executions', {subject: ctx.subject});
  return listed.ok ? listed.value.filter(item => item.state === 'completed').sort((a, b) => (a.updated < b.updated ? -1 : 1)) : [];
}
/** An execution can evidence a task only if it finished on or after the task's day; an older one never does, and one with no time is never assumed to. */
const fits = (e, task) => typeof e.updated === 'string' && typeof task.day === 'string' && e.updated.slice(0, 10) >= task.day;
async function completedExecutions(ctx) {
  const byProcedure = new Map();
  for (const e of await completedList(ctx)) byProcedure.set(e.procedure_id, e); // the latest completed one is the default
  return byProcedure;
}
/** Recorded values of the subject that no task of the subject already links: the only candidates for a result. */
async function linkable(ctx, task) {
  const listed = await ctx.store.list('records', {subject: ctx.subject});
  if (!listed.ok) return [];
  const from = Date.parse(typeof task.scheduled_at === 'string' ? task.scheduled_at : `${task.day}T00:00:00.000Z`); // only values observed after the task started, with an established time
  return listed.value.filter(r => r.state === 'recorded' && !task.result_ids.includes(r.id) && typeof r.time === 'string' && Date.parse(r.time) >= from).map(r => ({id: r.id, text: `${r.variable ?? r.type}: ${r.value ?? ''}${r.unit ? ` ${r.unit}` : ''} · ${r.time ?? 'time not established'} · ${r.origin}`}));
}

function procedureOf(ctx, task, latest) {
  if (!isText(task.procedure_id)) return null;
  const found = latest.find(item => item && item.id === task.procedure_id);
  if (!found || !ctx.procedures || typeof ctx.procedures.availability !== 'function') return {id: task.procedure_id, title: task.procedure_id, can_start: false, availability_text: 'The procedure is not listed in this data source.'};
  const a = ctx.procedures.availability(found, ctx.config);
  const text = a.available ? 'The equipment for this procedure is in the mission configuration.' : a.missing.length ? `Blocked: this mission configuration lacks ${a.missing.join(', ')}.` : `Not available: ${a.problem ?? 'unknown reason'}`;
  return {id: found.id, title: found.title, can_start: a.available === true, availability_text: text};
}

function taskEntry(ctx, task, executions, planOk, latest, extra) {
  const blocked = !ctx.writable ? NOT_WRITABLE : !planOk ? 'The plan is not available yet.' : null;
  const pending = task.completion === 'pending';
  const results = task.result_ids.length;
  return {kind: 'task', id: task.id, description: task.description, assigned_text: `Assigned by ${task.assigned_by ?? 'source not stated'}`, completion: task.completion, done_text: DONE_TEXT[task.completion],
    result_text: results ? `${results} ${results === 1 ? 'result' : 'results'} linked` : 'not recorded', result_ids: [...task.result_ids],
    note_text: task.not_done_note && task.not_done_note.reason ? `Reason: ${task.not_done_note.reason}` : null, procedure: procedureOf(ctx, task, latest),
    execution: (() => { const last = extra.done_for.filter(e => e.procedure_id === task.procedure_id && fits(e, task)).pop(); return isText(task.procedure_id) && last ? {id: last.id} : null; })(),
    execution_choices: extra.done_for.filter(e => e.procedure_id === task.procedure_id && fits(e, task)).map(e => ({id: e.id, text: `${e.id} · finished ${e.updated ?? 'time not stated'}`})),
    history: (Array.isArray(task.history) ? task.history : []).map(h => `${h.completion} · ${h.at ?? 'time not recorded'}${h.reason ? ` · ${h.reason}` : ''}`), series_id: task.series_id ?? null,
    link_choices: extra.links, scheduled_text: task.scheduled_at ? `Scheduled ${task.scheduled_at}${task.planned_minutes ? ` · ${task.planned_minutes} min planned` : ''}` : null,
    actions: {reopen: {enabled: !pending && blocked === null, reason: pending ? 'Not marked, nothing to undo' : blocked}, link: {enabled: blocked === null && extra.links.length > 0, reason: blocked ?? (extra.links.length ? null : 'No recorded value is available to link')},
      done: {enabled: pending && blocked === null, reason: pending ? blocked : 'Already marked'}, not_done: {enabled: pending && blocked === null, reason: pending ? blocked : 'Already marked'}}};
}

async function build(services, message) {
  const made = contextOf(services);
  if (!made.ok) return {state: 'error', title: 'My plan', message: made.error.message};
  const ctx = made.value;
  const query = {subject: ctx.subject, day: ctx.today.from.slice(0, 10)};
  const door = ctx.plan && typeof ctx.plan.tasksFor === 'function' && typeof ctx.plan.progress === 'function' ? ctx.plan : null;
  const sections = [bannerSection(ctx)];
  let tasks = door ? await door.tasksFor(ctx.store, query).catch(() => ({ok: false, error: {message: 'the query failed'}})) : {ok: false, error: {code: 'not_implemented'}};
  const progress = {id: 'progress', title: 'Progress today', state: 'ready', text: '', not_done: [], pending: []};
  const list = {id: 'tasks', title: 'Tasks for today', state: 'ready', note: 'Assigned, done and result are three different things. A task marked done has no result until one is observed and linked.', entries: []};
  if (!tasks.ok) {
    const problem = planProblem(tasks);
    sections.push({...progress, ...problem}, {...list, ...problem});
  } else {
    const executions = await completedExecutions(ctx);
    const {latest} = await loadProcedures(ctx);
    const done_for = await completedList(ctx);
    list.entries = [];
    for (const task of tasks.value) list.entries.push(taskEntry(ctx, task, executions, true, latest, {done_for, links: await linkable(ctx, task)}));
    const count = status => tasks.value.filter(task => task.completion === status);
    progress.text = `${count('done').length} of ${tasks.value.length} done · ${count('not_done').length} not done · ${count('pending').length} pending`;
    progress.not_done = count('not_done').map(({id, description}) => ({id, description}));
    progress.pending = count('pending').map(({id, description}) => ({id, description}));
    if (!tasks.value.length) { list.state = 'empty'; list.text = 'No task is listed for today.'; progress.state = 'empty'; progress.text = 'No task is listed for today.'; }
    sections.push(progress, list);
  }
  sections.push({id: 'create', title: 'Add a task', state: 'ready', note: 'Tasks you add are assigned by you. A repeat falls only on the days you choose; nothing is scheduled by default.', procedures: (await loadProcedures(ctx)).latest.map(p => ({id: p.id, title: p.title})), actions: {create: {enabled: ctx.writable && ctx.plan !== null, reason: ctx.writable ? null : NOT_WRITABLE}}});
  return {state: 'ready', title: 'My plan', sections, message: message ?? null, interactions: interactions(services)};
}

function interactions(services) {
  const run = async work => {
    const made = contextOf(services);
    if (!made.ok) return build(services, msg('error', made.error.message));
    const ctx = made.value;
    if (!ctx.writable) return build(services, msg('error', NOT_WRITABLE));
    if (!ctx.plan || typeof ctx.plan.mark !== 'function') return build(services, msg('error', 'The plan is not available yet.'));
    let result; try { result = await work(ctx); } catch { result = msg('error', 'Not saved: something went wrong.'); }
    return build(services, result);
  };
  const saved = (out, text) => (out.ok ? msg('info', text) : msg('error', `Not saved: ${out.error.message}`));
  return {
    markDone: (taskId, executionId) => run(async ctx => {
      const task = await ctx.store.get('tasks', taskId);
      let known;
      if (isText(executionId)) { known = (await completedList(ctx)).find(e => e.id === executionId && task.ok && e.procedure_id === task.value.procedure_id && fits(e, task.value)); if (!known) return msg('error', 'Not saved: that execution is not a completed one of this procedure.'); }
      else known = task.ok && isText(task.value.procedure_id) ? (await completedList(ctx)).filter(e => e.procedure_id === task.value.procedure_id && fits(e, task.value)).pop() : undefined;
      return saved(await ctx.plan.mark(ctx.store, taskId, known ? {completion: 'done', execution_id: known.id, clock: ctx.clock} : {completion: 'done', clock: ctx.clock}), 'Saved: marked done. No result is implied.');
    }),
    reopen: (taskId, reason) => run(async ctx => {
      if (typeof ctx.plan.reopenTask !== 'function') return msg('error', 'Undo is not available yet.');
      if (!isText(typeof reason === 'string' ? reason.trim() : '')) return msg('error', 'Not saved: say why the mark is being undone.');
      return saved(await ctx.plan.reopenTask(ctx.store, taskId, {reason: reason.trim(), clock: ctx.clock}), 'Saved: the task is pending again. The earlier mark stays in its history; linked results stay.');
    }),
    linkResult: (taskId, recordId) => run(async ctx => saved(await ctx.plan.linkResult(ctx.store, taskId, recordId), 'Saved: result linked. The task\'s mark did not change.')),
    createTask: input => run(async ctx => {
      if (typeof ctx.plan.createTask !== 'function' || !ctx.newId) return msg('error', 'Adding tasks is not available yet.');
      const f = input && typeof input === 'object' ? input : {};
      if (!isText(typeof f.description === 'string' ? f.description.trim() : '')) return msg('error', 'Not saved: describe the task.');
      if (!isText(f.scheduled_at) || !/^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d(\.\d+)?)?Z$/.test(f.scheduled_at.trim()) || Number.isNaN(Date.parse(f.scheduled_at.trim())) || new Date(f.scheduled_at.trim()).toISOString().slice(0, 10) !== f.scheduled_at.trim().slice(0, 10)) return msg('error', 'Not saved: give the date and time in UTC with the Z at the end, for example 2026-11-15T10:00:00Z. No time zone is assumed.');
      const whole = v => typeof v === 'string' || typeof v === 'number' ? /^\d{1,5}$/.test(String(v).trim()) : false; // digits only: no 0x10, no 1e3, no 1.5
      const minutes = whole(f.planned_minutes) ? Number(String(f.planned_minutes).trim()) : NaN;
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) return msg('error', 'Not saved: say how many minutes it takes, a whole number from 1 to 1440; none is assumed.');
      const base = {subject: ctx.subject, description: f.description.trim(), scheduled_at: new Date(f.scheduled_at.trim()).toISOString(), planned_minutes: minutes, ...(isText(f.procedure_id) ? {procedure_id: f.procedure_id} : {})};
      if (f.every_days !== undefined && f.every_days !== '') {
        if (typeof ctx.plan.scheduleSeries !== 'function') return msg('error', 'Repeating tasks are not available yet.');
        return saved(await ctx.plan.scheduleSeries(ctx.store, {...base, first_scheduled_at: base.scheduled_at, every_days: whole(f.every_days) ? Number(String(f.every_days).trim()) : NaN, count: whole(f.count) ? Number(String(f.count).trim()) : NaN}, {newId: ctx.newId}), `Saved: ${f.count} tasks, one every ${f.every_days} days.`);
      }
      return saved(await ctx.plan.createTask(ctx.store, base, {newId: ctx.newId}), 'Saved: task added.');
    }),
    markNotDone: (taskId, reason) => run(async ctx => {
      if (!isText(typeof reason === 'string' ? reason.trim() : '')) return msg('error', 'Not saved: say why it was not done.');
      return saved(await ctx.plan.mark(ctx.store, taskId, {completion: 'not_done', note: {reason: reason.trim()}, clock: ctx.clock}), 'Saved: marked not done, with the reason.');
    })
  };
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  try { return await build(services, null); } catch { return {state: 'error', title: 'My plan', message: 'My plan could not be built.'}; }
}
