import test from 'node:test';
import assert from 'node:assert/strict';
import {model} from './model.js';
import {viewKit} from '../base/index.js';
import * as exporter from '../../export/index.js';
import {makeServices, makeRecord, SUBJECT, FORBIDDEN_WORDS, SCORE_KEYS} from '../../../tests/walkthrough/fixtures.js';

const section = (vm, id) => vm.sections.find(s => s.id === id);
const at = (day, extra = {}) => ({time: `2026-${day}T10:00:00.000Z`, ...extra});
const vo2 = (id, day, value, extra = {}) => makeRecord({id, variable: 'aerobic_capacity', type: 'exam', value, unit: 'mL/kg/min', method: 'bike-test', ...at(day), ...extra});
const open = async (records, extra) => { const vm = await model(await svc(records, extra)); return vm.interactions.select({variable: 'aerobic_capacity'}); };
const svc = async (records = [], extra = {}) => makeServices({records, without: r => r.variable === 'aerobic_capacity', ...extra, objects: {}}).then(s => ({...s, exporter}));

test('M25-P7: with no measurement recorded the view says nothing was recorded, not "nothing new"', async () => {
  const services = await makeServices({without: r => r.type === 'measurement' || r.type === 'exam'}); const vm = await model({...services, exporter});
  assert.equal(vm.state, 'ready'); assert.equal(section(vm, 'review').state, 'empty'); assert.match(section(vm, 'review').text, /nothing was recorded/); assert.equal(vm.review, null);
  assert.equal(vm.exports.all.enabled, true, 'the export of what exists (even nothing) is still offered');
});

test('M25-P8: two comparable values give a descriptive difference with its unit; it carries no judgement and no criterion', async () => {
  const vm = await open([vo2('a', '09-01', 30), vo2('b', '10-01', 33.5)]);
  assert.equal(section(vm, 'values').entries.length, 2);
  assert.equal(section(vm, 'change').difference, 3.5); assert.match(section(vm, 'change').text, /\+3\.5 mL\/kg\/min.*Descriptive only.*no clinical meaning/);
  for (const text of viewKit.textsOf(vm)) assert.doesNotMatch(text, FORBIDDEN_WORDS, text);
  for (const key of viewKit.keysOf(vm)) assert.equal(SCORE_KEYS.includes(key), false, key);
  assert.match(vm.review.text, /Performance criterion: not configured. No value is graded/); assert.match(vm.review.text, /Not sent/i);
});

test('M25-P9: values of different methods are never compared; they are named as outside the selection, and the method can be chosen', async () => {
  const vm = await open([vo2('a', '09-01', 30, {method: 'treadmill'}), vo2('b', '10-01', 33, {method: 'bike-test'}), vo2('c', '10-15', 34, {method: 'bike-test'})]);
  assert.equal(section(vm, 'select').chosen.method, 'bike-test', 'the method of the newest value'); assert.deepEqual(section(vm, 'values').entries.map(e => e.id), ['b', 'c']); assert.equal(section(vm, 'values').outside.other_methods, 1);
  assert.match(vm.review.text, /1 value\(s\) of other methods.*never put on one line/);
  const other = await vm.interactions.select({method: 'treadmill'}); assert.deepEqual(section(other, 'values').entries.map(e => e.id), ['a']); assert.match(section(other, 'change').text, /Not enough recorded values/);
});

test('M25-P10: a different unit, origin or time basis blocks the difference and says why; a not-recorded value is not a number', async () => {
  const unit = await open([vo2('a', '09-01', 30), vo2('b', '10-01', 33, {unit: 'L/min'})]); assert.equal(section(unit, 'change').difference, null); assert.match(section(unit, 'change').text, /Not compared: different unit/);
  const origin = await open([vo2('a', '09-01', 30, {origin: 'terrestrial'}), vo2('b', '10-01', 33, {origin: 'ground_analog'})], {without: () => true});
  assert.equal(section(origin, 'change').difference, null); assert.match(section(origin, 'change').text, /different origin/i);
  const absent = await open([vo2('a', '09-01', 30), vo2('b', '10-01', 0, {state: 'not_recorded'})]);
  assert.equal(section(absent, 'change').difference, null); assert.match(section(absent, 'change').text, /Not enough recorded values/); assert.equal(section(absent, 'values').entries.length, 2, 'the not-recorded entry is still listed');
});

test('M25-P11: the period limits the values and the others are counted; a value with no established time is named, never placed', async () => {
  const unplaced = vo2('u', '01-01', 20, {time: null, source_time: {raw: '2026-01-01T10:00', value: '2026-01-01T10:00', precision: 'minute', scope: 'S', calendar: 'unknown', timezone: null}});
  const vm = await open([vo2('a', '01-01', 28), vo2('b', '09-01', 30), vo2('c', '10-01', 33), unplaced]); assert.equal(section(vm, 'values').untimed.length, 1);
  const recent = await vm.interactions.select({months: 3}); assert.deepEqual(section(recent, 'values').entries.map(e => e.id), ['b', 'c']); assert.equal(section(recent, 'values').outside.before_period, 1); assert.equal(section(recent, 'values').outside.no_time, 1);
  assert.match(recent.review.text, /1 value\(s\) before the period/); assert.match(recent.review.text, /1 value\(s\) have no established time/);
  assert.equal((await vm.interactions.select({months: 7})).message.kind, 'error'); assert.equal((await vm.interactions.select({variable: 'nope'})).message.kind, 'error'); assert.equal((await vm.interactions.select(null)).message.kind, 'error');
});

test('M25-P12: the exports carry every record of the subject, with provenance, and only that subject; a hostile selection exports nothing', async () => {
  const other = makeRecord({id: 'zz', subject: 'someone-else', origin: 'synthetic', value: 99, variable: 'pulse'});
  const services = await svc([vo2('a', '09-01', 30), vo2('b', '10-01', 33)]); await services.store.save('records', other);
  const vm = await (await model(services)).interactions.select({variable: 'aerobic_capacity'}); const all = await vm.interactions.exportAll(); assert.equal(all.ok, true);
  assert.ok(all.value.text.includes('aerobic_capacity')); assert.equal(all.value.text.includes('zz'), false, 'another subject is never exported'); assert.match(all.value.filename, /^orbita-.+-records\.csv$/);
  const series = await vm.interactions.exportSeries(); assert.equal(series.ok, true); assert.equal(series.value.records, 2); assert.equal(/pulse/.test(series.value.text), false);
  const bare = await model({...services, exporter: undefined}); assert.equal(bare.exports.all.enabled, false); assert.equal((await bare.interactions.exportAll()).ok, false);
});

test('M25-P13: hostile services give an error view model, never an exception', async () => {
  const base = await svc();
  for (const broken of [{store: undefined}, {readings: {}}, {subject: ''}, {clock: 'x'}]) assert.equal((await model({...base, ...broken})).state, 'error');
  for (const input of [undefined, null, 'x', 7]) assert.equal((await model(input)).state, 'error');
});
