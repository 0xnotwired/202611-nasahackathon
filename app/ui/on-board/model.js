// On board: procedures with their equipment check, their executions step by step, and a minimal editor for writing a procedure.
// No DOM. Which procedures can start depends on the mission configuration; a blocked one names what is missing and offers no start.
// An execution is read against the exact version it started with (from the registry). A procedure written here is a draft,
// never reviewed guidance, and publishing never changes an earlier version. Nothing here is clinical content.
import {viewKit} from '../base/index.js';

const {contextOf, bannerSection, loadProcedures} = viewKit;
const isText = value => typeof value === 'string' && value.length > 0;
const msg = (kind, text) => ({kind, text});
const NOT_WRITABLE = 'Running or writing procedures is not available for this data source yet.';
const REVIEW_TEXT = Object.freeze({demo: 'demo: invented for the team demo, not reviewed guidance', draft: 'draft: written by a person, not reviewed guidance', reviewed: 'reviewed'});
const lines = value => (typeof value === 'string' ? value.split('\n').map(line => line.trim()).filter(Boolean) : []);
const slug = title => (typeof title === 'string' ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) : '') || 'procedure';

function procedureEntries(ctx, latest) {
  const door = ctx.procedures;
  const blocked = !ctx.writable ? NOT_WRITABLE : !door ? 'Procedures are not available yet.' : null;
  return latest.map(p => {
    const a = door.availability(p, ctx.config);
    const text = a.available ? 'The equipment for this procedure is in the mission configuration.' : a.missing.length ? `Blocked: this mission configuration lacks ${a.missing.join(', ')}.` : `Not available: ${a.problem ?? 'unknown reason'}`;
    return {kind: 'procedure', id: p.id, title: p.title, purpose: p.purpose, version: p.version, source: p.source, review_status: p.review_status, review_text: REVIEW_TEXT[p.review_status] ?? p.review_status,
      required_equipment: p.required_equipment, preparation: p.preparation, steps: p.steps.map(step => step.text), availability: {available: a.available, missing: a.missing, alternative_id: a.alternative_id ?? null, text},
      blocked_text: a.available ? null : text, actions: a.available ? [{id: 'start', label: 'Start', enabled: blocked === null, reason: blocked}] : []};
  });
}

function executionEntry(ctx, e, all) {
  const exact = all.find(p => p.id === e.procedure_id && p.version === e.procedure_version) ?? null;
  const latestTitle = [...all].reverse().find(p => p.id === e.procedure_id);
  const blocked = !ctx.writable ? NOT_WRITABLE : null;
  const done = e.current_step >= e.step_count;
  const stepText = e.state === 'completed' || e.state === 'could_not' || e.state === 'blocked' ? null
    : done ? 'Every step is done.' : exact ? `Next: ${exact.steps[e.current_step].text}` : `The text of version ${e.procedure_version} is not in this data source; the step number is ${e.current_step + 1} of ${e.step_count}.`;
  const stateText = {blocked: `blocked: missing ${(e.missing ?? []).join(', ') || 'equipment not stated'}`, in_progress: 'in progress', interrupted: `interrupted; ${e.current_step} of ${e.step_count} steps are done`, completed: 'completed', could_not: 'could not be completed'}[e.state];
  const actions = [];
  if (e.state === 'in_progress') actions.push({id: 'advance', label: 'Step done', enabled: !done && blocked === null, reason: done ? 'Every step is done' : blocked},
    {id: 'interrupt', label: 'Interrupt', enabled: blocked === null, reason: blocked, needs: 'reason'},
    {id: 'finish_completed', label: 'Finish', enabled: done && blocked === null, reason: done ? blocked : 'Steps remain'},
    {id: 'finish_could_not', label: 'I could not complete it', enabled: blocked === null, reason: blocked, needs: 'difficulty'});
  if (e.state === 'interrupted') actions.push({id: 'resume', label: 'Resume', enabled: blocked === null, reason: blocked, resume_at: e.current_step}, {id: 'finish_could_not', label: 'I could not complete it', enabled: blocked === null, reason: blocked, needs: 'difficulty'});
  return {kind: 'execution', id: e.id, procedure_id: e.procedure_id, title: (exact ?? latestTitle)?.title ?? e.procedure_id, procedure_version: e.procedure_version, state: e.state, state_text: stateText,
    progress_text: `${e.current_step} of ${e.step_count} steps done`, step_text: stepText && `Version ${e.procedure_version}. ${stepText}`, difficulties: [...e.difficulties], interruptions: e.interruptions.map(i => ({reason: i.reason, step: i.step})), actions};
}

async function build(services, message) {
  const made = contextOf(services);
  if (!made.ok) return {state: 'error', title: 'On board', message: made.error.message};
  const ctx = made.value;
  const loaded = await loadProcedures(ctx);
  const entries = procedureEntries(ctx, loaded.latest);
  const sections = [bannerSection(ctx)];
  const empty = loaded.problem ? loaded.problem : 'No procedure is listed in this data source.';
  sections.push({id: 'procedures', title: 'Procedures', state: loaded.problem ? 'error' : entries.length ? 'ready' : 'empty', text: empty, note: 'Check the equipment and the preparation before starting. Procedures here are demo or draft content, not medical guidance.', entries});
  const editorBlocked = !ctx.writable ? NOT_WRITABLE : !ctx.procedures || !ctx.newId ? 'Procedures are not available yet.' : null;
  sections.push({id: 'editor', title: 'Write a procedure', state: 'ready', note: 'A procedure written here is a draft, not reviewed guidance. Publishing a change makes a new version; earlier versions and the executions started on them are not changed.',
    existing: loaded.latest.map(p => ({id: p.id, title: p.title, version: p.version})), actions: {publish: {enabled: editorBlocked === null, reason: editorBlocked}}});
  const listed = await ctx.store.list('executions', {subject: ctx.subject});
  const runs = {id: 'executions', title: 'My executions', state: 'ready', note: 'Each execution is read against the procedure version it started with.', entries: []};
  if (!listed.ok) { runs.state = 'error'; runs.text = `Executions could not be read: ${listed.error.message}`; }
  else {
    const valid = listed.value.filter(e => e && Number.isInteger(e.current_step) && Number.isInteger(e.step_count) && Array.isArray(e.difficulties) && Array.isArray(e.interruptions));
    runs.entries = valid.sort((a, b) => (a.started < b.started ? 1 : a.started > b.started ? -1 : a.id < b.id ? -1 : 1)).map(e => executionEntry(ctx, e, loaded.all));
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
      const found = (await loadProcedures(ctx)).latest.find(item => item.id === procedureId);
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
    }),
    // input: { based_on?: id of an existing procedure (publishes its next version), title, purpose, equipment (comma-separated), preparation (one per line), steps (one per line) }
    publish: input => run(async ctx => {
      if (input === null || typeof input !== 'object' || Array.isArray(input)) return msg('error', 'Not published: fill in the form.');
      const {latest, all} = await loadProcedures(ctx);
      let id; let version;
      if (input.based_on !== undefined && input.based_on !== '') {
        if (!latest.some(p => p.id === input.based_on)) return msg('error', 'Not published: choose one of the listed procedures to change.');
        id = input.based_on;
        const numbers = all.filter(p => p.id === id).map(p => Number(p.version)).filter(Number.isInteger);
        version = String((numbers.length ? Math.max(...numbers) : all.filter(p => p.id === id).length) + 1);
      } else { id = `user-${slug(input.title)}-${ctx.newId()}`; version = '1'; }
      const equipment = typeof input.equipment === 'string' ? [...new Set(input.equipment.split(',').map(item => item.trim()).filter(Boolean))] : [];
      const procedure = {id, version, title: typeof input.title === 'string' ? input.title.trim() : '', purpose: typeof input.purpose === 'string' ? input.purpose.trim() : '', required_equipment: equipment, preparation: lines(input.preparation),
        steps: lines(input.steps).map((text, index) => ({id: `step-${index + 1}`, text})), source: 'user_entered', review_status: 'draft'};
      const out = await ctx.procedures.publishProcedure(ctx.store, procedure, {clock: ctx.clock});
      return saved(out, `Published version ${version} of "${procedure.title}" as a draft. Earlier versions are unchanged.`);
    })
  };
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  try { return await build(services, null); } catch { return {state: 'error', title: 'On board', message: 'On board could not be built.'}; }
}
