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
const ctx = (extra = {}) => ({subject: SUBJECT, clock: () => NOW, newId: ids(), preparation_confirmed: true, ...extra});
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
  for (const step of [() => m.advance(store, ex.id, {no_record: true}), () => m.advance(store, ex.id, {no_record: true}), () => m.interrupt(store, ex.id, {reason: 'call from ground'}), () => m.resume(store, ex.id)]) { const r = await step(); assert.equal(r.ok, true); seen.push(r.value.state); }
  assert.deepEqual(seen, ['in_progress', 'in_progress', 'in_progress', 'interrupted', 'in_progress']);
  const now = await get(store, ex.id); assert.equal(now.current_step, 2); assert.equal(now.state, 'in_progress'); assert.deepEqual(now.interruptions.map(i => [i.reason, i.step]), [['call from ground', 2]]);
});

test('M13-P4: an execution keeps the version it started with', async () => {
  const store = await fresh(); const ex = await begin(store); const v2 = {...procedure, version: '2', steps: [...procedure.steps, {id: 'extra', text: 'A new step'}]};
  assert.equal(m.validateProcedure(v2).ok, true);
  assert.equal((await get(store, ex.id)).procedure_version, '1');
  await m.advance(store, ex.id, {no_record: true}); assert.equal((await get(store, ex.id)).procedure_version, '1'); assert.equal((await get(store, ex.id)).step_count, 3);
  const later = await m.start(store, v2, withDevice, ctx({newId: () => 'ex-v2'})); assert.equal(later.value.procedure_version, '2');
  assert.equal((await get(store, ex.id)).procedure_version, '1');
});

test('M13-P5: every transition the contract does not allow is refused and changes nothing', async () => {
  const force = async (store, id, state) => store.updateState('executions', id, {state});
  const actions = {advance: (s, id) => m.advance(s, id, {no_record: true}), interrupt: (s, id) => m.interrupt(s, id, {reason: 'x'}), resume: (s, id) => m.resume(s, id),
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
  const {store, ex} = await fresh1(); await m.advance(store, ex.id, {no_record: true});
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
  const {store, ex} = await fresh1(); const [a, b] = await Promise.all([m.advance(store, ex.id, {no_record: true}), m.advance(store, ex.id, {no_record: true})]);
  assert.equal(a.ok && b.ok, true); assert.equal((await get(store, ex.id)).current_step, 2);
});

test('M13-X3: no step beyond the last, and completed needs every step', async () => {
  const {store, ex} = await fresh1(); await m.advance(store, ex.id, {no_record: true});
  const early = await m.finish(store, ex.id, {state: 'completed', difficulties: []}); assert.equal(early.ok, false); assert.equal(early.error.code, 'steps_remaining'); assert.equal((await get(store, ex.id)).state, 'in_progress');
  await m.advance(store, ex.id, {no_record: true}); await m.advance(store, ex.id, {no_record: true});
  const over = await m.advance(store, ex.id, {no_record: true}); assert.equal(over.ok, false); assert.equal(over.error.code, 'no_more_steps');
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
  await m.advance(store, ex.id, {no_record: true}); assert.equal((await get(store, ex.id)).updated, started);
  await m.advance(store, ex.id, {no_record: true, clock: () => '2026-11-16T00:00:00.000Z'}); assert.equal((await get(store, ex.id)).updated, '2026-11-16T00:00:00.000Z');
  assert.equal((await m.advance(store, ex.id, {no_record: true, clock: () => 'yesterday'})).ok, false); assert.equal((await m.advance(store, ex.id, {no_record: true, clock: 'x'})).ok, false); assert.equal((await get(store, ex.id)).current_step, 2);
});

test('M13-X6: hostile inputs give an error, not an exception', async () => {
  const store = await fresh();
  for (const [s, p, c, o] of [[undefined, procedure, withDevice, ctx()], [store, null, withDevice, ctx()], [store, procedure, null, ctx()], [store, procedure, {}, ctx()], [store, procedure, withDevice, null],
    [store, procedure, withDevice, ctx({subject: ''})], [store, procedure, withDevice, ctx({clock: 'x'})], [store, procedure, withDevice, ctx({newId: () => 7})], [store, procedure, withDevice, ctx({clock: () => 'yesterday'})]])
    assert.equal((await m.start(s, p, c, o)).ok, false);
  for (const id of [undefined, '', 7, 'missing']) { assert.equal((await m.advance(store, id, {no_record: true})).ok, false); assert.equal((await m.resume(store, id)).ok, false); }
  assert.equal((await m.interrupt(store, 'missing', {reason: 'x'})).error.code, 'not_found');
  const {store: s2, ex} = await fresh1(); assert.equal((await m.interrupt(s2, ex.id, {})).ok, false); assert.equal((await m.interrupt(s2, ex.id, {reason: ''})).ok, false); assert.equal((await get(s2, ex.id)).state, 'in_progress');
});

// ---- Registry: published versions are kept, never replaced (R5) ----
const publish = (store, p, at = NOW) => m.publishProcedure(store, p, {clock: () => at});
const v = (n, extra = {}) => ({...procedure, version: String(n), ...extra});

test('M13-R1: every published version is kept and the latest is the one most recently published', async () => {
  const store = await fresh();
  assert.equal((await publish(store, v(1), '2026-11-15T10:00:00.000Z')).ok, true); assert.equal((await publish(store, v(2, {title: 'Second'}), '2026-11-15T11:00:00.000Z')).ok, true);
  const latest = (await m.listProcedures(store)).value; assert.equal(latest.length, 1); assert.equal(latest[0].version, '2'); assert.equal(latest[0].title, 'Second');
  const all = (await m.listProcedures(store, {all: true})).value; assert.deepEqual(all.map(p => p.version), ['1', '2']);
  assert.equal((await m.getProcedure(store, procedure.id, '1')).value.title, procedure.title); assert.equal((await m.getProcedure(store, procedure.id, '2')).value.title, 'Second');
  assert.equal((await m.getProcedure(store, procedure.id, '9')).error.code, 'not_found');
});

test('M13-R2: a published version cannot be replaced or published twice', async () => {
  const store = await fresh(); await publish(store, v(1));
  const again = await publish(store, v(1, {title: 'Changed'})); assert.equal(again.ok, false); assert.equal(again.error.code, 'version_exists');
  assert.equal((await m.getProcedure(store, procedure.id, '1')).value.title, procedure.title);
});

test('M13-R3: an invalid procedure, a bad clock or an id with "@" is refused and nothing is stored', async () => {
  const store = await fresh();
  for (const [p, o] of [[{...procedure, steps: []}, {clock: () => NOW}], [procedure, {}], [procedure, {clock: () => 'yesterday'}], [{...procedure, id: 'a@b'}, {clock: () => NOW}], [{...procedure, version: '1@x'}, {clock: () => NOW}], [null, {clock: () => NOW}]])
    assert.equal((await m.publishProcedure(store, p, o)).ok, false);
  assert.deepEqual((await m.listProcedures(store, {all: true})).value, []);
  assert.equal((await m.listProcedures(undefined)).ok, false); assert.equal((await m.getProcedure(store, '', '1')).ok, false);
});

test('M13-R4: an execution started from a registry version keeps that version after a newer one is published', async () => {
  const store = await fresh(); await publish(store, v(1), '2026-11-15T10:00:00.000Z');
  const ex = (await m.start(store, (await m.getProcedure(store, procedure.id, '1')).value, withDevice, ctx())).value;
  await publish(store, v(2, {steps: [{id: 'new', text: 'New first step'}]}), '2026-11-15T12:00:00.000Z');
  assert.equal((await get(store, ex.id)).procedure_version, '1'); assert.equal((await m.getProcedure(store, procedure.id, ex.procedure_version)).value.steps.length, 3);
});

test('M13-R5: a corrupt stored version is reported, not skipped', async () => {
  const store = await fresh(); await store.save('procedures', {id: 'x@1', schema_version: 2, procedure_id: 'x', version: '1', published: NOW, procedure: {id: 'x'}});
  const out = await m.listProcedures(store); assert.equal(out.ok, false); assert.equal(out.error.code, 'corrupt_procedure');
});

// ---- Made real: preparation, steps that record, retirement, and writers that cannot step on each other ----
const adv = (store, id, extra = {}) => m.advance(store, id, extra);

test('M13-N1: a procedure with preparation checks starts only once they are confirmed, and the execution says so', async () => {
  const store = await fresh(); const refused = await m.start(store, procedure, withDevice, ctx({preparation_confirmed: undefined}));
  assert.equal(refused.ok, false); assert.equal(refused.error.code, 'preparation_not_confirmed'); assert.deepEqual((await store.list('executions', {})).value, []);
  assert.equal((await m.start(store, procedure, withDevice, ctx({preparation_confirmed: 'yes'}))).ok, false, 'only true confirms');
  const ok1 = await m.start(store, procedure, withDevice, ctx()); assert.equal(ok1.value.preparation_confirmed, true);
  const none = await m.start(store, {...procedure, preparation: []}, withDevice, ctx({preparation_confirmed: undefined, newId: () => 'ex-none'})); assert.equal(none.ok, true); assert.equal(none.value.preparation_confirmed, false);
  const blocked = await m.start(store, procedure, without, ctx({preparation_confirmed: undefined, newId: () => 'ex-blocked'})); assert.equal(blocked.value.state, 'blocked', 'missing equipment is reported first, whatever the preparation');
});

test('M13-N2: a step that declares a variable needs its record or an explicit "nothing was recorded", and the skip is kept', async () => {
  const {store, ex} = await fresh1(); await store.save('records', makeRecord({id: 'pulse-1'})); await store.save('records', makeRecord({id: 'glu-1', variable: 'glucose', value: 90, unit: 'mg/dL'}));
  assert.equal((await adv(store, ex.id)).ok, true, 'step 1 declares no variable');
  const bare = await adv(store, ex.id); assert.equal(bare.ok, false); assert.equal(bare.error.code, 'record_required'); assert.equal((await get(store, ex.id)).current_step, 1);
  assert.equal((await adv(store, ex.id, {record: 'glu-1'})).error.code, 'wrong_variable');
  assert.equal((await adv(store, ex.id, {record: 'pulse-1'})).ok, true); const done = await get(store, ex.id);
  assert.deepEqual(done.records, ['pulse-1']); assert.deepEqual(done.unrecorded_steps, []);
  const other = await fresh1(); await adv(other.store, other.ex.id); await adv(other.store, other.ex.id, {no_record: true});
  const skipped = await get(other.store, other.ex.id); assert.deepEqual(skipped.unrecorded_steps, [1]); assert.deepEqual(skipped.records, []);
  assert.deepEqual(skipped.step_records, [null, 'pulse', null]);
});

test('M13-N3: a retired version is no longer offered, but stays readable for the executions that used it', async () => {
  const store = await fresh(); await publish(store, v(1), '2026-11-15T10:00:00.000Z'); await publish(store, v(2, {title: 'Second'}), '2026-11-15T11:00:00.000Z');
  const ex = (await m.start(store, v(1), withDevice, ctx())).value;
  const out = await m.retireProcedure(store, procedure.id, '2', {clock: () => NOW, reason: 'wrong step order'}); assert.equal(out.ok, true);
  assert.equal((await m.listProcedures(store)).value[0].version, '1', 'the latest that is not retired');
  assert.deepEqual((await m.listProcedures(store, {all: true})).value.map(p => p.version), ['1', '2'], 'every version stays readable');
  assert.equal((await m.getProcedure(store, procedure.id, '2')).value.title, 'Second'); assert.equal((await get(store, ex.id)).procedure_version, '1');
  await m.retireProcedure(store, procedure.id, '1', {clock: () => NOW, reason: 'old'}); assert.deepEqual((await m.listProcedures(store)).value, [], 'nothing left to offer');
  assert.equal((await m.retireProcedure(store, procedure.id, '2', {clock: () => NOW, reason: 'again'})).error.code, 'already_retired');
  for (const [id, version, o] of [[procedure.id, '9', {clock: () => NOW, reason: 'x'}], [procedure.id, '1', {clock: () => NOW}], [procedure.id, '1', {clock: () => 'late', reason: 'x'}], ['', '1', {clock: () => NOW, reason: 'x'}], [procedure.id, '1', null]])
    assert.equal((await m.retireProcedure(store, id, version, o)).ok, false);
});

test('M13-N4: a writer that read an older state is refused by the store and decides again; nothing is lost or applied twice', async () => {
  const {store, ex} = await fresh1(); let sneaked = 0;
  const racing = {...store, updateState: async (...args) => {
    if (sneaked < 2) { sneaked += 1; const now = await get(store, ex.id); await store.updateState('executions', ex.id, {difficulties: [`other tab ${sneaked}`], rev: (now.rev ?? 0) + 1}); }
    return store.updateState(...args);
  }};
  const out = await m.advance(racing, ex.id, {no_record: true}); assert.equal(out.ok, true); const now = await get(store, ex.id);
  assert.equal(now.current_step, 1, 'advanced exactly once'); assert.deepEqual(now.difficulties, ['other tab 2'], 'the other writer\'s change survived'); assert.equal(now.rev, 3);
  const always = {...store, updateState: async () => ({ok: false, error: {code: 'conflict', field: 'rev', message: 'x'}})};
  assert.equal((await m.advance(always, ex.id, {no_record: true})).error.code, 'conflict', 'it gives up visibly after a few tries');
  assert.equal((await get(store, ex.id)).current_step, 1);
});

// ---- From the independent review of F3 ----
test('M13-N5: a not-recorded or nothing-new entry is never the record of a step', async () => {
  const store = await fresh();
  const proc = {...scenario.procedures[0], id: 'n5-proc', steps: [{id: 'a', text: 'Take the pulse', records: 'pulse'}]};
  await m.publishProcedure(store, proc, {clock: () => NOW});
  for (const state of ['not_recorded', 'confirmed_none']) {
    const rec = makeRecord({id: `n5-${state}`, state}); assert.equal((await store.save('records', rec)).ok, true);
    const started = await m.start(store, proc, withDevice, {subject: SUBJECT, clock: () => NOW, newId: () => `n5-ex-${state}`, preparation_confirmed: true});
    const out = await m.advance(store, started.value.id, {clock: () => NOW, record: rec.id});
    assert.equal(out.ok, false, state); assert.equal(out.error.code, 'not_a_result');
    assert.deepEqual((await store.get('executions', started.value.id)).value.records, []);
  }
});

test('M13-N6: an id that looks like a retirement entry is refused, so retiring cannot collide with a procedure', async () => {
  const store = await fresh();
  const out = await m.publishProcedure(store, {...scenario.procedures[0], id: 'retired:a'}, {clock: () => NOW}); assert.equal(out.ok, false);
});
