import test from 'node:test';
import assert from 'node:assert/strict';
import * as mission from './index.js';
import {checkMission} from '../../tests/contract/mission.js';
import {config} from '../../tests/contract/samples.js';

const sample=()=>structuredClone(config);
const criterion=()=>({id:'demo',variable:'demo_variable',unit:'demo_unit',low:0,high:10,defined_by:'team demo',source:'team_defined',review_status:'demo'});
const fieldError=(value,field)=>{
  const result=mission.validateConfig(value);
  assert.equal(result.ok,false);
  assert.equal(result.error.field,field);
  assert.match(result.error.message,new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
};

test('M02 contract checker accepts the actual implementation',()=>checkMission(mission));
test('M02-P1: communication is required and restricted to the three documented modes',()=>{
  const absent=sample(); delete absent.communication; fieldError(absent,'communication');
  fieldError({...sample(),communication:'sometimes'},'communication');
  for(const communication of ['real_time','delayed','no_link']) assert.equal(mission.validateConfig({...sample(),communication}).ok,true);
});
test('M02-P2: equipment presence must be explicitly listed',()=>{
  assert.equal(mission.hasEquipment(sample(),'demo-device'),true);
  assert.equal(mission.hasEquipment(sample(),'missing'),false);
  assert.equal(mission.hasEquipment(sample(),'unlisted-catalog-id'),false);
  const empty={...sample(),available_equipment:[]};
  assert.deepEqual(mission.validateConfig(empty),{ok:true,value:empty});
  assert.equal(mission.hasEquipment(empty,'demo-device'),false);
});
test('M02-P3/X3: phases are half-open UTC intervals with no nearest fallback',()=>{
  const c={...sample(),phases:[{name:'first',from:'2026-11-15T00:00:00Z',to:'2026-11-16T00:00:00Z'},{name:'second',from:'2026-11-16T00:00:00Z',to:'2026-11-17T00:00:00Z'}]};
  for(const [time,expected] of [['2026-11-14T23:59:59Z',null],['2026-11-15T00:00:00Z','first'],['2026-11-16T00:00:00Z','second'],['2026-11-17T00:00:00Z',null],['2026-11-18T00:00:00Z',null]]) assert.equal(mission.phaseAt(c,time),expected);
});
test('M02-P4: environments and criterion provenance are explicit',()=>{
  fieldError({...sample(),environment:'moon'},'environment');
  for(const environment of ['station','spacecraft','rover','surface_base']) assert.equal(mission.validateConfig({...sample(),environment}).ok,true);
  for(const field of ['id','variable','unit','defined_by','source','review_status']) {
    const item=criterion(); delete item[field];
    fieldError({...sample(),attention_criteria:[item]},`attention_criteria[0].${field}`);
  }
  fieldError({...sample(),attention_criteria:[{...criterion(),review_status:'approved'}]},'attention_criteria[0].review_status');
});
test('M02-P5: a criterion needs a finite bound and zero is a bound',()=>{
  const none=criterion(); delete none.low; delete none.high;
  fieldError({...sample(),attention_criteria:[none]},'attention_criteria[0]');
  const negative={...sample(),attention_criteria:[{...criterion(),low:-1,high:0}]};
  assert.deepEqual(mission.validateConfig(negative),{ok:true,value:negative});
  const low=criterion(); delete low.high;
  assert.equal(mission.validateConfig({...sample(),attention_criteria:[low]}).ok,true);
  const high=criterion(); delete high.low; high.high=0;
  assert.equal(mission.validateConfig({...sample(),attention_criteria:[high]}).ok,true);
  for(const value of [undefined,null,NaN,Infinity,-Infinity,'10']) fieldError({...sample(),attention_criteria:[{...criterion(),low:value}]},'attention_criteria[0].low');
  fieldError({...sample(),attention_criteria:[{...criterion(),low:11,high:10}]},'attention_criteria[0]');
});
test('M02-X1: shapes, field types, uniqueness and resource limits fail closed',()=>{
  for(const value of [null,undefined,7,'',[],()=>{}]) fieldError(value,'config');
  for(const field of ['id','name','available_equipment','phases','attention_criteria']) {const c=sample();delete c[field];fieldError(c,field);}
  for(const [field,value] of [['id',7],['name',''],['available_equipment','demo-device'],['phases',{}],['attention_criteria',{}],['gravity_note',9]]) fieldError({...sample(),[field]:value},field);
  fieldError({...sample(),available_equipment:['same','same']},'available_equipment');
  fieldError({...sample(),attention_criteria:[criterion(),criterion()]},'attention_criteria');
  fieldError({...sample(),name:'x'.repeat(100000)},'name');
  fieldError({...sample(),phases:Array(10001).fill(sample().phases[0])},'phases');
  fieldError({...sample(),schema_version:999},'schema_version');
  fieldError({...sample(),extra:'unrecognized'},'extra');
  const getter=sample(); let called=false;
  Object.defineProperty(getter,'communication',{enumerable:true,get(){called=true;return 'no_link';}});
  fieldError(getter,'communication');assert.equal(called,false);
  fieldError(Object.assign(Object.create({communication:'no_link'}),sample()),'config');
  const badCriterion=criterion();Object.defineProperty(badCriterion,'low',{enumerable:true,get(){throw new Error('getter executed');}});
  fieldError({...sample(),attention_criteria:[badCriterion]},'attention_criteria[0].low');
});
test('M02-X1: dates reject rollover, offsets, inverted and overlapping intervals',()=>{
  for(const from of ['2026-02-30T00:00:00Z','2026-11-15','2026-11-15T00:00:00+00:00','2026-11-15T24:00:00Z','2026-11-15T00:00:60Z']) fieldError({...sample(),phases:[{name:'bad',from,to:'2027-01-01T00:00:00Z'}]},'phases[0].from');
  fieldError({...sample(),phases:[{name:'bad',from:'2026-11-16T00:00:00Z',to:'2026-11-15T00:00:00Z'}]},'phases[0]');
  fieldError({...sample(),phases:[{name:'one',from:'2026-11-15T00:00:00Z',to:'2026-11-17T00:00:00Z'},{name:'two',from:'2026-11-16T00:00:00Z',to:'2026-11-18T00:00:00Z'}]},'phases');
  assert.equal(mission.validateConfig({...sample(),phases:[{name:'leap',from:'2024-02-29T00:00:00.1Z',to:'2024-03-01T00:00:00.12Z'}]}).ok,true);
});
test('M02-X2: config results are detached and queries preserve caller data',()=>{
  const input={...sample(),gravity_note:'Explanation only',attention_criteria:[criterion()]};
  const before=structuredClone(input);const result=mission.validateConfig(input);
  assert.equal(result.ok,true);assert.deepEqual(result.value,input);
  result.value.available_equipment.push('new');result.value.phases[0].name='changed';result.value.attention_criteria[0].low=-10;
  assert.deepEqual(input,before);
  mission.hasEquipment(input,'demo-device');mission.phaseAt(input,'2026-11-15T12:00:00Z');assert.deepEqual(input,before);
});
test('helpers fail closed on hostile configs, equipment IDs and timestamps',()=>{
  for(const input of [null,[],{},'x',7]) {assert.equal(mission.hasEquipment(input,'demo-device'),false);assert.equal(mission.phaseAt(input,'2026-11-15T12:00:00Z'),null);}
  for(const equipment of [null,[],{},7,'']) assert.equal(mission.hasEquipment(sample(),equipment),false);
  for(const time of [null,{},7,'2026-02-30T12:00:00Z','2026-11-15T12:00:00+00:00']) assert.equal(mission.phaseAt(sample(),time),null);
});
