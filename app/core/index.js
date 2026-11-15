import {error,own,snapshot,text,utc} from './boundary.js';

export const STATES = Object.freeze(['recorded','confirmed_none','not_recorded']);
export const TYPES = Object.freeze(['observation','measurement','action','environment','exam']);
export const ORIGINS = Object.freeze(['synthetic','ground_analog','terrestrial','flight','cell_culture']);
export const SCHEMA_VERSION = 1;
const fields = new Set(['id','schema_version','type','state','variable','value','unit','method','time','interval','origin','source','mission_phase','subject','place','sensor','corrects','note']);

/** Validate at the record boundary. An accepted value is detached, never repaired. */
export function validateRecord(input) {
  const parsed = snapshot(input);
  if (!parsed.ok) return parsed;
  const data = parsed.value;
  if (!data || typeof data !== 'object') return error('record');
  for (const key of Object.keys(data)) if (!fields.has(key)) return error(key,'Unknown');
  for (const key of ['id','variable','method','source','mission_phase','subject']) if (!text(data[key])) return error(key);
  if (!Number.isInteger(data.schema_version) || data.schema_version !== SCHEMA_VERSION) return error('schema_version',`Unsupported schema_version; expected ${SCHEMA_VERSION}; invalid`);
  if (!TYPES.includes(data.type)) return error('type');
  if (!STATES.includes(data.state)) return error('state');
  if (!ORIGINS.includes(data.origin)) return error('origin');
  if (!utc(data.time)) return error('time');
  // Absence carries no numeric value, including zero, null or undefined.
  if (data.state !== 'recorded' && own(data,'value')) return error('value');
  if (own(data,'value') && (typeof data.value !== 'number' || !Number.isFinite(data.value))) return error('value');
  if (own(data,'unit') && !text(data.unit)) return error('unit');
  if (data.state === 'recorded' && ['measurement','environment','exam'].includes(data.type)) {
    if (!own(data,'value')) return error('value');
    if (!text(data.unit)) return error('unit');
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
  return validateRecord({...parsed.value,id:newId(),time:clock(),schema_version:SCHEMA_VERSION});
}

/** This is compatibility, not a clinical judgment or proof that a value exists. */
export function areComparable(a, b) {
  const accepted=[];
  for (const input of [a,b]) {
    const result = validateRecord(input);
    if (!result.ok) return {comparable:false,reason:`Cannot compare invalid ${result.error.field}`};
    accepted.push(result.value);
  }
  for (const field of ['subject','variable','unit','method']) {
    if (accepted[0][field] !== accepted[1][field]) return {comparable:false,reason:`Different ${field}`};
  }
  return {comparable:true};
}
