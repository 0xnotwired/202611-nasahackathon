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

// ---- Reopen and history ----
test('M16-R1: a closed episode can be reopened with a reason; the earlier close stays in its history', async () => {
  const store = await bare(); const ep = await opened(store);
  assert.equal((await m.reopen(store, ep.id, {reason: 'x'})).error.code, 'episode_not_closed');
  await m.close(store, ep.id, {clock: () => NOW});
  for (const bad of [undefined, {}, {reason: ''}, {reason: 5}]) assert.equal((await m.reopen(store, ep.id, bad)).error.code, 'invalid_reason');
  assert.equal((await m.reopen(store, ep.id, {reason: 'x', clock: () => 'noon'})).error.code, 'invalid_clock');
  const back = await m.reopen(store, ep.id, {reason: 'closed by mistake', clock: () => NOW}); assert.equal(back.ok, true, JSON.stringify(back));
  assert.equal((await store.get('episodes', ep.id)).value.closed, null); assert.deepEqual(back.value.reopened.map(r => [r.previous_closed, r.reason]), [[NOW, 'closed by mistake']]);
  assert.equal((await m.link(store, ep.id, {record_id: 'obs-1'})).ok, true, 'open again, so it accepts links');
  await m.close(store, ep.id, {clock: () => NOW}); await m.reopen(store, ep.id, {reason: 'again'}); assert.equal((await store.get('episodes', ep.id)).value.reopened.length, 2);
});

test('M16-R2: an episode is not reopened while another of the same subject is open; the history lists newest first', async () => {
  const store = await bare([obs(), obs({id: 'obs-2', time: '2026-11-15T12:00:00.000Z'})]);
  const first = (await m.open(store, obs(), {clock: () => '2026-11-15T10:00:00.000Z', newId: () => 'e-old'})).value; await m.close(store, first.id, {clock: () => NOW});
  const second = (await m.open(store, obs({id: 'obs-2'}), {clock: () => '2026-11-15T12:00:00.000Z', newId: () => 'e-new'})).value;
  assert.equal((await m.reopen(store, first.id, {reason: 'x'})).error.code, 'another_episode_open'); assert.equal((await store.get('episodes', first.id)).value.closed, NOW);
  const listed = await m.listEpisodes(store, {subject: SUBJECT}); assert.deepEqual(listed.value.map(e => [e.id, e.is_closed]), [['e-new', false], ['e-old', true]]);
  assert.equal((await m.listEpisodes(store, {})).ok, false); assert.deepEqual((await m.listEpisodes(store, {subject: 'nobody'})).value, []);
});

test('M16-R3: two reopens at once give exactly one success', async () => {
  const store = await bare(); const ep = await opened(store); await m.close(store, ep.id, {clock: () => NOW});
  const results = await Promise.all([m.reopen(store, ep.id, {reason: 'a'}), m.reopen(store, ep.id, {reason: 'b'})]);
  assert.equal(results.filter(r => r.ok).length, 1); assert.equal((await store.get('episodes', ep.id)).value.reopened.length, 1);
});

// ---- From the independent review of F4: one open episode per subject, across episodes ----
test('M16-R4: opening is refused while an episode of the subject is open, and two opens at once give one episode', async () => {
  const store = await bare([obs(), obs({id: 'obs-2', time: '2026-11-15T12:00:00.000Z'})]);
  const both = await Promise.all([m.open(store, obs(), {clock: () => NOW, newId: () => 'a'}), m.open(store, obs({id: 'obs-2'}), {clock: () => NOW, newId: () => 'b'})]);
  assert.equal(both.filter(r => r.ok).length, 1); assert.equal(both.find(r => !r.ok).error.code, 'another_episode_open');
  assert.equal((await store.list('episodes', {subject: SUBJECT})).value.length, 1);
});

test('M16-R5: two reopens of two different closed episodes give one open episode', async () => {
  const store = await bare([obs(), obs({id: 'obs-2', time: '2026-11-15T12:00:00.000Z'})]);
  const a = (await m.open(store, obs(), {clock: () => NOW, newId: () => 'a'})).value; await m.close(store, a.id, {clock: () => NOW});
  const b = (await m.open(store, obs({id: 'obs-2'}), {clock: () => NOW, newId: () => 'b'})).value; await m.close(store, b.id, {clock: () => NOW});
  const results = await Promise.all([m.reopen(store, a.id, {reason: 'x'}), m.reopen(store, b.id, {reason: 'y'})]);
  assert.equal(results.filter(r => r.ok).length, 1, JSON.stringify(results.map(r => r.ok || r.error.code)));
  assert.equal((await store.list('episodes', {subject: SUBJECT})).value.filter(e => e.closed === null || e.closed === undefined).length, 1);
});

test('M16-R6: closing twice at once closes once; a legacy `closed: true` episode is listed as closed with no time', async () => {
  const store = await bare(); const ep = await opened(store);
  const two = await Promise.all([m.close(store, ep.id, {clock: () => NOW}), m.close(store, ep.id, {clock: () => NOW})]); assert.equal(two.filter(r => r.ok).length, 1);
  const legacy = await bare([obs({id: 'o9'})]); const e = await opened(legacy, obs({id: 'o9'})); await m.close(legacy, e.id);
  const listed = (await m.listEpisodes(legacy, {subject: SUBJECT})).value[0]; assert.equal(listed.is_closed, true); assert.equal(listed.closed, true);
});

test('M16-R7: close is refused, not applied, when another writer changed `closed` after it was read', async () => {
  const store = await bare(); const ep = await opened(store); let raced = false;
  const racing = {...store, updateState: async (collection, id, changes, options) => { if (!raced) { raced = true; await store.updateState('episodes', id, {closed: '2026-11-15T09:00:00.000Z'}); } return store.updateState(collection, id, changes, options); }};
  const out = await m.close(racing, ep.id, {clock: () => NOW}); assert.equal(out.ok, false); assert.equal(out.error.code, 'conflict');
  assert.equal((await store.get('episodes', ep.id)).value.closed, '2026-11-15T09:00:00.000Z');
});
