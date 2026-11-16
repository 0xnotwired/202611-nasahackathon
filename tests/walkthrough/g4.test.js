// G4 as defined in docs/IMPLEMENTATION_LAYERS.md (W1–W4): one episode from the observation to the ground panel, through the real views and modules.
// Predictions are the table's. W5 (a half-done episode restored after a reload) needs a persistent store and a browser: tests/walkthrough/g4-extras-browser.py (U-checks) and g3-real-browser.py.
// W6 (rerun G1–G3) is `npm test` plus `node scripts/run-gates.mjs`. Negative controls live in tests/controls/g4-gate-controls.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {model as feel} from '../../app/ui/i-feel-different/model.js';
import {model as groundModel} from '../../app/ui/ground/model.js';
import * as sync from '../../app/sync/index.js';
import {makeServices, makeRecord, scenario, SUBJECT, NOW} from './fixtures.js';

const station = scenario.config[0], spacecraft = scenario.config[1];
const section = (vm, id) => vm.sections.find(s => s.id === id);
const later = ms => () => new Date(Date.parse(NOW) + ms).toISOString();

async function wholeEpisode(config, {share = true, records = [], link = []} = {}) {
  const services = await makeServices({config, records}); let vm = await feel(services, {});
  vm = await vm.interactions.open('fatigue'); assert.equal(vm.message.kind, 'info', JSON.stringify(vm.message));
  const episode = (await services.store.list('episodes', {})).value[0];
  // "procedure, result": run the demo procedure when the equipment allows it, and record its value.
  const procedure = scenario.procedures[0]; const run = await services.procedures.start(services.store, procedure, config, {subject: SUBJECT, clock: services.clock, newId: services.newId, preparation_confirmed: true});
  assert.equal(run.ok, true, JSON.stringify(run.error));
  if (run.value.state === 'in_progress') {
    await services.procedures.advance(services.store, run.value.id, {clock: services.clock});
    const result = makeRecord({id: 'g4-result', time: NOW}); assert.equal((await services.store.save('records', result)).ok, true);
    await services.procedures.advance(services.store, run.value.id, {clock: services.clock, record: 'g4-result'});
    await services.procedures.advance(services.store, run.value.id, {clock: services.clock});
    await services.procedures.finish(services.store, run.value.id, {state: 'completed', clock: services.clock});
  }
  await services.episode.link(services.store, episode.id, {execution_id: run.value.id});
  for (const id of link) assert.equal((await services.episode.link(services.store, episode.id, {record_id: id})).ok, true);
  vm = await vm.interactions.generateSummary(); const summary = vm.summary;
  if (share) { const out = await vm.interactions.shareWithGround({confirmed: true}); assert.equal(out.message.kind, 'info', out.message.text); }
  return {services, vm, episode, run: run.value, summary};
}

test('G4-W1: the whole episode reaches the ground with exactly one Shared entry and one delivery; every value of the summary equals the history', async () => {
  const {services, episode, summary} = await wholeEpisode(station);
  const shared = (await services.store.list('shared', {})).value; const deliveries = (await services.store.list('deliveries', {})).value;
  assert.equal(shared.length, 1); assert.equal(deliveries.length, 1); assert.equal(deliveries[0].shared_id, shared[0].id);
  const panel = await groundModel(services, {}); const ground = await panel.interactions.advance(); // the panel sets the link from the mission configuration (real time here)
  assert.equal(section(ground, 'ground').entries.length, 1, 'the ground panel received it once');
  const again = await ground.interactions.advance(); assert.equal(section(again, 'ground').entries.length, 1, 'a second advance does not duplicate it'); assert.equal((await sync.received(services.store, {})).value.length, 1);
  // Every number in the summary text is a recorded value of the history, and every recorded value of the episode appears.
  const history = (await services.store.list('records', {subject: SUBJECT})).value; const numbers = [...summary.text.matchAll(/: (-?\d+(?:\.\d+)?) /g)].map(m => Number(m[1]));
  for (const n of numbers) assert.ok(history.some(r => r.state === 'recorded' && r.value === n), `${n} is not in the history`);
  assert.ok(summary.text.includes(episode.id));
  const alertCount = (await services.store.list('episodes', {})).value.filter(e => e.alert_issued).length; assert.ok(alertCount <= 1, 'at most one alert per episode');
});

test('G4-W2: stopped before "share", nothing is shared, nothing is queued and the ground panel shows nothing', async () => {
  const {services} = await wholeEpisode(station, {share: false});
  assert.equal((await services.store.list('shared', {})).value.length, 0); assert.equal((await services.store.list('deliveries', {})).value.length, 0);
  const ground = await groundModel(services, {}); assert.equal(section(ground, 'ground').state, 'empty'); assert.match(JSON.stringify(ground), /Nothing sent/);
});

test('G4-W3: a not-recorded variable is "not recorded" on the card, in the summary and on the ground panel', async () => {
  const absent = makeRecord({id: 'g4-absent', variable: 'respiration_rate', state: 'not_recorded', time: '2026-11-15T09:00:00.000Z'});
  const {services, vm, summary} = await wholeEpisode(station, {records: [absent], link: ['g4-absent']});
  const card = JSON.stringify(section(vm, 'gaps')); assert.match(card, /respiration_rate: not recorded/);
  assert.match(summary.text, /respiration_rate: not recorded/); assert.doesNotMatch(summary.text, /respiration_rate: 0\b/);
  const ground = await (await groundModel(services, {})).interactions.advance();
  const delivery = (await services.store.list('deliveries', {})).value[0]; assert.ok(delivery, 'a delivery exists');
  const shown = JSON.stringify(section(ground, 'ground')); assert.match(shown, /not recorded/); assert.doesNotMatch(shown, /respiration_rate: 0\b|"value":0\b/);
});

test('G4-W4: the delayed configuration without the equipment: no reviewed guidance, the procedure is blocked, the summary has its four parts, the delivery is in transit until the delay passes', async () => {
  const {services, vm, run, summary} = await wholeEpisode(spacecraft);
  assert.equal(run.state, 'blocked'); assert.match(JSON.stringify(section(vm, 'suggestion')), /no reviewed guidance/i);
  for (const part of ['1. What happened', '2. What was measured and how', '3. What is missing', '4. What is being asked']) assert.ok(summary.text.includes(part), part);
  assert.equal(summary.pending_send, true);
  services.link.setMode('delayed', 60000);
  await sync.advance(services.store, services.link, {clock: later(1000)}); let d = (await services.store.list('deliveries', {})).value[0]; assert.equal(d.state, 'in_transit');
  await sync.advance(services.store, services.link, {clock: later(60999)}); d = (await services.store.list('deliveries', {})).value[0]; assert.equal(d.state, 'in_transit', 'still in transit just before the delay');
  await sync.advance(services.store, services.link, {clock: later(61000)}); d = (await services.store.list('deliveries', {})).value[0]; assert.equal(d.state, 'received');
});
