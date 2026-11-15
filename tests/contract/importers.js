import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {failure} from './assertions.js';
import {validateRecord} from '../../app/core/index.js';
const accepted=result=>{assert.equal(result.ok,true);return result.value;};
const HEADER='Subject,Date,Test_Phase,BR_Day,Vitals Time,Pulse,SysBP,DiaBP,Resp Rate,Weight,Body Temp,Height,Comment,Bowel Movement Description';
/** Verified provider headers, team-authored values; no original clinical rows. */
export async function checkImporters(m,fixtures) {
  for(const [fn,args] of [['importCRF',[]],['importAdaptation',[{study:'MR079G'}]],['importGlucose',[{subject:'terrestrial-subject'}]]])
    for(const input of [null,{},[],7]) failure(m[fn](input,...args));
  const row='007,7/6/2007,PRE_TEST,-1,9:40,0,120,80,16,70,37,170,secret clinical free text,secret bowel free text';
  const text=HEADER+'\n'+row;
  const report=accepted(m.importCRF(text));
  assert.equal(report.records.length,7);assert.equal(report.rejected.length,0);assert.equal(report.skipped.length,2);
  const pulse=report.records.find(r=>r.variable==='pulse');assert.ok(pulse);
  assert.equal(pulse.value,0);assert.equal(pulse.unit,null);assert.equal(pulse.unit_status,'unknown');
  const fingerprint=createHash('sha256').update(text,'utf8').digest('hex');
  for(const r of report.records){
    assert.equal(validateRecord(r).ok,true);assert.equal(r.subject,'007');assert.equal(r.origin,'ground_analog');
    assert.equal(r.mission_phase,'PRE_TEST');assert.equal(r.time,null);assert.equal(r.source_time.value,'2007-07-06T09:40');
    assert.equal(r.source_time.precision,'minute');assert.equal(r.source_time.calendar,'unknown');assert.equal(r.source_time.timezone,null);
    assert.ok(r.id.includes(fingerprint));assert.ok(r.source.includes(fingerprint));assert.match(r.note,/BR_Day=-1/);
  }
  assert.equal(JSON.stringify(report).includes('secret'),false);
  assert.equal(new Set(report.records.map(r=>r.id)).size,7);
  assert.deepEqual(m.importCRF(text),m.importCRF(text));
  const missing=accepted(m.importCRF(HEADER+'\n'+row.replace(',0,120,80,',',NA,,NaN,')));
  for(const key of ['pulse','systolic_pressure','diastolic_pressure']){
    const r=missing.records.find(r=>r.variable===key);assert.equal(r.state,'not_recorded');assert.equal(Object.hasOwn(r,'value'),false);
  }
  const rejected=accepted(m.importCRF(text+'\n'+row.replace('7/6/2007','2/30/2007')+'\n'+row));
  assert.equal(rejected.records.length,14);assert.equal(rejected.rejected.length,1);
  const quoted=accepted(m.importCRF(HEADER+'\n'+row.replace('secret clinical free text','"excluded, multiline\ntext"')));
  assert.equal(quoted.records.length,7);assert.equal(quoted.skipped.length,2);
  assert.equal(accepted(m.importCRF(HEADER+',Campaign\n'+row+',spoof')).records[0].source_time.scope,pulse.source_time.scope);
  failure(m.importCRF(text+'\n"unclosed'));
  const a=accepted(m.importAdaptation('Campaign,Subject,Date,Test_Phase,BR_Day,Test,Position,Value,Units\nC3G,007,3/12/2009,POST_TEST,90,knee,seated,12,ft-lb',{study:'MR079G'}));
  assert.equal(a.records.length,1);assert.equal(a.records[0].value,12);assert.equal(a.records[0].unit,'ft-lb');
  assert.equal(a.records[0].subject,'007');assert.equal(a.records[0].source_time.value,'2009-03-12');assert.match(a.records[0].method,/seated/);
  const g=accepted(m.importGlucose('\ufeffTimestamp;Glycemia\r\n2100-01-02 01:02:03;5.5\r\n2100-01-02 01:07:03;NaN',{subject:'participant-007'}));
  assert.equal(g.records.length,2);assert.equal(g.records[0].value,5.5);assert.equal(g.records[0].unit,'mmol/L');
  assert.equal(g.records[0].origin,'terrestrial');assert.equal(g.records[0].source_time.calendar,'shifted');
  assert.equal(g.records[1].state,'not_recorded');assert.equal(Object.hasOwn(g.records[1],'value'),false);
  for(const r of g.records)assert.equal(validateRecord(r).ok,true);
  failure(m.importAdaptation(text,{study:'BRSMImmune'}));
  if(Array.isArray(fixtures))for(const {method,text,options,expected} of fixtures)assert.deepEqual(m[method](text,options),expected);
}
