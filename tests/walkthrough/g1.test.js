import test from 'node:test';
import assert from 'node:assert/strict';
import {runG1Operations} from './g1-operations.js';
import * as core from '../../app/core/index.js';
import * as store from '../../app/store/index.js';
import * as scenario from '../../app/scenario/index.js';
const api={...core,...store,...scenario};

test('G1: scenario round-trip, immutable history, schema, atomicity and isolation',async()=>{
  const result=await runG1Operations(api);
  assert.ok(result.records>0);
  assert.equal(result.kind,'memory');
});

for(const mutation of ['collapse_state','zero_gap','drop_subject','overwrite','allow_update','skip_batch_validation']) test(`G1 negative control detects ${mutation}`,async()=>{
  const broken={...api,async openStore(options){
    const result=await store.openStore(options);
    if(!result.ok) return result;
    const original=result.value;
    const changed={...original};
    if(mutation==='allow_update') changed.updateState=async(collection,id,changes)=>{
      if(collection==='records') return {ok:true,value:{...(await original.get(collection,id)).value,...changes}};
      return original.updateState(collection,id,changes);
    };
    else if(mutation==='skip_batch_validation') changed.saveBatch=(collection,objects)=>{
      if(collection==='records'&&objects.some(object=>!Object.hasOwn(object,'origin'))) return Promise.resolve({ok:true,value:objects.length});
      return original.saveBatch(collection,objects);
    };
    else if(mutation==='drop_subject') changed.list=(collection,filter={})=>{
      const {subject,...rest}=filter; return original.list(collection,rest);
    };
    else if(mutation==='overwrite') changed.save=async(collection,object)=>{
      const previous=await original.get(collection,object.id);
      if(previous.ok) return {ok:true,value:object};
      return original.save(collection,object);
    };
    else changed.get=async(...args)=>{
      const value=await original.get(...args);
      if(value.ok&&value.value.state==='not_recorded') {
        if(mutation==='collapse_state') value.value.state='confirmed_none';
        else value.value.value=0;
      }
      return value;
    };
    return {ok:true,value:changed};
  }};
  const reason={drop_subject:/Subject isolation filter failed/,overwrite:/Duplicate save: expected implemented error Result/,allow_update:/Record updateState: expected implemented error Result/,skip_batch_validation:/Invalid batch: expected implemented error Result/}[mutation]??/changed on save/;
  await assert.rejects(()=>runG1Operations(broken),reason);
});
