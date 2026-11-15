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
