// My plan: the day's tasks. What was assigned, what was done and what was observed afterwards are three separate fields.
// No DOM. Progress is "n of m done" with the not done and pending tasks named; nothing is scored, streaked or rewarded.
import {viewKit} from '../base/index.js';

const {contextOf, bannerSection} = viewKit;
const isText = value => typeof value === 'string' && value.length > 0;
const DONE_TEXT = Object.freeze({pending: 'Pending', done: 'Done', not_done: 'Not done'});
const msg = (kind, text) => ({kind, text});
const NOT_WRITABLE = 'Marking tasks is not available for this data source yet.';

function planProblem(result) {
  const code = result && result.error ? result.error.code : null;
  return code === 'not_implemented' ? {state: 'not_available', text: 'The plan is not available yet.'} : {state: 'error', text: `The plan could not be read: ${result && result.error ? result.error.message : 'unknown problem'}`};
}

async function completedExecutions(ctx) {
  const listed = await ctx.store.list('executions', {subject: ctx.subject});
  const byProcedure = new Map();
  if (!listed.ok) return byProcedure;
  for (const e of listed.value.filter(item => item.state === 'completed').sort((a, b) => (a.updated < b.updated ? -1 : 1))) byProcedure.set(e.procedure_id, e);
  return byProcedure;
}

function procedureOf(ctx, task) {
  if (!isText(task.procedure_id)) return null;
  const found = ctx.procedure_list.find(item => item && item.id === task.procedure_id);
  if (!found || !ctx.procedures || typeof ctx.procedures.availability !== 'function') return {id: task.procedure_id, title: task.procedure_id, can_start: false, availability_text: 'The procedure is not listed in this data source.'};
  const a = ctx.procedures.availability(found, ctx.config);
  const text = a.available ? 'The equipment for this procedure is in the mission configuration.' : a.missing.length ? `Blocked: this mission configuration lacks ${a.missing.join(', ')}.` : `Not available: ${a.problem ?? 'unknown reason'}`;
  return {id: found.id, title: found.title, can_start: a.available === true, availability_text: text};
}

function taskEntry(ctx, task, executions, planOk) {
  const blocked = !ctx.writable ? NOT_WRITABLE : !planOk ? 'The plan is not available yet.' : null;
  const pending = task.completion === 'pending';
  const results = task.result_ids.length;
  return {kind: 'task', id: task.id, description: task.description, assigned_text: `Assigned by ${task.assigned_by ?? 'source not stated'}`, completion: task.completion, done_text: DONE_TEXT[task.completion],
    result_text: results ? `${results} ${results === 1 ? 'result' : 'results'} linked` : 'not recorded', result_ids: [...task.result_ids],
    note_text: task.not_done_note && task.not_done_note.reason ? `Reason: ${task.not_done_note.reason}` : null, procedure: procedureOf(ctx, task),
    execution: isText(task.procedure_id) && executions.has(task.procedure_id) ? {id: executions.get(task.procedure_id).id} : null,
    actions: {done: {enabled: pending && blocked === null, reason: pending ? blocked : 'Already marked'}, not_done: {enabled: pending && blocked === null, reason: pending ? blocked : 'Already marked'}}};
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
    list.entries = tasks.value.map(task => taskEntry(ctx, task, executions, true));
    const count = status => tasks.value.filter(task => task.completion === status);
    progress.text = `${count('done').length} of ${tasks.value.length} done · ${count('not_done').length} not done · ${count('pending').length} pending`;
    progress.not_done = count('not_done').map(({id, description}) => ({id, description}));
    progress.pending = count('pending').map(({id, description}) => ({id, description}));
    if (!tasks.value.length) { list.state = 'empty'; list.text = 'No task is listed for today.'; progress.state = 'empty'; progress.text = 'No task is listed for today.'; }
    sections.push(progress, list);
  }
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
    markDone: taskId => run(async ctx => {
      const task = await ctx.store.get('tasks', taskId);
      const executions = await completedExecutions(ctx);
      const known = task.ok && isText(task.value.procedure_id) ? executions.get(task.value.procedure_id) : undefined;
      return saved(await ctx.plan.mark(ctx.store, taskId, known ? {completion: 'done', execution_id: known.id} : {completion: 'done'}), 'Saved: marked done. No result is implied.');
    }),
    markNotDone: (taskId, reason) => run(async ctx => {
      if (!isText(typeof reason === 'string' ? reason.trim() : '')) return msg('error', 'Not saved: say why it was not done.');
      return saved(await ctx.plan.mark(ctx.store, taskId, {completion: 'not_done', note: {reason: reason.trim()}}), 'Saved: marked not done, with the reason.');
    })
  };
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  try { return await build(services, null); } catch { return {state: 'error', title: 'My plan', message: 'My plan could not be built.'}; }
}
