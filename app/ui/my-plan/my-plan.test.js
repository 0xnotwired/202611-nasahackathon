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

// ---- Made real: create, repeat, reopen, link, choose the execution ----
test('M15-R6: a task can be added, validated, and repeated only on the days the person chose', async () => {
  const services = await makeServices(); const vm = await model(services, {});
  assert.equal(section(vm, 'create').actions.create.enabled, true);
  for (const bad of [{}, {description: 'x'}, {description: 'x', scheduled_at: 'soon'}, {description: 'x', scheduled_at: '2026-11-15T10:00:00Z'}, {description: 'x', scheduled_at: '2026-11-15T10:00:00Z', planned_minutes: '1.5'}, {description: 'x', scheduled_at: '2026-11-15T10:00:00Z', planned_minutes: '10', every_days: '0', count: '3'}])
    assert.equal((await vm.interactions.createTask(bad)).message.kind, 'error', JSON.stringify(bad));
  const one = await vm.interactions.createTask({description: 'Weigh myself', scheduled_at: '2026-11-15T10:00:00Z', planned_minutes: '5'});
  assert.equal(one.message.kind, 'info'); const made = tasksOf(one).find(t => t.description === 'Weigh myself'); assert.match(made.assigned_text, /self/); assert.match(made.scheduled_text, /5 min/);
  const series = await vm.interactions.createTask({description: 'Blood draw', scheduled_at: '2026-11-15T10:00:00Z', planned_minutes: '10', every_days: '3', count: '3'});
  assert.equal(series.message.kind, 'info'); const all = (await services.store.list('tasks', {})).value.filter(t => t.description === 'Blood draw');
  assert.deepEqual(all.map(t => t.scheduled_at.slice(0, 10)).sort(), ['2026-11-15', '2026-11-18', '2026-11-21']); assert.equal(new Set(all.map(t => t.series_id)).size, 1);
  const ro = await model(await makeServices({writable: false}), {}); assert.equal(section(ro, 'create').actions.create.enabled, false); assert.equal((await ro.interactions.createTask({description: 'x', scheduled_at: '2026-11-15T10:00:00Z'})).message.kind, 'error');
});

test('M15-R7: undo needs a reason, keeps the history and the linked results; a result links without changing the mark', async () => {
  const services = await makeServices({objects: {tasks: [task('a')]}, records: [makeRecord({id: 'p1'}), makeRecord({id: 'p2', state: 'not_recorded'})]}); let vm = await model(services, {});
  assert.deepEqual(tasksOf(vm)[0].link_choices.map(c => c.id).includes('p2'), false, 'a not-recorded entry is never offered as a result');
  vm = await vm.interactions.linkResult('a', 'p1'); assert.equal(vm.message.kind, 'info'); assert.equal(tasksOf(vm)[0].completion, 'pending'); assert.equal(tasksOf(vm)[0].link_choices.some(c => c.id === 'p1'), false);
  assert.equal((await vm.interactions.linkResult('a', 'p2')).message.kind, 'error'); assert.equal((await vm.interactions.reopen('a', 'why')).message.kind, 'error', 'a pending task has nothing to undo');
  vm = await vm.interactions.markDone('a'); assert.equal(tasksOf(vm)[0].actions.reopen.enabled, true);
  assert.equal((await vm.interactions.reopen('a', ' ')).message.kind, 'error');
  vm = await vm.interactions.reopen('a', 'marked by mistake'); const t = tasksOf(vm)[0]; assert.equal(t.completion, 'pending'); assert.deepEqual(t.result_ids, ['p1']); assert.ok(t.history.some(h => /marked by mistake/.test(h)));
});

test('M15-R8: with several completed executions the person chooses which one the task counts', async () => {
  const services = await makeServices({objects: {tasks: [task('a', {procedure_id: scenario.procedures[0].id})], executions: [execution(), execution({id: 'ex-2', updated: `${DAY}T12:00:00.000Z`})]}}); const vm = await model(services, {});
  assert.equal(tasksOf(vm)[0].execution_choices.length, 2);
  assert.equal((await vm.interactions.markDone('a', 'nope')).message.kind, 'error'); assert.equal((await services.store.get('tasks', 'a')).value.completion, 'pending');
  await vm.interactions.markDone('a', 'ex-1'); assert.equal((await services.store.get('tasks', 'a')).value.execution_id, 'ex-1');
});

// ---- From the independent review of F3 ----
test('M15-R9: a date without the Z (a local or zone-less time) is refused; nothing is converted with the browser zone', async () => {
  const services = await makeServices(); const vm = await model(services, {});
  for (const at of ['2026-11-15T23:30:00', '2026-11-15', 'Nov 15 2026 23:30', '2026-11-15T23:30:00+02:00', '2026-02-30T10:00:00Z'])
    assert.equal((await vm.interactions.createTask({description: 'x', scheduled_at: at, planned_minutes: '5'})).message.kind, 'error', at);
  assert.equal((await services.store.list('tasks', {})).value.filter(t => t.description === 'x').length, 0);
  assert.equal((await vm.interactions.createTask({description: 'ok', scheduled_at: '2026-11-15T23:30:00Z', planned_minutes: '5'})).message.kind, 'info');
});

test('M15-R10: an old execution never evidences a task of a later day; with none that fits, the task is marked done without one and says so', async () => {
  const old = execution({id: 'ex-old', updated: '2026-10-01T10:00:00.000Z'});
  const services = await makeServices({objects: {tasks: [task('a', {procedure_id: scenario.procedures[0].id})], executions: [old]}}); const vm = await model(services, {});
  assert.equal(tasksOf(vm)[0].execution, null); assert.deepEqual(tasksOf(vm)[0].execution_choices, []);
  await vm.interactions.markDone('a'); const saved = (await services.store.get('tasks', 'a')).value; assert.equal(saved.completion, 'done'); assert.equal(saved.execution_id ?? null, null);
  assert.equal((await vm.interactions.markDone('a', 'ex-old')).message.kind, 'error');
});

test('M15-R11: the history never prints "null": a mark carries the time, and a missing one reads "time not recorded"', async () => {
  const services = await makeServices({objects: {tasks: [task('a'), task('b', {completion: 'done', history: [{completion: 'done', at: null}]})]}}); let vm = await model(services, {});
  assert.match(tasksOf(vm).find(t => t.id === 'b').history[0], /time not recorded/);
  vm = await vm.interactions.markDone('a'); vm = await vm.interactions.reopen('a', 'oops');
  for (const line of tasksOf(vm).find(t => t.id === 'a').history) assert.doesNotMatch(line, /null/);
  assert.match((await services.store.get('tasks', 'a')).value.history[0].at, /^2026-/);
});

test('M15-R13: minutes and repeat counts are digits only (no 0x10, 1e3, 1.5); only values observed after the task are offered as results', async () => {
  const services = await makeServices({objects: {tasks: [task('a', {scheduled_at: `${DAY}T12:00:00.000Z`, planned_minutes: 10})]}, records: [makeRecord({id: 'early', time: `${DAY}T09:00:00.000Z`}), makeRecord({id: 'late', time: `${DAY}T13:00:00.000Z`}), makeRecord({id: 'unplaced', time: null, source_time: {raw: '2026-11-15T14:00', value: '2026-11-15T14:00', precision: 'minute', scope: 'subject', calendar: 'unknown', timezone: null}})]});
  const vm = await model(services, {}); const base = {description: 'x', scheduled_at: '2026-11-15T10:00:00Z'};
  for (const bad of [{planned_minutes: '0x10'}, {planned_minutes: '1e3'}, {planned_minutes: '1.5'}, {planned_minutes: '-5'}, {planned_minutes: '10', every_days: '0x2', count: '3'}, {planned_minutes: '10', every_days: '2', count: '2.5'}])
    assert.equal((await vm.interactions.createTask({...base, ...bad})).message.kind, 'error', JSON.stringify(bad));
  const offered = tasksOf(vm).find(t => t.id === 'a').link_choices.map(c => c.id); assert.ok(offered.includes('late')); assert.equal(offered.includes('early'), false); assert.equal(offered.includes('unplaced'), false);
  assert.equal((await services.store.list('tasks', {})).value.filter(t => t.description === 'x').length, 0);
});
