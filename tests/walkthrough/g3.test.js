// G3 walkthrough, model level (RUN). Predictions, written before this file:
//  W1 a configuration that lacks the equipment gives a blocked execution naming the missing item, the task stays pending, no result exists;
//  W2 with the equipment: start, interrupt, resume, finish, mark done gives one completed execution, a done task and no result until one is linked;
//  W3 publishing version 2 afterwards leaves the execution on version 1; W4 G1 and G2 still pass.
// The keyboard walk of My plan and On board in a browser is tests/walkthrough/g3-browser.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {model as board} from '../../app/ui/on-board/model.js';
import {model as myPlan} from '../../app/ui/my-plan/model.js';
import {makeServices, scenario, SUBJECT, countRecords} from './fixtures.js';

const proc = scenario.procedures[0];
const spacecraft = scenario.config[1];
const task = {id: 'g3-task', schema_version: 2, subject: SUBJECT, day: '2026-11-15', procedure_id: proc.id, description: 'Do the demo procedure', assigned_by: 'team_defined', completion: 'pending', result_ids: []};
const entry = (vm, sectionId, id) => vm.sections.find(s => s.id === sectionId).entries.find(e => e.id === id);

test('G3-W1: without the equipment the execution is blocked, the task stays pending and no result exists', async () => {
  const services = await makeServices({config: spacecraft, objects: {tasks: [task]}}); const before = await countRecords(services.store);
  const vm = await board(services, {}); const p = entry(vm, 'procedures', proc.id);
  assert.equal(p.availability.available, false); assert.equal(p.actions.some(a => a.id === 'start'), false);
  const out = await services.procedures.start(services.store, proc, services.config, {subject: SUBJECT, clock: services.clock, newId: services.newId});
  assert.equal(out.value.state, 'blocked'); assert.deepEqual(out.value.missing, ['demo-device']);
  const saved = (await services.store.get('tasks', 'g3-task')).value; assert.equal(saved.completion, 'pending'); assert.deepEqual(saved.result_ids, []);
  assert.equal(await countRecords(services.store), before, 'no record was created');
  const plan = await myPlan(services, {}); assert.equal(entry(plan, 'tasks', 'g3-task').procedure.can_start, false); assert.equal(entry(plan, 'tasks', 'g3-task').result_text, 'not recorded');
});

async function fullJourney() {
  const services = await makeServices({objects: {tasks: [task]}}); const before = await countRecords(services.store);
  let vm = await (await board(services, {})).interactions.start(proc.id, {confirmed: true}); const id = vm.sections.find(s => s.id === 'executions').entries[0].id;
  vm = await vm.interactions.advance(id, {no_record: true}); vm = await vm.interactions.interrupt(id, 'call from ground'); vm = await vm.interactions.resume(id);
  vm = await vm.interactions.advance(id, {no_record: true}); vm = await vm.interactions.advance(id, {no_record: true}); vm = await vm.interactions.finish(id, 'completed');
  const plan = await myPlan(services, {}); const marked = await plan.interactions.markDone('g3-task');
  return {services, id, before, vm, marked};
}

test('G3-W2: with the equipment the journey completes once, the task is done and no result exists until one is linked', async () => {
  const {services, id, before, vm, marked} = await fullJourney();
  const executions = (await services.store.list('executions', {})).value; assert.equal(executions.length, 1); assert.equal(executions[0].state, 'completed'); assert.equal(executions[0].current_step, 3);
  assert.equal(executions[0].interruptions.length, 1); assert.equal(vm.sections.find(s => s.id === 'executions').entries[0].state, 'completed');
  const saved = (await services.store.get('tasks', 'g3-task')).value; assert.equal(saved.completion, 'done'); assert.equal(saved.execution_id, id); assert.deepEqual(saved.result_ids, []);
  assert.equal(await countRecords(services.store), before, 'finishing and marking done created no record'); assert.equal(entry(marked, 'tasks', 'g3-task').result_text, 'not recorded');
  assert.match(marked.sections.find(s => s.id === 'progress').text, /^1 of 1 done/);
  const blockedHere = await board(await makeServices({config: spacecraft}), {});
  assert.notDeepEqual(entry(blockedHere, 'procedures', proc.id).actions.map(a => a.id), entry(await board(services, {}), 'procedures', proc.id).actions.map(a => a.id), 'the two configurations give two different journeys');
});

test('G3-W3: publishing version 2 afterwards leaves the execution on version 1', async () => {
  const {services, id} = await fullJourney(); const v2 = {...proc, version: '2', steps: [{id: 'new-first', text: 'A different first step'}, ...proc.steps]};
  assert.equal((await services.procedures.publishProcedure(services.store, v2, {clock: () => '2026-11-15T19:00:00.000Z'})).ok, true);
  const later = await board(services, {}); const ex = entry(later, 'executions', id);
  assert.equal(ex.procedure_version, '1'); assert.equal((await services.store.get('executions', id)).value.procedure_version, '1'); assert.doesNotMatch(ex.step_text ?? '', /A different first step/);
  const started = await later.interactions.start(proc.id, {confirmed: true}); assert.equal(started.sections.find(s => s.id === 'executions').entries.length, 2);
  assert.equal((await services.store.get('executions', id)).value.procedure_version, '1');
  assert.equal((await services.store.list('executions', {})).value.filter(e => e.procedure_version === '2').length, 1);
});

test('G3-W4: the G1 and G2 tests still pass', () => {
  const run = spawnSync('node', ['--test', 'tests/walkthrough/g1.test.js', 'tests/walkthrough/g2.test.js'], {encoding: 'utf8', cwd: new URL('../../', import.meta.url)});
  assert.equal(run.status, 0, run.stdout.slice(-600));
});
