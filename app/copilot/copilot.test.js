import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as m from './index.js';
import {scenario} from '../../tests/walkthrough/fixtures.js';

const config = scenario.config[0];
const situation = (extra = {}) => ({you_recorded: [{id: 'o1', variable: 'toy_symptom', state: 'recorded'}], we_know: [{id: 'p1', variable: 'pulse', value: 76}], missing: [{kind: 'not_recorded', variable: 'glucose'}], you_can: [], happened: [], next: [], why_empty: {}, alert_issued: false, ...extra});
const toy = (extra = {}) => ({id: 'toy-1', when: {recorded_variable: 'toy_symptom'}, suggestion: 'TOY: this is a labelled toy suggestion, not guidance.', source: 'toy source for tests', version: '0', review_status: 'demo', ...extra});

test('M17-P1: with no rule there is no suggestion, no_guidance is true, and data and gaps are the situation\'s', () => {
  const s = situation(); const before = structuredClone(s); const c = m.card(s, config, []);
  assert.equal(c.suggestion, null); assert.equal(c.no_guidance, true); assert.equal(c.alert, null); assert.deepEqual(c.gaps, s.missing); assert.deepEqual(c.data, [...s.you_recorded, ...s.we_know]); assert.deepEqual(s, before);
  assert.deepEqual(Object.keys(c).slice(0, 2), ['data', 'gaps'], 'data and gaps come first');
});

test('M17-P2: a suggestion carries its source, version and review status, and not_assessed says what was not looked at', () => {
  const c = m.card(situation(), config, [toy()]); assert.equal(c.no_guidance, false);
  assert.deepEqual({source: c.suggestion.source, version: c.suggestion.version, review_status: c.suggestion.review_status, rule_id: c.suggestion.rule_id}, {source: 'toy source for tests', version: '0', review_status: 'demo', rule_id: 'toy-1'});
  assert.ok(c.not_assessed.length > 0); assert.match(c.not_assessed.join(' '), /threshold|criterion/i); assert.ok(c.data.length && c.gaps.length);
  assert.equal(m.card(situation({you_recorded: []}), config, [toy()]).no_guidance, true, 'a rule that does not apply gives no guidance');
});

test('M17-P3: a rule with no source is rejected on load, and is named in not_assessed', () => {
  for (const bad of [toy({source: ''}), toy({source: undefined}), toy({version: ''}), toy({review_status: 'approved'}), toy({when: {}}), toy({suggestion: ''}), null, 'x']) assert.equal(m.validateRules([bad]).ok, false, JSON.stringify(bad)?.slice(0, 50));
  assert.equal(m.validateRules([toy(), toy({id: 'toy-1'})]).ok, false, 'duplicate ids'); assert.equal(m.validateRules('x').ok, false); assert.equal(m.validateRules([toy()]).ok, true);
  const c = m.card(situation(), config, [toy({source: ''})]); assert.equal(c.no_guidance, true); assert.match(c.not_assessed.join(' '), /rule.*not applied|not applied/i);
});

test('M17-P4: if the episode already issued an alert, alert is null; otherwise a rule may carry one', () => {
  const rule = toy({alert: 'TOY alert text'});
  assert.deepEqual(m.card(situation(), config, [rule]).alert, {text: 'TOY alert text'}); assert.equal(m.card(situation({alert_issued: true}), config, [rule]).alert, null);
  assert.equal(m.card(situation(), config, [toy()]).alert, null, 'no alert text in the rule, no alert');
});

test('M17-P5: the same inputs give the same card, and the source reads no clock, no randomness and no network', () => {
  assert.deepEqual(m.card(situation(), config, [toy()]), m.card(situation(), config, [toy()]));
  const source = readFileSync(new URL('./index.js', import.meta.url), 'utf8'); assert.doesNotMatch(source, /fetch|XMLHttpRequest|Date\.now|Math\.random|new Date\(|import\(/);
  assert.doesNotMatch(source, /\b(low|high|threshold)\s*[<>]=?\s*\d/i, 'no number is compared with a clinical limit');
});

test('M17-X1: a card needs a situation; the first of several applicable rules wins by id; hostile input does not throw', () => {
  const a = toy({id: 'b-rule', suggestion: 'B'}), b = toy({id: 'a-rule', suggestion: 'A'}); assert.equal(m.card(situation(), config, [a, b]).suggestion.text, 'A');
  for (const bad of [null, undefined, 'x', {}]) assert.equal(m.card(bad, config, [toy()]).no_guidance, true);
  assert.equal(m.card(situation(), config, undefined).no_guidance, true); assert.equal(m.card(situation(), null, [toy()]).no_guidance, false);
});

// ---- Rules as data: parse, store, load ----
import {openStore} from '../store/index.js';
const R = (extra = {}) => ({id: 'r1', when: {recorded_variable: 'fatigue'}, suggestion: 'Fictional.', source: 'team demo (fictional)', version: 'v1', review_status: 'demo', ...extra});
const clock = () => '2026-11-16T10:00:00.000Z';
const mem = async () => (await openStore({kind: 'memory', name: `cp-${Math.random()}`})).value;

test('M17-R1: parseRules reads a file as untrusted text: size, JSON, shape and sources are checked', () => {
  assert.equal(m.parseRules(JSON.stringify([R()])).ok, true); assert.equal(m.parseRules(JSON.stringify({rules: [R()]})).ok, true);
  for (const bad of [7, undefined, '{', 'null', '"x"', JSON.stringify([R({source: ''})]), JSON.stringify([R({review_status: 'approved'})]), JSON.stringify([R(), R()]), JSON.stringify([{...R(), extra_when: 1, when: {recorded_variable: 'a', limit: 5}}]), 'x'.repeat(200 * 1024 + 1)])
    assert.equal(m.parseRules(bad).ok, false, String(bad).slice(0, 30));
  assert.equal(m.parseRules('x'.repeat(200 * 1024 + 1)).error.code, 'too_large');
});

test('M17-R2: stored rules are immutable per id@version; a changed rule needs a new version; load gives the newest per id', async () => {
  const store = await mem();
  assert.equal((await m.saveRules(store, [R()], {clock})).ok, true); assert.equal((await m.saveRules(store, [R()], {clock})).ok, true, 'the same content again is accepted');
  const clash = await m.saveRules(store, [R({suggestion: 'Changed.'})], {clock}); assert.equal(clash.error.code, 'version_exists'); assert.equal((await m.loadRules(store)).value[0].suggestion, 'Fictional.');
  await m.saveRules(store, [R({version: 'v2', suggestion: 'Newer.'})], {clock: () => '2026-11-16T11:00:00.000Z'}); assert.equal((await m.loadRules(store)).value[0].suggestion, 'Newer.');
  assert.equal((await m.saveRules(store, [R({id: 'r2', source: ''})], {clock})).ok, false); assert.equal((await m.saveRules(store, [R({id: 'r3'})], {clock: () => 'noon'})).error.code, 'invalid_clock');
  assert.equal((await m.loadRules({})).ok, false);
});
