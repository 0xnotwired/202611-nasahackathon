import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {series,latest,baseline,environment,cumulative,attention,seriesBySourceTime} from './index.js';
import {openStore} from '../store/index.js';

// Expected values are written by hand from the work order, never computed by the code under test.
const day=n=>`2026-03-${String(n).padStart(2,'0')}`;
const at=(n,hour=12)=>`${day(n)}T${String(hour).padStart(2,'0')}:00:00.000Z`;
const base={schema_version:2,type:'measurement',state:'recorded',variable:'pulse',unit:'bpm',method:'device-a',
  origin:'synthetic',source:'user_entered',mission_phase:'mission',subject:'subject-a'};
let counter=0;
const rec=(fields)=>({...base,id:`r${++counter}`,time:at(1),...fields});
const gone=(fields)=>{const r=rec(fields);delete r.value;delete r.unit;return {...r,state:fields.state??'not_recorded'};};
async function storeWith(records) {
  const opened=await openStore({kind:'memory',name:'readings-test'});
  assert.equal(opened.ok,true);
  const saved=await opened.value.saveBatch('records',records);
  assert.equal(saved.ok,true,JSON.stringify(saved));
  return opened.value;
}
const Q={subject:'subject-a',variable:'pulse',from:`${day(1)}T00:00:00.000Z`,to:`${day(6)}T00:00:00.000Z`};
const NOW={clock:()=>at(10)};

test('M06-P1: gaps are days without a value, never points at zero (R2)',async()=>{
  const store=await storeWith([rec({id:'d1',time:at(1),value:60}),rec({id:'d2',time:at(2),value:61}),
    gone({id:'d4',time:at(4),state:'not_recorded'}),rec({id:'d5',time:at(5),value:64})]);
  try {
    const out=await series(store,Q);
    assert.deepEqual(out.points.map(p=>[p.day,p.value]),[[day(1),60],[day(2),61],[day(5),64]]);
    assert.deepEqual(out.gaps.map(g=>[g.day,g.reason]),[[day(3),'no_record'],[day(4),'not_recorded']]);
    assert.equal(out.n,3);
    assert.ok(out.points.every(p=>p.value!==0));
    assert.deepEqual(out.non_comparable_groups,[]);
  } finally {await store.close();}
});

test('M06-P1b: confirmed nothing new and a value-less record are named, not merged into "no record"',async()=>{
  const store=await storeWith([{...gone({id:'n1',time:at(2),state:'confirmed_none'}),type:'observation'},
    {...rec({id:'n2',time:at(3)}),type:'observation',variable:'pulse'}]);
  try {
    const out=await series(store,Q);
    assert.deepEqual(out.points,[]);
    assert.deepEqual(out.gaps.map(g=>[g.day,g.reason]),[[day(1),'no_record'],[day(2),'confirmed_none'],[day(3),'no_value'],[day(4),'no_record'],[day(5),'no_record']]);
  } finally {await store.close();}
});

test('M06-P2: another method is never in points; the group names method (R3)',async()=>{
  const store=await storeWith([rec({id:'a1',time:at(1),value:60}),rec({id:'a2',time:at(2),value:61}),
    rec({id:'b1',time:at(3),value:99,method:'device-b'})]);
  try {
    const out=await series(store,Q);
    assert.deepEqual(out.points.map(p=>p.id),['a1','a2']);
    assert.equal(out.non_comparable_groups.length,1);
    assert.match(out.non_comparable_groups[0].reason,/method/i);
    assert.deepEqual(out.non_comparable_groups[0].points.map(p=>p.id),['b1']);
    assert.equal(out.n,2);
    assert.equal(out.gaps.find(g=>g.day===day(3)).reason,'other_group');
  } finally {await store.close();}
});

test('M06-P2b: the larger group wins regardless of save order; a tie is decided by recency then stable key',async()=>{
  const store=await storeWith([rec({id:'b1',time:at(1),value:90,method:'device-b'}),rec({id:'b2',time:at(2),value:91,method:'device-b'}),
    rec({id:'a1',time:at(3),value:60})]);
  try {
    const out=await series(store,Q);
    assert.deepEqual(out.points.map(p=>p.id),['b1','b2']);
    assert.deepEqual(out.non_comparable_groups[0].points.map(p=>p.id),['a1']);
  } finally {await store.close();}
  const tie=await storeWith([rec({id:'t1',time:at(1),value:60}),rec({id:'t2',time:at(4),value:70,method:'device-b'})]);
  try {
    const out=await series(tie,Q);
    assert.deepEqual(out.points.map(p=>p.id),['t2'],'equal size: the group with the more recent point is primary');
  } finally {await tie.close();}
});

test('M06-P2c: a different unit is also not comparable and the reason names unit',async()=>{
  const store=await storeWith([rec({id:'u1',time:at(1),value:60}),rec({id:'u2',time:at(2),value:61}),rec({id:'u3',time:at(3),value:5,unit:'mmol/L'})]);
  try {
    const out=await series(store,Q);
    assert.deepEqual(out.points.map(p=>p.id),['u1','u2']);
    assert.match(out.non_comparable_groups[0].reason,/unit/i);
  } finally {await store.close();}
});

test('M06-P3: latest with no data is null with a null age; with data the age is whole days',async()=>{
  const store=await storeWith([]);
  try {assert.deepEqual(await latest(store,{subject:'subject-a',variable:'pulse'},NOW),{record:null,age_days:null});}
  finally {await store.close();}
  const filled=await storeWith([rec({id:'l1',time:at(7),value:60}),rec({id:'l2',time:at(8),value:61})]);
  try {
    const out=await latest(filled,{subject:'subject-a',variable:'pulse'},NOW);
    assert.equal(out.record.id,'l2');
    assert.equal(out.age_days,2);
  } finally {await filled.close();}
});

test('M06-X9: latest returns the newest record of any state and rejects a record from the future',async()=>{
  const store=await storeWith([rec({id:'old',time:at(7),value:60}),gone({id:'new',time:at(9),state:'not_recorded'})]);
  try {
    const out=await latest(store,{subject:'subject-a',variable:'pulse'},NOW);
    assert.equal(out.record.id,'new');
    assert.equal(out.record.state,'not_recorded');
    assert.equal(out.age_days,1);
    const early=await latest(store,{subject:'subject-a',variable:'pulse'},{clock:()=>at(8)});
    assert.equal(early.ok,false);
    assert.equal(early.error.code,'record_in_future');
  } finally {await store.close();}
});

test('M06-P4: cumulative sums only values, counts gaps, and has no total without data (R2)',async()=>{
  const store=await storeWith([rec({id:'c1',time:at(1),value:2,variable:'dose'}),rec({id:'c2',time:at(2),value:3,variable:'dose'}),
    gone({id:'c3',time:at(3),state:'not_recorded',variable:'dose'})]);
  try {
    const out=await cumulative(store,{subject:'subject-a',variable:'dose',from:`${day(1)}T00:00:00.000Z`,to:`${day(4)}T00:00:00.000Z`});
    assert.equal(out.total,5);assert.equal(out.n,2);assert.equal(out.gaps,1);assert.equal(out.unit,'bpm');
    const none=await cumulative(store,{subject:'subject-a',variable:'absent',from:`${day(1)}T00:00:00.000Z`,to:`${day(4)}T00:00:00.000Z`});
    assert.equal(none.total,null);assert.equal(none.n,0);assert.equal(none.unit,null);assert.equal(none.gaps,3);
    const onlyGaps=await cumulative(store,{subject:'subject-a',variable:'dose',from:`${day(3)}T00:00:00.000Z`,to:`${day(4)}T00:00:00.000Z`});
    assert.equal(onlyGaps.total,null,'a not_recorded day alone is not a total of zero');
  } finally {await store.close();}
});

test('M06-X5: cumulative refuses a partial total when records are not comparable',async()=>{
  const store=await storeWith([rec({id:'m1',time:at(1),value:2}),rec({id:'m2',time:at(2),value:3,method:'device-b'})]);
  try {
    const out=await cumulative(store,Q);
    assert.equal(out.ok,false);assert.equal(out.error.code,'not_comparable');
    assert.equal(Object.hasOwn(out,'total'),false);
  } finally {await store.close();}
});

const env=(fields)=>({...rec(fields),type:'environment',variable:'co2',unit:'ppm',method:'environment_sensor',value:600,
  place:'A',sensor:'s1',interval:{from:at(2,11),to:at(2,12)},time:at(2,12),...fields});
test('M06-P5: environment returns only the asked place and names its sensors',async()=>{
  const store=await storeWith([env({id:'ea1',value:600}),env({id:'ea2',value:610,sensor:'s2'}),env({id:'eb1',value:900,place:'B',sensor:'s9'})]);
  try {
    const out=await environment(store,{place:'A',interval:{from:at(2,0),to:at(3,0)}});
    assert.deepEqual(out.records.map(r=>r.id).sort(),['ea1','ea2']);
    assert.deepEqual(out.coverage.sensors,['s1','s2']);
    assert.equal(out.coverage.from,at(2,11));assert.equal(out.coverage.to,at(2,12));
    assert.ok(out.records.every(r=>r.origin==='synthetic'),'origin travels with the record (R4)');
  } finally {await store.close();}
});

test('M06-X6: environment coverage reports holes as separate segments and ignores records outside the interval',async()=>{
  const store=await storeWith([env({id:'e1',interval:{from:at(2,11),to:at(2,12)}}),env({id:'e2',interval:{from:at(2,14),to:at(2,15)},time:at(2,15)}),
    env({id:'e3',interval:{from:at(5,11),to:at(5,12)},time:at(5,12)})]);
  try {
    const out=await environment(store,{place:'A',interval:{from:at(2,0),to:at(3,0)}});
    assert.deepEqual(out.records.map(r=>r.id).sort(),['e1','e2']);
    assert.deepEqual(out.coverage.segments,[{from:at(2,11),to:at(2,12)},{from:at(2,14),to:at(2,15)}]);
    const none=await environment(store,{place:'A',interval:{from:at(8,0),to:at(9,0)}});
    assert.deepEqual(none,{records:[],coverage:{from:null,to:null,sensors:[],segments:[]}});
  } finally {await store.close();}
});

test('M06-P6: another subject never appears in points or groups (R9)',async()=>{
  const store=await storeWith([rec({id:'mine',time:at(1),value:60}),rec({id:'theirs',time:at(2),value:70,subject:'subject-b'}),
    rec({id:'theirs2',time:at(3),value:80,subject:'subject-b',method:'device-b'})]);
  try {
    const out=await series(store,Q);
    const ids=[...out.points,...out.non_comparable_groups.flatMap(g=>g.points)].map(p=>p.id);
    assert.deepEqual(ids,['mine']);
    const last=await latest(store,{subject:'subject-a',variable:'pulse'},NOW);
    assert.equal(last.record.id,'mine');
    const bl=await baseline(store,{subject:'subject-a',variable:'pulse',to:Q.to});
    assert.equal(bl.n,1);assert.equal(bl.excluded_non_comparable,0,'another subject\'s method is not "excluded", it is simply not this subject\'s');
    const total=await cumulative(store,Q);
    assert.equal(total.total,60);assert.equal(total.n,1);
  } finally {await store.close();}
});

test('M06-X1: a correction supersedes the corrected record (R7) and a not_recorded correction leaves a gap (R1)',async()=>{
  const store=await storeWith([rec({id:'o1',time:at(1),value:60}),rec({id:'o2',time:at(2),value:61}),
    rec({id:'c1',time:at(1),value:65,corrects:'o1'}),{...gone({id:'c2',time:at(2),state:'not_recorded'}),corrects:'o2'}]);
  try {
    const out=await series(store,Q);
    assert.deepEqual(out.points.map(p=>[p.id,p.value]),[['c1',65]]);
    assert.equal(out.gaps.find(g=>g.day===day(2)).reason,'not_recorded');
  } finally {await store.close();}
  const cross=await storeWith([rec({id:'x1',time:at(2),value:60}),rec({id:'x2',time:at(4),value:62,corrects:'x1'})]);
  try {
    const out=await series(cross,Q);
    assert.deepEqual(out.points.map(p=>p.id),['x2']);
    assert.equal(out.gaps.find(g=>g.day===day(2)).reason,'superseded');
  } finally {await cross.close();}
});

test('M06-X2: unknown-unit values are never points and form one non-comparable group',async()=>{
  const unknown=(id,n,v)=>({...rec({id,time:at(n),value:v}),unit:null,unit_status:'unknown'});
  const store=await storeWith([rec({id:'k1',time:at(1),value:60}),unknown('q1',2,7),unknown('q2',3,8)]);
  try {
    const out=await series(store,Q);
    assert.deepEqual(out.points.map(p=>p.id),['k1']);
    assert.equal(out.non_comparable_groups.length,1);
    assert.match(out.non_comparable_groups[0].reason,/unit/i);
    assert.deepEqual(out.non_comparable_groups[0].points.map(p=>p.id),['q1','q2']);
  } finally {await store.close();}
});

const sourceTime=(id)=>({...rec({id,value:5}),time:null,unit:null,unit_status:'unknown',
  source_time:{value:'2026-03-02',raw:'03/02/2026',precision:'date',timezone:null,calendar:'original',scope:'demo-source'}});
test('M06-X3: source-time-only records make time-based queries say so instead of inventing UTC',async()=>{
  const store=await storeWith([rec({id:'u1',time:at(1),value:60}),sourceTime('st1')]);
  try {
    for(const result of [await series(store,Q),await latest(store,{subject:'subject-a',variable:'pulse'},NOW),
      await baseline(store,{subject:'subject-a',variable:'pulse',to:Q.to}),await cumulative(store,Q)]) {
      assert.equal(result.ok,false);assert.equal(result.error.code,'unresolved_time');
      assert.equal(Object.hasOwn(result,'age_days'),false);assert.equal(Object.hasOwn(result,'points'),false);
    }
    const other=await series(store,{...Q,subject:'subject-z'});
    assert.equal(other.n,0,'another subject\'s unresolved record does not block this subject');
  } finally {await store.close();}
});

test('M06-X10: baseline counts recorded comparable values only and ranks nothing',async()=>{
  const store=await storeWith([rec({id:'p1',time:at(1),value:60}),rec({id:'p2',time:at(3),value:62}),gone({id:'p3',time:at(2),state:'not_recorded'}),
    rec({id:'p4',time:at(4),value:200,method:'device-b'}),rec({id:'p5',time:at(7),value:61})]);
  try {
    const out=await baseline(store,{subject:'subject-a',variable:'pulse',to:`${day(6)}T00:00:00.000Z`});
    assert.deepEqual(out,{n:2,from:at(1),to:at(3),excluded_non_comparable:1});
    const none=await baseline(store,{subject:'subject-a',variable:'absent',to:Q.to});
    assert.deepEqual(none,{n:0,from:null,to:null,excluded_non_comparable:0});
  } finally {await store.close();}
});

test('M06-X4: hostile or malformed input gives an implemented error Result and never throws',async()=>{
  const store=await storeWith([]);
  const trap={};Object.defineProperty(trap,'subject',{enumerable:true,get(){throw new Error('accessor ran');}});
  const fine={subject:'subject-a',variable:'pulse'};
  const failed=(out,label)=>{
    assert.equal(out?.ok,false,label);
    assert.equal(typeof out.error.code,'string',label);assert.notEqual(out.error.code,'not_implemented',label);
    assert.equal(typeof out.error.message,'string',label);
  };
  try {
    // Invalid for every query function.
    const everywhere=[['null',null],['undefined',undefined],['text','x'],['number',7],['array',[]],['empty',{}],
      ['empty subject',{...Q,subject:''}],['numeric variable',{...Q,variable:7}],['accessor',trap],['huge subject',{...Q,subject:'x'.repeat(100000)}]];
    for(const [label,q] of everywhere) {
      for(const [name,call] of [['series',()=>series(store,q)],['cumulative',()=>cumulative(store,q)],['baseline',()=>baseline(store,q)],
        ['latest',()=>latest(store,q,NOW)],['environment',()=>environment(store,q)]]) failed(await call(),`${name} ${label}`);
    }
    // Invalid only for the range functions.
    for(const [label,q] of [['reversed',{...Q,from:Q.to,to:Q.from}],['not a date',{...Q,from:'yesterday'}],['missing to',{subject:'subject-a',variable:'pulse',from:Q.from}],
      ['over the technical bound',{...Q,from:'2000-01-01T00:00:00.000Z',to:'2026-01-01T00:00:00.000Z'}]]) {
      failed(await series(store,q),`series ${label}`);failed(await cumulative(store,q),`cumulative ${label}`);
    }
    failed(await baseline(store,{subject:'subject-a',variable:'pulse',to:'yesterday'}),'baseline bad to');
    failed(await baseline(store,{subject:'subject-a',variable:'pulse'}),'baseline missing to');
    for(const [label,q] of [['no place',{interval:{from:at(2),to:at(3)}}],['empty place',{place:'',interval:{from:at(2),to:at(3)}}],
      ['no interval',{place:'A'}],['reversed',{place:'A',interval:{from:at(3),to:at(2)}}],['extra key',{place:'A',interval:{from:at(2),to:at(3),x:1}}]])
      failed(await environment(store,q),`environment ${label}`);
    for(const notStore of [null,{},{list:()=>{throw new Error('x');}},'store']) failed(await series(notStore,Q),'series notStore');
    for(const clock of [undefined,null,{},{clock:()=>'not a date'},{clock:()=>{throw new Error('x');}}]) failed(await latest(store,fine,clock),'latest clock');
  } finally {await store.close();}
});

const criterion={id:'demo-pulse',variable:'pulse',unit:'bpm',low:50,high:70,defined_by:'team demo',source:'team_defined',review_status:'demo'};
const config={id:'c',schema_version:2,name:'Team demo',available_equipment:[],communication:'real_time',phases:[],environment:'station',attention_criteria:[criterion]};
const withCriteria=(...c)=>({...config,attention_criteria:c});
const meas=(fields)=>({...rec(fields),time:at(1)});

test('M06-P7: no criterion, not recorded, other unit and above high',()=>{
  assert.equal(attention(meas({value:60}),withCriteria()).status,'no_criterion');
  assert.equal(attention(meas({value:60}),{...config,attention_criteria:undefined}).status,'no_criterion');
  assert.equal(attention(gone({state:'not_recorded'}),config).status,'not_assessed');
  const unit=attention(meas({value:5,unit:'mmol/L'}),config);
  assert.equal(unit.status,'not_assessed');assert.match(unit.reason,/unit/i);assert.match(unit.reason,/mmol\/L/);
  const outside=attention(meas({value:71}),config);
  assert.equal(outside.status,'outside');assert.equal(outside.criterion.id,'demo-pulse');
  assert.equal(attention(meas({value:49}),config).status,'outside');
});

test('M06-P8: inside the demo criterion is within and the result carries the criterion',()=>{
  const out=attention(meas({value:60}),config);
  assert.equal(out.status,'within');
  assert.equal(out.criterion.review_status,'demo');assert.equal(out.criterion.defined_by,'team demo');assert.equal(out.criterion.source,'team_defined');
  const copy=out.criterion;copy.low=0;
  assert.equal(config.attention_criteria[0].low,50,'the result does not alias the configuration');
});

test('M06-X7: inclusive boundaries, incomplete criteria, ambiguous criteria and invalid input never read as within',()=>{
  assert.equal(attention(meas({value:50}),config).status,'within');
  assert.equal(attention(meas({value:70}),config).status,'within');
  assert.equal(attention(meas({value:60}),withCriteria({...criterion,low:undefined,high:65})).status,'within');
  for(const bad of [{...criterion,defined_by:''},{...criterion,source:undefined},{...criterion,review_status:'draft'},{...criterion,low:undefined,high:undefined},
    {...criterion,low:80,high:70},{...criterion,low:'50'},{...criterion,high:Infinity}]) {
    const out=attention(meas({value:60}),withCriteria(bad));
    assert.equal(out.status,'not_assessed',JSON.stringify(bad));assert.equal(typeof out.reason,'string');
  }
  assert.equal(attention(meas({value:60}),withCriteria(criterion,{...criterion,id:'second',low:0,high:999})).status,'not_assessed');
  assert.equal(attention(meas({value:60}),withCriteria(criterion,{...criterion,id:'other-unit',unit:'mmol/L'})).status,'within');
  for(const record of [null,undefined,'x',{},{...meas({value:60}),state:'unknown'},{...meas({value:60}),value:undefined},{...meas({value:60}),value:NaN}])
    assert.equal(attention(record,config).status,'not_assessed');
  for(const cfg of [null,undefined,'x',[],{attention_criteria:'x'},{attention_criteria:[null]}])
    assert.notEqual(attention(meas({value:60}),cfg).status,'within');
  assert.equal(attention({...meas({value:60}),unit:null,unit_status:'unknown'},config).status,'not_assessed');
});

test('M06-X8: within happens only with a well-formed criterion, the record\'s own unit and a recorded value inside it',()=>{
  const records=[meas({value:60}),meas({value:90}),meas({value:60,unit:'other'}),gone({state:'not_recorded'}),gone({state:'confirmed_none'}),
    {...meas({value:60}),unit:null,unit_status:'unknown'},{...meas({value:60}),variable:'glucose'}];
  const configs=[withCriteria(),config,withCriteria({...criterion,unit:'other'}),withCriteria({...criterion,defined_by:''}),null];
  let withinCount=0;
  for(const record of records) for(const cfg of configs) {
    const out=attention(record,cfg);
    if(out.status!=='within') continue;
    withinCount++;
    assert.equal(record.state,'recorded');assert.equal(record.variable,out.criterion.variable);assert.equal(record.unit,out.criterion.unit);
    assert.ok(record.value>=out.criterion.low&&record.value<=out.criterion.high);
  }
  // (60 bpm, bpm criterion) and (60 other, the criterion in unit other): the only two well-formed same-unit in-range pairings.
  assert.equal(withinCount,2);
});

test('M06-R1/R2/R5: latest ignores superseded records, age floors, utc_records ignores superseded',async()=>{
  const store=await storeWith([rec({id:'old',time:at(9),value:60}),rec({id:'fix',time:at(8),value:61,corrects:'old'})]);
  try {
    const out=await latest(store,{subject:'subject-a',variable:'pulse'},NOW);
    assert.equal(out.record.id,'fix','the superseded record is newer by time but is not the latest');
    const young=await latest(store,{subject:'subject-a',variable:'pulse'},{clock:()=>`${day(8)}T11:59:59.000Z`});
    assert.equal(young.ok,false,'the active record at 12:00 is after this clock');
    const floored=await latest(store,{subject:'subject-a',variable:'pulse'},{clock:()=>`${day(10)}T11:59:59.000Z`});
    assert.equal(floored.age_days,1,'1.9999 days is 1');
  } finally {await store.close();}
  const utc={...rec({id:'u1',value:5}),time:`${day(2)}T12:00:00.000Z`};delete utc.source_time;
  const fixUtc={...rec({id:'u2',value:6,corrects:'u1'}),time:`${day(2)}T13:00:00.000Z`};delete fixUtc.source_time;
  const sourced=rec({id:'s1',value:7,source_time:{value:day(1),raw:day(1),precision:'date',timezone:null,calendar:'original',scope:'x'},time:null});
  const st2=await storeWith([utc,fixUtc,sourced]);
  try {assert.equal((await seriesBySourceTime(st2,{subject:'subject-a',variable:'pulse'})).utc_records,1);} finally {await st2.close();}
});

test('M06-R3: windows are [from, to): a record at from is in, at to is out, for series and baseline',async()=>{
  const store=await storeWith([rec({id:'atFrom',time:`${day(1)}T00:00:00.000Z`,value:60}),rec({id:'atTo',time:`${day(6)}T00:00:00.000Z`,value:61})]);
  try {
    const out=await series(store,Q);assert.deepEqual(out.points.map(p=>p.id),['atFrom']);
    const bl=await baseline(store,{subject:'subject-a',variable:'pulse',to:`${day(6)}T00:00:00.000Z`});assert.equal(bl.n,1);
  } finally {await store.close();}
});

test('M06-R4: source-clock order uses seconds',async()=>{
  const clk=value=>({value,raw:value,precision:'second',timezone:null,calendar:'shifted',scope:'x'});
  const mk=(id,t,v)=>({...rec({id,value:v}),time:null,source_time:clk(`2100-01-01T10:00:${t}`)});
  const store=await storeWith([mk('a-late','30',2),mk('b-early','05',1)]); // ids sort the opposite way, so only the seconds can give this order
  try {const out=await seriesBySourceTime(store,{subject:'subject-a',variable:'pulse'});assert.deepEqual(out.points.map(p=>p.id),['b-early','a-late']);} finally {await store.close();}
});

test('M06-R6: a criterion without a text unit is refused even against a unit-unknown record',()=>{
  const unknownRec={...meas({value:60}),unit:null,unit_status:'unknown'};
  for(const unit of [null,undefined,'',7]) {
    const out=attention(unknownRec,withCriteria({...criterion,unit}));assert.equal(out.status,'not_assessed',String(unit));
    const known=attention(meas({value:60}),withCriteria({...criterion,unit}));assert.equal(known.status,'not_assessed',String(unit));
  }
});

test('M06-R7/R8: environment filters by subject and variable and never claims cover across variables; bounds must be UTC',async()=>{
  const store=await storeWith([env({id:'c1',interval:{from:at(2,11),to:at(2,12)}}),env({id:'t1',variable:'ambient_temperature',unit:'degC',interval:{from:at(2,12),to:at(2,13)},time:at(2,13)}),
    env({id:'other',subject:'subject-z',interval:{from:at(2,11),to:at(2,12)}}),env({id:'before',interval:{from:at(2,9),to:at(2,10)},time:at(2,10),value:1})]);
  try {
    const interval={from:at(2,10),to:at(3,0)};
    const all=await environment(store,{place:'A',interval});
    assert.deepEqual(all.coverage.segments,[]);assert.match(all.coverage.segments_note,/several variables/i);assert.deepEqual(all.coverage.sensors,['s1']);
    assert.equal(all.records.some(r=>r.id==='before'),false,'a record ending exactly at the interval start is not inside it');
    const one=await environment(store,{place:'A',interval,variable:'co2'});
    assert.deepEqual(one.coverage.segments,[{from:at(2,11),to:at(2,12)}]);assert.ok(one.records.every(r=>r.variable==='co2'));
    const mine=await environment(store,{place:'A',interval,variable:'co2',subject:'subject-a'});
    assert.deepEqual(mine.records.map(r=>r.id),['c1']);
    for(const bad of [{place:'A',interval:{from:'2026-03-02',to:'2026-03-03'}},{place:'A',interval:{from:'2026-03-02T00:00:00',to:'2026-03-03T00:00:00'}},{place:'A',interval:{from:'2026-03-02T00:00:00+14:00',to:'2026-03-03T00:00:00Z'}}]) {
      const out=await environment(store,bad);assert.equal(out.ok,false,JSON.stringify(bad));assert.equal(out.error.code,'invalid_query');
    }
    for(const bad of [{...Q,from:'2026-03-01'},{...Q,to:'2026-03-06T00:00:00'},{...Q,from:'2026-03-01T00:00:00+02:00'}]) {const out=await series(store,bad);assert.equal(out.ok,false);assert.equal(out.error.code,'invalid_query');}
    assert.equal((await baseline(store,{subject:'subject-a',variable:'pulse',to:'2026-03-06'})).ok,false);
  } finally {await store.close();}
});

test('M06-X11: the module source holds no numeric literal beyond the reviewed structural list (R6 tripwire)',async()=>{
  const allowed=new Set(['0','1','2','24','60','1000','3650','512']);
  const files=['index.js','analysis.js','attention.js','source-time.js'];
  const found=[];
  for(const name of files) {
    const source=await readFile(new URL(`./${name}`,import.meta.url),'utf8');
    const code=source.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'').replace(/(['"`])(?:\\.|(?!\1).)*\1/g,'""');
    for(const match of code.matchAll(/(?<![\w.$])\d+(?:\.\d+)?(?![\w.])/g)) if(!allowed.has(match[0])) found.push(`${name}:${match[0]}`);
  }
  assert.deepEqual(found,[]);
});
