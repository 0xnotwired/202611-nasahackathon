// G2 walkthrough, model level (RUN). Predictions, written before this file:
//  W1 the same record reads the same in every view that shows it; W2 a gap is "not recorded" everywhere and never a number;
//  W3 an old exam is a "last known assessment" with its age, and another place's reading is never in the person's own section;
//  W4 no score, grade, causal sentence or reassurance appears in any view, before or after an interaction.
// W5 (keyboard walk of the five views in a browser) is tests/walkthrough/g2-browser.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import {viewKit} from '../../app/ui/base/index.js';
import {model as health} from '../../app/ui/my-health/model.js';
import {model as adaptation} from '../../app/ui/adaptation/model.js';
import {model as habitat} from '../../app/ui/habitat/model.js';
import {model as progress} from '../../app/ui/my-progress/model.js';
import {model as day} from '../../app/ui/my-day/model.js';
import {makeServices, makeRecord, DAY, FORBIDDEN_WORDS, CAUSAL_WORDS, SCORE_KEYS} from './fixtures.js';

const VIEWS = {'my-health': health, adaptation, habitat, 'my-progress': progress, 'my-day': day};
const everyModel = async services => Object.fromEntries(await Promise.all(Object.entries(VIEWS).map(async ([name, build]) => [name, await build(services, {})])));
const recordEntries = vm => vm.sections.flatMap(section => (section.entries ?? []).flatMap(entry => (entry.kind === 'comparison' ? [entry.latest] : [entry]))).filter(entry => entry && entry.kind === 'record');

test('G2-W1: one record, one reading, in every view that shows it', async () => {
  const models = await everyModel(await makeServices());
  const seen = new Map();
  for (const [name, vm] of Object.entries(models)) for (const entry of recordEntries(vm)) if (entry.has_record) (seen.get(entry.id) ?? seen.set(entry.id, []).get(entry.id)).push([name, entry]);
  const shared = [...seen.values()].filter(list => new Set(list.map(([name]) => name)).size > 1);
  assert.ok(shared.length >= 3, `expected several records shown by more than one view, found ${shared.length}`);
  for (const list of shared) for (const [name, entry] of list.slice(1)) for (const field of ['text', 'value_text', 'origin_text', 'method', 'time', 'state_text'])
    assert.equal(entry[field], list[0][1][field], `${list[0][1].id}: ${field} differs between ${list[0][0]} and ${name}`);
  const pulse = seen.get('synthetic-1-record-003').map(([name]) => name).sort();
  assert.deepEqual([...new Set(pulse)], ['my-day', 'my-health', 'my-progress']);
});

test('G2-W2: a gap is "not recorded" in every view and never a number', async () => {
  const models = await everyModel(await makeServices({without: record => record.variable === 'sleep_hours'}));
  const sleep = models['my-health'].sections.find(section => section.id === 'rest').entries[0];
  assert.equal(sleep.has_record, false); assert.equal(sleep.value_text, 'not recorded');
  assert.ok(models['my-day'].sections.find(section => section.id === 'not_recorded_today').entries.some(entry => entry.variable === 'sleep_hours' && entry.value_text === 'not recorded'));
  const table = models['my-progress'].sections.find(section => section.id === 'chart').charts[0].table.rows;
  assert.match(table.find(row => row.day === '2026-11-14').value, /not recorded/);
  for (const [name, vm] of Object.entries(models)) for (const entry of recordEntries(vm)) {
    if (entry.state === 'not_recorded' || entry.state === 'confirmed_none' || !entry.has_record) {
      assert.equal(entry.value, null, `${name}: ${entry.label} carries a number although it has none`);
      assert.doesNotMatch(entry.value_text, /^0\b/, `${name}: ${entry.label} reads as zero`);
    }
  }
});

test('G2-W3: an old exam is a last known assessment; another place is never the person\'s own', async () => {
  const exams = (await adaptation(await makeServices(), {})).sections.find(section => section.id === 'results').entries;
  const bone = exams.find(entry => entry.variable === 'bone_density');
  assert.equal(bone.assessment_label, 'last known assessment'); assert.equal(bone.age_days, 365); assert.match(bone.text, /365 days ago/);
  const services = await makeServices();
  const none = await habitat(services, {});
  assert.deepEqual(none.sections.find(section => section.id === 'own').entries, [], 'no place chosen: nothing attributed');
  const chosen = await habitat(services, {place: 'module-a'});
  const own = chosen.sections.find(section => section.id === 'own').entries.map(entry => entry.id);
  const other = chosen.sections.find(section => section.id === 'place-module-b');
  assert.ok(other.entries.length > 0); assert.match(other.note, /Not attributed to you/);
  for (const entry of other.entries) assert.equal(own.includes(entry.id), false, `${entry.id} from module-b is in the own section`);
});

test('G2-W4: no score, grade, causal sentence or reassurance anywhere, also after an interaction', async () => {
  const services = await makeServices();
  const models = await everyModel(services);
  models['my-health-after'] = await (await health(services)).interactions.recordNothingNew();
  models['habitat-after'] = await habitat(services, {place: 'module-b'});
  models['progress-after'] = await (await progress(services, {})).interactions.chooseVariable('glucose');
  const withCorrection = await makeServices({records: [makeRecord({id: 'g2-fix', value: 72, corrects: 'synthetic-1-record-001', time: `${DAY(13)}T13:00:00.000Z`})]});
  models['progress-corrected'] = await progress(withCorrection, {});
  for (const [name, vm] of Object.entries(models)) {
    assert.notEqual(vm.state, 'error', name);
    for (const key of viewKit.keysOf(vm)) assert.equal(SCORE_KEYS.includes(key), false, `${name}: key ${key}`);
    for (const text of viewKit.textsOf(vm)) { assert.doesNotMatch(text, FORBIDDEN_WORDS, `${name}: ${text}`); assert.doesNotMatch(text, CAUSAL_WORDS, `${name}: ${text}`); }
  }
});
