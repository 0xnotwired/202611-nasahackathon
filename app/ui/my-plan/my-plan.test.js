import test from 'node:test';
import assert from 'node:assert/strict';
import {model} from './model.js';
import {viewKit} from '../base/index.js';
import {makeServices, SUBJECT, scenario, FORBIDDEN_WORDS, SCORE_KEYS, makeRecord} from '../../../tests/walkthrough/fixtures.js';

const DAY = '2026-11-15';
const task = (id, extra = {}) => ({id, schema_version: 2, subject: SUBJECT, day: DAY, description: `Task ${id}`, assigned_by: 'team_defined', completion: 'pending', result_ids: [], ...extra});
const section = (vm, id) => vm.sections.find(s => s.id === id);
const tasksOf = vm => section(vm, 'tasks').entries;
const spacecraft = scenario.config[1];
const execution = (extra = {}) => ({id: 'ex-1', schema_version: 2, procedure_id: scenario.procedures[0].id, procedure_version: '1', subject: SUBJECT, state: 'completed', current_step: 3, step_count: 3, started: `${DAY}T09:00:00.000Z`, updated: `${DAY}T09:30:00.000Z`, difficulties: [], records: [], interruptions: [], ...extra});

test('M15-P5: assigned, done and result are three separate fields; a done task with no result says "not recorded"', async () => {
  const vm = await model(await makeServices({objects: {tasks: [task('a', {completion: 'done'}), task('b', {completion: 'done', result_ids: ['r1']})]}, records: [makeRecord({id: 'r1'})]}), {});
  const [a, b] = tasksOf(vm);
  assert.equal(a.assigned_text, 'Assigned by team_defined'); assert.equal(a.done_text, 'Done'); assert.equal(a.result_text, 'not recorded');
  assert.match(b.result_text, /1 result linked/); assert.notEqual(a.done_text, a.result_text);
  for (const key of ['assigned_text', 'done_text', 'result_text']) assert.ok(Object.hasOwn(a, key));
});

test('M15-P6: progress reads "n of m done" and lists the not done and pending tasks by name; no score', async () => {
  const vm = await model(await makeServices({objects: {tasks: [task('a', {completion: 'done'}), task('b', {completion: 'done'}), task('c', {completion: 'not_done', not_done_note: {reason: 'no time'}}), task('d')]}}), {});
  const progress = section(vm, 'progress'); assert.match(progress.text, /^2 of 4 done/); assert.match(progress.text, /1 not done/); assert.match(progress.text, /1 pending/);
  assert.deepEqual(progress.not_done.map(t => t.description), ['Task c']); assert.deepEqual(progress.pending.map(t => t.description), ['Task d']);
  assert.match(tasksOf(vm).find(t => t.id === 'c').note_text, /no time/);
  for (const key of viewKit.keysOf(vm)) assert.equal(SCORE_KEYS.includes(key), false, key);
  for (const key of viewKit.keysOf(vm)) assert.doesNotMatch(key, /streak|points|badge|reward/i);
  for (const text of viewKit.textsOf(vm)) assert.doesNotMatch(text, FORBIDDEN_WORDS, text);
});

test('M15-X1: marking goes through the plan: done links the completed execution, not done needs a reason, a read-only source cannot mark', async () => {
  const services = await makeServices({objects: {tasks: [task('a', {procedure_id: scenario.procedures[0].id}), task('b'), task('c')], executions: [execution()]}});
  const vm = await model(services, {});
  const a = tasksOf(vm).find(t => t.id === 'a'); assert.equal(a.execution.id, 'ex-1'); assert.equal(a.actions.done.enabled, true);
  const after = await vm.interactions.markDone('a'); assert.equal(tasksOf(after).find(t => t.id === 'a').done_text, 'Done');
  assert.equal((await services.store.get('tasks', 'a')).value.execution_id, 'ex-1'); assert.deepEqual((await services.store.get('tasks', 'a')).value.result_ids, []);
  assert.equal(after.message.kind, 'info');
  const blank = await vm.interactions.markNotDone('b', '  '); assert.equal(blank.message.kind, 'error'); assert.equal((await services.store.get('tasks', 'b')).value.completion, 'pending');
  const reasoned = await vm.interactions.markNotDone('b', 'no time'); assert.equal((await services.store.get('tasks', 'b')).value.not_done_note.reason, 'no time'); assert.equal(reasoned.message.kind, 'info');
  const ro = await makeServices({writable: false, objects: {tasks: [task('z')]}}); const rv = await model(ro, {});
  assert.equal(tasksOf(rv)[0].actions.done.enabled, false); assert.match(tasksOf(rv)[0].actions.done.reason, /not available/);
  assert.equal((await rv.interactions.markDone('z')).message.kind, 'error'); assert.equal((await ro.store.get('tasks', 'z')).value.completion, 'pending');
});

test('M15-X2: a task of a procedure says whether the mission equipment allows it, and that changes with the configuration', async () => {
  const objects = {tasks: [task('a', {procedure_id: scenario.procedures[0].id})]};
  const station = tasksOf(await model(await makeServices({objects}), {}))[0].procedure, craft = tasksOf(await model(await makeServices({objects, config: spacecraft}), {}))[0].procedure;
  assert.equal(station.can_start, true); assert.equal(craft.can_start, false); assert.match(craft.availability_text, /demo-device/);
});

test('M15-X3: while plan answers not_implemented the tasks section says so and the view stays ready; other failures stay in the section', async () => {
  for (const [plan, state] of [[{tasksFor: async () => ({ok: false, error: {code: 'not_implemented', message: 'x'}}), progress: async () => ({ok: false, error: {code: 'not_implemented', message: 'x'}})}, 'not_available'],
    [{tasksFor: async () => ({ok: false, error: {code: 'boom', message: 'boom'}}), progress: async () => ({ok: false, error: {code: 'boom', message: 'boom'}})}, 'error']]) {
    const vm = await model(await makeServices({plan}), {}); assert.equal(vm.state, 'ready'); assert.equal(section(vm, 'tasks').state, state);
  }
  assert.equal(section(await model(await makeServices({drop: ['plan']}), {}), 'tasks').state, 'not_available');
  assert.equal(section(await model(await makeServices(), {}), 'tasks').state, 'empty');
});

test('M15-X4: hostile services give an error view model', async () => {
  const base = await makeServices();
  for (const broken of [{store: undefined}, {readings: {}}, {subject: ''}, {clock: 'x'}]) assert.equal((await model({...base, ...broken}, {})).state, 'error');
  for (const input of [undefined, null, 'x', 7]) assert.equal((await model(input, {})).state, 'error');
});
