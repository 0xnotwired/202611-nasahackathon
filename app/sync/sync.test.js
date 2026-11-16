import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from './index.js';
import * as privacy from '../privacy/index.js';
import {openStore} from '../store/index.js';
import {SUBJECT} from '../../tests/walkthrough/fixtures.js';

const T0 = Date.parse('2026-11-15T10:00:00.000Z');
const at = ms => () => new Date(T0 + ms).toISOString();
let seq = 0;
const fresh = async () => (await openStore({kind: 'memory', name: `sync-${++seq}`})).value;
let counter = 0;
const newId = () => `d-${++counter}`;
const share = async (store, what = ['r1'], subject = SUBJECT) => (await privacy.logShared(store, {subject, what, with: 'ground panel (simulated)', channel: 'simulated sync'}, {clock: at(0), newId})).value;
const delivery = async (store, id) => (await store.get('deliveries', id)).value;

test('M24-P1: only something logged as shared can be enqueued', async () => {
  const store = await fresh();
  for (const id of ['nope', '', undefined, 7]) assert.equal((await m.enqueue(store, id, {clock: at(0), newId})).ok, false);
  assert.deepEqual((await store.list('deliveries', {})).value, []);
  const s = await share(store); const out = await m.enqueue(store, s.id, {clock: at(0), newId});
  assert.equal(out.ok, true); assert.equal(out.value.shared_id, s.id); assert.equal(out.value.state, 'queued'); assert.equal(out.value.created, at(0)()); assert.equal(Object.hasOwn(out.value, 'sent'), false);
});

test('M24-P2: with no link nothing is lost and everything stays queued', async () => {
  const store = await fresh(); const link = m.createLink({clock: at(0), mode: 'no_link'});
  const a = await m.enqueue(store, (await share(store)).id, {clock: at(0), newId}), b = await m.enqueue(store, (await share(store, ['r2'])).id, {clock: at(0), newId});
  for (let i = 0; i < 3; i++) assert.equal((await m.advance(store, link, {clock: at(i * 1000)})).ok, true);
  assert.equal((await delivery(store, a.value.id)).state, 'queued'); assert.equal((await delivery(store, b.value.id)).state, 'queued'); assert.deepEqual((await m.received(store, {})).value, []);
});

test('M24-P3: delayed goes through in_transit and arrives at the delay, by the injected clock', async () => {
  const store = await fresh(); const link = m.createLink({clock: at(0), mode: 'delayed', delay_ms: 60000});
  const d = (await m.enqueue(store, (await share(store)).id, {clock: at(0), newId})).value;
  await m.advance(store, link, {clock: at(0)}); assert.equal((await delivery(store, d.id)).state, 'in_transit'); assert.equal((await delivery(store, d.id)).sent, at(0)());
  await m.advance(store, link, {clock: at(59999)}); assert.equal((await delivery(store, d.id)).state, 'in_transit');
  const out = await m.advance(store, link, {clock: at(60000)}); assert.deepEqual(out.value.map(x => x.id), [d.id]);
  const arrived = await delivery(store, d.id); assert.equal(arrived.state, 'received'); assert.equal(arrived.received, at(60000)());
});

test('M24-P4: the same delivery appears once in received, however many times it is handed over', async () => {
  const store = await fresh(); const link = m.createLink({clock: at(0), mode: 'real_time'}); const s = await share(store);
  const first = await m.enqueue(store, s.id, {clock: at(0), newId}), second = await m.enqueue(store, s.id, {clock: at(5), newId});
  assert.equal(second.value.id, first.value.id); assert.equal((await store.list('deliveries', {})).value.length, 1);
  await m.advance(store, link, {clock: at(10)}); await m.advance(store, link, {clock: at(20)});
  assert.equal((await m.received(store, {})).value.length, 1);
});

test('M24-P5: received is per subject, and a subject that sent nothing has nothing', async () => {
  const store = await fresh(); const link = m.createLink({clock: at(0), mode: 'real_time'});
  await m.enqueue(store, (await share(store, ['r1'], 'crew-a')).id, {clock: at(0), newId}); await m.advance(store, link, {clock: at(1)});
  assert.equal((await m.received(store, {subject: 'crew-a'})).value.length, 1); assert.deepEqual((await m.received(store, {subject: 'crew-b'})).value, []);
  assert.deepEqual((await m.deliveries(store, {subject: 'crew-b'})).value, []);
});

test('M24-P6: what was shared travels unchanged, with its subject', async () => {
  const store = await fresh(); const link = m.createLink({clock: at(0), mode: 'real_time'}); const s = await share(store, ['rec-1', 'rec-not-recorded']);
  const d = (await m.enqueue(store, s.id, {clock: at(0), newId})).value; await m.advance(store, link, {clock: at(1)});
  const got = (await m.received(store, {subject: SUBJECT})).value[0]; assert.deepEqual(got.what, ['rec-1', 'rec-not-recorded']); assert.equal(got.subject, SUBJECT); assert.equal(got.id, d.id);
});

test('M24-X1: createLink and setMode validate; a delayed link needs a delay; a bad mode changes nothing', () => {
  assert.throws(() => m.createLink({mode: 'fast'}), TypeError); assert.throws(() => m.createLink({mode: 'delayed'}), TypeError); assert.throws(() => m.createLink({mode: 'delayed', delay_ms: -1}), TypeError); assert.throws(() => m.createLink(null), TypeError);
  const link = m.createLink({mode: 'no_link'}); assert.equal(link.mode(), 'no_link');
  assert.equal(link.setMode('real_time').ok, true); assert.equal(link.mode(), 'real_time');
  for (const bad of [['fast'], ['delayed'], ['delayed', -5], ['delayed', NaN], [undefined]]) { assert.equal(link.setMode(...bad).ok, false); assert.equal(link.mode(), 'real_time'); }
  assert.equal(link.setMode('delayed', 5000).ok, true); assert.equal(link.delay_ms(), 5000);
});

test('M24-X2: hostile inputs give an error, not an exception', async () => {
  const store = await fresh(); const link = m.createLink({mode: 'real_time'});
  for (const [s, l, c] of [[undefined, link, {clock: at(0)}], [store, null, {clock: at(0)}], [store, link, {}], [store, link, {clock: () => 'yesterday'}], [store, {}, {clock: at(0)}]]) assert.equal((await m.advance(s, l, c)).ok, false);
  assert.equal((await m.enqueue(undefined, 'x', {clock: at(0), newId})).ok, false); assert.equal((await m.enqueue(store, 'x', {})).ok, false);
  assert.equal((await m.received(undefined, {})).ok, false); assert.equal((await m.received(store, {subject: ''})).ok, false);
});

test('M24-X3: two advances at once deliver a delivery once', async () => {
  const store = await fresh(); const link = m.createLink({mode: 'real_time'}); const d = (await m.enqueue(store, (await share(store)).id, {clock: at(0), newId})).value;
  const [a, b] = await Promise.all([m.advance(store, link, {clock: at(1)}), m.advance(store, link, {clock: at(2)})]);
  assert.equal(a.value.length + b.value.length, 1); assert.equal((await delivery(store, d.id)).received, at(1)());
});
