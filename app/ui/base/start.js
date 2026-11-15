// Composition root. This is the only M07 file that imports other modules (store, scenario, readings),
// so base components stay free of them. It wires collaborators, builds the shell and re-renders on change.
import {CONTRACT_VERSION} from '../../contracts/data.js';
import {openStore} from '../../store/index.js';
import {generateScenario} from '../../scenario/index.js';
import * as readings from '../../readings/index.js';
import {assembleServices, buildShell, PLANNED_VIEWS} from './shell-model.js';
import {renderShell, create} from './dom.js';

const loaders = PLANNED_VIEWS.map(view => ({id: view.id, label: view.label, folder: view.folder, load: () => import(`../${view.id}/index.js`)}));

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
  let configs = [];
  try { configs = generateScenario({seed: 1}).config; } catch { configs = []; }
  let selected = configs.length ? configs[0].id : null; // an explicit, visible initial choice
  let currentId = (win.location.hash.match(/^#\/([\w-]+)$/) ?? [])[1] ?? PLANNED_VIEWS[0].id;

  async function draw(moveFocus) {
    const services = assembleServices({store: opened.store, clock: () => new Date().toISOString(), newId: () => win.crypto.randomUUID(), configs,
      selected_config_id: selected, collaborators: {readings}, storage_fallback_reason: opened.reason ?? undefined});
    if (!services.ok) { root.replaceChildren(create(doc, 'p', {class: 'notice notice-error', role: 'alert'}, `The application could not start: ${services.error.message}`)); return; }
    const shell = await buildShell({views: loaders, currentId, services: services.value, params: {}});
    const parts = renderShell(doc, root, shell, {onConfig: id => { selected = id; draw(false).then(() => {
      const label = configs.find(config => config.id === id)?.name ?? id;
      doc.querySelector('#announce').textContent = `Mission configuration changed to ${label}.`;
    }); }});
    if (moveFocus) parts.main.focus();
  }

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
