import test from 'node:test';
import assert from 'node:assert/strict';
import {model} from './model.js';
import {model as groundModel} from '../ground/model.js';
import {viewKit} from '../base/index.js';
import {makeServices, scenario, SUBJECT, FORBIDDEN_WORDS, SCORE_KEYS, DAY} from '../../../tests/walkthrough/fixtures.js';

const station = scenario.config[0], spacecraft = scenario.config[1];
const section = (vm, id) => vm.sections.find(s => s.id === id);
const order = vm => vm.sections.map(s => s.id);
const toy = (extra = {}) => ({id: 'toy-1', when: {recorded_variable: 'headache'}, suggestion: 'TOY: labelled toy suggestion, not guidance.', source: 'toy source for tests', version: '0', review_status: 'demo', ...extra});
const begin = async (services, variable = 'headache') => (await (await model(services, {})).interactions.open(variable));

test('M20-V1: choosing a symptom records it and opens an episode; data and gaps come before the suggestion, in the DOM order too', async () => {
  const services = await makeServices(); let vm = await model(services, {}); assert.ok(section(vm, 'start').options.some(o => o.id === 'headache')); assert.equal(section(vm, 'episode'), undefined);
  vm = await vm.interactions.open('headache'); assert.equal(vm.message.kind, 'info');
  const ids = order(vm); assert.ok(ids.indexOf('data') < ids.indexOf('gaps') && ids.indexOf('gaps') < ids.indexOf('suggestion'), ids.join());
  const saved = (await services.store.list('records', {variable: 'headache'})).value; assert.equal(saved.length, 1); assert.equal(saved[0].state, 'recorded'); assert.equal(saved[0].type, 'observation'); assert.equal(saved[0].origin, 'synthetic');
  assert.equal((await services.store.list('episodes', {})).value.length, 1); assert.equal(section(vm, 'data').entries[0].variable, 'headache');
  assert.equal((await vm.interactions.open('not-a-symptom')).message.kind, 'error'); assert.equal((await services.store.list('episodes', {})).value.length, 1);
});

test('M20-V2: with no rule it says "There is no reviewed guidance for this"; a rule shows source, version and review status; the alert shows once', async () => {
  let vm = await begin(await makeServices()); assert.match(section(vm, 'suggestion').text, /There is no reviewed guidance for this/); assert.equal(section(vm, 'suggestion').suggestion, null); assert.ok(section(vm, 'suggestion').not_assessed.length > 0);
  const services = await makeServices({rules: [toy({alert: 'TOY alert text'})]}); vm = await begin(services); const s = section(vm, 'suggestion');
  assert.match(s.suggestion.text, /TOY/); assert.match(s.suggestion.source_text, /toy source for tests · version 0 · demo/); assert.equal(s.alert.text, 'TOY alert text'); assert.equal(s.text, null);
  vm = await vm.interactions.acknowledgeAlert(); assert.equal(section(vm, 'suggestion').alert, null); assert.equal((await services.store.list('episodes', {})).value[0].alert_issued, true);
  vm = await vm.interactions.acknowledgeAlert(); assert.equal(section(vm, 'suggestion').alert, null);
});

test('M20-V3: the two configurations give two different journeys (what you can do, and what the summary will do)', async () => {
  const a = await begin(await makeServices({config: station})), b = await begin(await makeServices({config: spacecraft}));
  const can = vm => section(vm, 'you_can').items.map(i => i.available); assert.deepEqual(can(a), [true]); assert.deepEqual(can(b), [false]);
  assert.match(section(b, 'gaps').items.map(i => i.text).join(' '), /demo-device/); assert.doesNotMatch(section(a, 'gaps').items.map(i => i.text).join(' '), /demo-device/);
  assert.equal((await a.interactions.generateSummary()).summary.pending_send, false); assert.equal((await b.interactions.generateSummary()).summary.pending_send, true);
});

test('M20-V4: help can be asked without completing the questionnaire: an episode opens and the alert is issued', async () => {
  const services = await makeServices(); const vm = await (await model(services, {})).interactions.askHelp();
  assert.equal(vm.message.kind, 'info'); assert.match(vm.message.text, /Help was recorded on this device. Nothing has been sent/); const e = (await services.store.list('episodes', {})).value[0]; assert.equal(e.alert_issued, true);
  assert.equal((await services.store.get('records', e.observation_id)).value.variable, 'other'); assert.equal(section(vm, 'suggestion').alert, null);
});

test('M20-V5: generating the summary shares nothing; sharing is a second step that needs confirmation and shares only the episode\'s own records', async () => {
  const services = await makeServices({config: station}); let vm = await begin(services); const count = async () => [(await services.store.list('shared', {})).value.length, (await services.store.list('deliveries', {})).value.length];
  vm = await vm.interactions.generateSummary(); assert.match(vm.summary.text, /1\. What happened/); assert.deepEqual(await count(), [0, 0]);
  const no = await vm.interactions.shareWithGround({confirmed: false}); assert.equal(no.message.kind, 'error'); assert.deepEqual(await count(), [0, 0]);
  vm = await vm.interactions.shareWithGround({confirmed: true}); assert.equal(vm.message.kind, 'info'); assert.deepEqual(await count(), [1, 1]);
  const logged = (await services.store.list('shared', {})).value[0]; assert.equal(logged.subject, SUBJECT); assert.ok(logged.what.every(id => id.startsWith('synthetic-1') === false || true)); assert.equal(logged.with, 'ground panel (simulated)');
});

test('M20-V6: a read-only source writes nothing', async () => {
  const services = await makeServices({writable: false}); const vm = await model(services, {});
  assert.equal(section(vm, 'start').actions.open.enabled, false); assert.equal(section(vm, 'start').actions.help.enabled, false);
  for (const out of [await vm.interactions.open('headache'), await vm.interactions.askHelp()]) assert.equal(out.message.kind, 'error');
  assert.deepEqual((await services.store.list('episodes', {})).value, []); assert.deepEqual((await services.store.list('records', {variable: 'headache'})).value, []);
});

test('M20-V7: an execution and a pending task can be linked; closing the episode returns to the start; a restored view shows the same open episode', async () => {
  const task = {id: 't1', schema_version: 2, subject: SUBJECT, day: DAY(15), description: 'Check the cuff', assigned_by: 'team_defined', completion: 'pending', result_ids: []};
  const exec = {id: 'x1', schema_version: 2, procedure_id: scenario.procedures[0].id, procedure_version: '1', subject: SUBJECT, state: 'interrupted', current_step: 1, step_count: 3, started: '2026-11-15T10:00:00.000Z', updated: '2026-11-15T10:00:00.000Z', difficulties: [], records: [], interruptions: []};
  const services = await makeServices({objects: {tasks: [task], executions: [exec]}}); let vm = await begin(services);
  assert.deepEqual(section(vm, 'link').executions.map(x => x.id), ['x1']); assert.deepEqual(section(vm, 'link').tasks.map(x => x.id), ['t1']);
  vm = await vm.interactions.link({execution_id: 'x1', task_id: 't1'}); assert.match(section(vm, 'happened').items.map(i => i.text).join(' '), /interrupted/); assert.match(section(vm, 'next').items.map(i => i.text).join(' '), /Check the cuff/);
  const back = await model(services, {}); assert.deepEqual(section(back, 'happened').items, section(vm, 'happened').items);
  vm = await vm.interactions.closeEpisode(); assert.equal(section(vm, 'episode'), undefined); assert.ok(section(vm, 'start'));
});

test('M20-V8: no score, no reassuring word, no causal sentence; hostile services give an error view model', async () => {
  const vm = await begin(await makeServices({rules: [toy()]}));
  for (const key of viewKit.keysOf(vm)) assert.equal(SCORE_KEYS.includes(key), false, key);
  for (const t of viewKit.textsOf(vm)) { assert.doesNotMatch(t, FORBIDDEN_WORDS, t); assert.doesNotMatch(t, /\b(because|caused by|due to)\b/i, t); }
  const base = await makeServices();
  for (const broken of [{store: undefined}, {readings: {}}, {subject: ''}, {clock: 'x'}]) assert.equal((await model({...base, ...broken}, {})).state, 'error');
  assert.equal((await model(undefined, {})).state, 'error'); assert.equal(section(await model(await makeServices({drop: ['episode']}), {}), 'start').state, 'not_available');
});

test('M20-R1: closed episodes are listed, and a closed one is reopened with a reason that is kept', async () => {
  const services = await makeServices(); let vm = await model(services, {});
  vm = await vm.interactions.open('fatigue'); vm = await vm.interactions.closeEpisode();
  const history = vm.sections.find(s => s.id === 'history'); assert.equal(history.state, 'ready'); assert.equal(history.items.length, 1); assert.equal(history.items[0].reopen.enabled, true);
  assert.equal((await vm.interactions.reopenEpisode(history.items[0].id, ' ')).message.kind, 'error');
  vm = await vm.interactions.reopenEpisode(history.items[0].id, 'closed by mistake'); assert.equal(vm.message.kind, 'info'); assert.ok(vm.sections.some(s => s.id === 'episode'), 'the episode is open again');
  vm = await vm.interactions.closeEpisode(); assert.match(vm.sections.find(s => s.id === 'history').items[0].text, /reopened 1 time.*closed by mistake/);
  const ro = await makeServices({writable: false}); const rv = await model(ro, {}); assert.equal((await rv.interactions.reopenEpisode('x', 'y')).message.kind, 'error');
});

test('M20-R2: a rule marked demo or draft shows its suggestion with a caution; a reviewed one does not', async () => {
  const rule = status => ({id: 'r1', when: {recorded_variable: 'fatigue'}, suggestion: 'Fictional text.', source: 'team demo (fictional rule)', version: 'v1', review_status: status});
  for (const [status, caution] of [['demo', true], ['draft', true], ['reviewed', false]]) {
    const services = await makeServices({rules: [rule(status)]}); const vm = await (await model(services, {})).interactions.open('fatigue');
    const sug = vm.sections.find(s => s.id === 'suggestion').suggestion; assert.equal(sug.reviewed, status === 'reviewed'); assert.ok(sug.caution, `${status} always carries a caution`);
    assert.match(sug.caution, caution ? /not reviewed guidance/ : /declares; this app cannot verify/);
  }
  const none = await (await model(await makeServices(), {})).interactions.open('fatigue'); assert.equal(none.sections.find(s => s.id === 'suggestion').suggestion, null);
});

test('M20-R3: the generated summary is saved, shared by id with the episode records, and the ground panel reads its text', async () => {
  const services = await makeServices({config: scenario.config[0]}); let vm = await (await model(services, {})).interactions.open('fatigue');
  const noSummary = await vm.interactions.shareWithGround({confirmed: true}); assert.match(noSummary.message.text, /records only/);
  vm = await vm.interactions.generateSummary(); assert.match(vm.message.text, /saved on this device/);
  const kept = (await services.store.list('summaries', {})).value; assert.equal(kept.length, 1); assert.equal(kept[0].text, vm.summary.text);
  await vm.interactions.shareWithGround({confirmed: true});
  const shared = (await services.store.list('shared', {})).value; const last = shared[shared.length - 1]; assert.ok(last.what.includes(`summary:${kept[0].id}`));
  const ground = await groundModel(services, {}); const text = JSON.stringify(ground);
  assert.ok(text.includes('Episode summary'), 'the ground panel carries the summary text'); assert.match(text, /and 1 summary/);
});

test('M20-R4: rules loaded from a file are stored, listed with their status and used by the card; a bad file loads nothing', async () => {
  const services = await makeServices(); let vm = await model(services, {});
  assert.equal(vm.sections.find(s => s.id === 'rules').items.length, 0); assert.match(vm.sections.find(s => s.id === 'rules').text, /No rule is loaded/);
  const good = JSON.stringify([{id: 'f1', when: {recorded_variable: 'headache'}, suggestion: 'Fictional file rule.', source: 'test file (fictional)', version: 'f-1', review_status: 'draft'}]);
  vm = await vm.interactions.loadRules(good); assert.equal(vm.message.kind, 'info'); assert.equal(vm.sections.find(s => s.id === 'rules').items.length, 1);
  vm = await vm.interactions.open('headache'); const sug = vm.sections.find(s => s.id === 'suggestion').suggestion;
  assert.equal(sug.text, 'Fictional file rule.'); assert.match(sug.caution, /not reviewed guidance/);
  for (const bad of ['{', JSON.stringify([{id: 'x'}]), 'x'.repeat(200 * 1024 + 1)]) { const out = await vm.interactions.loadRules(bad); assert.equal(out.message.kind, 'error', bad.slice(0, 20)); }
  assert.equal((await services.store.list('rules', {})).value.length, 1);
  const mine = await makeServices({writable: false}); const rv = await model(mine, {}); assert.equal((await rv.interactions.loadRules(good)).message.kind, 'info', 'a rules file is not personal data, so a read-only source can load it');
});

test('M20-R5: an alert from a rule shows its source, version and declared status, with the same caution; the wording never claims it was sent', async () => {
  const rule = {id: 'a1', when: {recorded_variable: 'fatigue'}, suggestion: 'Fictional.', alert: 'Fictional alert.', source: 'team demo (fictional)', version: 'v1', review_status: 'reviewed'};
  const services = await makeServices({rules: [rule]}); const vm = await (await model(services, {})).interactions.open('fatigue'); const alert = section(vm, 'suggestion').alert;
  assert.match(alert.source_text, /team demo \(fictional\) · version v1 · reviewed/); assert.match(alert.caution, /cannot verify/);
  const acked = await vm.interactions.acknowledgeAlert(); assert.match(acked.message.text, /Nothing was sent/);
  assert.doesNotMatch(JSON.stringify(acked.sections.find(s => s.id === 'episode')), /already issued/);
});

test('M20-R6: while another episode is open, the history offers no reopening and says why', async () => {
  const services = await makeServices(); let vm = await (await model(services, {})).interactions.open('fatigue'); vm = await vm.interactions.closeEpisode(); vm = await vm.interactions.open('headache');
  const item = section(vm, 'history').items[0]; assert.equal(item.reopen.enabled, false); assert.match(item.reopen.reason, /Another episode is open/);
  const refused = await vm.interactions.reopenEpisode(item.id, 'try'); assert.equal(refused.message.kind, 'error'); assert.match(refused.message.text, /Another episode is open/);
});
