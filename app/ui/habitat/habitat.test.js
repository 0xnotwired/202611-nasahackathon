import test from 'node:test';
import assert from 'node:assert/strict';
import {model} from './model.js';
import {viewKit} from '../base/index.js';
import {makeServices,makeRecord,DAY,FORBIDDEN_WORDS,CAUSAL_WORDS,SCORE_KEYS} from '../../../tests/walkthrough/fixtures.js';

const section=(vm,id)=>vm.sections.find(s=>s.id===id);
const dose=(fields)=>makeRecord({type:'environment',variable:'radiation_dose',value:0.2,unit:'mGy',method:'absorbed',place:'module-a',sensor:'dosimeter-1',
  interval:{from:`${DAY(14)}T00:00:00.000Z`,to:`${DAY(14)}T23:00:00.000Z`},time:`${DAY(14)}T23:00:00.000Z`,...fields});

test('M10-P1/X1: with no place chosen nothing is attributed to the person; choosing one moves only that place into their section',async()=>{
  const services=await makeServices();
  const vm=await model(services,{});
  assert.deepEqual(vm.places,['module-a','module-b']);assert.equal(vm.chosen_place,null);
  assert.deepEqual(section(vm,'own').entries,[]);assert.match(section(vm,'own').note,/does not know where you are/i);
  const b=section(vm,'place-module-b');assert.ok(b.entries.length>=1);assert.ok(b.entries.every(e=>e.place==='module-b'));assert.match(b.note,/not attributed to you/i);
  const a=section(vm,'place-module-a');assert.ok(a.entries.every(e=>e.place==='module-a'));
  const chosen=await model(services,{place:'module-a'});
  assert.equal(chosen.chosen_place,'module-a');
  const own=section(chosen,'own').entries;assert.ok(own.length>=2);assert.ok(own.every(e=>e.place==='module-a'));
  assert.equal(own.some(e=>e.id==='synthetic-1-record-015'),false,'the module-b reading is not in the own section');
  assert.equal(section(chosen,'place-module-a'),undefined);assert.ok(section(chosen,'place-module-b'));
  const unknown=await model(services,{place:'nowhere'});assert.equal(unknown.chosen_place,null);assert.match(section(unknown,'own').note,/does not know where you are/i);
  const picked=await vm.interactions.choosePlace('module-b');assert.equal(picked.chosen_place,'module-b');
});

test('M10-X2: every reading carries place, sensor, method, time, origin and its own coverage',async()=>{
  const vm=await model(await makeServices(),{});
  const entries=vm.sections.filter(s=>s.id.startsWith('place-')).flatMap(s=>s.entries);
  assert.equal(entries.length,3);
  for(const e of entries){assert.ok(e.place&&e.sensor&&e.method&&e.time&&e.origin_text);assert.match(e.coverage_text,/11:00–12:00 UTC/);assert.match(e.coverage_text,/sensor synthetic-1-sensor-/);}
  const a=section(vm,'place-module-a').entries.map(e=>e.variable).sort();assert.deepEqual(a,['ambient_temperature','co2']);
});

test('M10-P2/X4: the career limit is not in the model by default, and never has a number',async()=>{
  const services=await makeServices();
  const text=JSON.stringify(await model(services,{}));
  assert.doesNotMatch(text,/career/i);assert.doesNotMatch(text,/600/);
  const on=await model(await makeServices({flags:{career_limit:true}}),{});
  assert.match(on.career_limit.text,/not confirmed/i);assert.doesNotMatch(on.career_limit.text,/\d/);
});

test('M10-P3: no causal sentence, no grade, no reassuring word',async()=>{
  const vm=await model(await makeServices({records:[dose({})]}),{place:'module-a'});
  for(const text of viewKit.textsOf(vm)){assert.doesNotMatch(text,CAUSAL_WORDS,text);assert.doesNotMatch(text,FORBIDDEN_WORDS,text);}
  for(const key of viewKit.keysOf(vm)) assert.equal(SCORE_KEYS.includes(key),false,key);
});

test('M10-P4/X3: radiation is cumulative per dose type and unit; with no data it is "not recorded", not 0',async()=>{
  const none=section(await model(await makeServices(),{}),'radiation');
  assert.equal(none.entries.length,1);assert.equal(none.entries[0].value,null);assert.equal(none.entries[0].value_text,'not recorded');assert.equal(none.entries[0].text,'Radiation dose: not recorded');
  const records=[dose({id:'d1',value:0.2}),dose({id:'d2',value:0.3,time:`${DAY(15)}T08:00:00.000Z`,interval:{from:`${DAY(15)}T00:00:00.000Z`,to:`${DAY(15)}T08:00:00.000Z`}}),dose({id:'d3',value:0.5,unit:'mSv',method:'equivalent'})];
  const rad=section(await model(await makeServices({records}),{}),'radiation').entries;
  assert.deepEqual(rad.map(e=>[e.dose_type,e.unit,e.value,e.value_text]),[['absorbed','mGy',0.5,'0.5 mGy'],['equivalent','mSv',0.5,'0.5 mSv']]);
  assert.match(rad[0].coverage_text,/2 readings on 2 days/);assert.match(rad[1].coverage_text,/1 reading on 1 day/);
  assert.match(rad[0].text,/cumulative/);assert.match(rad[0].text,/dose type absorbed/);
  const unknownUnit=makeRecord({id:'d4',type:'environment',variable:'radiation_dose',value:9,unit:null,unit_status:'unknown',method:'absorbed',place:'module-a',sensor:'x',interval:{from:`${DAY(14)}T00:00:00.000Z`,to:`${DAY(14)}T01:00:00.000Z`}});
  const withUnknown=section(await model(await makeServices({records:[unknownUnit]}),{}),'radiation');
  assert.equal(withUnknown.entries.some(e=>e.value===9),false,'a value with an unknown unit is never added into a total');assert.match(withUnknown.note,/unknown unit/i);
});

test('M10: hostile services give an error view model',async()=>{
  const base=await makeServices();
  for(const broken of [{store:undefined},{readings:{}},{catalogs:{}},{subject:''},{clock:'x'}]) assert.equal((await model({...base,...broken},{})).state,'error');
  for(const input of [undefined,null,'x',7]) assert.equal((await model(input,{})).state,'error');
  const trap={};Object.defineProperty(trap,'place',{enumerable:true,get(){throw new Error('accessor ran');}});
  assert.equal((await model(base,trap)).state,'ready');
  for(const place of [7,{},[],'x'.repeat(100000)]) assert.equal((await model(base,{place})).chosen_place,null);
});
