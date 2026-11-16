// M17 copilot: a pure function from a situation and rules (data) to a card. It ships no rule: a rule is data with a source, a version
// and a review status, and an applicable rule only matches what the person recorded. With no applicable rule the card says so.
// No clock, no randomness, no network, no language model. Nothing here compares a value with a limit.
const REVIEW = Object.freeze(['demo', 'draft', 'reviewed']);
const isText = value => typeof value === 'string' && value.length > 0 && value.length <= 1000;
const isPlain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const list = value => (Array.isArray(value) ? value : []);

const RULE_KEYS = new Set(['id', 'when', 'suggestion', 'source', 'version', 'review_status', 'alert']);
function checkRule(rule) {
  if (!isPlain(rule)) return 'a rule must be an object';
  const unknown = Object.keys(rule).find(key => !RULE_KEYS.has(key));
  if (unknown !== undefined) return `a rule has a field that is not part of the contract (${String(unknown).slice(0, 30)}); only id, when, suggestion, source, version, review_status and alert are accepted`;
  if (!isText(rule.id)) return 'a rule needs an id';
  if (rule.id.length > 100 || rule.id.includes('@')) return `rule ${rule.id.slice(0, 40)} needs an id of at most 100 characters without "@"`;
  if (!isPlain(rule.when) || Object.keys(rule.when).join() !== 'recorded_variable' || !isText(rule.when.recorded_variable)) return `rule ${String(rule.id).slice(0, 40)} needs when: { recorded_variable }`;
  if (!isText(rule.suggestion)) return `rule ${rule.id.slice(0, 40)} needs a suggestion text`;
  if (!isText(rule.source)) return `rule ${rule.id.slice(0, 40)} has no source`;
  if (!isText(rule.version) || rule.version.length > 50 || rule.version.includes('@')) return `rule ${rule.id.slice(0, 40)} needs a version of at most 50 characters without "@"`;
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

const MAX_BYTES = 200 * 1024;
const failed = (code, field, message) => ({ok: false, error: {code, field, message}});

/**
 * parseRules(text) → Result<Rule[]>. Reads a rules file: JSON text of at most 200 KB holding a list, or { rules: [...] }. Nothing is trusted: it is parsed and
 * validated here, and a rule without a source, a version or a review status is refused. The app cannot verify that a rule was reviewed; it keeps what the file says.
 */
export function parseRules(text) {
  if (typeof text !== 'string') return failed('invalid_rules', 'text', 'The rules file must be text');
  if (text.length > MAX_BYTES) return failed('too_large', 'text', 'The rules file is larger than 200 KB');
  let data; try { data = JSON.parse(text); } catch { return failed('invalid_rules', 'text', 'The file is not valid JSON'); }
  return validateRules(isPlain(data) && Array.isArray(data.rules) ? data.rules : data);
}

/** saveRules(store, rules, { clock }) → Result<Rule[]>: stores each rule immutably as `id@version`; a stored id@version is never replaced (a changed rule needs a new version). */
export async function saveRules(store, rules, context) {
  if (!isPlain(store) || typeof store.save !== 'function' || typeof store.get !== 'function') return failed('invalid_store', 'store', 'A store with get() and save() is required');
  const checked = validateRules(rules); if (!checked.ok) return checked;
  if (!isPlain(context) || typeof context.clock !== 'function') return failed('invalid_context', 'clock', 'A clock is required');
  let saved; try { saved = context.clock(); } catch { saved = undefined; }
  if (typeof saved !== 'string' || Number.isNaN(Date.parse(saved))) return failed('invalid_clock', 'clock', 'The clock did not return an instant');
  // All or nothing: every rule is checked against what is stored first, and only then are the new ones written in one batch.
  const fresh = [];
  for (const rule of checked.value) {
    const id = `${rule.id}@${rule.version}`;
    const found = await store.get('rules', id);
    if (found.ok) { if (JSON.stringify(found.value.rule) === JSON.stringify(rule)) continue; return failed('version_exists', 'version', `Rule ${rule.id.slice(0, 40)} version ${rule.version.slice(0, 20)} already exists with other content; publish a new version. No rule of this file was saved.`); }
    fresh.push({id, schema_version: 2, saved, rule});
  }
  if (fresh.length) { if (typeof store.saveBatch !== 'function') return failed('invalid_store', 'store', 'A store with saveBatch() is required'); const out = await store.saveBatch('rules', fresh); if (!out.ok) return out; }
  return {ok: true, value: checked.value};
}

/** loadRules(store) → Result<Rule[]>: for each rule id, the most recently saved version. */
export async function loadRules(store) {
  if (!isPlain(store) || typeof store.list !== 'function') return failed('invalid_store', 'store', 'A store with list() is required');
  const listed = await store.list('rules', {}); if (!listed.ok) return listed;
  const newest = new Map();
  for (const item of listed.value) if (isPlain(item) && isPlain(item.rule) && (!newest.has(item.rule.id) || item.saved > newest.get(item.rule.id).saved || (item.saved === newest.get(item.rule.id).saved && item.rule.version.localeCompare(newest.get(item.rule.id).rule.version, 'en', {numeric: true}) > 0))) newest.set(item.rule.id, item);
  return {ok: true, value: [...newest.values()].map(item => item.rule).sort((a, b) => (a.id < b.id ? -1 : 1))};
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
    alert: rule && rule.alert !== undefined && s.alert_issued !== true ? {text: rule.alert, rule_id: rule.id, source: rule.source, version: rule.version, review_status: rule.review_status} : null
  };
}
