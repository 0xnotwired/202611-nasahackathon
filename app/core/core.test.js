import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from './index.js';
import {checkCore} from '../../tests/contract/core.js';
import {record,context} from '../../tests/contract/samples.js';

export async function checkM01(implementation) {
  await checkCore(implementation);
  for(const origin of ['synthetic','ground_analog','terrestrial','flight','cell_culture']) assert.equal(implementation.validateRecord({...record,origin}).ok,true);
  for(const time of ['2026-02-30T12:00:00Z','2025-02-29T12:00:00Z','2026-11-15T24:00:00Z','2026-11-15T12:00:60Z','2026-11-15T12:00:00+02:00','yesterday']) {
    const result=implementation.validateRecord({...record,time}); assert.equal(result.ok,false,time); assert.equal(result.error.field,'time');
  }
  assert.equal(implementation.validateRecord({...record,time:'2024-02-29T12:00:00Z'}).ok,true);
  for(const value of [NaN,Infinity,-Infinity,null,'12',{},[],undefined]) assert.equal(implementation.validateRecord({...record,value}).ok,false);
  for(const id of ['',7,null,'x'.repeat(100000),'bad\0id']) assert.equal(implementation.validateRecord({...record,id}).ok,false);
  const environment={...record,type:'environment',place:'module-a',sensor:'demo-sensor',interval:{from:'2026-11-15T00:00:00Z',to:'2026-11-15T01:00:00Z'}};
  const parsed=implementation.validateRecord(environment);
  assert.equal(parsed.ok,true);
  assert.notEqual(parsed.value,environment); assert.notEqual(parsed.value.interval,environment.interval);
  environment.interval.from='changed'; assert.equal(parsed.value.interval.from,'2026-11-15T00:00:00Z');
  parsed.value.interval.to='changed'; assert.equal(environment.interval.to,'2026-11-15T01:00:00Z');
  assert.equal(implementation.validateRecord({...environment,interval:{from:record.time,to:'2026-11-14T00:00:00Z'}}).ok,false);
  let reads=0; const getter={...record};Object.defineProperty(getter,'value',{get(){reads++;return 12;},enumerable:true});
  assert.equal(implementation.validateRecord(getter).ok,false); assert.equal(reads,0);
  const cycle={...record};cycle.note=cycle;assert.equal(implementation.validateRecord(cycle).ok,false);
  for(const data of [Object.create(record), {...record,extra:'hidden'}, {...record,note:'x'.repeat(100000)}, {...record,interval:new Date()}]) assert.equal(implementation.validateRecord(data).ok,false);
  const noState={...record,type:'observation'}; delete noState.state; delete noState.value;delete noState.unit;
  assert.equal(implementation.createRecord(noState,context).ok,false);
  const fields={...record};delete fields.id;delete fields.time;delete fields.schema_version;
  const before=structuredClone(fields);
  const made=implementation.createRecord(fields,context);assert.equal(made.ok,true);assert.equal(made.value.id,'007');assert.deepEqual(fields,before);
  for(const invalidContext of [null,{}, {clock:context.clock,newId:()=>7}, {clock:()=> 'bad',newId:context.newId}]) assert.equal(implementation.createRecord(fields,invalidContext).ok,false);
  for(const data of [null,[],{}, {...record,method:''}]) {const result=implementation.areComparable(data,record);assert.equal(result.comparable,false);assert.equal(typeof result.reason,'string');}
}

test('M01 validates contracts, hostile inputs, UTC dates and detached values',()=>checkM01(core));
