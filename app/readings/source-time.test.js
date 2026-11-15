import test from 'node:test';
import assert from 'node:assert/strict';
import {seriesBySourceTime,series} from './index.js';
import {openStore} from '../store/index.js';

// Expected values are written by hand. Source time is text from the source: no UTC, no age.
const UTC_LIKE=/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/;
const clockOf=(value,{precision='date',calendar='original',scope='scope-a'}={})=>({value,raw:value,precision,timezone:null,calendar,scope});
const day=n=>`2026-03-${String(n).padStart(2,'0')}`;
let counter=0;
const rec=(fields={},when={})=>({schema_version:2,id:`s${++counter}`,type:'measurement',state:'recorded',variable:'pulse',value:60,unit:'bpm',method:'device-a',
  origin:'ground_analog',source:'user_entered',mission_phase:'mission',subject:'s-a',time:null,source_time:clockOf(day(1),when),...fields});
const gone=(fields={},when={})=>{const r=rec(fields,when);delete r.value;delete r.unit;return {...r,state:fields.state??'not_recorded'};};
async function storeWith(records) {
  const opened=await openStore({kind:'memory',name:'source-time-test'});assert.equal(opened.ok,true);
  const saved=await opened.value.saveBatch('records',records);assert.equal(saved.ok,true,JSON.stringify(saved));
  return opened.value;
}
const Q={subject:'s-a',variable:'pulse'};
const at=(n,when)=>({source_time:clockOf(day(n),when)});

test('M06-S1: gaps and points come from source days; nothing looks like UTC and no value is zero',async()=>{
  const store=await storeWith([rec({id:'a1',value:60,...at(1)}),rec({id:'a2',value:61,...at(2)}),gone({id:'a4',...at(4)}),rec({id:'a5',value:64,...at(5)})]);
  try {
    const out=await seriesBySourceTime(store,Q);
    assert.deepEqual(out.points.map(p=>[p.day,p.value]),[[day(1),60],[day(2),61],[day(5),64]]);
    assert.deepEqual(out.gaps.map(g=>[g.day,g.reason]),[[day(3),'no_record'],[day(4),'not_recorded']]);
    assert.equal(out.n,3);
    assert.deepEqual(out.clock,{scope:'scope-a',calendar:'original',precision:'date',timezone:null});
    assert.ok(out.points.every(p=>p.time===null&&p.source_time===p.day));
    assert.ok(out.points.every(p=>p.value!==0));
    assert.doesNotMatch(JSON.stringify(out),UTC_LIKE);
    assert.deepEqual(out.non_comparable_groups,[]);assert.deepEqual(out.other_clocks,[]);assert.equal(out.utc_records,0);
  } finally {await store.close();}
});

test('M06-S2: two clocks are never merged; the one with more measured values is primary; the other is listed',async()=>{
  const store=await storeWith([rec({id:'a1',...at(1,{scope:'scope-a'})}),rec({id:'a2',...at(2,{scope:'scope-a'})}),
    rec({id:'b1',value:90,...at(1,{scope:'scope-b'})}),rec({id:'b2',value:91,...at(2,{scope:'scope-b'})}),rec({id:'b3',value:92,...at(3,{scope:'scope-b'})})]);
  try {
    const out=await seriesBySourceTime(store,Q);
    assert.deepEqual(out.points.map(p=>p.id),['b1','b2','b3']);
    assert.equal(out.clock.scope,'scope-b');
    assert.deepEqual(out.other_clocks,[{scope:'scope-a',calendar:'original',precision:'date',n:2,orderable:true}]);
    assert.doesNotMatch(JSON.stringify([out.points,out.non_comparable_groups]),/"a1"|"a2"/);
  } finally {await store.close();}
  const tie=await storeWith([rec({id:'t1',...at(1,{scope:'scope-b'})}),rec({id:'t2',...at(1,{scope:'scope-a'})})]);
  try {assert.equal((await seriesBySourceTime(tie,Q)).clock.scope,'scope-a','a tie is decided by the stable key, not by save order');}
  finally {await tie.close();}
  const precision=await storeWith([rec({id:'p1',...at(1,{precision:'date'})}),rec({id:'p2',source_time:clockOf('2026-03-02T10:05',{precision:'minute'})}),rec({id:'p3',source_time:clockOf('2026-03-03T10:05',{precision:'minute'})})]);
  try {
    const out=await seriesBySourceTime(precision,Q);
    assert.deepEqual(out.points.map(p=>p.id),['p2','p3']);assert.deepEqual(out.other_clocks.map(c=>[c.precision,c.n]),[['date',1]]);
  } finally {await precision.close();}
});

test('M06-S3: an unknown calendar is never ordered or placed on a day',async()=>{
  const store=await storeWith([rec({id:'u1',...at(1,{calendar:'unknown',scope:'scope-u'})}),rec({id:'u2',...at(2,{calendar:'unknown',scope:'scope-u'})}),rec({id:'k1',value:70,...at(3)})]);
  try {
    const out=await seriesBySourceTime(store,Q);
    assert.deepEqual(out.points.map(p=>p.id),['k1']);
    assert.equal(out.other_clocks.length,1);
    const [unordered]=out.other_clocks;
    assert.deepEqual([unordered.scope,unordered.calendar,unordered.precision,unordered.n,unordered.orderable],['scope-u','unknown','date',2,false]);
    assert.deepEqual(out.gaps,[]);
    assert.doesNotMatch(JSON.stringify([out.points,out.gaps,out.non_comparable_groups]),/"u1"|"u2"/);
  } finally {await store.close();}
  const only=await storeWith([rec({id:'u1',...at(1,{calendar:'unknown',scope:'scope-u'})})]);
  try {
    const out=await seriesBySourceTime(only,Q);
    assert.equal(out.clock,null);assert.deepEqual(out.points,[]);assert.deepEqual(out.gaps,[]);assert.equal(out.other_clocks[0].orderable,false);
  } finally {await only.close();}
});

test('M06-S13: an unordered clock hands over its records unchanged, sorted by id only, claiming no order',async()=>{
  const raw=(id,text,v)=>({...rec({id,value:v,source_time:{value:'2007-07-06T09:40',raw:text,precision:'minute',timezone:null,calendar:'unknown',scope:'crf-like'}}),unit:null,unit_status:'unknown'});
  const store=await storeWith([raw('zz','7/6/2007 9:40',80),raw('aa','7/5/2007 8:15',70),{...gone({id:'mm',source_time:{value:'2007-07-07T10:00',raw:'7/7/2007 10:00',precision:'minute',timezone:null,calendar:'unknown',scope:'crf-like'}})},rec({id:'k1',...at(1)})]);
  try {
    const out=await seriesBySourceTime(store,Q);
    const unordered=out.other_clocks.find(c=>c.orderable===false);
    assert.deepEqual(unordered.records.map(r=>r.id),['aa','mm','zz'],'sorted by id for stable output, which says nothing about time');
    assert.deepEqual(unordered.records.map(r=>r.source_time.raw),['7/5/2007 8:15','7/7/2007 10:00','7/6/2007 9:40']);
    assert.deepEqual(unordered.records.map(r=>r.state),['recorded','not_recorded','recorded']);
    assert.equal(unordered.n,3);
    assert.deepEqual(out.points.map(p=>p.id),['k1']);
    assert.equal(out.other_clocks.filter(c=>c.orderable===true).every(c=>!Object.hasOwn(c,'records')),true);
  } finally {await store.close();}
  const two=await storeWith([rec({id:'a1',...at(1,{scope:'scope-a'})}),rec({id:'b1',...at(1,{scope:'scope-b'})}),rec({id:'b2',...at(2,{scope:'scope-b'})})]);
  try {
    const out=await seriesBySourceTime(two,Q);
    assert.equal(out.other_clocks.length,1);assert.equal(Object.hasOwn(out.other_clocks[0],'records'),false,'an orderable clock is counted, not listed');
  } finally {await two.close();}
});

test('M06-S14: an optional scope chooses the clock; every other clock is still listed',async()=>{
  const unorderedRec=(id,scope)=>rec({id,source_time:clockOf(day(1),{scope,calendar:'unknown'})});
  const store=await storeWith([rec({id:'a1',...at(1,{scope:'scope-a'})}),rec({id:'a2',...at(2,{scope:'scope-a'})}),
    rec({id:'b1',value:90,...at(1,{scope:'scope-b'})}),rec({id:'b2',value:91,...at(2,{scope:'scope-b'})}),rec({id:'b3',value:92,...at(3,{scope:'scope-b'})}),
    unorderedRec('u1','scope-a'),unorderedRec('u2','scope-b')]);
  try {
    const free=await seriesBySourceTime(store,Q);
    assert.equal(free.clock.scope,'scope-b');
    const chosen=await seriesBySourceTime(store,{...Q,scope:'scope-a'});
    assert.deepEqual(chosen.points.map(p=>p.id),['a1','a2']);assert.equal(chosen.clock.scope,'scope-a');
    assert.deepEqual(chosen.other_clocks.map(c=>[c.scope,c.orderable,Object.hasOwn(c,'records')]).sort(),[['scope-a',false,true],['scope-b',false,false],['scope-b',true,false]].sort());
    assert.doesNotMatch(JSON.stringify([chosen.points,chosen.non_comparable_groups]),/"b1"|"b2"|"b3"/);
    const none=await seriesBySourceTime(store,{...Q,scope:'nope'});
    assert.equal(none.clock,null);assert.deepEqual(none.points,[]);assert.equal(none.other_clocks.length,4);
    for(const bad of [7,'',{},[],'x'.repeat(100000)]) {const out=await seriesBySourceTime(store,{...Q,scope:bad});assert.equal(out.ok,false,JSON.stringify(bad)?.slice(0,30));assert.notEqual(out.error.code,'not_implemented');}
  } finally {await store.close();}
});

test('M06-S4: unknown-unit values are not points; they are listed with their source days',async()=>{
  const unknown=(id,n,v)=>({...rec({id,value:v,...at(n)}),unit:null,unit_status:'unknown'});
  const store=await storeWith([unknown('q1',1,7),unknown('q2',2,8),unknown('q3',3,9)]);
  try {
    const out=await seriesBySourceTime(store,Q);
    assert.deepEqual(out.points,[]);assert.equal(out.n,0);
    assert.equal(out.non_comparable_groups.length,1);
    assert.match(out.non_comparable_groups[0].reason,/unit/i);
    assert.deepEqual(out.non_comparable_groups[0].points.map(p=>[p.id,p.day,p.value]),[['q1',day(1),7],['q2',day(2),8],['q3',day(3),9]]);
    assert.equal(out.clock.scope,'scope-a');
  } finally {await store.close();}
});

test('M06-S5: UTC records are counted, not mixed in, and the UTC query still refuses',async()=>{
  const utc={...rec({id:'z1',value:80}),time:'2026-03-02T12:00:00.000Z'};delete utc.source_time;
  const store=await storeWith([rec({id:'a1',...at(1)}),utc]);
  try {
    const out=await seriesBySourceTime(store,Q);
    assert.deepEqual(out.points.map(p=>p.id),['a1']);assert.equal(out.utc_records,1);
    const refused=await series(store,{...Q,from:'2026-03-01T00:00:00.000Z',to:'2026-03-05T00:00:00.000Z'});
    assert.equal(refused.ok,false);assert.equal(refused.error.code,'unresolved_time');
  } finally {await store.close();}
});

test('M06-S6/S7: another subject never appears (R9) and a correction supersedes its record (R7)',async()=>{
  const store=await storeWith([rec({id:'mine',...at(1)}),rec({id:'theirs',subject:'s-b',...at(2)}),rec({id:'theirs2',subject:'s-b',...at(3,{scope:'scope-z'})}),
    rec({id:'o1',value:50,...at(4)}),rec({id:'c1',value:55,corrects:'o1',...at(4)})]);
  try {
    const out=await seriesBySourceTime(store,Q);
    assert.deepEqual(out.points.map(p=>p.id),['mine','c1']);
    assert.doesNotMatch(JSON.stringify(out),/theirs/);
    assert.deepEqual(out.other_clocks,[]);
  } finally {await store.close();}
});

test('M06-S12: shifted calendar and second precision keep the source day; days between values are gaps',async()=>{
  const sec=(id,date,time,v)=>rec({id,value:v,source_time:clockOf(`${date}T${time}`,{precision:'second',calendar:'shifted',scope:'participant-1'})});
  const store=await storeWith([sec('g1','2100-01-01','08:00:00',5.5),sec('g2','2100-01-01','08:00:05',5.6),sec('g3','2100-01-03','09:30:10',6.1)]);
  try {
    const out=await seriesBySourceTime(store,Q);
    assert.deepEqual(out.points.map(p=>[p.id,p.day,p.source_time]),[['g1','2100-01-01','2100-01-01T08:00:00'],['g2','2100-01-01','2100-01-01T08:00:05'],['g3','2100-01-03','2100-01-03T09:30:10']]);
    assert.deepEqual(out.gaps,[{day:'2100-01-02',reason:'no_record'}]);
    assert.equal(out.clock.calendar,'shifted');assert.equal(out.clock.precision,'second');
    assert.doesNotMatch(JSON.stringify(out),UTC_LIKE);
  } finally {await store.close();}
});

test('M06-S8: no records means no clock, no gaps and no invented data',async()=>{
  const store=await storeWith([]);
  try {assert.deepEqual(await seriesBySourceTime(store,Q),{points:[],gaps:[],n:0,non_comparable_groups:[],clock:null,other_clocks:[],utc_records:0});}
  finally {await store.close();}
});

test('M06-S9: hostile input gives an implemented error Result and never throws',async()=>{
  const store=await storeWith([rec({id:'old',...at(1)}),rec({id:'new',source_time:clockOf('2000-01-01')})]);
  const trap={};Object.defineProperty(trap,'subject',{enumerable:true,get(){throw new Error('accessor ran');}});
  const failed=(out,label)=>{assert.equal(out?.ok,false,label);assert.equal(typeof out.error.code,'string',label);assert.notEqual(out.error.code,'not_implemented',label);};
  try {
    for(const [label,q] of [['null',null],['undefined',undefined],['text','x'],['array',[]],['empty',{}],['empty subject',{...Q,subject:''}],['numeric variable',{...Q,variable:7}],['accessor',trap],['huge',{...Q,subject:'x'.repeat(100000)}]])
      failed(await seriesBySourceTime(store,q),label);
    for(const notStore of [null,{},{list:()=>{throw new Error('x');}},'store']) failed(await seriesBySourceTime(notStore,Q),'store');
    const wide=await seriesBySourceTime(store,Q);
    failed(wide,'span');assert.equal(wide.error.code,'range_too_large');
  } finally {await store.close();}
});
