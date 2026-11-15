// Test-only reference. Never imported by app/ and not the M01 implementation.
export const STATES=Object.freeze(['recorded','confirmed_none','not_recorded']);
export const TYPES=Object.freeze(['observation','measurement','action','environment','exam']);
export const ORIGINS=Object.freeze(['synthetic','ground_analog','terrestrial','flight','cell_culture']);
export const SCHEMA_VERSION=1;
const fail=(field)=>({ok:false,error:{code:'invalid_field',field,message:`Invalid or missing field ${field}`}});
const text=v=>typeof v==='string' && v.trim().length>0 && !v.includes('\0');
const timestamp=v=>typeof v==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(v) && Number.isFinite(Date.parse(v));
export function validateRecord(data) {
  if(!data || typeof data!=='object' || Array.isArray(data)) return fail('record');
  for(const field of ['id','variable','method','time','source','mission_phase','subject','origin','state','type','schema_version']) {
    if(!Object.hasOwn(data,field)) return fail(field);
    if(field==='schema_version') {if(data[field]!==SCHEMA_VERSION) return fail(field);}
    else if(!text(data[field])) return fail(field);
  }
  if(!STATES.includes(data.state)) return fail('state');
  if(!TYPES.includes(data.type)) return fail('type');
  if(!ORIGINS.includes(data.origin)) return fail('origin');
  if(!timestamp(data.time)) return fail('time');
  if(data.state!=='recorded' && Object.hasOwn(data,'value')) return fail('value');
  if(data.state==='recorded' && ['measurement','environment','exam'].includes(data.type)) {
    if(typeof data.value!=='number' || !Number.isFinite(data.value)) return fail('value');
    if(!text(data.unit)) return fail('unit');
  }
  if(data.type==='environment') {
    for(const field of ['place','sensor']) if(!text(data[field])) return fail(field);
    if(!timestamp(data.interval?.from) || !timestamp(data.interval?.to) || data.interval.from>data.interval.to) return fail('interval');
  }
  if(Object.hasOwn(data,'corrects') && !text(data.corrects)) return fail('corrects');
  return {ok:true,value:{...data}};
}
export function createRecord(fields,{clock,newId}) {
  return validateRecord({...fields,id:newId(),time:clock(),schema_version:SCHEMA_VERSION});
}
export function areComparable(a,b) {
  for(const field of ['subject','variable','unit','method']) if(a[field]!==b[field]) return {comparable:false,reason:`Different ${field}`};
  return {comparable:true};
}
