// Pure label and badge models. No DOM, no clock of their own, no imports from other modules.
// Rule: absence is never worded as a value or as reassurance (R1, R2); origin always travels (R4);
// a freshness cutoff or an attention criterion is DATA that the caller supplies (R6), never a constant here.

const STATE_TEXT = Object.freeze({recorded: 'recorded', confirmed_none: 'confirmed nothing new', not_recorded: 'not recorded'});
const ORIGIN_TEXT = Object.freeze({
  synthetic: 'synthetic (team demo, fictional)',
  ground_analog: 'ground analog (on Earth, not spaceflight)',
  terrestrial: 'terrestrial (people on Earth, not a spaceflight analog)',
  flight: 'flight (spaceflight)',
  cell_culture: 'cell culture (not a person)'
});
const DAY_MS = 24 * 60 * 60 * 1000;
const REVIEW_STATUSES = ['demo', 'reviewed'];

/** Read an own data property without running an accessor. */
export function ownValue(object, key) {
  if (object === null || typeof object !== 'object') return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  return descriptor && Object.hasOwn(descriptor, 'value') ? descriptor.value : undefined;
}
const isText = value => typeof value === 'string' && value.length > 0;

export function stateLabel(input) {
  const state = typeof input === 'string' ? input : ownValue(input, 'state');
  return typeof state === 'string' && Object.hasOwn(STATE_TEXT, state) ? STATE_TEXT[state] : 'state unknown';
}

export function originLabel(origin) {
  return typeof origin === 'string' && Object.hasOwn(ORIGIN_TEXT, origin) ? ORIGIN_TEXT[origin] : 'origin unknown';
}

const dayWord = days => days === 0 ? 'today' : days === 1 ? '1 day ago' : `${days} days ago`;

/** Age in whole days, or a reason why none is given. Source-time records never get a UTC age. */
export function ageOf(record, context) {
  if (ownValue(record, 'time') === null) return {days: null, why: 'age not computed (source time has no time zone)'};
  const clock = ownValue(context, 'clock');
  if (typeof clock !== 'function') return {days: null, why: 'age not computed (no clock given)'};
  let now;
  try { now = Date.parse(clock()); } catch { now = NaN; }
  const then = Date.parse(ownValue(record, 'time'));
  if (Number.isNaN(now) || Number.isNaN(then)) return {days: null, why: 'age not computed (time could not be read)'};
  if (then > now) return {days: null, why: 'dated after the clock; age not computed'};
  return {days: Math.floor((now - then) / DAY_MS), why: null};
}

const validRecord = record => record !== null && typeof record === 'object'
  && typeof ownValue(record, 'state') === 'string' && Object.hasOwn(STATE_TEXT, ownValue(record, 'state'));

function valueText(record) {
  const state = ownValue(record, 'state');
  if (state === 'not_recorded') return {text: 'not recorded', value: null, unit: null};
  if (state === 'confirmed_none') return {text: 'confirmed nothing new', value: null, unit: null};
  const value = ownValue(record, 'value');
  if (typeof value !== 'number' || !Number.isFinite(value)) return {text: 'recorded (no numeric value)', value: null, unit: null};
  const unit = ownValue(record, 'unit');
  if (ownValue(record, 'unit_status') === 'unknown') return {text: `${value} (unit unknown)`, value, unit: null};
  if (isText(unit)) return {text: `${value} ${unit}`, value, unit};
  return {text: `${value} (no unit recorded)`, value, unit: null};
}

/** value, unit, method, time and age in one line, plus the parts. Nothing is converted or filled in. */
export function valueWithContext(record, context) {
  if (!validRecord(record)) {
    return {text: 'record is invalid; nothing to show', parts: {state: null, value: null, unit: null, method: null, time: null, source_time_raw: null, age_days: null, origin: null}};
  }
  const shown = valueText(record);
  const age = ageOf(record, context);
  const sourceTime = ownValue(record, 'source_time');
  const time = ownValue(record, 'time');
  const raw = ownValue(sourceTime, 'raw');
  const when = time === null || time === undefined
    ? `date as recorded in source: ${isText(raw) ? raw : 'not given'} (time zone not established); ${age.why}`
    : `${time} (${age.days === null ? age.why : dayWord(age.days)})`;
  const method = ownValue(record, 'method');
  const origin = ownValue(record, 'origin');
  return {
    text: `${shown.text} · method ${isText(method) ? method : 'not given'} · ${when} · ${originLabel(origin)}`,
    parts: {state: ownValue(record, 'state'), value: shown.value, unit: shown.unit, method: isText(method) ? method : null,
      time: typeof time === 'string' ? time : null, source_time_raw: isText(raw) ? raw : null, age_days: age.days, origin: typeof origin === 'string' ? origin : null}
  };
}

const badge = (kind, symbol, tone, text, extra = {}) => ({kind, symbol, tone, text, ...extra});

/** Colour plus text for the state of one datum. Colour never means "fine"; freshness comes from the caller. */
export function dataStateBadge(record, context) {
  if (!validRecord(record)) return badge('unknown', '?', 'unknown', 'data state unknown');
  const state = ownValue(record, 'state');
  if (state === 'not_recorded') return badge('not_recorded', '○', 'absent', 'not recorded');
  if (state === 'confirmed_none') return badge('confirmed_none', '▫', 'none', 'confirmed nothing new');
  if (ownValue(context, 'comparable') === false) {
    const reason = ownValue(context, 'reason');
    return badge('not_comparable', '≠', 'incomparable', `not comparable: ${isText(reason) ? reason : 'reason not given'}`);
  }
  if (ownValue(record, 'unit_status') === 'unknown') return badge('not_comparable', '≠', 'incomparable', 'not comparable: unit unknown');
  if (ownValue(record, 'time') === null) return badge('age_unknown', '?', 'unknown', 'recorded; age not established (source time has no time zone)');
  const age = ageOf(record, context);
  if (age.days === null) return badge('age_unknown', '?', 'unknown', `recorded; ${age.why}`);
  const cutoff = ownValue(context, 'old_after_days');
  const measured = age.days === 0 ? 'measured today' : `measured ${age.days === 1 ? '1 day' : `${age.days} days`} ago`;
  if (typeof cutoff !== 'number' || !Number.isFinite(cutoff) || cutoff < 0) return badge('age_only', '·', 'neutral', `${measured} (no freshness rule set)`, {age_days: age.days});
  return age.days > cutoff
    ? badge('old', '◐', 'old', `old: ${measured}`, {age_days: age.days})
    : badge('current', '●', 'current', `current: ${measured}`, {age_days: age.days});
}

function provenanceOf(criterion) {
  const defined_by = ownValue(criterion, 'defined_by');
  const source = ownValue(criterion, 'source');
  const review_status = ownValue(criterion, 'review_status');
  if (!isText(defined_by) || !isText(source) || !REVIEW_STATUSES.includes(review_status)) return null;
  return {defined_by, source, review_status};
}

/** Show the result of readings.attention with who defined the criterion, its source and its review status. */
export function attentionBadge(result) {
  const status = ownValue(result, 'status');
  const reason = ownValue(result, 'reason');
  if (status === 'no_criterion') return badge('no_criterion', '–', 'neutral', 'No attention criterion defined for this mission', {provenance: null});
  if (status === 'not_assessed') return badge('not_assessed', '–', 'neutral', `Not assessed: ${isText(reason) ? reason : 'no reason given'}`, {provenance: null});
  if (status === 'within' || status === 'outside') {
    const provenance = provenanceOf(ownValue(result, 'criterion'));
    if (!provenance) return badge('not_assessed', '–', 'neutral', 'Not assessed: the criterion does not say who defined it, its source and its review status, so no result is shown', {provenance: null});
    const demo = provenance.review_status === 'demo' ? 'Demo criterion. ' : '';
    const where = `criterion defined by ${provenance.defined_by} · source ${provenance.source} · review status ${provenance.review_status}`;
    const head = status === 'within' ? 'Within the configured range' : `Outside the configured range${isText(reason) ? ` (${reason})` : ''}`;
    return badge(status, status === 'within' ? '◇' : '◆', status === 'within' ? 'within' : 'outside', `${demo}${head} · ${where}`,
      {provenance, note: 'This compares one value with a configured criterion. It is not a diagnosis.'});
  }
  return badge('not_assessed', '–', 'neutral', 'Not assessed: the attention result was not recognised', {provenance: null});
}
