import test from 'node:test';
import assert from 'node:assert/strict';
import {model} from './model.js';
import {viewKit} from '../base/index.js';
import {makeServices, scenario, SUBJECT, NOW, FORBIDDEN_WORDS, SCORE_KEYS} from '../../../tests/walkthrough/fixtures.js';

const station = scenario.config[0], spacecraft = scenario.config[1], rover = scenario.config[2];
const section = (vm, id) => vm.sections.find(s => s.id === id);
const ids = ['synthetic-1-record-003', 'synthetic-1-record-002']; // a recorded pulse and a not_recorded pulse
const later = ms => () => new Date(Date.parse(NOW) + ms).toISOString();

test('M24-V1: the panel says "simulated sync" and shows no users, passwords or encryption', async () => {
  const vm = await model(await makeServices(), {}); const text = viewKit.textsOf(vm).join(' ');
  assert.match(text, /simulated sync/i); assert.doesNotMatch(text, /password|log in|login|user name|encrypt|secure|protected/i);
  for (const key of viewKit.keysOf(vm)) assert.equal(SCORE_KEYS.includes(key), false, key);
  for (const t of viewKit.textsOf(vm)) assert.doesNotMatch(t, FORBIDDEN_WORDS, t);
});

test('M24-V2: a subject that sent nothing reads "Nothing sent", never "nothing new"', async () => {
  const vm = await model(await makeServices(), {});
  assert.equal(section(vm, 'ground').state, 'empty'); assert.match(section(vm, 'ground').text, /^Nothing sent/); assert.doesNotMatch(JSON.stringify(section(vm, 'ground')), /nothing new/i);
  assert.equal(section(vm, 'sent').entries.length, 0);
});

test('M24-V3: sharing needs a confirmation, logs what was shared and queues it; with a live link "Deliver" moves it to the ground', async () => {
  const services = await makeServices({config: station}); let vm = await model(services, {});
  assert.equal(section(vm, 'link').mode, 'real_time');
  const unconfirmed = await vm.interactions.share({ids, confirmed: false}); assert.equal(unconfirmed.message.kind, 'error'); assert.deepEqual((await services.store.list('shared', {})).value, []);
  vm = await vm.interactions.share({ids, confirmed: true}); assert.equal(vm.message.kind, 'info');
  const logged = (await services.store.list('shared', {})).value; assert.equal(logged.length, 1); assert.deepEqual(logged[0].what, ids); assert.equal(logged[0].with, 'ground panel (simulated)');
  assert.equal(section(vm, 'sent').entries[0].state, 'queued'); assert.equal(section(vm, 'ground').state, 'empty'); assert.match(section(vm, 'ground').text, /queued or in transit/);
  vm = await vm.interactions.advance(); assert.equal(section(vm, 'ground').entries.length, 1); assert.equal(section(vm, 'sent').entries[0].state, 'received');
});

test('M24-V4: with no link nothing is delivered and nothing is lost', async () => {
  const services = await makeServices({config: rover}); let vm = await model(services, {}); assert.equal(section(vm, 'link').mode, 'no_link');
  vm = await vm.interactions.share({ids, confirmed: true}); vm = await vm.interactions.advance(); vm = await vm.interactions.advance();
  assert.equal(section(vm, 'sent').entries[0].state, 'queued'); assert.equal(section(vm, 'ground').entries.length, 0); assert.match(vm.message.text, /link is down/i);
});

test('M24-V5: a delayed link needs a delay to be set, then delivers after it by the clock', async () => {
  const services = await makeServices({config: spacecraft}); services.link.setMode('real_time'); let vm = await model(services, {});
  assert.equal(section(vm, 'link').needs_delay, true); assert.match(section(vm, 'link').mode_text, /^delayed: the link is down until a delay is set/); assert.equal(services.link.mode(), 'no_link', 'without a delay the link stays down');
  vm = await vm.interactions.share({ids, confirmed: true}); vm = await vm.interactions.advance(); assert.equal(section(vm, 'sent').entries[0].state, 'queued');
  assert.equal((await vm.interactions.setDelay(-3)).message.kind, 'error'); assert.equal((await vm.interactions.setDelay('x')).message.kind, 'error');
  vm = await vm.interactions.setDelay(20); assert.equal(section(vm, 'link').needs_delay, false); assert.equal(section(vm, 'link').delay_minutes, 20);
  vm = await vm.interactions.advance(); assert.equal(section(vm, 'sent').entries[0].state, 'in_transit');
  const soon = await model({...services, clock: later(19 * 60000)}, {}); assert.equal(section(await soon.interactions.advance(), 'sent').entries[0].state, 'in_transit');
  const due = await model({...services, clock: later(20 * 60000)}, {}); const done = await due.interactions.advance();
  assert.equal(section(done, 'sent').entries[0].state, 'received'); assert.equal(section(done, 'ground').entries.length, 1);
});

test('M24-V6: record states travel intact: a not-recorded entry arrives as "not recorded"', async () => {
  const services = await makeServices({config: station}); let vm = await (await model(services, {})).interactions.share({ids, confirmed: true}); vm = await vm.interactions.advance();
  const items = section(vm, 'ground').entries[0].items; const missing = items.find(i => i.id === 'synthetic-1-record-002'); const known = items.find(i => i.id === 'synthetic-1-record-003');
  assert.equal(missing.state, 'not_recorded'); assert.equal(missing.value_text, 'not recorded'); assert.equal(missing.value, null); assert.equal(known.value_text, '76 bpm'); assert.match(known.origin_text, /synthetic/);
});

test('M24-V7: the panel shows creation, send and receive time and the age of the data', async () => {
  const services = await makeServices({config: station}); let vm = await (await model(services, {})).interactions.share({ids: [ids[0]], confirmed: true});
  let d = section(vm, 'sent').entries[0]; assert.match(d.created_text, /2026-11-15T18:00:00/); assert.equal(d.sent_text, 'not sent yet'); assert.equal(d.received_text, 'not received yet'); assert.match(d.age_text, /less than 1 h/);
  vm = await vm.interactions.advance(); d = section(vm, 'ground').entries[0]; assert.match(d.sent_text, /2026-11-15T18:00:00/); assert.match(d.received_text, /2026-11-15T18:00:00/);
  const old = await model({...services, clock: later(5 * 3600000)}, {}); assert.match(section(old, 'ground').entries[0].age_text, /5 h/);
});

test('M24-V8: only the subject\'s own records can be shared; a read-only source cannot share', async () => {
  const services = await makeServices({config: station, records: [{...scenario.records[0], id: 'theirs', subject: 'someone-else'}]}); const vm = await model(services, {});
  assert.equal(section(vm, 'share').choices.some(c => c.id === 'theirs'), false); assert.equal(section(vm, 'share').choices.some(c => c.id === 'synthetic-1-record-014'), false, 'no environment record');
  for (const bad of [['theirs'], ['nope'], [], 'x', [7]]) assert.equal((await vm.interactions.share({ids: bad, confirmed: true})).message.kind, 'error');
  assert.deepEqual((await services.store.list('shared', {})).value, []);
  const ro = await makeServices({writable: false}); const rv = await model(ro, {}); assert.equal(section(rv, 'share').actions.share.enabled, false);
  assert.equal((await rv.interactions.share({ids, confirmed: true})).message.kind, 'error'); assert.deepEqual((await ro.store.list('shared', {})).value, []);
});

test('M24-V9: without sync or privacy the sections say so; hostile services give an error view model', async () => {
  const vm = await model(await makeServices({drop: ['sync', 'link']}), {}); assert.equal(vm.state, 'ready'); assert.equal(section(vm, 'link').state, 'not_available');
  const base = await makeServices();
  for (const broken of [{store: undefined}, {readings: {}}, {subject: ''}, {clock: 'x'}]) assert.equal((await model({...base, ...broken}, {})).state, 'error');
  for (const input of [undefined, null, 'x']) assert.equal((await model(input, {})).state, 'error');
  assert.ok(SUBJECT);
});

test('M24-R1: the panel never shows a summary or a record of another subject, even if a delivery names its id', async () => {
  const other = 'someone-else';
  const delivery = {id: 'd1', schema_version: 2, shared_id: 's1', subject: SUBJECT, what: [ids[0], 'summary:sum-other', 'summary:sum-mine'], created: NOW, state: 'queued'};
  const services = await makeServices({objects: {deliveries: [delivery], summaries: [{id: 'sum-other', schema_version: 2, subject: other, episode_id: 'e', text: 'OTHER SUBJECT TEXT', origins: [], generated: NOW}, {id: 'sum-mine', schema_version: 2, subject: SUBJECT, episode_id: 'e', text: 'MY SUMMARY TEXT', origins: [], generated: NOW}]}, config: station});
  const text = JSON.stringify(await model(services, {}));
  assert.ok(text.includes('MY SUMMARY TEXT')); assert.equal(text.includes('OTHER SUBJECT TEXT'), false, 'another subject\'s summary text is never shown');
  assert.ok(text.includes('The summary text is not in this data source') || text.includes('"text":null'), 'the unreadable one is said, not hidden');
});
