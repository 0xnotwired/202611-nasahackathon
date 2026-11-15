// Compare a record with an attention criterion that exists as DATA in the mission configuration (R6).
// This module contains no threshold of its own: every bound it reads comes from the criterion,
// and the result always names the criterion's author, source and review status.
import {validateRecord} from '../core/index.js';

const REVIEW_STATUSES = ['demo', 'reviewed'];
const notAssessed = reason => ({status: 'not_assessed', reason});
const isText = value => typeof value === 'string' && value.length > 0;
const isBound = value => typeof value === 'number' && Number.isFinite(value);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function ownValue(object, key) {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  return descriptor && Object.hasOwn(descriptor, 'value') ? descriptor.value : undefined;
}

/** A criterion is usable only if it says who defined it, where it comes from and its review status. */
function problemWith(criterion) {
  for (const key of ['id', 'defined_by', 'source', 'unit']) if (!isText(ownValue(criterion, key))) return `its ${key} is missing`;
  if (!REVIEW_STATUSES.includes(ownValue(criterion, 'review_status'))) return 'its review_status is not demo or reviewed';
  const low = ownValue(criterion, 'low'); const high = ownValue(criterion, 'high');
  if (low === undefined && high === undefined) return 'it has neither low nor high';
  if (low !== undefined && !isBound(low)) return 'its low is not a finite number';
  if (high !== undefined && !isBound(high)) return 'its high is not a finite number';
  if (low !== undefined && high !== undefined && low > high) return 'its low is above its high';
  return null;
}

function criteriaOf(config) {
  if (!plain(config)) return {error: 'no mission configuration was given'};
  const list = ownValue(config, 'attention_criteria');
  if (list === undefined) return {list: []};
  if (!Array.isArray(list)) return {error: 'attention_criteria is not a list'};
  if (list.some(entry => !plain(entry))) return {error: 'attention_criteria holds an entry that is not an object'};
  return {list};
}

/**
 * attention(record, config) → { status, criterion?, reason? }
 * `within` needs a well-formed criterion for this variable and this unit and a recorded numeric value.
 * Absence in the record is reported before a missing criterion, so a not recorded value never reads as "no criterion".
 */
export function attention(input, config) {
  const checked = validateRecord(input);
  if (!checked.ok) return notAssessed(`the record is invalid (${checked.error.field ?? 'record'})`);
  const record = checked.value;
  if (record.state === 'not_recorded') return notAssessed('the value is not recorded');
  if (record.state === 'confirmed_none') return notAssessed('the record confirms nothing new; there is no value to compare');
  if (typeof record.value !== 'number') return notAssessed('the record has no numeric value');
  if (record.unit_status === 'unknown') return notAssessed('the unit of this value is unknown');

  const found = criteriaOf(config);
  if (found.error) return notAssessed(found.error);
  const forVariable = found.list.filter(entry => ownValue(entry, 'variable') === record.variable);
  if (!forVariable.length) return {status: 'no_criterion', reason: 'no attention criterion is defined for this variable in this mission'};

  const sameUnit = forVariable.filter(entry => ownValue(entry, 'unit') === record.unit);
  if (!sameUnit.length) {
    const units = forVariable.map(entry => String(ownValue(entry, 'unit')));
    return notAssessed(`the criterion is in unit ${units.join(', ')} but the record is in unit ${record.unit}; no conversion is made`);
  }
  if (sameUnit.length > 1) return notAssessed('more than one criterion matches this variable and unit; none is chosen');

  const criterion = sameUnit[0];
  const problem = problemWith(criterion);
  if (problem) return notAssessed(`the matching criterion cannot be used: ${problem}`);
  const copy = {...criterion};
  const low = ownValue(criterion, 'low'); const high = ownValue(criterion, 'high');
  if (low !== undefined && record.value < low) return {status: 'outside', criterion: copy, reason: 'the value is below the criterion low'};
  if (high !== undefined && record.value > high) return {status: 'outside', criterion: copy, reason: 'the value is above the criterion high'};
  return {status: 'within', criterion: copy};
}
