import test from 'node:test';
import assert from 'node:assert/strict';
import {SCHEMA_VERSION,validateRecord,createRecord,areComparable} from './index.js';
import {record} from '../../tests/contract/samples.js';
const source_time={value:'2024-02-29',raw:'29/02/2024',precision:'date',timezone:null,calendar:'original',scope:'crf:cohort-a'};
const sample=()=>({...record,schema_version:2,time:null,source_time:{...source_time}});

test('source uncertainty preserves source time, unknown units and legacy records without rewriting',()=>{
  assert.equal(SCHEMA_VERSION,2);
  assert.deepEqual(validateRecord(record),{ok:true,value:record});
  const input=sample();const parsed=validateRecord(input);assert.deepEqual(parsed,{ok:true,value:input});
  input.source_time.raw='changed';assert.equal(parsed.value.source_time.raw,'29/02/2024');
  const creation=sample();const before=structuredClone(creation);
  const made=createRecord(creation,{clock:()=>{throw Error('source time must not read clock');},newId:()=> 'new-id'});
  assert.deepEqual(made,{ok:true,value:{...sample(),id:'new-id'}});
  assert.deepEqual(creation,before);
  assert.equal(validateRecord({...sample(),unit:null,unit_status:'unknown'}).ok,true);
  assert.equal(areComparable({...sample(),unit:null,unit_status:'unknown'},{...sample(),unit:null,unit_status:'unknown'}).comparable,false);
  assert.equal(areComparable(sample(),{...sample(),source_time:{...source_time,value:'2024-03-01'}}).comparable,true);
  for(const changed of [{scope:'other'},{calendar:'shifted'},{precision:'second',value:'2024-02-29T00:00:00'}])
    assert.equal(areComparable(sample(),{...sample(),source_time:{...source_time,...changed}}).comparable,false);
  assert.equal(areComparable(sample(),record).comparable,false);
});

test('source uncertainty rejects invalid calendars, contradictory metadata and hostile nested input',()=>{
  for(const changed of [{value:'2025-02-29'},{value:'2024-02-30'},{value:'2024-13-01'},{value:'2024-00-01'},
    {timezone:'UTC'},{timezone:0},{calendar:'invented'},{scope:''},{raw:''},{scope:'x'.repeat(513)},
    {raw:'x'.repeat(513)},{precision:'hour'},{extra:'no'},
    {precision:'second',value:'2024-02-29T24:00:00'},{precision:'second',value:'2024-02-29T00:00:00Z'},
    {precision:'second',value:'2024-02-29T00:00:00+02:00'},{precision:'second',value:'2024-02-29T00:00:00.0000'}]) {
    const result=validateRecord({...sample(),source_time:{...source_time,...changed}});assert.equal(result.ok,false,JSON.stringify(changed));
  }
  for(const value of ['2024-02-29T23:59:59','2024-02-29T00:00:00.1','2024-02-29T00:00:00.123'])
    assert.equal(validateRecord({...sample(),source_time:{...source_time,precision:'second',value}}).ok,true);
  for(const input of [{...sample(),schema_version:1},{...sample(),schema_version:3},{...sample(),source_time:null},
    {...sample(),time:record.time},{...record,unit_status:'known'},
    {...sample(),unit:null},{...sample(),unit_status:'unknown'},{...sample(),unit:null,unit_status:'known'},
    {...sample(),unit:null,unit_status:'unknown',state:'not_recorded'}]) assert.equal(validateRecord(input).ok,false,JSON.stringify(input));
  let reads=0;const hostile={...source_time};Object.defineProperty(hostile,'value',{enumerable:true,get(){reads++;return '2024-02-29';}});
  assert.equal(validateRecord({...sample(),source_time:hostile}).ok,false);assert.equal(reads,0);
  assert.equal(createRecord({...sample(),time:record.time},{clock:()=>record.time,newId:()=> 'new'}).ok,false);
});

test('unknown source calendar is preserved but never comparable',()=>{
  const input={...sample(),source_time:{...source_time,calendar:'unknown'}};
  assert.deepEqual(validateRecord(input),{ok:true,value:input});
  assert.equal(areComparable(input,input).comparable,false);
});

test('minute precision preserves a minute clock without inventing seconds',()=>{
  const input={...sample(),source_time:{...source_time,value:'2024-02-29T09:40',raw:'9:40',precision:'minute'}};
  assert.deepEqual(validateRecord(input),{ok:true,value:input});
  for(const value of ['2024-02-29T9:40','2024-02-29T09:40:00','2024-02-29T24:00','2024-02-29T09:60','2024-02-29T09:40Z'])
    assert.equal(validateRecord({...input,source_time:{...input.source_time,value}}).ok,false,value);
});
