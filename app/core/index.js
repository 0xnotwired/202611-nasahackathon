import {error,own,snapshot,text,utc} from './boundary.js';

export const STATES = Object.freeze(['recorded','confirmed_none','not_recorded']);
export const TYPES = Object.freeze(['observation','measurement','action','environment','exam']);
export const ORIGINS = Object.freeze(['synthetic','ground_analog','terrestrial','flight','cell_culture']);
export const SCHEMA_VERSION = 2;
const fields = new Set(['id','schema_version','type','state','variable','value','unit','method','time','source_time','unit_status','interval','origin','source','mission_phase','subject','place','sensor','corrects','note']);

// Check calendar components explicitly; unknown source clocks never enter Date.parse.
function validSourceTime(value) {
  if (!value || typeof value !== 'object' || Object.keys(value).sort().join(',') !== 'calendar,precision,raw,scope,timezone,value') return false;
  if (!text(value.raw) || !text(value.scope) || value.timezone !== null || !['original','shifted','unknown'].includes(value.calendar)) return false;
  const pattern = value.precision === 'date' ? /^(\d{4})-(\d{2})-(\d{2})$/
    : value.precision === 'minute' ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
    : value.precision === 'second' ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?$/ : null;
  if (!pattern || typeof value.value !== 'string') return false;
  const match=pattern.exec(value.value);if (!match) return false;
  const [year,month,day,hour=0,minute=0,second=0]=match.slice(1).map(Number);
  const leap=year%4===0 && (year%100!==0 || year%400===0);
  const days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  return month>=1 && month<=12 && day>=1 && day<=days[month-1] && hour<24 && minute<60 && second<60;
}

/** Validate at the record boundary. An accepted value is detached, never repaired. */
export function validateRecord(input) {
  const parsed = snapshot(input);
  if (!parsed.ok) return parsed;
  const data = parsed.value;
  if (!data || typeof data !== 'object') return error('record');
  for (const key of Object.keys(data)) if (!fields.has(key)) return error(key,'Unknown');
  for (const key of ['id','variable','method','source','mission_phase','subject']) if (!text(data[key])) return error(key);
  if (!Number.isInteger(data.schema_version) || ![1,SCHEMA_VERSION].includes(data.schema_version)) return error('schema_version',`Unsupported schema_version; expected 1 or ${SCHEMA_VERSION}; invalid`);
  if (!TYPES.includes(data.type)) return error('type');
  if (!STATES.includes(data.state)) return error('state');
  if (!ORIGINS.includes(data.origin)) return error('origin');
  if (data.schema_version === 1) {
    for (const key of ['source_time','unit_status']) if (own(data,key)) return error(key);
  }
  if (data.time === null && data.schema_version === 2) {
    if (!validSourceTime(data.source_time)) return error('source_time');
  } else {
    if (!utc(data.time)) return error('time');
    if (own(data,'source_time')) return error('source_time');
  }
  // Absence carries no numeric value, including zero, null or undefined.
  if (data.state !== 'recorded' && own(data,'value')) return error('value');
  if (own(data,'value') && (typeof data.value !== 'number' || !Number.isFinite(data.value))) return error('value');
  const unknownUnit = data.schema_version === 2 && data.unit_status === 'unknown';
  if (own(data,'unit_status') && !['known','unknown'].includes(data.unit_status)) return error('unit_status');
  if (unknownUnit && (data.unit !== null || data.state !== 'recorded' || !own(data,'value'))) return error('unit');
  if (!unknownUnit && own(data,'unit') && !text(data.unit)) return error('unit');
  if (data.unit_status === 'known' && !text(data.unit)) return error('unit');
  if (data.state === 'recorded' && ['measurement','environment','exam'].includes(data.type)) {
    if (!own(data,'value')) return error('value');
    if (!unknownUnit && !text(data.unit)) return error('unit');
  }
  for (const key of ['place','sensor','corrects','note']) if (own(data,key) && !text(data[key])) return error(key);
  if (data.type === 'environment') {
    for (const key of ['place','sensor']) if (!text(data[key])) return error(key);
    if (!own(data,'interval')) return error('interval');
  }
  if (own(data,'interval')) {
    const interval = data.interval;
    if (!interval || typeof interval !== 'object' || Object.keys(interval).sort().join(',') !== 'from,to'
        || !utc(interval.from) || !utc(interval.to) || Date.parse(interval.from) > Date.parse(interval.to)) return error('interval');
  }
  return {ok:true,value:data};
}

/** Inject time and identifier generation; do not read ambient time or randomness. */
export function createRecord(input, context) {
  const parsed = snapshot(input);
  if (!parsed.ok) return parsed;
  if (!parsed.value || typeof parsed.value !== 'object') return error('record');
  if (!context || typeof context !== 'object') return error('context');
  let clock, newId;
  try {
    const clockProperty = Object.getOwnPropertyDescriptor(context,'clock');
    const idProperty = Object.getOwnPropertyDescriptor(context,'newId');
    if (!clockProperty || !own(clockProperty,'value') || typeof clockProperty.value !== 'function'
        || !idProperty || !own(idProperty,'value') || typeof idProperty.value !== 'function') return error('context');
    clock = clockProperty.value; newId = idProperty.value;
  } catch { return error('context'); }
  if (own(parsed.value,'id') && !text(parsed.value.id)) return error('id');
  if (own(parsed.value,'schema_version') && parsed.value.schema_version !== SCHEMA_VERSION) return error('schema_version');
  return validateRecord({...parsed.value,id:newId(),time:parsed.value.time === null ? null : clock(),schema_version:SCHEMA_VERSION});
}

/** This is compatibility, not a clinical judgment or proof that a value exists. */
export function areComparable(a, b) {
  const accepted=[];
  for (const input of [a,b]) {
    const result = validateRecord(input);
    if (!result.ok) return {comparable:false,reason:`Cannot compare invalid ${result.error.field}`};
    accepted.push(result.value);
  }
  if (accepted.some(record => record.unit_status === 'unknown')) return {comparable:false,reason:'Unknown unit'};
  const [left,right] = accepted;
  if ((left.time === null) !== (right.time === null)) return {comparable:false,reason:'Different time basis'};
  if (left.time === null) {
    if (accepted.some(record => record.source_time.calendar === 'unknown')) return {comparable:false,reason:'Unknown source calendar'};
    for (const field of ['scope','calendar','precision']) if (left.source_time[field] !== right.source_time[field])
      return {comparable:false,reason:`Different source_time ${field}`};
  }
  for (const field of ['subject','variable','unit','method']) {
    if (accepted[0][field] !== accepted[1][field]) return {comparable:false,reason:`Different ${field}`};
  }
  return {comparable:true};
}
