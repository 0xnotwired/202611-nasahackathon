import test from 'node:test';
import assert from 'node:assert/strict';
import {model} from './model.js';
import {viewKit} from '../base/index.js';
import {makeServices,makeRecord,countRecords,DAY,SUBJECT,FORBIDDEN_WORDS,SCORE_KEYS} from '../../../tests/walkthrough/fixtures.js';

// Expected values are written by hand from the work order and the synthetic scenario.
const entriesOf=vm=>vm.sections.flatMap(s=>s.entries??[]);
const section=(vm,id)=>vm.sections.find(s=>s.id===id);
const night=(method,value)=>makeRecord({variable:'sleep_hours',value,unit:'h',method,time:`${DAY(14)}T23:00:00.000Z`});

test('M08-P1: scheduled rest, self-report and instrument estimate are three entries, never merged (R3)',async()=>{
  const services=await makeServices({without:r=>r.variable==='sleep_hours',records:[night('self_report',7),night('scheduled_rest',8),night('instrument_estimate',6.5)]});
  const rest=section(await model(services,{}),'rest');
  assert.deepEqual(rest.entries.map(e=>[e.method,e.label,e.value_text]),[['instrument_estimate','Estimated sleep (instrument)','6.5 h'],['scheduled_rest','Scheduled rest','8 h'],['self_report','Sleep self-report','7 h']]);
  assert.equal(new Set(rest.entries.map(e=>e.id)).size,3);
  const unknown=section(await model(await makeServices({without:r=>r.variable==='sleep_hours',records:[night('mystery_device',5)]}),{}),'rest');
  assert.equal(unknown.entries[0].label,'Rest, method mystery_device');
});

test('M08-P2/X1: every variable is listed; one without data is "not recorded" with a null value; a newer not_recorded is shown, not skipped',async()=>{
  const services=await makeServices({records:[makeRecord({state:'not_recorded',time:`${DAY(15)}T17:00:00.000Z`})]});
  const vm=await model(services,{});
  const vitals=section(vm,'vitals');
  const resp=vitals.entries.find(e=>e.variable==='respiration_rate');
  assert.equal(resp.has_record,false);assert.equal(resp.value,null);assert.equal(resp.value_text,'not recorded');assert.equal(resp.text,'Respiration rate: not recorded');
  const pulse=vitals.entries.find(e=>e.variable==='pulse');assert.equal(pulse.state,'not_recorded');assert.equal(pulse.value,null);
  const symptoms=section(vm,'symptoms');
  assert.equal(symptoms.entries.length,10);
  assert.equal(symptoms.entries.find(e=>e.variable==='headache').value_text,'not recorded');assert.equal(symptoms.entries.find(e=>e.variable==='fatigue').has_record,true);
  assert.doesNotMatch(JSON.stringify(vm),/"value":0\b/);
  assert.match(section(vm,'vitals').note,/No attention criteria are defined/);
});

test('M08-P3: "nothing new" creates exactly one confirmed_none record without a value',async()=>{
  const services=await makeServices();
  const before=await countRecords(services.store);
  const vm=await model(services,{});
  assert.equal(vm.actions.nothing_new.enabled,true);
  const after=await vm.interactions.recordNothingNew();
  assert.equal(after.message.kind,'info');
  const all=(await services.store.list('records',{})).value;
  assert.equal(all.length,before+1);
  const made=all.find(r=>r.id==='new-1');
  assert.equal(made.state,'confirmed_none');assert.equal(Object.hasOwn(made,'value'),false);assert.equal(made.origin,'synthetic');assert.equal(made.subject,SUBJECT);assert.equal(made.variable,'other');
});

test('M08-P4: every value shows method, time and origin',async()=>{
  const vm=await model(await makeServices(),{});
  const withRecord=entriesOf(vm).filter(e=>e.has_record);
  assert.equal(withRecord.length,6,"fatigue, mood, nothing-new, pulse, glucose and the sleep self-report");
  for(const e of withRecord){assert.ok(e.method&&e.method.length>0,e.id);assert.ok((e.time??e.source_time_raw??'').length>0,e.id);assert.ok(e.origin&&e.origin_text.length>0,e.id);}
});

test('M08-X2: recording a measurement validates, keeps bad input out of the store and saves a good one',async()=>{
  const services=await makeServices();const before=await countRecords(services.store);
  const vm=await model(services,{});
  for(const bad of [{variable:'pulse',value:NaN},{variable:'pulse',value:Infinity},{variable:'pulse',value:'5'},{variable:'banana',value:5},{variable:'mass',value:70},{variable:'pulse'},null,'x',{variable:'pulse',value:5,method:7}]) {
    const out=await vm.interactions.recordMeasurement(bad);assert.equal(out.message.kind,'error',JSON.stringify(bad));
  }
  assert.equal(await countRecords(services.store),before,'nothing was saved');
  const ok=await vm.interactions.recordMeasurement({variable:'pulse',value:80,method:'demo-device'});
  assert.equal(ok.message.kind,'info');assert.equal(await countRecords(services.store),before+1);
  const mass=await vm.interactions.recordMeasurement({variable:'mass',value:70,unit:'kg',method:'scale'});assert.equal(mass.message.kind,'info');
  assert.equal(section(mass,'vitals').entries.find(e=>e.variable==='mass').value_text,'70 kg');
});

test('M08-X3: a read-only source or a missing core cannot write',async()=>{
  for(const services of [await makeServices({writable:false}),await makeServices({drop:['core']})]) {
    const before=await countRecords(services.store);const vm=await model(services,{});
    assert.equal(vm.actions.nothing_new.enabled,false);assert.ok(vm.actions.nothing_new.reason.length>0);assert.equal(vm.actions.measurement.enabled,false);
    assert.equal((await vm.interactions.recordNothingNew()).message.kind,'error');assert.equal((await vm.interactions.recordMeasurement({variable:'pulse',value:80,method:'x'})).message.kind,'error');
    assert.equal(await countRecords(services.store),before);
  }
});

test('M08-X4: no score, grade or health colour, and no word that reassures',async()=>{
  const vm=await model(await makeServices(),{});
  for(const key of viewKit.keysOf(vm)) assert.equal(SCORE_KEYS.includes(key),false,key);
  for(const text of viewKit.textsOf(vm)) assert.doesNotMatch(text,FORBIDDEN_WORDS,text);
});

test('M08-X5: hostile services give an error view model naming the part',async()=>{
  const base=await makeServices();const trap={};Object.defineProperty(trap,'subject',{enumerable:true,get(){throw new Error('accessor ran');}});
  for(const [part,broken] of [['store',{store:undefined}],['readings',{readings:{}}],['catalogs',{catalogs:{}}],['subject',{subject:''}],['clock',{clock:'x'}]]) {
    const vm=await model({...base,...broken},{});assert.equal(vm.state,'error',part);assert.match(vm.message,new RegExp(part));
  }
  for(const input of [undefined,null,'x',7,[],trap]) assert.equal((await model(input,{})).state,'error');
  assert.equal(base.subject,SUBJECT);
});
