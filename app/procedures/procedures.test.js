import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from './index.js';
import {openStore} from '../store/index.js';
import {scenario, makeRecord, SUBJECT, NOW} from '../../tests/walkthrough/fixtures.js';

const procedure = scenario.procedures[0]; // three steps, needs demo-device
const withDevice = scenario.config[0], without = scenario.config[1];
let seq = 0;
const fresh = async () => (await openStore({kind: 'memory', name: `proc-${++seq}`})).value;
const ids = () => { let n = 0; return () => `ex-${++n}`; };
const ctx = (extra = {}) => ({subject: SUBJECT, clock: () => NOW, newId: ids(), ...extra});
const begin = async (store, config = withDevice, proc = procedure) => (await m.start(store, proc, config, ctx())).value;
const get = async (store, id) => (await store.get('executions', id)).value;
const fresh1 = async () => { const store = await fresh(); const ex = await begin(store); return {store, ex}; };

test('M13-P1: start with a missing item is blocked, names exactly that item and creates no record', async () => {
  const store = await fresh(); const out = await m.start(store, procedure, without, ctx());
  assert.equal(out.ok, true); assert.equal(out.value.state, 'blocked'); assert.deepEqual(out.value.missing, ['demo-device']);
  assert.equal((await store.list('records', {})).value.length, 0); assert.equal((await get(store, out.value.id)).state, 'blocked');
});

test('M13-P2: an alternative appears only when the procedure declares it', async () => {
  assert.equal(Object.hasOwn(m.availability(procedure, without), 'alternative_id'), false);
  const declared = {...procedure, documented_alternative: 'alt-7'};
  assert.equal(m.availability(declared, without).alternative_id, 'alt-7');
  assert.equal(m.availability({...procedure, id: 'other', title: procedure.title}, without).alternative_id, undefined);
  const ok = m.availability(declared, withDevice); assert.equal(ok.available, true); assert.deepEqual(ok.missing, []); assert.equal(Object.hasOwn(ok, 'alternative_id'), false);
});

test('M13-P3: interrupt and resume keep the step and never complete', async () => {
  const {store, ex} = await fresh1(); const seen = [ex.state];
  for (const step of [() => m.advance(store, ex.id, {}), () => m.advance(store, ex.id, {}), () => m.interrupt(store, ex.id, {reason: 'call from ground'}), () => m.resume(store, ex.id)]) { const r = await step(); assert.equal(r.ok, true); seen.push(r.value.state); }
  assert.deepEqual(seen, ['in_progress', 'in_progress', 'in_progress', 'interrupted', 'in_progress']);
  const now = await get(store, ex.id); assert.equal(now.current_step, 2); assert.equal(now.state, 'in_progress'); assert.deepEqual(now.interruptions.map(i => [i.reason, i.step]), [['call from ground', 2]]);
});

test('M13-P4: an execution keeps the version it started with', async () => {
  const store = await fresh(); const ex = await begin(store); const v2 = {...procedure, version: '2', steps: [...procedure.steps, {id: 'extra', text: 'A new step'}]};
  assert.equal(m.validateProcedure(v2).ok, true);
  assert.equal((await get(store, ex.id)).procedure_version, '1');
  await m.advance(store, ex.id, {}); assert.equal((await get(store, ex.id)).procedure_version, '1'); assert.equal((await get(store, ex.id)).step_count, 3);
  const later = await m.start(store, v2, withDevice, ctx({newId: () => 'ex-v2'})); assert.equal(later.value.procedure_version, '2');
  assert.equal((await get(store, ex.id)).procedure_version, '1');
});

test('M13-P5: every transition the contract does not allow is refused and changes nothing', async () => {
  const force = async (store, id, state) => store.updateState('executions', id, {state});
  const actions = {advance: (s, id) => m.advance(s, id, {}), interrupt: (s, id) => m.interrupt(s, id, {reason: 'x'}), resume: (s, id) => m.resume(s, id),
    completed: (s, id) => m.finish(s, id, {state: 'completed', difficulties: []}), could_not: (s, id) => m.finish(s, id, {state: 'could_not', difficulties: []})};
  const forbidden = {blocked: ['advance', 'interrupt', 'resume', 'completed', 'could_not'], in_progress: ['resume'], interrupted: ['advance', 'interrupt', 'completed'],
    completed: ['advance', 'interrupt', 'resume', 'completed', 'could_not'], could_not: ['advance', 'interrupt', 'resume', 'completed', 'could_not']};
  for (const [state, names] of Object.entries(forbidden)) for (const name of names) {
    const store = await fresh(); const ex = await begin(store); await force(store, ex.id, state);
    const before = await get(store, ex.id); const out = await actions[name](store, ex.id);
    assert.equal(out.ok, false, `${state} must refuse ${name}`); assert.equal(out.error.code, 'transition_not_allowed', `${state}/${name}`); assert.deepEqual(await get(store, ex.id), before, `${state}/${name} changed the execution`);
  }
  const {store, ex} = await fresh1(); assert.equal((await m.finish(store, ex.id, {state: 'in_progress', difficulties: []})).ok, false);
});

test('M13-P6: could_not keeps the difficulties as given', async () => {
  const {store, ex} = await fresh1(); await m.advance(store, ex.id, {});
  const out = await m.finish(store, ex.id, {state: 'could_not', difficulties: ['no cuff on board']});
  assert.equal(out.ok, true); assert.equal(out.value.state, 'could_not'); assert.deepEqual((await get(store, ex.id)).difficulties, ['no cuff on board']);
  const bad = await fresh1(); assert.equal((await m.finish(bad.store, bad.ex.id, {state: 'could_not', difficulties: ['']})).ok, false);
  assert.equal((await m.finish(bad.store, bad.ex.id, {state: 'could_not', difficulties: 'no'})).ok, false); assert.equal((await get(bad.store, bad.ex.id)).state, 'in_progress');
});

test('M13-X1: validateProcedure refuses malformed procedures and returns a copy', () => {
  const ok = m.validateProcedure(procedure); assert.equal(ok.ok, true); assert.notEqual(ok.value, procedure); assert.deepEqual(ok.value.steps, procedure.steps);
  for (const bad of [null, [], 'x', {}, {...procedure, steps: []}, {...procedure, steps: [{id: 'a', text: 'x'}, {id: 'a', text: 'y'}]}, {...procedure, review_status: 'approved'}, {...procedure, required_equipment: [1]},
    {...procedure, version: 2}, {...procedure, id: ''}, {...procedure, documented_alternative: procedure.id}, {...procedure, steps: [{id: 'a'}]}]) assert.equal(m.validateProcedure(bad).ok, false, JSON.stringify(bad)?.slice(0, 60));
  const trap = {...procedure}; Object.defineProperty(trap, 'title', {get() { throw new Error('x'); }, enumerable: true}); assert.equal(m.validateProcedure(trap).ok, false);
  assert.equal(m.availability(null, withDevice).available, false); assert.equal(m.availability(procedure, {}).available, false); assert.match(m.availability(procedure, {}).problem, /equipment/);
});

test('M13-X2: two concurrent advances both land (no lost update)', async () => {
  const {store, ex} = await fresh1(); const [a, b] = await Promise.all([m.advance(store, ex.id, {}), m.advance(store, ex.id, {})]);
  assert.equal(a.ok && b.ok, true); assert.equal((await get(store, ex.id)).current_step, 2);
});

test('M13-X3: no step beyond the last, and completed needs every step', async () => {
  const {store, ex} = await fresh1(); await m.advance(store, ex.id, {});
  const early = await m.finish(store, ex.id, {state: 'completed', difficulties: []}); assert.equal(early.ok, false); assert.equal(early.error.code, 'steps_remaining'); assert.equal((await get(store, ex.id)).state, 'in_progress');
  await m.advance(store, ex.id, {}); await m.advance(store, ex.id, {});
  const over = await m.advance(store, ex.id, {}); assert.equal(over.ok, false); assert.equal(over.error.code, 'no_more_steps');
  assert.equal((await m.finish(store, ex.id, {state: 'completed', difficulties: []})).value.state, 'completed');
});

test('M13-X4: a produced record is linked only if it exists and belongs to the subject', async () => {
  const {store, ex} = await fresh1(); await store.save('records', makeRecord({id: 'mine-1'})); await store.save('records', makeRecord({id: 'theirs-1', subject: 'someone-else'}));
  assert.equal((await m.advance(store, ex.id, {record: 'nope'})).error.code, 'unknown_record'); assert.equal((await m.advance(store, ex.id, {record: 'theirs-1'})).error.code, 'other_subject');
  assert.equal((await m.advance(store, ex.id, {record: 7})).ok, false); assert.equal((await get(store, ex.id)).current_step, 0);
  const good = await m.advance(store, ex.id, {record: 'mine-1'}); assert.equal(good.ok, true); assert.deepEqual((await get(store, ex.id)).records, ['mine-1']);
});

test('M13-X5: time is stamped only from an injected clock, never invented', async () => {
  const {store, ex} = await fresh1(); const started = (await get(store, ex.id)).updated;
  await m.advance(store, ex.id, {}); assert.equal((await get(store, ex.id)).updated, started);
  await m.advance(store, ex.id, {clock: () => '2026-11-16T00:00:00.000Z'}); assert.equal((await get(store, ex.id)).updated, '2026-11-16T00:00:00.000Z');
  assert.equal((await m.advance(store, ex.id, {clock: () => 'yesterday'})).ok, false); assert.equal((await m.advance(store, ex.id, {clock: 'x'})).ok, false); assert.equal((await get(store, ex.id)).current_step, 2);
});

test('M13-X6: hostile inputs give an error, not an exception', async () => {
  const store = await fresh();
  for (const [s, p, c, o] of [[undefined, procedure, withDevice, ctx()], [store, null, withDevice, ctx()], [store, procedure, null, ctx()], [store, procedure, {}, ctx()], [store, procedure, withDevice, null],
    [store, procedure, withDevice, ctx({subject: ''})], [store, procedure, withDevice, ctx({clock: 'x'})], [store, procedure, withDevice, ctx({newId: () => 7})], [store, procedure, withDevice, ctx({clock: () => 'yesterday'})]])
    assert.equal((await m.start(s, p, c, o)).ok, false);
  for (const id of [undefined, '', 7, 'missing']) { assert.equal((await m.advance(store, id, {})).ok, false); assert.equal((await m.resume(store, id)).ok, false); }
  assert.equal((await m.interrupt(store, 'missing', {reason: 'x'})).error.code, 'not_found');
  const {store: s2, ex} = await fresh1(); assert.equal((await m.interrupt(s2, ex.id, {})).ok, false); assert.equal((await m.interrupt(s2, ex.id, {reason: ''})).ok, false); assert.equal((await get(s2, ex.id)).state, 'in_progress');
});
