import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as m from './index.js';
import {openStore} from '../store/index.js';
import {SUBJECT, NOW} from '../../tests/walkthrough/fixtures.js';

let seq = 0;
const fresh = async () => (await openStore({kind: 'memory', name: `priv-${++seq}`})).value;
const ids = () => { let n = 0; return () => `sh-${++n}`; };
const fields = (extra = {}) => ({subject: SUBJECT, what: ['r1', 'r2'], with: 'ground panel (simulated)', channel: 'simulated sync', ...extra});
const ctx = (extra = {}) => ({clock: () => NOW, newId: ids(), ...extra});

test('M19-P1: with an active session nothing asks to unlock again', () => {
  const session = m.createSession({clock: () => NOW});
  assert.equal(session.active(), false); session.unlock(); session.unlock(); assert.equal(session.active(), true); session.close(); assert.equal(session.active(), false);
});

test('M19-P2: every sharing leaves an entry with what, with whom and when', async () => {
  const store = await fresh(); const out = await m.logShared(store, fields(), ctx());
  assert.equal(out.ok, true); assert.deepEqual(out.value, {id: 'sh-1', schema_version: 1, subject: SUBJECT, time: NOW, what: ['r1', 'r2'], with: 'ground panel (simulated)', channel: 'simulated sync'});
  assert.deepEqual((await m.sharedLog(store, {subject: SUBJECT})).value, [out.value]); assert.deepEqual((await m.sharedLog(store, {subject: 'other'})).value, []);
});

test('M19-P3: the shared log cannot be edited or deleted, through this module or the store', async () => {
  const store = await fresh(); const out = await m.logShared(store, fields(), ctx());
  assert.deepEqual(Object.keys(m).sort(), ['createSession', 'logShared', 'sharedLog']);
  assert.equal((await store.updateState('shared', out.value.id, {with: 'someone else'})).ok, false);
  assert.equal((await store.save('shared', out.value)).ok, false); assert.equal((await store.get('shared', out.value.id)).value.with, 'ground panel (simulated)');
});

test('M19-P4: no text in the module claims protection', () => {
  const source = readFileSync(new URL('./index.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /encrypt|secure|protect/i);
});

test('M19-P5: a locked session cannot share, and nothing is written', async () => {
  const store = await fresh(); const session = m.createSession({clock: () => NOW});
  const locked = await m.logShared(store, fields(), ctx({session})); assert.equal(locked.ok, false); assert.equal(locked.error.code, 'session_locked'); assert.deepEqual((await store.list('shared', {})).value, []);
  session.unlock(); assert.equal((await m.logShared(store, fields(), ctx({session}))).ok, true);
  session.close(); assert.equal((await m.logShared(store, fields(), ctx({session}))).ok, false);
});

test('M19-X1: invalid input is refused and nothing is written', async () => {
  const store = await fresh();
  for (const bad of [{...fields(), subject: ''}, {...fields(), what: []}, {...fields(), what: [1]}, {...fields(), what: ''}, {...fields(), with: ''}, {...fields(), channel: undefined}, null, 'x', {...fields(), what: Array(101).fill('r')}])
    assert.equal((await m.logShared(store, bad, ctx())).ok, false, JSON.stringify(bad)?.slice(0, 50));
  for (const c of [undefined, {}, {clock: () => 'yesterday', newId: ids()}, {clock: () => NOW, newId: () => 7}]) assert.equal((await m.logShared(store, fields(), c)).ok, false);
  assert.equal((await m.logShared(undefined, fields(), ctx())).ok, false); assert.equal((await m.sharedLog(store, {subject: ''})).ok, false); assert.equal((await m.sharedLog(undefined, {subject: 'x'})).ok, false);
  assert.deepEqual((await store.list('shared', {})).value, []);
});

test('M19-X2: a single what given as text is kept as text; the log is ordered by time', async () => {
  const store = await fresh(); await m.logShared(store, fields({what: 'summary:s1'}), ctx());
  let n = 0; await m.logShared(store, fields(), {clock: () => '2026-11-15T17:00:00.000Z', newId: () => `early-${++n}`});
  const log = (await m.sharedLog(store, {subject: SUBJECT})).value; assert.deepEqual(log.map(x => x.id), ['early-1', 'sh-1']); assert.equal(log[1].what, 'summary:s1');
});
