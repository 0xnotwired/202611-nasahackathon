// Composition root. This is the only M07 file that imports other modules (store, scenario, readings),
// so base components stay free of them. It wires collaborators, builds the shell and re-renders on change.
import {CONTRACT_VERSION} from '../../contracts/data.js';
import {openStore} from '../../store/index.js';
import {generateScenario} from '../../scenario/index.js';
import * as readings from '../../readings/index.js';
import * as importers from '../../importers/index.js';
import * as catalogs from '../../catalogs/index.js';
import * as core from '../../core/index.js';
import * as plan from '../../plan/index.js';
import * as procedures from '../../procedures/index.js';
import * as sync from '../../sync/index.js';
import * as privacy from '../../privacy/index.js';
import * as episode from '../../episode/index.js';
import * as copilot from '../../copilot/index.js';
import * as summary from '../../summary/index.js';
import {assembleServices, buildShell, PLANNED_VIEWS} from './shell-model.js';
import {renderShell, create} from './dom.js';

const loaders = PLANNED_VIEWS.map(view => ({id: view.id, label: view.label, folder: view.folder, load: () => import(`../${view.id}/index.js`)}));

// The synthetic demo: the scenario's fictional records in a memory store, with a clock fixed at the scenario's "now" so the
// fictional data stays current. It never touches the persistent store. Every view says which source it is showing.
const DEMO_NOW = '2026-11-15T18:00:00.000Z';
const LOCAL_SUBJECT = 'local-user'; // one person on their own device; no accounts
// One simulated link and one session for the whole page; the link follows the selected mission configuration (see the ground view).
const LINK = sync.createLink({mode: 'no_link'});
const SESSION = privacy.createSession({clock: () => new Date().toISOString()});
const SOURCES = [{id: 'demo', label: 'Synthetic demo (fictional)', synthetic: true}, {id: 'mine', label: 'My records', synthetic: false}];

async function openDemo() {
  const scenario = generateScenario({seed: 1});
  const opened = await openStore({kind: 'memory', name: 'demo'});
  if (!opened.ok) throw new Error('The synthetic demo store could not be opened');
  for (const [collection, objects] of [['records', scenario.records], ['tasks', scenario.tasks]]) {
    const saved = await opened.value.saveBatch(collection, objects);
    if (!saved.ok) throw new Error(`The synthetic demo could not be loaded (${collection}: ${saved.error.code})`);
  }
  for (const item of scenario.procedures) {
    const published = await procedures.publishProcedure(opened.value, item, {clock: () => DEMO_NOW});
    if (!published.ok) throw new Error(`The synthetic demo procedures could not be loaded (${published.error.code})`);
  }
  return {store: opened.value, subject: scenario.records[0].subject, configs: scenario.config, rules: scenario.rules};
}

// The origin of records a person enters under "My records" is their own statement, never a default: until chosen, recording stays off.
const ORIGINS = [{id: 'terrestrial', label: 'Terrestrial: ordinary life on Earth'}, {id: 'ground_analog', label: 'Ground analog: a mission simulation on Earth'}, {id: 'flight', label: 'Flight: during a real flight'}];
const ORIGIN_KEY = 'orbita.record_origin';
const readChoice = win => { try { const v = JSON.parse(win.localStorage.getItem(ORIGIN_KEY) ?? 'null'); return v && ORIGINS.some(o => o.id === v.origin) ? {origin: v.origin, locked: v.locked === true} : {origin: null, locked: false}; } catch { return {origin: null, locked: false}; } };
const writeChoice = (win, choice) => { try { win.localStorage.setItem(ORIGIN_KEY, JSON.stringify(choice)); return true; } catch { return false; } };

async function openStorage() {
  const persistent = await openStore({kind: 'indexeddb', name: 'orbita'});
  if (persistent.ok) return {store: persistent.value, reason: null};
  // The store never falls back silently; this caller chooses memory and the shell says so.
  const memory = await openStore({kind: 'memory', name: 'orbita'});
  if (!memory.ok) throw new Error('No storage could be opened');
  return {store: memory.value, reason: `IndexedDB could not be used (${persistent.error.message}).`};
}

export async function start(doc = document, win = window) {
  const root = doc.querySelector('#app');
  const opened = await openStorage();
  const demo = await openDemo();
  const configs = demo.configs;
  let sourceId = 'demo';
  let choice = readChoice(win);
  let selected = configs.length ? configs[0].id : null; // an explicit, visible initial choice
  let currentId = (win.location.hash.match(/^#\/([\w-]+)$/) ?? [])[1] ?? PLANNED_VIEWS[0].id;

  const bar = create(doc, 'section', {id: 'origin-bar', class: 'card', 'aria-labelledby': 'origin-title'}); bar.hidden = true; root.after(bar);
  function drawBar() {
    const select = create(doc, 'select', {id: 'origin-select'}, create(doc, 'option', {value: ''}, 'Not chosen: recording is off'), ...ORIGINS.map(o => create(doc, 'option', {value: o.id}, o.label)));
    select.value = choice.origin ?? ''; if (choice.locked) select.setAttribute('disabled', 'disabled');
    select.addEventListener('change', () => { const next = {origin: select.value || null, locked: false}; if (!writeChoice(win, next) && next.origin) { doc.querySelector('#announce').textContent = 'The choice could not be saved in this browser; recording stays off.'; select.value = choice.origin ?? ''; return; } choice = next; draw(false).then(() => doc.querySelector('#origin-select')?.focus()); });
    const lock = create(doc, 'input', {id: 'origin-lock', type: 'checkbox'}); lock.checked = choice.locked; if (choice.origin === null) lock.setAttribute('disabled', 'disabled');
    lock.addEventListener('change', () => { const next = {...choice, locked: lock.checked}; if (writeChoice(win, next)) { choice = next; draw(false).then(() => doc.querySelector('#origin-lock')?.focus()); } else lock.checked = choice.locked; });
    bar.replaceChildren(create(doc, 'h3', {id: 'origin-title'}, 'Where do your entries come from?'), create(doc, 'p', {class: 'legend'}, 'Every record you add carries this origin. It is your statement, nothing is assumed, and records already saved keep theirs. Lock it to avoid changing it by accident.'),
      create(doc, 'div', {class: 'field'}, create(doc, 'label', {for: 'origin-select'}, 'Origin of my entries'), select), create(doc, 'div', {class: 'field'}, lock, ' ', create(doc, 'label', {for: 'origin-lock'}, 'Lock this choice')),
      opened.reason !== null ? create(doc, 'p', {class: 'notice notice-warning'}, 'Records cannot be saved in this browser right now, so recording stays off.') : null);
  }

  async function draw(moveFocus) {
    const isDemo = sourceId === 'demo';
    const services = assembleServices({store: isDemo ? demo.store : opened.store, clock: isDemo ? () => DEMO_NOW : () => new Date().toISOString(), newId: () => win.crypto.randomUUID(), configs,
      selected_config_id: selected, subject: isDemo ? demo.subject : LOCAL_SUBJECT, writable: isDemo || (choice.origin !== null && opened.reason === null), record_origin: isDemo ? 'synthetic' : choice.origin ?? undefined, flags: {},
      data_source: isDemo ? {id: 'demo', label: 'Synthetic demo (fictional data)', synthetic: true, note: 'Fictional records generated by the team. The demo clock is fixed at 2026-11-15 18:00 UTC so the data stays current.'}
        : {id: 'mine', label: 'My records', synthetic: false, note: 'Records saved in this browser.' + (choice.origin === null ? ' Recording is off until you say where your entries come from (below).' : ` Entries you add are recorded as: ${ORIGINS.find(o => o.id === choice.origin).label}.`)},
      collaborators: {readings, importers, catalogs, core, plan, procedures, sync, privacy, episode, copilot, summary, rules: isDemo ? demo.rules : [], link: LINK, session: SESSION, openMemoryStore: () => openStore({kind: 'memory', name: 'nasa-cases'})}, storage_fallback_reason: isDemo ? undefined : opened.reason ?? undefined});
    if (!services.ok) { root.replaceChildren(create(doc, 'p', {class: 'notice notice-error', role: 'alert'}, `The application could not start: ${services.error.message}`)); return; }
    const shell = await buildShell({views: loaders, currentId, services: services.value, params: {}, sources: SOURCES});
    const parts = renderShell(doc, root, shell, {onSource: id => { sourceId = id; draw(false).then(() => {
      doc.querySelector('#announce').textContent = `Data source changed to ${SOURCES.find(source => source.id === id)?.label ?? id}.`;
    }); }, onConfig: id => { selected = id; draw(false).then(() => {
      const label = configs.find(config => config.id === id)?.name ?? id;
      doc.querySelector('#announce').textContent = `Mission configuration changed to ${label}.`;
    }); }});
    bar.hidden = isDemo; if (!isDemo) drawBar();
    if (moveFocus) parts.main.focus();
  }

  // Another tab changed or locked the origin: this tab follows at once, so a lock cannot be bypassed from a stale page.
  win.addEventListener('storage', event => { if (event.key === ORIGIN_KEY || event.key === null) { choice = readChoice(win); draw(false); } });
  win.addEventListener('hashchange', () => {
    currentId = (win.location.hash.match(/^#\/([\w-]+)$/) ?? [])[1] ?? currentId;
    draw(true);
  });
  await draw(false);
  doc.querySelector('#status')?.remove();
  const footer = create(doc, 'footer', {}, create(doc, 'p', {id: 'status'}, `Modules loaded (contracts ${CONTRACT_VERSION}). Product views are added module by module; a view that is not built yet says so.`));
  root.after(footer);
  doc.documentElement.dataset.modules = 'loaded';
}
