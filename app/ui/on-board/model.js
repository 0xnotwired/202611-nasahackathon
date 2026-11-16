// On board: procedures with their equipment check, their executions step by step, and a minimal editor for writing a procedure.
// No DOM. Which procedures can start depends on the mission configuration; a blocked one names what is missing and offers no start.
// An execution is read against the exact version it started with (from the registry). A procedure written here is a draft,
// never reviewed guidance, and publishing never changes an earlier version. Nothing here is clinical content.
import {viewKit} from '../base/index.js';

const {contextOf, bannerSection, loadProcedures, variablesOfType} = viewKit;
const isText = value => typeof value === 'string' && value.length > 0;
const msg = (kind, text) => ({kind, text});
const NOT_WRITABLE = 'Running or writing procedures is not available for this data source yet.';
const REVIEW_TEXT = Object.freeze({demo: 'demo: invented for the team demo, not reviewed guidance', draft: 'draft: written by a person, not reviewed guidance', reviewed: 'reviewed'});
const phaseName = ctx => {
  const phases = ctx.config && Array.isArray(ctx.config.phases) ? ctx.config.phases : [];
  const found = phases.find(phase => Date.parse(phase.from) <= ctx.now_ms && ctx.now_ms < Date.parse(phase.to));
  return found ? found.name : 'mission';
};
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
      blocked_text: a.available ? null : text, needs_preparation: a.available && p.preparation.length > 0, documented_alternative: p.documented_alternative ?? null,
      step_variables: p.steps.map(step => step.records ?? null),
      actions: [...(a.available ? [{id: 'start', label: 'Start', enabled: blocked === null, reason: blocked, needs: p.preparation.length ? 'preparation' : null}] : []), {id: 'retire', label: 'Retire this version', enabled: blocked === null, reason: blocked, needs: 'reason'}]};
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
  const declared = Array.isArray(e.step_records) ? e.step_records[e.current_step] ?? null : null;
  const catalog = declared ? variablesOfType(ctx, ['measurement', 'exam']).find(item => item.id === declared) : null;
  const recordForm = !done && declared ? {variable: declared, label: catalog ? catalog.label : declared, unit: catalog && catalog.unit !== 'as_recorded' ? catalog.unit : null, needs_unit: !catalog || catalog.unit === 'as_recorded'} : null;
  const actions = [];
  if (e.state === 'in_progress') actions.push({id: 'advance', label: recordForm ? 'Record and step done' : 'Step done', enabled: !done && blocked === null, reason: done ? 'Every step is done' : blocked, needs: recordForm ? 'record' : null},
    ...(recordForm ? [{id: 'advance_no_record', label: 'Step done without recording', enabled: blocked === null, reason: blocked}] : []),
    {id: 'interrupt', label: 'Interrupt', enabled: blocked === null, reason: blocked, needs: 'reason'},
    {id: 'finish_completed', label: 'Finish', enabled: done && blocked === null, reason: done ? blocked : 'Steps remain'},
    {id: 'finish_could_not', label: 'I could not complete it', enabled: blocked === null, reason: blocked, needs: 'difficulty'});
  if (e.state === 'interrupted') actions.push({id: 'resume', label: 'Resume', enabled: blocked === null, reason: blocked, resume_at: e.current_step}, {id: 'finish_could_not', label: 'I could not complete it', enabled: blocked === null, reason: blocked, needs: 'difficulty'});
  return {kind: 'execution', id: e.id, procedure_id: e.procedure_id, title: (exact ?? latestTitle)?.title ?? e.procedure_id, procedure_version: e.procedure_version, state: e.state, state_text: stateText,
    progress_text: `${e.current_step} of ${e.step_count} steps done${(e.unrecorded_steps ?? []).length ? `; ${(e.unrecorded_steps ?? []).length} without the value they ask for` : ''}`, record_form: recordForm, unrecorded_steps: [...(e.unrecorded_steps ?? [])], step_text: stepText && `Version ${e.procedure_version}. ${stepText}`, difficulties: [...e.difficulties], interruptions: e.interruptions.map(i => ({reason: i.reason, step: i.step})), actions};
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
    existing: loaded.latest.map(p => ({id: p.id, title: p.title, version: p.version})), recordable: variablesOfType(ctx, ['measurement']).map(({id, label}) => ({id, label})),
    step_syntax: 'One step per line. To make a step record a value, end it with | records=VARIABLE (for example: Take your pulse | records=pulse).', actions: {publish: {enabled: editorBlocked === null, reason: editorBlocked}}});
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
    // input: { confirmed } is the person's confirmation that every preparation check was done.
    start: (procedureId, input) => run(async ctx => {
      const found = (await loadProcedures(ctx)).latest.find(item => item.id === procedureId);
      if (!found) return msg('error', 'Not started: choose one of the listed procedures.');
      const out = await ctx.procedures.start(ctx.store, found, ctx.config, {subject: ctx.subject, clock: ctx.clock, newId: ctx.newId, preparation_confirmed: Boolean(input && input.confirmed === true)});
      return out.ok && out.value.state === 'blocked' ? msg('error', `Blocked: this mission configuration lacks ${out.value.missing.join(', ')}.`) : saved(out, 'Started.');
    }),
    // input: { value, unit?, method? } records the step's variable and links it; { no_record: true } says nothing was recorded for the step.
    advance: (id, input) => run(async ctx => {
      const found = await ctx.store.get('executions', id);
      if (!found.ok) return msg('error', 'Not saved: no execution has this id.');
      if (found.value.state !== 'in_progress') return msg('error', `Not saved: this execution is ${found.value.state.replace('_', ' ')}, not in progress. Nothing was recorded.`);
      const declared = (Array.isArray(found.value.step_records) ? found.value.step_records[found.value.current_step] : null) ?? null;
      if (!declared) return saved(await ctx.procedures.advance(ctx.store, id, {clock: ctx.clock}), 'Step done.');
      if (input && input.no_record === true) return saved(await ctx.procedures.advance(ctx.store, id, {clock: ctx.clock, no_record: true}), 'Step done. Nothing was recorded for it, and the execution says so.');
      if (!input || input.value === undefined) return msg('error', `Not saved: this step records ${declared}. Enter the value, or choose "Step done without recording".`);
      if (!ctx.core) return msg('error', 'Recording needs the core, which is not available.');
      if (!isText(typeof input.method === 'string' ? input.method.trim() : '')) return msg('error', 'Not saved: say how it was measured (the method); none is assumed.');
      if (typeof input.value !== 'number' || !Number.isFinite(input.value)) return msg('error', 'Not saved: the value must be a number.');
      const catalog = variablesOfType(ctx, ['measurement', 'exam']).find(item => item.id === declared);
      const unit = catalog && catalog.unit !== 'as_recorded' ? catalog.unit : (typeof input.unit === 'string' ? input.unit.trim() : '');
      if (!isText(unit)) return msg('error', `Not saved: ${catalog ? catalog.label : declared} needs the unit it was recorded in.`);
      const created = ctx.core.createRecord({type: 'measurement', state: 'recorded', variable: declared, value: input.value, unit, method: input.method.trim(), origin: ctx.record_origin, source: 'user_entered', mission_phase: phaseName(ctx), subject: ctx.subject}, {clock: ctx.clock, newId: ctx.newId});
      if (!created.ok) return msg('error', `Not saved: ${created.error.message}`);
      const record = await ctx.store.save('records', created.value);
      if (!record.ok) return msg('error', `Not saved: ${record.error.message}`);
      const out = await ctx.procedures.advance(ctx.store, id, {clock: ctx.clock, record: created.value.id});
      return out.ok ? msg('info', `Recorded ${declared} and moved to the next step.`) : msg('error', `The value was saved as a record, but the step could not be advanced: ${out.error.message}`);
    }),
    retire: (procedureId, reason) => run(async ctx => {
      const found = (await loadProcedures(ctx)).latest.find(item => item.id === procedureId);
      if (!found) return msg('error', 'Not retired: choose one of the listed procedures.');
      if (!isText(typeof reason === 'string' ? reason.trim() : '')) return msg('error', 'Not retired: say why this version is retired.');
      return saved(await ctx.procedures.retireProcedure(ctx.store, found.id, found.version, {clock: ctx.clock, reason: reason.trim()}), `Retired version ${found.version}. It is no longer offered; executions that used it still read it.`);
    }),    interrupt: (id, reason) => run(async ctx => (isText(typeof reason === 'string' ? reason.trim() : '') ? saved(await ctx.procedures.interrupt(ctx.store, id, {reason: reason.trim(), clock: ctx.clock}), 'Interrupted. You can resume later.') : msg('error', 'Not saved: say why it was interrupted.'))),
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
      const recordable = new Set(variablesOfType(ctx, ['measurement']).map(item => item.id));
      const steps = [];
      for (const [index, line] of lines(input.steps).entries()) {
        const match = line.match(/^(.*?)\s*\|\s*records=([A-Za-z0-9_]+)\s*$/);
        if (match && !recordable.has(match[2])) return msg('error', `Not published: step ${index + 1} records ${match[2]}, which is not a measurement variable of the catalog.`);
        steps.push({id: `step-${index + 1}`, text: match ? match[1] : line, ...(match ? {records: match[2]} : {})});
      }
      const alternative = isText(input.alternative) ? input.alternative : null;
      if (alternative && (!latest.some(p => p.id === alternative) || alternative === id)) return msg('error', 'Not published: the alternative must be another listed procedure.');
      const equipment = typeof input.equipment === 'string' ? [...new Set(input.equipment.split(',').map(item => item.trim()).filter(Boolean))] : [];
      const procedure = {id, version, title: typeof input.title === 'string' ? input.title.trim() : '', purpose: typeof input.purpose === 'string' ? input.purpose.trim() : '', required_equipment: equipment, preparation: lines(input.preparation),
        steps, source: 'user_entered', review_status: 'draft', ...(alternative ? {documented_alternative: alternative} : {})};
      const out = await ctx.procedures.publishProcedure(ctx.store, procedure, {clock: ctx.clock});
      return saved(out, `Published version ${version} of "${procedure.title}" as a draft. Earlier versions are unchanged.`);
    })
  };
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  try { return await build(services, null); } catch { return {state: 'error', title: 'On board', message: 'On board could not be built.'}; }
}
