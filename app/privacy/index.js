// M19 privacy: a session flag and an append-only log of what was shared, with whom and when.
// This module does not change how data is stored and makes no claim about the safety of what is on the device.
// The log has no edit and no delete: the store refuses updates to `shared`, and this module offers none.
const MAX_TEXT = 500;
const MAX_WHAT = 100;
const fail = (code, field, message) => ({ok: false, error: {code, field, message}});
const ok = value => ({ok: true, value});
const isText = value => typeof value === 'string' && value.length > 0 && value.length <= MAX_TEXT;
const isPlain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isInstant = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(value) && !Number.isNaN(Date.parse(value));

/** createSession({ clock }) → { unlock(), active(), close() }. An active session never asks to unlock again. */
export function createSession(context) {
  if (!isPlain(context) || typeof context.clock !== 'function') throw new TypeError('createSession needs { clock }');
  let open = false;
  return Object.freeze({unlock() { open = true; }, active() { return open; }, close() { open = false; }});
}

/** logShared(store, { subject, what, with, channel }, { clock, newId, session? }) → Result<Shared>. With a session given, it must be active. */
export async function logShared(store, input, context) {
  if (!isPlain(store) || typeof store.save !== 'function') return fail('invalid_store', 'store', 'A store with save() is required');
  if (!isPlain(input)) return fail('invalid_input', 'input', 'An input { subject, what, with, channel } is required');
  if (!isText(input.subject)) return fail('invalid_input', 'subject', 'A subject is required; none is assumed');
  const what = input.what;
  if (!(isText(what) || (Array.isArray(what) && what.length > 0 && what.length <= MAX_WHAT && what.every(isText)))) return fail('invalid_input', 'what', 'what must say what was shared: a list of ids, or text');
  if (!isText(input.with)) return fail('invalid_input', 'with', 'with must say who it was shared with');
  if (!isText(input.channel)) return fail('invalid_input', 'channel', 'channel must say how it was shared');
  if (!isPlain(context) || typeof context.clock !== 'function' || typeof context.newId !== 'function') return fail('invalid_context', 'context', 'A clock and an id generator are required');
  if (context.session !== undefined && !(isPlain(context.session) && typeof context.session.active === 'function' && context.session.active() === true)) return fail('session_locked', 'session', 'Sharing needs an active session');
  let time; let id;
  try { time = context.clock(); id = context.newId(); } catch { return fail('invalid_context', 'context', 'The clock or the id generator failed'); }
  if (!isInstant(time)) return fail('invalid_clock', 'clock', 'The clock did not return an ISO8601 UTC instant');
  if (!isText(id)) return fail('invalid_id', 'newId', 'The id generator did not return text');
  return store.save('shared', {id, schema_version: 1, subject: input.subject, time, what: Array.isArray(what) ? [...what] : what, with: input.with, channel: input.channel});
}

/** sharedLog(store, { subject }) → Result<Shared[]>, oldest first. */
export async function sharedLog(store, query) {
  if (!isPlain(store) || typeof store.list !== 'function') return fail('invalid_store', 'store', 'A store with list() is required');
  if (!isPlain(query) || !isText(query.subject)) return fail('invalid_query', 'subject', 'A subject is required; none is assumed');
  const listed = await store.list('shared', {subject: query.subject}); if (!listed.ok) return listed;
  return ok([...listed.value].sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : a.id < b.id ? -1 : 1)));
}
