// I feel different: report what you notice, see what you recorded and what is missing before any suggestion, then summarize and share.
// No DOM. Data and gaps come first, in this order and in the screen's order. With no applicable rule the card says "There is no reviewed
// guidance for this". The module ships no rule. Generating the summary and sharing it are two separate steps; sharing asks for confirmation.
import {viewKit} from '../base/index.js';

const {contextOf, bannerSection, recordEntry} = viewKit;
const isText = value => typeof value === 'string' && value.length > 0;
const msg = (kind, text) => ({kind, text});
const NOT_WRITABLE = 'Recording is not available for this data source yet.';
const STATE_TEXT = Object.freeze({completed: 'completed', in_progress: 'in progress', blocked: 'blocked, equipment missing', could_not: 'could not be completed'});

function phaseName(ctx) {
  const phases = ctx.config && Array.isArray(ctx.config.phases) ? ctx.config.phases : [];
  const found = phases.find(phase => Date.parse(phase.from) <= ctx.now_ms && ctx.now_ms < Date.parse(phase.to));
  return found ? found.name : 'mission';
}
const modulesOk = ctx => Boolean(ctx.episode && ctx.copilot && ctx.summary);

async function openEpisodeOf(ctx) {
  const listed = await ctx.store.list('episodes', {subject: ctx.subject});
  if (!listed.ok) return null;
  return listed.value.filter(e => e.closed === undefined || e.closed === null || e.closed === false).sort((a, b) => (a.opened < b.opened ? 1 : a.opened > b.opened ? -1 : a.id < b.id ? -1 : 1))[0] ?? null;
}
async function historySection(ctx, blocked) {
  const base = {id: 'history', title: 'Earlier episodes', state: 'empty', text: 'No earlier episode.', items: []};
  if (typeof ctx.episode.listEpisodes !== 'function') return {...base, state: 'not_available', text: 'The episode history is not available yet.'};
  const listed = await ctx.episode.listEpisodes(ctx.store, {subject: ctx.subject});
  if (!listed.ok) return {...base, state: 'error', text: `The history could not be read: ${listed.error.message}`};
  const anyOpen = listed.value.some(e => !e.is_closed);
  const items = listed.value.filter(e => e.is_closed).map(e => ({id: e.id, text: `Opened ${e.opened}, closed ${e.closed === true ? '(time not stated)' : e.closed}${e.reopened.length ? `; reopened ${e.reopened.length} time(s), last reason: ${e.reopened[e.reopened.length - 1].reason}` : ''}`,
    reopen: {enabled: blocked === null && !anyOpen, reason: blocked ?? (anyOpen ? 'Another episode is open; close it first' : null)}}));
  return items.length ? {...base, state: 'ready', text: '', items} : base;
}
async function entriesFor(ctx, ids) {
  const out = [];
  for (const id of ids) { const f = await ctx.store.get('records', id); out.push(f.ok ? recordEntry(f.value, {clock: ctx.clock}) : {...recordEntry(null, {variable: id, label: id}), value_text: 'record not found'}); }
  return out;
}
const gapText = g => (g.kind === 'not_recorded' ? `${g.variable}: not recorded` : g.kind === 'equipment' ? `Equipment ${g.item} is not in this mission configuration (needed by ${g.needed_by.join(', ')})` : `${g.count} record(s) have no established time`);

async function build(services, message, extra) {
  const made = contextOf(services);
  if (!made.ok) return {state: 'error', title: 'I feel different', message: made.error.message};
  const ctx = made.value;
  const sections = [bannerSection(ctx)];
  if (!modulesOk(ctx)) { sections.push({id: 'start', title: 'I feel different', state: 'not_available', text: 'Episodes are not available yet.'}); return {state: 'ready', title: 'I feel different', sections, message: message ?? null, summary: null, actions: {}, interactions: interactions(services)}; }
  const blocked = !ctx.writable ? NOT_WRITABLE : !ctx.core || !ctx.newId ? 'Recording needs the core and an identifier generator, which are not available.' : null;
  const current = await openEpisodeOf(ctx);
  if (!current) {
    const observations = ctx.catalogs && typeof ctx.catalogs.observations === 'function' ? ctx.catalogs.observations().map(({id, label}) => ({id, label})) : [];
    sections.push({id: 'start', title: 'What do you notice?', state: 'ready', note: 'Choose what fits best. This records what you report; it is not a diagnosis. You can ask for help without choosing.', options: observations,
      actions: {open: {enabled: blocked === null, reason: blocked}, help: {enabled: blocked === null, reason: blocked}}});
    sections.push(await historySection(ctx, blocked));
    return {state: 'ready', title: 'I feel different', sections, message: message ?? null, summary: null, actions: {}, interactions: interactions(services)};
  }
  const s = await ctx.episode.situation(ctx.store, current.id, ctx.config, {clock: ctx.clock});
  if (s.ok === false) { sections.push({id: 'episode', title: 'Open episode', state: 'error', text: `The episode could not be read: ${s.error.message}`}); return {state: 'ready', title: 'I feel different', sections, message: message ?? null, summary: null, actions: {close: {enabled: blocked === null, reason: blocked}}, interactions: interactions(services)}; }
  const card = ctx.copilot.card(s, ctx.config, ctx.rules);
  sections.push({id: 'episode', title: 'Open episode', state: 'ready', note: `Opened ${current.opened}.${s.alert_issued ? ' An alert was already issued for it.' : ''}`});
  sections.push({id: 'data', title: 'What you recorded and what is known', state: 'ready', note: 'Each value shows its method, time and origin.', entries: await entriesFor(ctx, card.data.map(item => item.id))});
  const gaps = {id: 'gaps', title: 'What is missing', state: card.gaps.length ? 'ready' : 'empty', text: s.why_empty.missing ?? '', items: card.gaps.map(g => ({text: gapText(g)}))};
  sections.push(gaps);
  sections.push({id: 'suggestion', title: 'Suggestion', state: 'ready', note: 'A suggestion comes only from a rule with a source, a version and a review status.', text: card.no_guidance ? 'There is no reviewed guidance for this.' : null,
    suggestion: card.suggestion ? {text: card.suggestion.text, source_text: `${card.suggestion.source} · version ${card.suggestion.version} · ${card.suggestion.review_status}`, reviewed: card.suggestion.review_status === 'reviewed',
      caution: card.suggestion.review_status === 'reviewed' ? null : `This rule is marked "${card.suggestion.review_status}": it has not been reviewed, so it is not reviewed guidance.`} : null, not_assessed: card.not_assessed, alert: card.alert});
  sections.push({id: 'you_can', title: 'What you can do', state: s.you_can.length ? 'ready' : 'empty', text: s.why_empty.you_can ?? '', note: 'Procedures run from On board.',
    items: s.you_can.map(c => ({id: c.procedure_id, text: `${c.title} (version ${c.version}): ${c.available ? 'the equipment is in the mission configuration' : `blocked, this mission configuration lacks ${c.missing.join(', ')}`}`, available: c.available, missing: c.missing}))});
  sections.push({id: 'happened', title: 'What happened', state: s.happened.length ? 'ready' : 'empty', text: s.why_empty.happened ?? '',
    items: s.happened.map(h => ({id: h.id, text: `${h.procedure_id} version ${h.procedure_version}: ${h.state === 'interrupted' ? `interrupted after ${h.current_step} of ${h.step_count} steps` : STATE_TEXT[h.state] ?? h.state}${h.difficulties.length ? ` (difficulty: ${h.difficulties.join('; ')})` : ''}`}))});
  sections.push({id: 'next', title: 'What is next', state: s.next.length ? 'ready' : 'empty', text: s.why_empty.next ?? '', items: s.next.map(t => ({id: t.id, text: `Pending: ${t.description}`}))});
  const execs = await ctx.store.list('executions', {subject: ctx.subject}); const tasks = await ctx.store.list('tasks', {subject: ctx.subject, completion: 'pending'});
  sections.push({id: 'link', title: 'Link something to this episode', state: 'ready', executions: (execs.ok ? execs.value : []).filter(e => !current.execution_ids.includes(e.id)).map(e => ({id: e.id, label: `${e.procedure_id} version ${e.procedure_version} (${e.state})`})),
    tasks: (tasks.ok ? tasks.value : []).filter(t => !current.task_ids.includes(t.id)).map(t => ({id: t.id, label: t.description}))});
  sections.push(await historySection(ctx, blocked));
  const summary = extra && extra.summary ? extra.summary : null;
  if (summary) sections.push({id: 'summary', title: 'Summary for the ground', state: 'ready', text: summary.text, note: summary.pending_send ? 'This link does not deliver at once, so the summary stands on its own. Generating it sent nothing.' : 'Generating it sent nothing.'});
  return {state: 'ready', title: 'I feel different', sections, message: message ?? null, summary, actions: {close: {enabled: blocked === null, reason: blocked}, share: {enabled: blocked === null && Boolean(ctx.sync && ctx.privacy && ctx.session), reason: blocked ?? (ctx.sync && ctx.privacy && ctx.session ? null : 'Sharing is not available yet.')}}, interactions: interactions(services)};
}

function interactions(services) {
  const run = (work, keep) => async (...args) => {
    const made = contextOf(services);
    if (!made.ok) return build(services, msg('error', made.error.message));
    const ctx = made.value;
    if (!ctx.writable) return build(services, msg('error', NOT_WRITABLE));
    if (!modulesOk(ctx) || !ctx.core || !ctx.newId) return build(services, msg('error', 'Episodes are not available yet.'));
    let out; try { out = await work(ctx, ...args); } catch { out = {message: msg('error', 'Not done: something went wrong.')}; }
    return build(services, out.message, {summary: out.summary ?? null});
  };
  const saved = (res, text) => (res.ok ? msg('info', text) : msg('error', `Not done: ${res.error.message}`));
  async function startEpisode(ctx, variable) {
    if (await openEpisodeOf(ctx)) return {ok: false, error: {message: 'an episode is already open; close it first'}};
    const observations = ctx.catalogs.observations();
    if (!observations.some(item => item.id === variable)) return {ok: false, error: {message: 'choose one of the listed symptoms'}};
    const created = ctx.core.createRecord({type: 'observation', state: 'recorded', variable, method: 'self_report', origin: ctx.record_origin, source: 'user_entered', mission_phase: phaseName(ctx), subject: ctx.subject}, {clock: ctx.clock, newId: ctx.newId});
    if (!created.ok) return created;
    const stored = await ctx.store.save('records', created.value); if (!stored.ok) return stored;
    const opened = await ctx.episode.open(ctx.store, stored.value, {clock: ctx.clock, newId: ctx.newId});
    return opened.ok ? opened : {ok: false, error: {message: `the observation was saved but the episode could not be opened: ${opened.error.message}`}};
  }
  const current = ctx => openEpisodeOf(ctx);
  return {
    open: run(async (ctx, variable) => ({message: saved(await startEpisode(ctx, variable), 'Recorded, and an episode is open. This is what you reported, not a diagnosis.')})),
    askHelp: run(async ctx => {
      const opened = await startEpisode(ctx, 'other'); if (!opened.ok) return {message: saved(opened, '')};
      const alert = await ctx.episode.issueAlert(ctx.store, opened.value.id);
      return {message: alert.ok ? msg('info', 'Help was requested and the alert was issued. This device has no network here: share the episode with the ground from this screen.') : saved(alert, '')};
    }),
    acknowledgeAlert: run(async ctx => { const e = await current(ctx); if (!e) return {message: msg('error', 'Not done: no episode is open.')}; const r = await ctx.episode.issueAlert(ctx.store, e.id); return {message: saved(r, r.ok && r.value.issued ? 'The alert was marked as issued.' : 'The alert had already been issued.')}; }),
    link: run(async (ctx, input) => { const e = await current(ctx); if (!e) return {message: msg('error', 'Not done: no episode is open.')}; return {message: saved(await ctx.episode.link(ctx.store, e.id, input), 'Linked.')}; }),
    generateSummary: run(async ctx => {
      const e = await current(ctx); if (!e) return {message: msg('error', 'Not done: no episode is open.')};
      const g = await ctx.summary.generate(ctx.store, e.id, ctx.config, {clock: ctx.clock});
      return g.ok ? {message: msg('info', 'Summary generated. Nothing was sent.'), summary: g.value} : {message: saved(g, '')};
    }),
    shareWithGround: run(async (ctx, input) => {
      if (!input || input.confirmed !== true) return {message: msg('error', 'Not shared: confirm that you want to send this episode\'s records to the ground panel (simulated).')};
      if (!(ctx.sync && ctx.privacy && ctx.session)) return {message: msg('error', 'Sharing is not available yet.')};
      const e = await current(ctx); if (!e) return {message: msg('error', 'Not done: no episode is open.')};
      ctx.session.unlock();
      const logged = await ctx.privacy.logShared(ctx.store, {subject: ctx.subject, what: [e.observation_id, ...e.record_ids], with: 'ground panel (simulated)', channel: 'simulated sync'}, {clock: ctx.clock, newId: ctx.newId, session: ctx.session});
      if (!logged.ok) return {message: saved(logged, '')};
      const queued = await ctx.sync.enqueue(ctx.store, logged.value.id, {clock: ctx.clock, newId: ctx.newId});
      return {message: queued.ok ? msg('info', 'Shared: logged and queued. It moves when the link allows it; see the Ground panel.') : msg('error', `The share was logged but could not be queued: ${queued.error.message}`)};
    }),
    reopenEpisode: run(async (ctx, episodeId, reason) => {
      if (typeof ctx.episode.reopen !== 'function') return {message: msg('error', 'Reopening is not available yet.')};
      if (!isText(typeof reason === 'string' ? reason.trim() : '')) return {message: msg('error', 'Not done: say why the episode is being reopened.')};
      return {message: saved(await ctx.episode.reopen(ctx.store, episodeId, {reason: reason.trim(), clock: ctx.clock}), 'The episode is open again. The earlier close stays in its history.')};
    }),
    closeEpisode: run(async ctx => { const e = await current(ctx); if (!e) return {message: msg('error', 'Not done: no episode is open.')}; return {message: saved(await ctx.episode.close(ctx.store, e.id, {clock: ctx.clock}), 'The episode was closed.')}; })
  };
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  try { return await build(services, null, null); } catch { return {state: 'error', title: 'I feel different', message: 'This view could not be built.'}; }
}
