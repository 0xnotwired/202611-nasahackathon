import {validateRecord,SCHEMA_VERSION} from '../core/index.js';
import {csv,fail,isWellFormed} from './csv.js';
import {sha256} from './sha256.js';
const safe=v=>typeof v==='string'&&v.trim().length>0&&v.length<=128&&isWellFormed(v)&&!/[\u0000-\u001f]/.test(v);
const decimal=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
// Decimal canonicalization detects number rounding/underflow without imposing clinical ranges.
function decimalKey(input){
 const [mantissa,exponent='0']=input.toLowerCase().split('e');
 const negative=mantissa.startsWith('-'),body=mantissa.replace(/^[+-]/,'');
 const [whole,fraction='']=body.split('.');let digits=(whole+fraction).replace(/^0+/,'');
 if(!digits)return '0';
 let power=Number(exponent)-fraction.length;
 const trailing=/0+$/.exec(digits);if(trailing){digits=digits.slice(0,-trailing[0].length);power+=trailing[0].length;}
 return (negative?'-':'')+digits+'e'+power;
}
const missing=v=>['','NA','N/A','NAN'].includes(v.trim().toUpperCase());
const CRF_COLUMNS=['Pulse','SysBP','DiaBP','Resp Rate','Weight','Body Temp','Height'];
const MR080_UNITS={'HR':'bpm','VO2':'L/min','VCO2':'L/min','RER':'1','VO2 (ml/kg/min)':'mL/kg/min','VE':'L/min at BTPS','FEO2':'%','FECO2':'%'};
const VARIABLES={CRF:{Pulse:'pulse',SysBP:'systolic_pressure',DiaBP:'diastolic_pressure','Resp Rate':'respiration_rate',Weight:'mass','Body Temp':'temperature',Height:'height'},MR079G:{Value:'strength'},MR035G:{NET_AVG_BMD:'bone_density'},MR080G:{HR:'pulse','VO2 (ml/kg/min)':'aerobic_capacity'},BUT_CGM:{Glycemia:'glucose'}};
const DOI={CRF:'10.83263/wjw1-ta27',MR079G:'10.83263/bk5h-r757',MR035G:'10.83263/7myc-5j86',MR080G:'10.83263/w056-8t76',BUT_CGM:'10.13026/hv8f-3w60'};
function option(input,key){
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 try {const p=Object.getOwnPropertyDescriptor(input,key);return p&&Object.hasOwn(p,'value')&&safe(p.value)?p.value:null;}catch{return null;}
}
function slash(raw){const m=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);return m?`${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`:null;}
function timeFor(row,profile,subject){
 let value,raw,precision='date';
 if(profile==='BUT_CGM'){raw=row.Timestamp;value=/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(raw)?raw.replace(' ','T'):null;precision='second';}
 else if(profile==='MR035G'){raw=row.SCAN_DATE;value=/^\d{4}-\d\d-\d\d$/.test(raw)?raw:null;}
 else {raw=row.Date;value=slash(raw);}
 if(profile==='CRF'){
  const clock=/^(\d{1,2}):(\d\d)$/.exec(row['Vitals Time']);raw+=' '+row['Vitals Time'];precision='minute';
  value=value&&clock?`${value}T${clock[1].padStart(2,'0')}:${clock[2]}`:null;
 }
 if(!value)return null;
 const campaign=row.Campaign??row.CAMPAIGN??(profile==='CRF'?'Campaign3':'1.0.0');
 return {value,raw,precision,timezone:null,calendar:profile==='BUT_CGM'?'shifted':'unknown',scope:`${profile}:${campaign}:${subject}`};
}
function prepare(input,profile,subject){
 const parsed=csv(input,profile==='BUT_CGM'?';':',');if(!parsed.ok)return parsed;
 const {headers,rows}=parsed.value;
 const required=profile==='CRF'?['Subject','Date','Test_Phase','BR_Day','Vitals Time',...CRF_COLUMNS]
  :profile==='MR079G'?['Campaign','Subject','Date','Test_Phase','BR_Day','Test','Position','Value','Units']
  :profile==='MR035G'?['CAMPAIGN','SUBJECT','TEST_PHASE','BR_DAY','SCAN_DATE','NET_AVG_BMD']
  :profile==='MR080G'?['Campaign','Subject','Date','Test_Phase','BR_Day','Test','Stage',...Object.keys(MR080_UNITS)]
  :['Timestamp','Glycemia'];
 if(required.some(k=>!headers.includes(k)))return fail('header','header');
 const allowed=new Set([...required,...(profile==='CRF'?['Comment','Bowel Movement Description']:[])]);
 const fingerprint=sha256(input),records=[],rejected=[],skipped=[];
 const numeric=profile==='CRF'?CRF_COLUMNS:profile==='MR079G'?['Value']:profile==='MR035G'?['NET_AVG_BMD']:profile==='MR080G'?Object.keys(MR080_UNITS):['Glycemia'];
 if(rows.length*numeric.length>10000)return fail('capacity','records');
 for(const entry of rows){
  const sourceRow=entry.row;const reject=(code,field)=>rejected.push({row:sourceRow,code,field});
  if(entry.bad||entry.cells.length!==headers.length){reject('row_shape','row');continue;}
  const row=Object.fromEntries(headers.flatMap((key,i)=>allowed.has(key)?[[key,entry.cells[i]]]:[]));
  if(profile==='CRF')for(const column of ['Comment','Bowel Movement Description'])if(row[column]?.trim()&&!missing(row[column]))skipped.push({row:sourceRow,column,reason:'excluded_free_text'}); // the token NA is a missing value, not free text
  const who=subject??row.Subject??row.SUBJECT;
  const phase=profile==='BUT_CGM'?'source_observation':row.Test_Phase??row.TEST_PHASE;
  const day=row.BR_Day??row.BR_DAY;
  const campaign=row.Campaign??row.CAMPAIGN;
  if(!safe(who)){reject('invalid_field','subject');continue;}
  if(!safe(phase)||(profile!=='BUT_CGM'&&(!safe(day)||(campaign!==undefined&&!safe(campaign))))){reject('invalid_field','context');continue;}
  if(profile==='MR080G'&&(campaign!=='C3C'||who!=='7772'||slash(row.Date)!=='2006-05-07'||row.Test!=='Pre Bed Rest Maximum Cycle-Light')){reject('unsupported_profile','study');continue;}
  if(['MR079G','MR080G'].includes(profile)&&(!safe(row.Test)||!safe(profile==='MR079G'?row.Position:row.Stage))){reject('invalid_field','method');continue;}
  if(profile==='MR079G'&&!missing(row.Value)&&(!safe(row.Units)||missing(row.Units))){reject('invalid_field','unit');continue;}
  const source_time=timeFor(row,profile,who);if(!source_time){reject('invalid_field','time');continue;}
  const staged=[];let invalid=null;
  for(const [i,column] of numeric.entries()){
   const raw=row[column],absent=missing(raw);let value;
   if(!absent){if(!decimal.test(raw.trim())||!Number.isFinite(value=Number(raw))||decimalKey(raw.trim())!==decimalKey(String(value))){invalid=column;break;}}
   const unit=profile==='MR079G'?(missing(row.Units)?null:row.Units):profile==='MR080G'?MR080_UNITS[column]:profile==='BUT_CGM'?'mmol/L':null;
   const method=profile==='MR079G'?`${profile}:${row.Test}:${row.Position}`:profile==='MR080G'?`${profile}:${row.Test}:${row.Stage}:${column}${column==='VE'?':BTPS':''}`:`${profile}:${column}`;
   const record={id:`import:${profile}:${fingerprint}:${sha256(who)}:${sourceRow}:${i}`,schema_version:SCHEMA_VERSION,type:profile==='CRF'||profile==='BUT_CGM'?'measurement':'exam',state:absent?'not_recorded':'recorded',variable:VARIABLES[profile][column]??column,method,time:null,source_time,origin:profile==='BUT_CGM'?'terrestrial':'ground_analog',source:`https://doi.org/${DOI[profile]}#profile=${profile==='BUT_CGM'?'1.0.0':campaign??'Campaign3'};sha256=${fingerprint};row=${sourceRow}`,mission_phase:phase,subject:who};
   if(profile!=='BUT_CGM')record.note=`Source phase=${phase}; BR_Day=${day}`;
   if(unit!==null)record.unit=unit;
   if(!absent){record.value=value;if(unit===null){record.unit=null;record.unit_status='unknown';}}
   const checked=validateRecord(record);if(!checked.ok){invalid=checked.error.field;break;}staged.push(checked.value);
  }
  if(invalid){reject('invalid_field',invalid);continue;}
  records.push(...staged);
 }
  // Columns of the file that this importer does not read are named, never dropped silently.
 return {ok:true,value:{records,rejected,skipped,unread_columns:headers.filter(h=>!allowed.has(h))}};
}
/** Pure import: original numeric values, unknown units explicit, no database write. */
export function importCRF(text){return prepare(text,'CRF');}
export function importAdaptation(text,options){const study=option(options,'study');if(!['MR079G','MR035G','MR080G'].includes(study))return fail('unsupported_study','study');return prepare(text,study);}
export function importGlucose(text,options){const subject=option(options,'subject');if(!subject)return fail('invalid_field','subject');return prepare(text,'BUT_CGM',subject);}
