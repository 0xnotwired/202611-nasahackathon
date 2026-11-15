import assert from 'node:assert/strict';
import {record,context,invalidRecords} from './samples.js';
export async function checkCore(core) {
  assert.deepEqual([...core.STATES], ['recorded','confirmed_none','not_recorded']);
  assert.deepEqual([...core.TYPES], ['observation','measurement','action','environment','exam']);
  assert.deepEqual([...core.ORIGINS], ['synthetic','ground_analog','terrestrial','flight','cell_culture']);
  assert.equal(Number.isInteger(core.SCHEMA_VERSION), true);
  assert.deepEqual(core.validateRecord(record), {ok:true,value:record});
  for (const field of ['origin','method','time','subject','id','variable','source','mission_phase','state','type','schema_version','value','unit']) {
    const data = {...record}; delete data[field];
    const result = core.validateRecord(data);
    assert.equal(result.ok, false, `missing ${field}`);
    assert.equal(result.error.field, field);
    assert.match(result.error.message, new RegExp(field));
  }
  for (const data of invalidRecords) assert.equal(core.validateRecord(data).ok,false, 'invalid input must be rejected');
  for (const origin of core.ORIGINS) for (const state of core.STATES) {
    const data={...record,origin,state};
    if(state !== 'recorded') { delete data.value; delete data.unit; }
    assert.deepEqual(core.validateRecord(data),{ok:true,value:data});
    const {id,time,schema_version,...fields}=data;
    assert.deepEqual(core.createRecord(fields,context),{ok:true,value:{...fields,id:'007',time:context.clock(),schema_version:core.SCHEMA_VERSION}});
  }
  for(const field of ['subject','variable','unit','method']) {
    const result=core.areComparable(record,{...record,[field]:'other'});
    assert.equal(result.comparable,false,field);
    assert.match(result.reason,new RegExp(field));
  }
  assert.deepEqual(core.areComparable(record,{...record}),{comparable:true});
  const fields={...record}; delete fields.id; delete fields.time; delete fields.schema_version;
  assert.equal(core.createRecord(fields,{...context,newId:()=>7}).ok,false);
  assert.equal(core.createRecord({...fields,state:'unknown'},context).ok,false);
  const noState={...fields,type:'observation'}; delete noState.state; delete noState.value; delete noState.unit;
  const missingState=core.createRecord(noState,context);
  assert.equal(missingState.ok,false,'missing state must never default to confirmed_none');
  assert.equal(missingState.error.field,'state');
  const environment={...record,type:'environment',place:'demo-place',sensor:'demo-device',interval:{from:record.time,to:record.time}};
  assert.equal(core.validateRecord(environment).ok,true);
  for(const field of ['place','sensor','interval']) {
    const data={...environment}; delete data[field];
    assert.equal(core.validateRecord(data).error.field,field);
  }
}
