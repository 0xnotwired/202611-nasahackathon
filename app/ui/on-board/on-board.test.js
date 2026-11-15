import test from 'node:test';
import assert from 'node:assert/strict';
import {model} from './model.js';
import {viewKit} from '../base/index.js';
import {makeServices, scenario, SUBJECT, FORBIDDEN_WORDS, SCORE_KEYS} from '../../../tests/walkthrough/fixtures.js';

const spacecraft = scenario.config[1];
const proc = scenario.procedures[0];
const section = (vm, id) => vm.sections.find(s => s.id === id);
const procOf = vm => section(vm, 'procedures').entries.find(p => p.id === proc.id);
const executionsOf = vm => section(vm, 'executions').entries;
const action = (entry, id) => entry.actions.find(a => a.id === id);

test('M15-P1: with the configuration that lacks the equipment the procedure is blocked, names the missing item and offers no start', async () => {
  const p = procOf(await model(await makeServices({config: spacecraft}), {}));
  assert.equal(p.availability.available, false); assert.deepEqual(p.availability.missing, ['demo-device']); assert.match(p.availability.text, /demo-device/);
  assert.equal(p.actions.length, 0, 'no start action at all'); assert.match(p.blocked_text, /Blocked/);
});

test('M15-P2: the same procedure behaves differently under the two configurations', async () => {
  const station = procOf(await model(await makeServices(), {})), craft = procOf(await model(await makeServices({config: spacecraft}), {}));
  assert.equal(action(station, 'start').enabled, true); assert.equal(craft.actions.some(a => a.id === 'start'), false);
});

test('M15-P3: interrupt at step 2, come back, and the model offers to resume at step 2', async () => {
  const services = await makeServices(); let vm = await model(services, {});
  vm = await vm.interactions.start(proc.id); const id = executionsOf(vm)[0].id;
  await vm.interactions.advance(id); vm = await vm.interactions.advance(id); vm = await vm.interactions.interrupt(id, 'call from ground');
  const back = await model(services, {}); const ex = executionsOf(back)[0];
  assert.equal(ex.state, 'interrupted'); assert.equal(action(ex, 'resume').resume_at, 2); assert.match(ex.progress_text, /2 of 3 steps done/); assert.equal(action(ex, 'advance'), undefined);
  const resumed = await back.interactions.resume(id); assert.equal(executionsOf(resumed)[0].state, 'in_progress'); assert.match(executionsOf(resumed)[0].progress_text, /2 of 3 steps done/);
});

test('M15-P4: source, version and review status are visible, and "demo" reads as demo', async () => {
  const p = procOf(await model(await makeServices(), {}));
  assert.equal(p.version, '1'); assert.equal(p.source, 'team_defined'); assert.match(p.review_text, /demo/i); assert.match(p.review_text, /not reviewed/i); assert.ok(p.preparation.length >= 1);
  assert.ok(p.steps.length === 3);
});

test('M15-X1: "could not complete" asks for the difficulty and stores it', async () => {
  const services = await makeServices(); let vm = await (await model(services, {})).interactions.start(proc.id); const id = executionsOf(vm)[0].id;
  const blank = await vm.interactions.finish(id, 'could_not', ''); assert.equal(blank.message.kind, 'error'); assert.equal((await services.store.get('executions', id)).value.state, 'in_progress');
  const done = await vm.interactions.finish(id, 'could_not', 'no cuff on board'); assert.equal(done.message.kind, 'info');
  const saved = (await services.store.get('executions', id)).value; assert.equal(saved.state, 'could_not'); assert.deepEqual(saved.difficulties, ['no cuff on board']);
});

test('M15-X2: "finish" is offered only when every step is done', async () => {
  const services = await makeServices(); let vm = await (await model(services, {})).interactions.start(proc.id); const id = executionsOf(vm)[0].id;
  assert.equal(action(executionsOf(vm)[0], 'finish_completed').enabled, false);
  for (let i = 0; i < 3; i++) vm = await vm.interactions.advance(id);
  assert.equal(action(executionsOf(vm)[0], 'finish_completed').enabled, true); assert.equal(action(executionsOf(vm)[0], 'advance').enabled, false);
  vm = await vm.interactions.finish(id, 'completed'); assert.equal(executionsOf(vm)[0].state, 'completed'); assert.equal(executionsOf(vm)[0].actions.length, 0);
});

test('M15-X3: a read-only source offers nothing that writes, and writes nothing', async () => {
  const services = await makeServices({writable: false}); const vm = await model(services, {});
  assert.equal(action(procOf(vm), 'start').enabled, false); assert.match(action(procOf(vm), 'start').reason, /not available/);
  const out = await vm.interactions.start(proc.id); assert.equal(out.message.kind, 'error'); assert.equal((await services.store.list('executions', {})).value.length, 0);
});

test('M15-X4: after a newer version is published, an execution is still read against the version it started with', async () => {
  const services = await makeServices(); const vm = await (await model(services, {})).interactions.start(proc.id);
  const v2 = {...proc, version: '2', steps: [{id: 's1', text: 'A different first step'}, ...proc.steps]};
  assert.equal((await services.procedures.publishProcedure(services.store, v2, {clock: () => '2026-11-15T19:00:00.000Z'})).ok, true);
  const later = await model(services, {}); const ex = executionsOf(later)[0];
  assert.equal(ex.procedure_version, '1'); assert.match(ex.step_text, /Version 1/); assert.ok(ex.step_text.includes(proc.steps[0].text)); assert.doesNotMatch(ex.step_text, /A different first step/);
  assert.equal(procOf(later).version, '2', 'the list offers the newest version'); assert.equal(executionsOf(vm)[0].procedure_version, '1');
});

const form = (extra = {}) => ({title: 'Hydration check', purpose: 'Write down the amount drunk', equipment: 'demo-device, demo-device', preparation: 'Wash hands\n\n', steps: 'Fill the cup\nDrink\nNote the amount', ...extra});

test('M15-E1: a procedure written here is published as a draft with source user_entered, and can be started when the equipment is there', async () => {
  const services = await makeServices(); const vm = await (await model(services, {})).interactions.publish(form());
  assert.equal(vm.message.kind, 'info'); const mine = section(vm, 'procedures').entries.find(p => p.title === 'Hydration check');
  assert.equal(mine.version, '1'); assert.equal(mine.source, 'user_entered'); assert.match(mine.review_text, /draft/); assert.match(mine.review_text, /not reviewed guidance/);
  assert.deepEqual(mine.required_equipment, ['demo-device']); assert.deepEqual(mine.preparation, ['Wash hands']); assert.deepEqual(mine.steps, ['Fill the cup', 'Drink', 'Note the amount']);
  assert.equal(action(mine, 'start').enabled, true);
  const craft = await model(await makeServices({config: spacecraft}), {}); assert.ok(craft);
});

test('M15-E2: changing an existing procedure publishes its next version and leaves the old one and its executions alone', async () => {
  const services = await makeServices(); let vm = await (await model(services, {})).interactions.start(proc.id); const id = executionsOf(vm)[0].id;
  vm = await vm.interactions.publish(form({based_on: proc.id, title: 'Recording walkthrough, edited'}));
  assert.equal(vm.message.kind, 'info'); assert.equal(procOf(vm).version, '2'); assert.equal(procOf(vm).title, 'Recording walkthrough, edited');
  assert.equal((await services.procedures.getProcedure(services.store, proc.id, '1')).value.title, proc.title);
  assert.equal(executionsOf(vm)[0].id, id); assert.equal(executionsOf(vm)[0].procedure_version, '1');
  vm = await vm.interactions.publish(form({based_on: proc.id})); assert.equal(procOf(vm).version, '3');
});

test('M15-E3: an invalid form is refused in words and stores nothing', async () => {
  const services = await makeServices(); const vm = await model(services, {}); const before = (await services.procedures.listProcedures(services.store, {all: true})).value.length;
  for (const bad of [form({title: ''}), form({steps: ''}), form({purpose: '  '}), form({based_on: 'nope'}), form({steps: 'x'.repeat(600)}), null, 'x']) {
    const out = await vm.interactions.publish(bad); assert.equal(out.message.kind, 'error', JSON.stringify(bad)?.slice(0, 40));
  }
  assert.equal((await services.procedures.listProcedures(services.store, {all: true})).value.length, before);
});

test('M15-E4: a read-only source cannot publish, and says so', async () => {
  const services = await makeServices({writable: false}); const vm = await model(services, {});
  const editor = section(vm, 'editor'); assert.equal(editor.actions.publish.enabled, false); assert.match(editor.actions.publish.reason, /not available/);
  const out = await vm.interactions.publish(form()); assert.equal(out.message.kind, 'error'); assert.equal((await services.procedures.listProcedures(services.store, {all: true})).value.length, 1);
});

test('M15-X5: a blocked execution is shown as blocked; no score key, no reassuring word; hostile services give an error', async () => {
  const services = await makeServices({config: spacecraft}); await services.core; const store = services.store;
  await store.save('executions', {id: 'b1', schema_version: 2, procedure_id: proc.id, procedure_version: '1', subject: SUBJECT, state: 'blocked', current_step: 0, step_count: 3, started: '2026-11-15T10:00:00.000Z', updated: '2026-11-15T10:00:00.000Z', difficulties: [], records: [], interruptions: [], missing: ['demo-device']});
  const vm = await model(services, {}); const ex = executionsOf(vm)[0];
  assert.equal(ex.state, 'blocked'); assert.match(ex.state_text, /demo-device/); assert.equal(ex.actions.length, 0);
  for (const key of viewKit.keysOf(vm)) assert.equal(SCORE_KEYS.includes(key), false, key);
  for (const text of viewKit.textsOf(vm)) assert.doesNotMatch(text, FORBIDDEN_WORDS, text);
  const base = await makeServices();
  for (const broken of [{store: undefined}, {readings: {}}, {subject: ''}, {clock: 'x'}]) assert.equal((await model({...base, ...broken}, {})).state, 'error');
  for (const input of [undefined, null, 'x']) assert.equal((await model(input, {})).state, 'error');
});
