// Shell model: navigation, storage notice, configuration selector and the state of the current view.
// No DOM and no imports from other modules. Collaborators (store, readings, view modules) are injected
// by the composition root (start.js), because M07 depends only on M00.
import {ownValue} from './labels.js';

export const PLANNED_VIEWS = Object.freeze([
  ['my-health', 'My health'], ['adaptation', 'Adaptation'], ['habitat', 'Habitat'], ['my-progress', 'My progress'], ['my-day', 'My day'],
  ['my-plan', 'My plan'], ['on-board', 'On board'], ['i-feel-different', 'I feel different'], ['nasa-cases', 'NASA cases'], ['review', 'Review and export'], ['ground', 'Ground panel (simulated sync)']
].map(([id, label]) => Object.freeze({id, label, folder: `app/ui/${id}/`})));

const fail = (code, field, message) => ({ok: false, error: {code, field, message}});
const isText = value => typeof value === 'string' && value.length > 0;
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);

/** A visible line about where data lives. Never silent, never a promise of protection. */
export function storageNotice(status, fallbackReason) {
  const kind = ownValue(status, 'kind');
  const persistent = ownValue(status, 'persistent');
  const known = ['indexeddb', 'memory'].includes(kind) && typeof persistent === 'boolean';
  if (!known) return {kind: 'warning', text: 'Storage state unknown: nothing is promised about whether data is kept.'};
  if (persistent) return {kind: 'info', text: 'Saved in this browser on this device. It is not encrypted.'};
  const reason = ownValue(status, 'reason');
  const why = [fallbackReason, reason].filter(isText).join(' ');
  return {kind: 'warning', text: `Not saved: this session keeps data in memory only and it disappears when the page closes.${why ? ` Reason: ${why}` : ''}`};
}

const COMMUNICATION = Object.freeze({real_time: 'real-time link', delayed: 'delayed link', no_link: 'no link'});

/** The data sources a person can look at. Nothing is selected unless the caller says which. */
export function sourceSelector(sources, selectedId) {
  const list = Array.isArray(sources) ? sources.filter(source => plain(source) && isText(ownValue(source, 'id'))) : [];
  const options = list.map(source => ({id: ownValue(source, 'id'), label: isText(ownValue(source, 'label')) ? ownValue(source, 'label') : ownValue(source, 'id'),
    detail: ownValue(source, 'synthetic') === true ? 'fictional data kept in memory for this page' : 'records saved in this browser'}));
  return {options, selected_id: options.some(option => option.id === selectedId) ? selectedId : null};
}

export function configSelector(configs, selectedId) {
  const list = Array.isArray(configs) ? configs.filter(config => plain(config) && isText(ownValue(config, 'id'))) : [];
  const options = list.map(config => {
    const communication = ownValue(config, 'communication');
    const environment = ownValue(config, 'environment');
    return {id: ownValue(config, 'id'), label: isText(ownValue(config, 'name')) ? ownValue(config, 'name') : ownValue(config, 'id'),
      detail: `${COMMUNICATION[communication] ?? 'link not stated'}; ${isText(environment) ? environment.replace('_', ' ') : 'environment not stated'}`};
  });
  const selected = options.some(option => option.id === selectedId) ? selectedId : null;
  return {options, selected_id: selected, prompt: selected === null ? 'No mission configuration selected' : null};
}

const RESERVED = ['store', 'clock', 'newId', 'configs', 'config', 'storage_fallback_reason', 'subject', 'data_source', 'writable', 'record_origin', 'flags'];

/** Gather what views receive. Nothing is defaulted: a missing part or an unknown selection is an error. */
export function assembleServices(parts) {
  if (!plain(parts)) return fail('invalid_services', 'parts', 'Services need { store, clock, newId, configs }');
  const store = ownValue(parts, 'store');
  const clock = ownValue(parts, 'clock');
  const newId = ownValue(parts, 'newId');
  const configs = ownValue(parts, 'configs');
  const selected = ownValue(parts, 'selected_config_id');
  const collaborators = ownValue(parts, 'collaborators') ?? {};
  if (!plain(store) || typeof ownValue(store, 'status') !== 'function') return fail('invalid_services', 'store', 'A store with status() is required');
  if (typeof clock !== 'function') return fail('invalid_services', 'clock', 'A clock function is required');
  if (typeof newId !== 'function') return fail('invalid_services', 'newId', 'An identifier function is required');
  if (!Array.isArray(configs) || configs.some(config => !plain(config) || !isText(ownValue(config, 'id')))) return fail('invalid_services', 'configs', 'configs must be a list of configurations with ids');
  if (!plain(collaborators)) return fail('invalid_services', 'collaborators', 'collaborators must be an object');
  for (const key of Object.keys(collaborators)) if (RESERVED.includes(key)) return fail('reserved_name', key, `A collaborator may not replace ${key}`);
  let config = null;
  if (selected !== undefined && selected !== null) {
    config = configs.find(candidate => ownValue(candidate, 'id') === selected) ?? null;
    if (!config) return fail('unknown_config', 'selected_config_id', `No configuration has the id ${String(selected).slice(0, 60)}`);
  }
  const fallback = ownValue(parts, 'storage_fallback_reason');
  const subject = ownValue(parts, 'subject');
  if (subject !== undefined && subject !== null && !isText(subject)) return fail('invalid_services', 'subject', 'subject must be non-empty text when given');
  const source = ownValue(parts, 'data_source');
  if (source !== undefined && source !== null && (!plain(source) || !isText(ownValue(source, 'id')) || !isText(ownValue(source, 'label')))) return fail('invalid_services', 'data_source', 'data_source needs an id and a label');
  const writable = ownValue(parts, 'writable');
  if (writable !== undefined && typeof writable !== 'boolean') return fail('invalid_services', 'writable', 'writable must be true or false');
  const origin = ownValue(parts, 'record_origin');
  if (origin !== undefined && origin !== null && !isText(origin)) return fail('invalid_services', 'record_origin', 'record_origin must be text when given');
  const flags = ownValue(parts, 'flags');
  if (flags !== undefined && !plain(flags)) return fail('invalid_services', 'flags', 'flags must be an object');
  return {ok: true, value: Object.freeze({...collaborators, store, clock, newId, configs: Object.freeze([...configs]), config, storage_fallback_reason: isText(fallback) ? fallback : null,
    subject: isText(subject) ? subject : null, data_source: source ? Object.freeze({...source}) : null, writable: writable === true, record_origin: isText(origin) ? origin : null, flags: Object.freeze({...(flags ?? {})})})};
}

function interpret(label, result) {
  if (!plain(result)) return {state: 'error', text: `${label} did not return a view model.`};
  if (result.ok === false) { // a Result from a view module (team code), not hostile input
    const error = ownValue(result, 'error');
    if (ownValue(error, 'code') === 'not_implemented') return {state: 'not_available', text: `${label} is not available yet.`};
    return {state: 'error', text: `${label}: ${isText(ownValue(error, 'message')) ? ownValue(error, 'message') : 'the view reported an error'}`};
  }
  const state = ownValue(result, 'state');
  if (state === 'loading') return {state: 'loading', text: `${label} is loading.`};
  if (state === 'empty') {
    const reason = ownValue(result, 'reason');
    return isText(reason) ? {state: 'empty', text: reason} : {state: 'error', text: `${label} reported empty without saying why.`};
  }
  if (state === 'error') {
    const message = ownValue(result, 'message');
    return {state: 'error', text: isText(message) ? message : `${label} reported an error without a message.`};
  }
  if (state === 'ready') return {state: 'ready', text: `Showing ${label}.`, viewModel: result};
  return {state: 'error', text: `${label} returned an unrecognised state.`};
}

const LOAD_TIMEOUT_MS = 15000; // a view that does not answer must not hold the whole shell; technical, not clinical

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function resolveCurrent(planned, loader, services, params, timeoutMs) {
  const label = planned.label;
  if (!loader || typeof loader.load !== 'function') return {id: planned.id, state: 'not_available', text: `${label} is not available yet.`};
  let module;
  try { module = await withTimeout(Promise.resolve().then(() => loader.load()), timeoutMs); } catch (error) { return {id: planned.id, state: 'error', text: error && error.message === 'timeout' ? `${label} did not respond in time.` : `${label} could not be loaded.`}; }
  if (!module || typeof module.model !== 'function') return {id: planned.id, state: 'error', text: `${label} could not be loaded: its module has no model.`};
  let result;
  try { result = await withTimeout(Promise.resolve().then(() => module.model(services, params)), timeoutMs); } catch (error) { return {id: planned.id, state: 'error', text: error && error.message === 'timeout' ? `${label} did not respond in time.` : `${label} failed while preparing its data.`}; }
  const current = {id: planned.id, ...interpret(label, result)};
  if (current.state === 'ready') {
    if (typeof module.mount === 'function') current.mount = module.mount;
    else return {id: planned.id, state: 'error', text: `${label} returned a ready view with no mount function, so nothing can be drawn.`};
  }
  return current;
}

/**
 * buildShell({ views, currentId, services, params }) → { nav, current, storage, config }
 * The navigation always lists every planned view. One view failing never stops the shell.
 */
export async function buildShell({views = [], currentId, services, params, sources = [], timeout_ms = LOAD_TIMEOUT_MS} = {}) {
  const loaders = new Map((Array.isArray(views) ? views : []).filter(view => plain(view) && isText(view.id)).map(view => [view.id, view]));
  const nav = PLANNED_VIEWS.map(view => ({id: view.id, label: view.label, folder: view.folder, href: `#/${view.id}`, current: view.id === currentId}));
  const planned = PLANNED_VIEWS.find(view => view.id === currentId);
  const current = planned
    ? await resolveCurrent(planned, loaders.get(planned.id), services, params, timeout_ms)
    : {id: null, state: 'unknown_view', text: 'This address does not match any view. Choose one from the navigation.'};
  const store = ownValue(services, 'store');
  let status;
  try { status = typeof ownValue(store, 'status') === 'function' ? store.status() : undefined; } catch { status = undefined; }
  return {nav, current, storage: storageNotice(status, ownValue(services, 'storage_fallback_reason')), source: sourceSelector(sources, ownValue(ownValue(services, 'data_source'), 'id')),
    config: configSelector(ownValue(services, 'configs'), ownValue(ownValue(services, 'config'), 'id'))};
}
