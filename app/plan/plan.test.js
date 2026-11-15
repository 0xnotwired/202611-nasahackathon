import test from 'node:test';
import assert from 'node:assert/strict';
import * as plan from './index.js';
import {openStore} from '../store/index.js';
import {scenario, makeRecord, SUBJECT} from '../../tests/walkthrough/fixtures.js';

let seq = 0;
const DAY = '2026-11-15';
const task = (id, extra = {}) => ({id, schema_version: 2, subject: SUBJECT, day: DAY, description: `Task ${id}`, assigned_by: 'team_defined', completion: 'pending', result_ids: [], ...extra});
const execution = (id, extra = {}) => ({id, schema_version: 2, procedure_id: 'p1', procedure_version: '1', subject: SUBJECT, state: 'completed', current_step: 3, step_count: 3, started: `${DAY}T09:00:00.000Z`, updated: `${DAY}T09:30:00.000Z`, difficulties: [], records: [], interruptions: [], ...extra});
async function setup({tasks = [], executions = [], records = []} = {}) {
  const store = (await openStore({kind: 'memory', name: `plan-${++seq}`})).value;
  for (const [name, list] of [['tasks', tasks], ['executions', executions], ['records', records]]) { const r = await store.saveBatch(name, list); assert.equal(r.ok, true, JSON.stringify(r)); }
  return store;
}
const one = async (store, id) => (await store.get('tasks', id)).value;
const q = {subject: SUBJECT, day: DAY};

test('M14-P1: marking done creates no result and no record', async () => {
  const store = await setup({tasks: [task('t1')], records: scenario.records});
  const before = (await store.list('records', {})).value.length; const out = await plan.mark(store, 't1', {completion: 'done'});
  assert.equal(out.ok, true); assert.equal(out.value.completion, 'done'); assert.deepEqual((await one(store, 't1')).result_ids, []); assert.equal((await store.list('records', {})).value.length, before);
});

test('M14-P2: an unmarked task stays pending, and appears only on its own day', async () => {
  const store = await setup({tasks: [task('t1'), task('periodic-exam', {day: '2026-11-22'})]});
  const today = await plan.tasksFor(store, q); assert.deepEqual(today.value.map(t => [t.id, t.completion]), [['t1', 'pending']]);
  const later = await plan.tasksFor(store, {...q, day: '2026-11-16'}); assert.deepEqual(later.value, []);
  assert.deepEqual((await plan.tasksFor(store, {...q, day: '2026-11-22'})).value.map(t => t.id), ['periodic-exam']);
  assert.equal((await plan.tasksFor(store, q)).value[0].completion, 'pending');
});

test('M14-P3: not_done keeps a structured reason and who assigned the task', async () => {
  const store = await setup({tasks: [task('t1', {assigned_by: 'flight_surgeon'})]});
  const out = await plan.mark(store, 't1', {completion: 'not_done', note: {reason: 'no time'}});
  assert.equal(out.ok, true); const saved = await one(store, 't1'); assert.deepEqual(saved.not_done_note, {reason: 'no time'}); assert.equal(saved.assigned_by, 'flight_surgeon'); assert.equal(saved.completion, 'not_done');
  const other = await setup({tasks: [task('a'), task('b'), task('c')]});
  assert.equal((await plan.mark(other, 'a', {completion: 'not_done', note: {}})).ok, false); assert.equal((await plan.mark(other, 'b', {completion: 'not_done', note: 'no time'})).ok, false);
  assert.equal((await plan.mark(other, 'c', {completion: 'done', note: {reason: 'x'}})).ok, false); assert.equal((await one(other, 'a')).completion, 'pending');
});

test('M14-P4: linking a result leaves a pending task pending', async () => {
  const store = await setup({tasks: [task('t1')], records: [makeRecord({id: 'r1'})]});
  const out = await plan.linkResult(store, 't1', 'r1'); assert.equal(out.ok, true); const saved = await one(store, 't1');
  assert.deepEqual(saved.result_ids, ['r1']); assert.equal(saved.completion, 'pending');
});

test('M14-P5: progress counts done, not done and pending separately', async () => {
  const store = await setup({tasks: [task('a'), task('b'), task('c'), task('d'), task('other-day', {day: '2026-11-16'}), task('other-subject', {subject: 'someone-else'})]});
  await plan.mark(store, 'a', {completion: 'done'}); await plan.mark(store, 'b', {completion: 'done'}); await plan.mark(store, 'c', {completion: 'not_done', note: {reason: 'x'}});
  assert.deepEqual((await plan.progress(store, q)).value, {total: 4, done: 2, not_done: 1, pending: 1});
  assert.deepEqual((await plan.progress(store, {subject: SUBJECT, day: '2026-12-01'})).value, {total: 0, done: 0, not_done: 0, pending: 0});
});

test('M14-P6: linking a result to a done task changes no count and adds nothing', async () => {
  const store = await setup({tasks: [task('a'), task('b')], records: [makeRecord({id: 'r1'})]});
  await plan.mark(store, 'a', {completion: 'done'}); const before = (await plan.progress(store, q)).value;
  await plan.linkResult(store, 'a', 'r1'); assert.deepEqual((await plan.progress(store, q)).value, before); assert.deepEqual(Object.keys(before).sort(), ['done', 'not_done', 'pending', 'total']);
});

test('M14-X1: only pending tasks can be marked, only done or not_done, only known tasks', async () => {
  const store = await setup({tasks: [task('t1')]});
  for (const completion of ['pending', 'x', undefined, 7]) assert.equal((await plan.mark(store, 't1', {completion})).ok, false);
  assert.equal((await plan.mark(store, 'missing', {completion: 'done'})).error.code, 'not_found'); assert.equal((await plan.mark(store, 't1', null)).ok, false);
  await plan.mark(store, 't1', {completion: 'done'}); const again = await plan.mark(store, 't1', {completion: 'not_done', note: {reason: 'x'}});
  assert.equal(again.ok, false); assert.equal(again.error.code, 'already_marked'); assert.equal((await one(store, 't1')).completion, 'done');
});

test('M14-X2: an execution link must exist, belong to the subject and match the task', async () => {
  const store = await setup({tasks: [task('a', {procedure_id: 'p1'}), task('b', {procedure_id: 'p1'}), task('c', {procedure_id: 'p1'}), task('d', {procedure_id: 'p1'}), task('e', {procedure_id: 'p1'})],
    executions: [execution('ok'), execution('running', {state: 'in_progress', current_step: 1}), execution('theirs', {subject: 'someone-else'}), execution('wrong', {procedure_id: 'p2'})]});
  assert.equal((await plan.mark(store, 'a', {completion: 'done', execution_id: 'nope'})).error.code, 'unknown_execution');
  assert.equal((await plan.mark(store, 'a', {completion: 'done', execution_id: 'running'})).error.code, 'execution_not_completed');
  assert.equal((await plan.mark(store, 'a', {completion: 'done', execution_id: 'theirs'})).error.code, 'other_subject');
  assert.equal((await plan.mark(store, 'a', {completion: 'done', execution_id: 'wrong'})).error.code, 'procedure_mismatch'); assert.equal((await one(store, 'a')).completion, 'pending');
  const good = await plan.mark(store, 'a', {completion: 'done', execution_id: 'ok'}); assert.equal(good.ok, true); assert.equal((await one(store, 'a')).execution_id, 'ok');
  assert.equal((await plan.mark(store, 'b', {completion: 'not_done', execution_id: 'running', note: {reason: 'interrupted'}})).ok, true);
});

test('M14-X3: a result must exist, be a recorded value of the subject, and links never duplicate or get lost', async () => {
  const store = await setup({tasks: [task('t1')], records: [makeRecord({id: 'r1'}), makeRecord({id: 'r2'}), makeRecord({id: 'gone', state: 'not_recorded'}), makeRecord({id: 'theirs', subject: 'someone-else'})]});
  assert.equal((await plan.linkResult(store, 't1', 'nope')).error.code, 'unknown_record'); assert.equal((await plan.linkResult(store, 't1', 'theirs')).error.code, 'other_subject');
  assert.equal((await plan.linkResult(store, 't1', 'gone')).error.code, 'not_a_result'); assert.equal((await plan.linkResult(store, 'missing', 'r1')).error.code, 'not_found');
  const both = await Promise.all([plan.linkResult(store, 't1', 'r1'), plan.linkResult(store, 't1', 'r2'), plan.linkResult(store, 't1', 'r1')]);
  assert.equal(both.every(r => r.ok), true); assert.deepEqual((await one(store, 't1')).result_ids.sort(), ['r1', 'r2']);
});

test('M14-X4: hostile inputs give an error; a corrupt stored task is reported, not dropped', async () => {
  const store = await setup({tasks: [task('t1')]});
  for (const query of [undefined, null, {}, {subject: '', day: DAY}, {subject: SUBJECT, day: '15-11-2026'}, {subject: SUBJECT, day: '2026-02-31'}]) assert.equal((await plan.tasksFor(store, query)).ok, false);
  for (const s of [undefined, {}, null]) { assert.equal((await plan.tasksFor(s, q)).ok, false); assert.equal((await plan.progress(s, q)).ok, false); }
  const broken = await setup({tasks: [task('t1'), task('t2', {completion: 'weird'})]}); const out = await plan.tasksFor(broken, q);
  assert.equal(out.ok, false); assert.equal(out.error.code, 'corrupt_task'); assert.match(out.error.message, /t2/);
});
