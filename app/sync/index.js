// M24 simulated sync: there is no network and no server. A delivery is created only from something already logged as shared
// (M19), moves according to the link mode and an injected clock, and is received once. A real server would implement these same functions.
const fail = (code, field, message) => ({ok: false, error: {code, field, message}});
const ok = value => ({ok: true, value});
const isText = value => typeof value === 'string' && value.length > 0 && value.length <= 500;
const isPlain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isInstant = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(value) && !Number.isNaN(Date.parse(value));
const MODES = Object.freeze(['real_time', 'delayed', 'no_link']);
const delayOk = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;

/** createLink({ mode, delay_ms? }) → Link. Invalid options throw: this is called once, where the application is assembled. */
export function createLink(options) {
  if (!isPlain(options) || !MODES.includes(options.mode)) throw new TypeError('createLink needs a mode: real_time, delayed or no_link');
  if (options.mode === 'delayed' && !delayOk(options.delay_ms)) throw new TypeError('A delayed link needs delay_ms, a number of milliseconds');
  let mode = options.mode; let delay = options.mode === 'delayed' ? options.delay_ms : null;
  return Object.freeze({
    mode: () => mode, delay_ms: () => delay,
    setMode(next, delayMs) {
      if (!MODES.includes(next)) return fail('invalid_mode', 'mode', 'mode must be real_time, delayed or no_link');
      if (next === 'delayed' && !delayOk(delayMs === undefined ? delay : delayMs)) return fail('delay_not_set', 'delay_ms', 'A delayed link needs a delay, in milliseconds');
      mode = next; if (next === 'delayed') delay = delayMs === undefined ? delay : delayMs;
      return ok({mode, delay_ms: delay});
    }
  });
}

const has = (store, names) => isPlain(store) && names.every(name => typeof store[name] === 'function');
const subjectQuery = query => (query === undefined || (isPlain(query) && (query.subject === undefined || isText(query.subject)))) ? ok(query?.subject) : fail('invalid_query', 'subject', 'subject must be non-empty text when given');
const byTime = (a, b) => (a.created < b.created ? -1 : a.created > b.created ? 1 : a.id < b.id ? -1 : 1);

// Deliveries are moved one advance at a time, so a delivery is never delivered twice.
let tail = Promise.resolve();
const serial = work => { const run = tail.then(work, work); tail = run.catch(() => {}); return run; };

/** enqueue(store, sharedId, { clock, newId }) → Result<Delivery>. Only a logged Shared entry can be enqueued; the same one gives the same delivery. */
export async function enqueue(store, sharedId, context) {
  if (!has(store, ['get', 'list', 'save'])) return fail('invalid_store', 'store', 'A store with get(), list() and save() is required');
  if (!isText(sharedId)) return fail('invalid_id', 'sharedId', 'A shared id is required');
  if (!isPlain(context) || typeof context.clock !== 'function' || typeof context.newId !== 'function') return fail('invalid_context', 'context', 'A clock and an id generator are required');
  return serial(async () => {
    const shared = await store.get('shared', sharedId);
    if (!shared.ok) return fail('not_shared', 'sharedId', 'Nothing was logged as shared with this id, so nothing can be sent');
    const existing = await store.list('deliveries', {shared_id: sharedId}); if (!existing.ok) return existing;
    if (existing.value.length) return ok(existing.value[0]);
    let created; let id;
    try { created = context.clock(); id = context.newId(); } catch { return fail('invalid_context', 'context', 'The clock or the id generator failed'); }
    if (!isInstant(created)) return fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
    if (!isText(id)) return fail('invalid_id', 'newId', 'The id generator did not return text');
    return store.save('deliveries', {id, schema_version: 2, shared_id: sharedId, subject: shared.value.subject, what: structuredClone(shared.value.what), created, state: 'queued'});
  });
}

/** advance(store, link, { clock }) → Result<Delivery[]>: moves what is due and returns the deliveries received by this call. */
export async function advance(store, link, context) {
  if (!has(store, ['list', 'updateState'])) return fail('invalid_store', 'store', 'A store with list() and updateState() is required');
  if (!isPlain(link) || typeof link.mode !== 'function' || typeof link.delay_ms !== 'function') return fail('invalid_link', 'link', 'A link from createLink() is required');
  if (!isPlain(context) || typeof context.clock !== 'function') return fail('invalid_context', 'clock', 'A clock is required');
  let now; try { now = context.clock(); } catch { return fail('invalid_clock', 'clock', 'The clock failed'); }
  if (!isInstant(now)) return fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
  return serial(async () => {
    const mode = link.mode(); const delay = link.delay_ms();
    const listed = await store.list('deliveries', {}); if (!listed.ok) return listed;
    const arrived = [];
    for (const d of listed.value.filter(item => item.state !== 'received').sort(byTime)) {
      let sent = d.sent; let state = d.state;
      if (mode === 'no_link') continue;
      if (mode === 'real_time') { sent = sent ?? now; state = 'received'; }
      else {
        if (state === 'queued') { sent = now; state = 'in_transit'; }
        if (state === 'in_transit' && Date.parse(now) >= Date.parse(sent) + delay) state = 'received';
      }
      if (state === d.state) continue;
      const changes = state === 'received' ? {state, sent, received: now} : {state, sent};
      const updated = await store.updateState('deliveries', d.id, changes); if (!updated.ok) return updated;
      if (state === 'received') arrived.push(updated.value);
    }
    return ok(arrived);
  });
}

/** received(store, { subject? }) → Result<Delivery[]>: what the ground panel sees. */
export async function received(store, query) {
  if (!has(store, ['list'])) return fail('invalid_store', 'store', 'A store with list() is required');
  const who = subjectQuery(query); if (!who.ok) return who;
  const listed = await store.list('deliveries', who.value === undefined ? {state: 'received'} : {state: 'received', subject: who.value}); if (!listed.ok) return listed;
  return ok([...listed.value].sort((a, b) => (a.received < b.received ? -1 : a.received > b.received ? 1 : a.id < b.id ? -1 : 1)));
}

/** deliveries(store, { subject? }) → Result<Delivery[]>: every delivery in any state, so a sender can see what is still queued or in transit. */
export async function deliveries(store, query) {
  if (!has(store, ['list'])) return fail('invalid_store', 'store', 'A store with list() is required');
  const who = subjectQuery(query); if (!who.ok) return who;
  const listed = await store.list('deliveries', who.value === undefined ? {} : {subject: who.value}); if (!listed.ok) return listed;
  return ok([...listed.value].sort(byTime));
}
