// On board: procedures with their equipment check, and their executions step by step.
// No DOM. Which procedures can start depends on the mission configuration; a blocked one names what is missing and offers no start.
// An execution shows the version it started with. "Demo" procedures read as demo, never as guidance. Nothing here is clinical content.
import {viewKit} from '../base/index.js';

const {contextOf, bannerSection} = viewKit;
const isText = value => typeof value === 'string' && value.length > 0;
const msg = (kind, text) => ({kind, text});
const NOT_WRITABLE = 'Running procedures is not available for this data source yet.';
const REVIEW_TEXT = Object.freeze({demo: 'demo: invented for the team demo, not reviewed guidance', draft: 'draft: not reviewed', reviewed: 'reviewed'});

function procedureEntries(ctx) {
  const door = ctx.procedures;
  const blocked = !ctx.writable ? NOT_WRITABLE : !door ? 'Procedures are not available yet.' : null;
  const entries = []; const unreadable = [];
  for (const raw of ctx.procedure_list) {
    const checked = door && typeof door.validateProcedure === 'function' ? door.validateProcedure(raw) : {ok: false};
    if (!checked.ok) { unreadable.push(raw && isText(raw.id) ? raw.id : '(no id)'); continue; }
    const p = checked.value; const a = door.availability(p, ctx.config);
    const text = a.available ? 'The equipment for this procedure is in the mission configuration.' : a.missing.length ? `Blocked: this mission configuration lacks ${a.missing.join(', ')}.` : `Not available: ${a.problem ?? 'unknown reason'}`;
    entries.push({kind: 'procedure', id: p.id, title: p.title, purpose: p.purpose, version: p.version, source: p.source, review_status: p.review_status,
      review_text: REVIEW_TEXT[p.review_status] ?? p.review_status, preparation: p.preparation, steps: p.steps.map(step => step.text), availability: {available: a.available, missing: a.missing, alternative_id: a.alternative_id ?? null, text},
      blocked_text: a.available ? null : text, actions: a.available ? [{id: 'start', label: 'Start', enabled: blocked === null, reason: blocked}] : []});
  }
  return {entries, unreadable};
}

function executionEntry(ctx, e, procedures) {
  const p = procedures.find(item => item.id === e.procedure_id);
  const sameVersion = p && p.version === e.procedure_version ? p : null;
  const blocked = !ctx.writable ? NOT_WRITABLE : null;
  const all = e.current_step >= e.step_count;
  const stepText = e.state === 'completed' || e.state === 'could_not' || e.state === 'blocked' ? null
    : all ? 'Every step is done.' : sameVersion ? `Next: ${sameVersion.steps[e.current_step]}` : `The text of version ${e.procedure_version} is not available here; the step number is ${e.current_step + 1} of ${e.step_count}.`;
  const stateText = {blocked: `blocked: missing ${(e.missing ?? []).join(', ') || 'equipment not stated'}`, in_progress: 'in progress', interrupted: `interrupted; ${e.current_step} of ${e.step_count} steps are done`, completed: 'completed', could_not: 'could not be completed'}[e.state];
  const actions = [];
  if (e.state === 'in_progress') actions.push({id: 'advance', label: 'Step done', enabled: !all && blocked === null, reason: all ? 'Every step is done' : blocked},
    {id: 'interrupt', label: 'Interrupt', enabled: blocked === null, reason: blocked, needs: 'reason'},
    {id: 'finish_completed', label: 'Finish', enabled: all && blocked === null, reason: all ? blocked : 'Steps remain', },
    {id: 'finish_could_not', label: 'I could not complete it', enabled: blocked === null, reason: blocked, needs: 'difficulty'});
  if (e.state === 'interrupted') actions.push({id: 'resume', label: 'Resume', enabled: blocked === null, reason: blocked, resume_at: e.current_step}, {id: 'finish_could_not', label: 'I could not complete it', enabled: blocked === null, reason: blocked, needs: 'difficulty'});
  return {kind: 'execution', id: e.id, procedure_id: e.procedure_id, title: p ? p.title : e.procedure_id, procedure_version: e.procedure_version, state: e.state, state_text: stateText,
    progress_text: `${e.current_step} of ${e.step_count} steps done`, step_text: stepText && `Version ${e.procedure_version}. ${stepText}`, difficulties: [...e.difficulties], interruptions: e.interruptions.map(i => ({reason: i.reason, step: i.step})), actions};
}

async function build(services, message) {
  const made = contextOf(services);
  if (!made.ok) return {state: 'error', title: 'On board', message: made.error.message};
  const ctx = made.value;
  const {entries, unreadable} = procedureEntries(ctx);
  const sections = [bannerSection(ctx)];
  const list = {id: 'procedures', title: 'Procedures', state: entries.length ? 'ready' : 'empty', text: 'No procedure is listed in this data source.', note: unreadable.length ? `${unreadable.length} procedure(s) could not be read: ${unreadable.join(', ')}.` : 'Check the equipment and the preparation before starting. Procedures here are demo content, not medical guidance.', entries};
  sections.push(list);
  const listed = await ctx.store.list('executions', {subject: ctx.subject});
  const runs = {id: 'executions', title: 'My executions', state: 'ready', note: 'Each execution keeps the procedure version it started with.', entries: []};
  if (!listed.ok) { runs.state = 'error'; runs.text = `Executions could not be read: ${listed.error.message}`; }
  else {
    const valid = listed.value.filter(e => e && Number.isInteger(e.current_step) && Number.isInteger(e.step_count) && Array.isArray(e.difficulties) && Array.isArray(e.interruptions));
    runs.entries = valid.sort((a, b) => (a.started < b.started ? 1 : a.started > b.started ? -1 : a.id < b.id ? -1 : 1)).map(e => executionEntry(ctx, e, entries));
    if (valid.length !== listed.value.length) runs.note += ` ${listed.value.length - valid.length} stored execution(s) could not be read.`;
    if (!runs.entries.length) { runs.state = 'empty'; runs.text = 'No procedure has been started.'; }
  }
  sections.push(runs);
  return {state: 'ready', title: 'On board', sections, message: message ?? null, interactions: interactions(services)};
}

function interactions(services) {
  const run = async work => {
    const made = contextOf(services);
    if (!made.ok) return build(services, msg('error', made.error.message));
    const ctx = made.value;
    if (!ctx.writable) return build(services, msg('error', NOT_WRITABLE));
    if (!ctx.procedures || !ctx.newId) return build(services, msg('error', 'Procedures are not available yet.'));
    let result; try { result = await work(ctx); } catch { result = msg('error', 'Not saved: something went wrong.'); }
    return build(services, result);
  };
  const saved = (out, text) => (out.ok ? msg('info', text) : msg('error', `Not saved: ${out.error.message}`));
  return {
    start: procedureId => run(async ctx => {
      const found = ctx.procedure_list.find(item => item && item.id === procedureId);
      if (!found) return msg('error', 'Not started: choose one of the listed procedures.');
      const out = await ctx.procedures.start(ctx.store, found, ctx.config, {subject: ctx.subject, clock: ctx.clock, newId: ctx.newId});
      return out.ok && out.value.state === 'blocked' ? msg('error', `Blocked: this mission configuration lacks ${out.value.missing.join(', ')}.`) : saved(out, 'Started.');
    }),
    advance: id => run(async ctx => saved(await ctx.procedures.advance(ctx.store, id, {clock: ctx.clock}), 'Step recorded as done.')),
    interrupt: (id, reason) => run(async ctx => (isText(typeof reason === 'string' ? reason.trim() : '') ? saved(await ctx.procedures.interrupt(ctx.store, id, {reason: reason.trim(), clock: ctx.clock}), 'Interrupted. You can resume later.') : msg('error', 'Not saved: say why it was interrupted.'))),
    resume: id => run(async ctx => saved(await ctx.procedures.resume(ctx.store, id, {clock: ctx.clock}), 'Resumed at the same step.')),
    finish: (id, state, difficulty) => run(async ctx => {
      if (state === 'could_not') {
        if (!isText(typeof difficulty === 'string' ? difficulty.trim() : '')) return msg('error', 'Not saved: describe the difficulty.');
        return saved(await ctx.procedures.finish(ctx.store, id, {state, difficulties: [difficulty.trim()], clock: ctx.clock}), 'Saved: could not be completed, with the difficulty.');
      }
      return saved(await ctx.procedures.finish(ctx.store, id, {state, difficulties: [], clock: ctx.clock}), 'Finished.');
    })
  };
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  try { return await build(services, null); } catch { return {state: 'error', title: 'On board', message: 'On board could not be built.'}; }
}
