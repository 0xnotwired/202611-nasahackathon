import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from './index.js';
import {openStore} from '../store/index.js';
import {makeServices, makeRecord, scenario, SUBJECT, NOW} from '../../tests/walkthrough/fixtures.js';

const station = scenario.config[0], spacecraft = scenario.config[1];
const obs = (extra = {}) => makeRecord({id: 'obs-1', type: 'observation', variable: 'headache', value: undefined, method: 'self_report', ...extra});
let n = 0;
const ctx = () => ({clock: () => NOW, newId: () => `ep-${++n}`});
const bare = async (records = [obs()]) => { const s = (await openStore({kind: 'memory', name: `ep-${++n}`})).value; const r = await s.saveBatch('records', records); assert.equal(r.ok, true); return s; };
const opened = async (store, o = obs()) => (await m.open(store, o, ctx())).value;
const PARTS = ['you_recorded', 'we_know', 'missing', 'you_can', 'happened', 'next'];
const execution = (id, state, extra = {}) => ({id, schema_version: 2, procedure_id: 'p1', procedure_version: '1', subject: SUBJECT, state, current_step: state === 'completed' ? 3 : 1, step_count: 3, started: NOW, updated: NOW, difficulties: state === 'could_not' ? ['no cuff'] : [], records: [], interruptions: [], ...extra});

test('M16-P1: situation has exactly the six parts, and each empty one says why', async () => {
  const store = await bare(); const ep = await opened(store); const s = await m.situation(store, ep.id, station, {clock: () => NOW});
  assert.deepEqual(PARTS.filter(k => Object.hasOwn(s, k)), PARTS); assert.deepEqual(Object.keys(s).filter(k => !PARTS.includes(k)).sort(), ['alert_issued', 'why_empty']);
  for (const part of PARTS) { assert.ok(Array.isArray(s[part]), part); if (!s[part].length) assert.ok(typeof s.why_empty[part] === 'string' && s.why_empty[part].length > 0, `${part} is empty without a reason`); }
  assert.equal(s.you_recorded.length, 1); assert.equal(s.you_recorded[0].id, 'obs-1'); assert.equal(s.alert_issued, false);
});

test('M16-P2: we_know holds only this subject, and environment only from the same place', async () => {
  const records = [obs({place: 'module-a'}), makeRecord({id: 'a-pulse', value: 71}), makeRecord({id: 'b-pulse', subject: 'someone-else', value: 99, time: '2026-11-15T11:00:00.000Z'}), makeRecord({id: 'env-a', type: 'environment', variable: 'co2', value: 600, unit: 'ppm', place: 'module-a', sensor: 's', interval: {from: '2026-11-15T09:00:00.000Z', to: '2026-11-15T10:00:00.000Z'}}),
    makeRecord({id: 'env-b', type: 'environment', variable: 'co2', value: 900, unit: 'ppm', place: 'module-b', sensor: 's', interval: {from: '2026-11-15T09:00:00.000Z', to: '2026-11-15T10:00:00.000Z'}})];
  const store = await bare(records); const s = await m.situation(store, (await opened(store, records[0])).id, station, {clock: () => NOW});
  assert.deepEqual(s.we_know.map(r => r.id).sort(), ['a-pulse', 'env-a']);
  const noPlace = await bare([obs(), ...records.slice(1)]); const t = await m.situation(noPlace, (await opened(noPlace)).id, station, {clock: () => NOW});
  assert.deepEqual(t.we_know.map(r => r.id), ['a-pulse']); assert.equal(t.why_empty.we_know, undefined);
  const alone = await bare([obs()]); const u = await m.situation(alone, (await opened(alone)).id, station, {clock: () => NOW}); assert.match(u.why_empty.we_know, /no place is stated/);
});

test('M16-P3: missing lists a not-recorded variable and absent equipment, never "nothing to report"', async () => {
  const {store} = await makeServices({config: spacecraft}).then(s => ({store: s.store})); await store.save('records', obs());
  const ep = await opened(store); const s = await m.situation(store, ep.id, spacecraft, {clock: () => NOW});
  assert.ok(s.missing.some(x => x.kind === 'not_recorded' && x.variable === 'aerobic_capacity'), JSON.stringify(s.missing));
  assert.ok(s.missing.some(x => x.kind === 'equipment' && x.item === 'demo-device'));
  const withDevice = await makeServices({config: station}); await withDevice.store.save('records', obs()); const w = await m.situation(withDevice.store, (await opened(withDevice.store)).id, station, {clock: () => NOW});
  assert.equal(w.missing.some(x => x.kind === 'equipment'), false); assert.equal(w.you_can[0].available, true); assert.equal(s.you_can[0].available, false);
});

test('M16-P4: the alert is issued once, also under concurrency, and stays issued', async () => {
  const store = await bare(); const ep = await opened(store);
  const [a, b] = await Promise.all([m.issueAlert(store, ep.id), m.issueAlert(store, ep.id)]); assert.equal([a.value.issued, b.value.issued].filter(Boolean).length, 1);
  const again = await m.issueAlert(store, ep.id); assert.equal(again.value.issued, false); assert.equal((await store.get('episodes', ep.id)).value.alert_issued, true);
  assert.equal((await m.situation(store, ep.id, station, {clock: () => NOW})).alert_issued, true);
});

test('M16-P5: completed, interrupted and could-not executions are three different items', async () => {
  const store = await bare(); const ep = await opened(store);
  for (const [id, state] of [['e1', 'completed'], ['e2', 'interrupted'], ['e3', 'could_not']]) { await store.save('executions', execution(id, state)); assert.equal((await m.link(store, ep.id, {execution_id: id})).ok, true); }
  const s = await m.situation(store, ep.id, station, {clock: () => NOW}); assert.deepEqual(s.happened.map(h => h.state).sort(), ['completed', 'could_not', 'interrupted']);
  assert.deepEqual(s.happened.find(h => h.state === 'could_not').difficulties, ['no cuff']); assert.equal(s.happened.find(h => h.state === 'interrupted').current_step, 1);
});

test('M16-X1: open needs a recorded observation of the subject that is in the store', async () => {
  const store = await bare([obs(), makeRecord({id: 'pulse-1'}), obs({id: 'none-1', state: 'confirmed_none'}), obs({id: 'theirs', subject: 'x'})]);
  for (const bad of [null, {}, makeRecord({id: 'pulse-1'}), obs({id: 'none-1', state: 'confirmed_none'}), obs({id: 'ghost'}), obs({id: 'obs-1', subject: 'x'})]) assert.equal((await m.open(store, bad, ctx())).ok, false, JSON.stringify(bad)?.slice(0, 50));
  assert.equal((await m.open(store, obs(), {})).ok, false); assert.equal((await m.open(undefined, obs(), ctx())).ok, false); assert.deepEqual((await store.list('episodes', {})).value, []);
});

test('M16-X2: link checks existence, subject and that the episode is open; close is final', async () => {
  const store = await bare([obs(), makeRecord({id: 'mine'}), makeRecord({id: 'theirs', subject: 'x'})]); const ep = await opened(store);
  for (const bad of [{record_id: 'nope'}, {record_id: 'theirs'}, {execution_id: 'nope'}, {task_id: 'nope'}, {}, null]) assert.equal((await m.link(store, ep.id, bad)).ok, false);
  assert.equal((await m.link(store, ep.id, {record_id: 'mine'})).ok, true); assert.equal((await m.link(store, ep.id, {record_id: 'mine'})).ok, true); assert.deepEqual((await store.get('episodes', ep.id)).value.record_ids, ['mine']);
  assert.equal((await m.close(store, ep.id)).ok, true); assert.ok((await store.get('episodes', ep.id)).value.closed);
  assert.equal((await m.link(store, ep.id, {record_id: 'mine'})).error.code, 'episode_closed'); assert.equal((await m.close(store, ep.id)).ok, false);
  assert.equal((await m.situation(store, 'nope', station, {clock: () => NOW})).ok, false);
});
