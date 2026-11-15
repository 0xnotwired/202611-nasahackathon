import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from './index.js';
import {openStore} from '../store/index.js';
import * as episode from '../episode/index.js';
import {makeRecord, scenario, SUBJECT, NOW} from '../../tests/walkthrough/fixtures.js';

const station = scenario.config[0], spacecraft = scenario.config[1], rover = scenario.config[2];
const obs = (extra = {}) => makeRecord({id: 'obs-1', type: 'observation', variable: 'headache', value: undefined, method: 'self_report', ...extra});
let n = 0;
async function setup(records, links = []) {
  const store = (await openStore({kind: 'memory', name: `sum-${++n}`})).value; assert.equal((await store.saveBatch('records', records)).ok, true);
  const ep = (await episode.open(store, records.find(r => r.id === 'obs-1'), {clock: () => NOW, newId: () => `ep-${n}`})).value;
  for (const id of links) assert.equal((await episode.link(store, ep.id, {record_id: id})).ok, true);
  return {store, ep};
}
const gen = (store, ep, config = station) => m.generate(store, ep.id, config, {clock: () => NOW});

test('M18-P1: generating sends and shares nothing', async () => {
  const {store, ep} = await setup([obs(), makeRecord({id: 'p1'})], ['p1']);
  const count = async () => [(await store.list('shared', {})).value.length, (await store.list('deliveries', {})).value.length];
  const before = await count(); const out = await gen(store, ep); assert.equal(out.ok, true); assert.deepEqual(await count(), before);
});

test('M18-P2: "not recorded" and "confirmed nothing new" appear in those words and are not confused', async () => {
  const {store, ep} = await setup([obs(), makeRecord({id: 'gone', variable: 'glucose', state: 'not_recorded', method: 'demo-device'}), makeRecord({id: 'none', type: 'observation', variable: 'other', state: 'confirmed_none', method: 'self_report', value: undefined})], ['gone', 'none']);
  const text = (await gen(store, ep)).value.text; const line = id => text.split('\n').find(l => l.includes(id));
  assert.match(line('glucose'), /not recorded/); assert.doesNotMatch(line('glucose'), /nothing new/); assert.match(line('other'), /confirmed nothing new/); assert.doesNotMatch(line('other'), /not recorded/);
});

test('M18-P3: every value in the text equals the history, with its unit, unrounded', async () => {
  const {store, ep} = await setup([obs(), makeRecord({id: 'p1', value: 76.25, unit: 'bpm'}), makeRecord({id: 'g1', variable: 'glucose', value: 93, unit: 'mg/dL'}), makeRecord({id: 'u1', variable: 'mass', value: 71.3, unit: null, unit_status: 'unknown'})], ['p1', 'g1', 'u1']);
  const text = (await gen(store, ep)).value.text; assert.match(text, /pulse: 76\.25 bpm/); assert.match(text, /glucose: 93 mg\/dL/); assert.match(text, /mass: 71\.3 \(unit unknown\)/);
});

test('M18-P4: with a delayed link the text has four labelled parts, the third saying nothing was found missing', async () => {
  const {store, ep} = await setup([obs(), makeRecord({id: 'p1'})], ['p1']); const text = (await gen(store, ep, spacecraft)).value.text;
  const at = ['1. What happened', '2. What was measured and how', '3. What is missing', '4. What is being asked'].map(h => text.indexOf(h)); assert.ok(at.every(i => i >= 0) && at.every((v, i) => i === 0 || v > at[i - 1]), text);
  assert.match(text.slice(at[2], at[3]), /Nothing was found missing among what was looked at/);
});

test('M18-P5: pending_send is true with no link or a delay, false with a live link', async () => {
  const {store, ep} = await setup([obs()]); const flags = [];
  for (const c of [rover, station, spacecraft]) flags.push((await gen(store, ep, c)).value.pending_send); assert.deepEqual(flags, [true, false, true]);
});

test('M18-P6: origins are separated: one block per origin, exactly the origins present (a subject never mixes synthetic and real)', async () => {
  const {store, ep} = await setup([obs({origin: 'ground_analog'}), makeRecord({id: 'p1', origin: 'ground_analog'}), makeRecord({id: 'a1', variable: 'glucose', value: 90, unit: 'mg/dL', origin: 'terrestrial', method: 'cgm'})], ['p1', 'a1']);
  const out = (await gen(store, ep)).value; assert.deepEqual(out.origins, ['ground_analog', 'terrestrial']); const t = out.text;
  const heading = at => t.slice(t.lastIndexOf('Origin:', at), t.indexOf('\n', t.lastIndexOf('Origin:', at)));
  assert.match(heading(t.indexOf('glucose: 90')), /^Origin: terrestrial \(terrestrial data, not an astronaut\)/); assert.match(heading(t.indexOf('pulse: 70')), /^Origin: ground_analog \(ground analog data, not an astronaut\)/);
  assert.equal((t.match(/^Origin: /gm) ?? []).length, 2);
});

test('M18-P7: free-text notes are never in the summary', async () => {
  const {store, ep} = await setup([obs({note: 'SECRET-NOTE-TEXT'}), makeRecord({id: 'p1', note: 'ANOTHER-NOTE'})], ['p1']); const text = (await gen(store, ep)).value.text;
  assert.doesNotMatch(text, /SECRET-NOTE-TEXT|ANOTHER-NOTE/);
});

test('M18-X1: unknown episode, bad config or clock give an error; the same input gives the same text', async () => {
  const {store, ep} = await setup([obs()]);
  for (const [id, c, o] of [['nope', station, {clock: () => NOW}], [ep.id, null, {clock: () => NOW}], [ep.id, {}, {clock: () => NOW}], [ep.id, station, {}], [ep.id, station, {clock: () => 'yesterday'}]]) assert.equal((await m.generate(store, id, c, o)).ok, false);
  assert.equal((await m.generate(undefined, ep.id, station, {clock: () => NOW})).ok, false); assert.equal((await gen(store, ep)).value.text, (await gen(store, ep)).value.text); assert.ok(SUBJECT);
});
