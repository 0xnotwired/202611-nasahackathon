// Ground panel (simulated sync): what was shared, what is still queued or in transit, and what the ground panel has received.
// No DOM. There is no network: the link follows the mission configuration and only moves what was logged as shared. A subject that
// sent nothing reads "Nothing sent". Records keep their state and origin on the way, so a "not recorded" arrives as "not recorded".
import {viewKit} from '../base/index.js';

const {contextOf, bannerSection, recordEntry, variablesOfType} = viewKit;
const MODES = Object.freeze(['real_time', 'delayed', 'no_link']);
const MODE_TEXT = Object.freeze({real_time: 'real time: deliveries arrive when delivered', delayed: 'delayed: deliveries arrive after the delay', no_link: 'no link: deliveries stay queued'});
const MAX_CHOICES = 30;
const MAX_SHARE = 50;
const HOUR_MS = 3600000;
const isText = value => typeof value === 'string' && value.length > 0;
const msg = (kind, text) => ({kind, text});
const NOT_WRITABLE = 'Sharing is not available for this data source yet.';
const NOTE = 'Simulated sync: there is no network and no server, and nothing leaves this device. Only what you share here is queued, and only if the link allows it.';

function syncLink(ctx) {
  const {link, sync} = ctx;
  if (!link || !sync || typeof link.mode !== 'function') return {state: 'not_available', text: 'The simulated link is not available yet.'};
  const wanted = ctx.config && MODES.includes(ctx.config.communication) ? ctx.config.communication : null;
  let needsDelay = false;
  if (wanted === 'delayed' && link.delay_ms() === null) { link.setMode('no_link'); needsDelay = true; }
  else if (wanted) link.setMode(wanted, wanted === 'delayed' ? link.delay_ms() : undefined);
  else link.setMode('no_link');
  const demo = ctx.data_source && ctx.data_source.synthetic === true;
  return {state: 'ready', mode: link.mode(), mode_text: needsDelay ? 'delayed: the link is down until a delay is set' : MODE_TEXT[link.mode()], configured: wanted, needs_delay: needsDelay, delay_minutes: link.delay_ms() === null ? null : link.delay_ms() / 60000,
    note: `${NOTE}${wanted ? ` The link follows the mission configuration (${wanted.replace('_', ' ')}).` : ' The mission configuration does not state its link, so the link is down.'}${needsDelay ? ' Set the delay to start moving deliveries.' : ''}${demo && wanted === 'delayed' ? ' The demo clock does not move, so a delayed delivery stays in transit here.' : ''}`};
}

async function deliveryEntry(ctx, d) {
  const ids = Array.isArray(d.what) ? d.what : [];
  const items = []; const summaries = [];
  for (const id of ids) {
    if (typeof id === 'string' && id.startsWith('summary:')) { const s = await ctx.store.get('summaries', id.slice(8)); summaries.push(s.ok && s.value.subject === d.subject ? {id: s.value.id, text: s.value.text} : {id: id.slice(8), text: null}); continue; }
    const found = await ctx.store.get('records', id);
    items.push(found.ok && found.value.subject === d.subject ? recordEntry(found.value, {clock: ctx.clock}) : {...recordEntry(null, {variable: id, label: id}), value_text: 'record not found in this data source', text: `${id}: record not found in this data source`});
  }
  const hours = Math.floor((ctx.now_ms - Date.parse(d.created)) / HOUR_MS);
  return {kind: 'delivery', id: d.id, state: d.state, state_text: {queued: 'queued: waiting for the link', in_transit: 'in transit', received: 'received by the ground panel'}[d.state] ?? d.state,
    created_text: d.created, sent_text: d.sent ?? 'not sent yet', received_text: d.received ?? 'not received yet', age_text: hours < 1 ? 'Data created less than 1 h ago' : `Data created ${hours} h ago`,
    what_text: Array.isArray(d.what) ? `${items.length} ${items.length === 1 ? 'record' : 'records'}${summaries.length ? ` and ${summaries.length} summary` : ''}` : String(d.what), items, summaries};
}

async function choicesOf(ctx) {
  const listed = await ctx.store.list('records', {subject: ctx.subject});
  if (!listed.ok) return {problem: listed.error.message, choices: []};
  const labels = new Map(variablesOfType(ctx, ['measurement', 'observation', 'exam', 'action']).map(item => [item.id, item.label]));
  const own = listed.value.filter(record => record.type !== 'environment').sort((a, b) => {
    const ta = Date.parse(a.time ?? ''); const tb = Date.parse(b.time ?? '');
    if (Number.isNaN(ta) !== Number.isNaN(tb)) return Number.isNaN(ta) ? 1 : -1;
    return (tb - ta) || (a.id < b.id ? -1 : 1);
  }).slice(0, MAX_CHOICES);
  return {choices: own.map(record => { const e = recordEntry(record, {clock: ctx.clock, label: labels.get(record.variable)}); return {id: record.id, label: `${e.label}: ${e.value_text} (${record.time ?? 'time not established'})`}; })};
}

async function build(services, message) {
  const made = contextOf(services);
  if (!made.ok) return {state: 'error', title: 'Ground panel', message: made.error.message};
  const ctx = made.value;
  const link = {id: 'link', title: 'Link (simulated sync)', ...syncLink(ctx)};
  const ready = ctx.sync && ctx.privacy && ctx.link && ctx.session;
  const blocked = !ctx.writable ? NOT_WRITABLE : !ready || !ctx.newId ? 'Sharing is not available yet.' : null;
  const {choices, problem} = await choicesOf(ctx);
  const share = {id: 'share', title: 'Share with the ground panel (simulated)', state: problem ? 'error' : 'ready', text: problem ? `Records could not be read: ${problem}` : '', note: 'Sharing is a separate step from recording. Each share is logged with what, with whom and when. A record keeps its state: a not-recorded entry arrives as not recorded.', choices,
    actions: {share: {enabled: blocked === null && choices.length > 0, reason: blocked ?? (choices.length ? null : 'There is nothing to share yet')}, advance: {enabled: Boolean(ready) && ctx.writable, reason: ctx.writable ? (ready ? null : 'Sharing is not available yet.') : NOT_WRITABLE}}};
  const sent = {id: 'sent', title: 'What I sent', state: 'ready', note: 'Every delivery with its creation, send and receive time, and the age of its data.', entries: []};
  const ground = {id: 'ground', title: 'What the ground panel has received', state: 'ready', entries: []};
  if (!ready) { for (const part of [sent, ground]) { part.state = 'not_available'; part.text = 'The simulated sync is not available yet.'; } }
  else {
    const all = await ctx.sync.deliveries(ctx.store, {subject: ctx.subject});
    if (!all.ok) { for (const part of [sent, ground]) { part.state = 'error'; part.text = `Deliveries could not be read: ${all.error.message}`; } }
    else {
      const entries = await Promise.all(all.value.map(d => deliveryEntry(ctx, d)));
      sent.entries = entries; ground.entries = entries.filter(e => e.state === 'received');
      if (!entries.length) { sent.state = 'empty'; sent.text = 'Nothing sent.'; ground.state = 'empty'; ground.text = 'Nothing sent. The ground panel has received nothing from this subject.'; }
      else if (!ground.entries.length) { ground.state = 'empty'; ground.text = `Nothing has arrived yet: ${entries.length} ${entries.length === 1 ? 'delivery is' : 'deliveries are'} queued or in transit.`; }
    }
  }
  return {state: 'ready', title: 'Ground panel', sections: [bannerSection(ctx), link, share, sent, ground], message: message ?? null, interactions: interactions(services)};
}

function interactions(services) {
  const run = async work => {
    const made = contextOf(services);
    if (!made.ok) return build(services, msg('error', made.error.message));
    const ctx = made.value;
    if (!ctx.writable) return build(services, msg('error', NOT_WRITABLE));
    if (!(ctx.sync && ctx.privacy && ctx.link && ctx.session && ctx.newId)) return build(services, msg('error', 'Sharing is not available yet.'));
    let result; try { result = await work(ctx); } catch { result = msg('error', 'Not done: something went wrong.'); }
    return build(services, result);
  };
  return {
    share: input => run(async ctx => {
      if (input === null || typeof input !== 'object' || Array.isArray(input)) return msg('error', 'Not shared: choose what to share.');
      if (input.confirmed !== true) return msg('error', 'Not shared: confirm that you want to send these to the ground panel (simulated).');
      const ids = input.ids;
      if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_SHARE || !ids.every(isText)) return msg('error', 'Not shared: choose between one and fifty records.');
      for (const id of ids) { const found = await ctx.store.get('records', id); if (!found.ok || found.value.subject !== ctx.subject) return msg('error', 'Not shared: only your own records can be shared.'); }
      ctx.session.unlock();
      const logged = await ctx.privacy.logShared(ctx.store, {subject: ctx.subject, what: [...ids], with: 'ground panel (simulated)', channel: 'simulated sync'}, {clock: ctx.clock, newId: ctx.newId, session: ctx.session});
      if (!logged.ok) return msg('error', `Not shared: ${logged.error.message}`);
      const queued = await ctx.sync.enqueue(ctx.store, logged.value.id, {clock: ctx.clock, newId: ctx.newId});
      return queued.ok ? msg('info', 'Shared: logged and queued. It moves when the link allows it.') : msg('error', `The share was logged but could not be queued: ${queued.error.message}`);
    }),
    advance: () => run(async ctx => {
      syncLink(ctx);
      if (ctx.link.mode() === 'no_link') return msg('info', 'The link is down, so deliveries stay queued. Nothing was lost.');
      const moved = await ctx.sync.advance(ctx.store, ctx.link, {clock: ctx.clock});
      return moved.ok ? msg('info', moved.value.length ? `${moved.value.length} ${moved.value.length === 1 ? 'delivery' : 'deliveries'} received by the ground panel.` : 'Nothing was due.') : msg('error', `Not delivered: ${moved.error.message}`);
    }),
    setDelay: minutes => run(async ctx => {
      if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 0 || minutes > 10080) return msg('error', 'Not set: the delay is a number of minutes from 0 to 10080.');
      const out = ctx.link.setMode('delayed', Math.round(minutes * 60000));
      return out.ok ? msg('info', `Delay set to ${minutes} minutes. It applies when the mission configuration has a delayed link.`) : msg('error', `Not set: ${out.error.message}`);
    })
  };
}

/** model(services, params) → ViewModel. Hostile or incomplete services give an error view model, never an exception. */
export async function model(services) {
  try { return await build(services, null); } catch { return {state: 'error', title: 'Ground panel', message: 'The ground panel could not be built.'}; }
}
