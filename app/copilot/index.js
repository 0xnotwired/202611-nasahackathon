// M17 copilot: a pure function from a situation and rules (data) to a card. It ships no rule: a rule is data with a source, a version
// and a review status, and an applicable rule only matches what the person recorded. With no applicable rule the card says so.
// No clock, no randomness, no network, no language model. Nothing here compares a value with a limit.
const REVIEW = Object.freeze(['demo', 'draft', 'reviewed']);
const isText = value => typeof value === 'string' && value.length > 0 && value.length <= 1000;
const isPlain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const list = value => (Array.isArray(value) ? value : []);

function checkRule(rule) {
  if (!isPlain(rule)) return 'a rule must be an object';
  if (!isText(rule.id)) return 'a rule needs an id';
  if (!isPlain(rule.when) || Object.keys(rule.when).join() !== 'recorded_variable' || !isText(rule.when.recorded_variable)) return `rule ${String(rule.id).slice(0, 40)} needs when: { recorded_variable }`;
  if (!isText(rule.suggestion)) return `rule ${rule.id.slice(0, 40)} needs a suggestion text`;
  if (!isText(rule.source)) return `rule ${rule.id.slice(0, 40)} has no source`;
  if (!isText(rule.version)) return `rule ${rule.id.slice(0, 40)} has no version`;
  if (!REVIEW.includes(rule.review_status)) return `rule ${rule.id.slice(0, 40)} needs review_status demo, draft or reviewed`;
  if (rule.alert !== undefined && !isText(rule.alert)) return `rule ${rule.id.slice(0, 40)} has an alert that is not text`;
  return null;
}

/** validateRules(rules) → Result<Rule[]>. A rule without a source (or any other required field) is rejected, and so are duplicate ids. */
export function validateRules(rules) {
  if (!Array.isArray(rules) || rules.length > 200) return {ok: false, error: {code: 'invalid_rules', field: 'rules', message: 'rules must be a list of at most 200'}};
  const seen = new Set();
  for (const rule of rules) {
    const problem = checkRule(rule);
    if (problem) return {ok: false, error: {code: 'invalid_rule', field: 'rules', message: problem}};
    if (seen.has(rule.id)) return {ok: false, error: {code: 'invalid_rule', field: 'rules', message: `rule id ${rule.id.slice(0, 40)} is used twice`}};
    seen.add(rule.id);
  }
  return {ok: true, value: structuredClone(rules)};
}

/** card(situation, config, rules) → { data, gaps, suggestion|null, no_guidance, not_assessed, alert|null }. Data and gaps come first. */
export function card(situation, config, rules) {
  const s = isPlain(situation) ? situation : {};
  const recorded = list(s.you_recorded);
  const usable = []; let rejected = 0; const seen = new Set();
  for (const rule of list(rules)) { if (checkRule(rule) === null && !seen.has(rule.id)) { usable.push(rule); seen.add(rule.id); } else rejected += 1; }
  const applicable = usable.filter(rule => recorded.some(item => item && item.variable === rule.when.recorded_variable && item.state === 'recorded')).sort((a, b) => (a.id < b.id ? -1 : 1));
  const rule = applicable[0] ?? null;
  const notAssessed = ['No value was compared with a threshold or a clinical criterion: none is applied here.', 'Only what you recorded and the data in this situation were looked at.'];
  if (!list(rules).length) notAssessed.push('No guidance rules are loaded.');
  if (rejected) notAssessed.push(`${rejected} rule(s) were not applied because they are incomplete or repeated (for example, without a source).`);
  return {
    data: [...recorded, ...list(s.we_know)], gaps: [...list(s.missing)],
    suggestion: rule ? {rule_id: rule.id, text: rule.suggestion, source: rule.source, version: rule.version, review_status: rule.review_status} : null,
    no_guidance: rule === null, not_assessed: notAssessed,
    alert: rule && rule.alert !== undefined && s.alert_issued !== true ? {text: rule.alert} : null
  };
}
