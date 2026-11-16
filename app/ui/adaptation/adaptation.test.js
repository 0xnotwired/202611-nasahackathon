import test from 'node:test';
import assert from 'node:assert/strict';
import {model} from './model.js';
import {viewKit} from '../base/index.js';
import {makeServices,makeRecord,DAY,scenario,FORBIDDEN_WORDS,SCORE_KEYS} from '../../../tests/walkthrough/fixtures.js';

const section=(vm,id)=>vm.sections.find(s=>s.id===id);
const exam=(fields)=>makeRecord({type:'exam',variable:'strength',value:90,unit:'ft-lb',method:'isokinetic',time:`${DAY(10)}T09:00:00.000Z`,...fields});

test('M09-P1: the old bone exam is the "last known assessment" with its date, method and age',async()=>{
  const vm=await model(await makeServices(),{});
  const bone=section(vm,'results').entries.find(e=>e.variable==='bone_density');
  assert.equal(bone.assessment_label,'last known assessment');assert.equal(bone.method,'dxa');assert.equal(bone.time,'2025-11-15T12:00:00.000Z');assert.equal(bone.age_days,365);
  assert.doesNotMatch(JSON.stringify(bone),/current/i);
  assert.match(bone.text,/2025-11-15/);
});

test('M09-X1: every exam variable is listed; a not_recorded exam is "not recorded"',async()=>{
  const vm=await model(await makeServices(),{});
  const results=section(vm,'results').entries;
  assert.deepEqual(results.map(e=>e.variable).sort(),['aerobic_capacity','bone_density','strength']);
  const aerobic=results.find(e=>e.variable==='aerobic_capacity');assert.equal(aerobic.value_text,'not recorded');assert.equal(aerobic.value,null);assert.equal(aerobic.assessment_label,null);
  const none=section(await model(await makeServices({without:r=>r.type==='exam'}),{}),'results').entries;
  assert.equal(none.length,3);assert.ok(none.every(e=>e.has_record===false&&e.value_text==='not recorded'));
});

test('M09-P2: one variable measured with two methods is two series, each named by its method (R3)',async()=>{
  const vm=await model(await makeServices({records:[exam({id:'iso-1'})]}),{});
  const history=section(vm,'history');
  const strength=history.charts.filter(c=>/Strength/i.test(c.label));
  assert.equal(strength.length,2);
  assert.deepEqual(strength.map(c=>/dynamometer|isokinetic/.exec(c.label)[0]).sort(),['dynamometer','isokinetic']);
  assert.deepEqual(strength.map(c=>c.segments.flatMap(s=>s.points).map(p=>p.value)).sort(),[[100],[90]]);
  const results=section(vm,'results').entries.filter(e=>e.variable==='strength');assert.deepEqual(results.map(e=>e.method).sort(),['dynamometer','isokinetic']);
});

test('M09-P3: performed exercise and test results are separate sections with no item in both',async()=>{
  const sessions=[makeRecord({id:'ses-1',type:'action',variable:'exercise_session',value:undefined,method:'self_report',time:`${DAY(14)}T08:00:00.000Z`}),makeRecord({id:'ses-2',type:'action',variable:'exercise_session',value:undefined,method:'self_report',time:`${DAY(15)}T08:00:00.000Z`})];
  const vm=await model(await makeServices({records:sessions}),{});
  const performed=section(vm,'performed').entries.map(e=>e.id),results=section(vm,'results').entries.map(e=>e.id);
  assert.deepEqual(performed.sort(),['ses-1','ses-2']);assert.ok(results.length>0);assert.equal(performed.filter(id=>results.includes(id)).length,0);
  assert.ok(section(await model(await makeServices(),{}),'performed').entries.length===0);
});

test('M09-P4/X2: no repeat is offered for an exam whose equipment is not in the configuration',async()=>{
  const none=await model(await makeServices(),{});
  assert.deepEqual(none.repeat_options,[]);
  const bone=section(none,'results').entries.find(e=>e.variable==='bone_density');assert.equal(bone.repeat.available,false);assert.match(bone.repeat.text,/not in this mission configuration/);
  const config={...scenario.config[0],available_equipment:['demo-device','dynamometer']};
  const withDevice=await model(await makeServices({config}),{});
  assert.deepEqual(withDevice.repeat_options.map(o=>o.variable),['strength']);assert.match(withDevice.repeat_options[0].text,/available in this configuration/);
  assert.equal(section(withDevice,'results').entries.find(e=>e.variable==='bone_density').repeat.available,false,'dxa is still absent');
  assert.equal(Object.keys(withDevice).includes('current_bone_density'),false);
});

test('M09-X3: hostile services, no score keys, no reassuring words',async()=>{
  const base=await makeServices();
  for(const broken of [{store:undefined},{readings:{}},{catalogs:{}},{subject:''},{clock:'x'}]) assert.equal((await model({...base,...broken},{})).state,'error');
  for(const input of [undefined,null,'x',7]) assert.equal((await model(input,{})).state,'error');
  const vm=await model(base,{});
  for(const key of viewKit.keysOf(vm)) assert.equal(SCORE_KEYS.includes(key),false,key);
  for(const text of viewKit.textsOf(vm)) assert.doesNotMatch(text,FORBIDDEN_WORDS,text);
});
