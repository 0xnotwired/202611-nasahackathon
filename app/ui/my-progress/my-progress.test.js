import test from 'node:test';
import assert from 'node:assert/strict';
import {model} from './model.js';
import {viewKit,valueWithContext} from '../base/index.js';
import {makeServices,makeRecord,DAY,NOW,FORBIDDEN_WORDS,SCORE_KEYS} from '../../../tests/walkthrough/fixtures.js';

const section=(vm,id)=>vm.sections.find(s=>s.id===id);
const earlierPulse=[makeRecord({id:'p10',value:66,time:`${DAY(10)}T12:00:00.000Z`}),makeRecord({id:'p11',value:68,time:`${DAY(11)}T12:00:00.000Z`}),makeRecord({id:'p12',value:69,time:`${DAY(12)}T12:00:00.000Z`})];

test('M11-P1: every timeline entry equals valueWithContext of its record',async()=>{
  const services=await makeServices({records:earlierPulse});
  const vm=await model(services,{});
  const stored=new Map((await services.store.list('records',{})).value.map(r=>[r.id,r]));
  const entries=section(vm,'timeline').entries;assert.ok(entries.length>=15);
  for(const e of entries){const r=stored.get(e.id);assert.equal(e.text,valueWithContext(r,{clock:services.clock}).text,e.id);assert.equal(e.value,typeof r.value==='number'?r.value:null);assert.equal(e.unit,r.unit??null);assert.equal(e.origin,r.origin);}
});

test('M11-P2/X3: a baseline comparison states how many earlier measurements support it; with none it shows no comparison and says why',async()=>{
  const vm=await model(await makeServices({records:earlierPulse}),{});
  const pulse=section(vm,'baseline').entries.find(c=>c.variable==='pulse');
  assert.equal(pulse.comparison.n,4);assert.match(pulse.comparison.text,/4 earlier measurements/);assert.match(pulse.comparison.text,/2026-11-10 to 2026-11-13/);assert.match(pulse.comparison.text,/ranged from 66 to 70 bpm/);
  assert.doesNotMatch(pulse.comparison.text,/within|normal|expected|improv|worse|higher|lower/i);assert.equal(pulse.latest.value,76);
  const glucose=section(vm,'baseline').entries.find(c=>c.variable==='glucose');
  assert.equal(glucose.comparison,null);assert.match(glucose.reason,/No earlier comparable measurement exists/);
  const one=section(await model(await makeServices(),{}),'baseline').entries.find(c=>c.variable==='pulse');assert.match(one.comparison.text,/1 earlier measurement\b/);
});

test('M11-P3: a correction appears next to its original, which stays on the timeline (R7)',async()=>{
  const fix=makeRecord({id:'corr-1',value:72,corrects:'synthetic-1-record-001',time:`${DAY(13)}T13:00:00.000Z`});
  const entries=section(await model(await makeServices({records:[fix]}),{}),'timeline').entries;
  const original=entries.find(e=>e.id==='synthetic-1-record-001'),correction=entries.find(e=>e.id==='corr-1');
  assert.ok(original&&correction);assert.equal(original.value_text,'70 bpm');assert.equal(original.superseded,true);assert.equal(original.corrected_by,'corr-1');assert.match(original.correction_text,/corrected by corr-1/);
  assert.equal(correction.corrects,'synthetic-1-record-001');assert.match(correction.correction_text,/corrects synthetic-1-record-001/);
  assert.equal(entries.find(e=>e.id==='synthetic-1-record-003').superseded??false,false);
});

test('M11-P4: the mission phase is context, with no reassurance',async()=>{
  const vm=await model(await makeServices(),{});
  const entries=section(vm,'timeline').entries;
  assert.equal(entries.find(e=>e.id==='synthetic-1-record-009').phase_text,'Mission phase: preflight');assert.equal(entries.find(e=>e.id==='synthetic-1-record-003').phase_text,'Mission phase: mission');
  for(const e of entries) assert.doesNotMatch(e.phase_text,/normal|expected|nothing to worry|fine|good/i);
  for(const t of viewKit.textsOf(vm)) assert.doesNotMatch(t,/normal in this phase|nothing to worry|as expected/i);
});

test('M11-X1: only this subject, and no environment records',async()=>{
  const vm=await model(await makeServices({records:[makeRecord({id:'os1',subject:'someone-else'})]}),{});
  const ids=section(vm,'timeline').entries.map(e=>e.id);
  assert.equal(ids.includes('os1'),false);assert.equal(ids.includes('synthetic-1-record-014'),false);assert.ok(ids.includes('synthetic-1-record-003'));
  const times=section(vm,'timeline').entries.map(e=>Date.parse(e.time));for(let i=1;i<times.length;i++) assert.ok(times[i-1]>=times[i],'newest first');
});

test('M11-X2: the chart draws a day without data as a gap, with a table that says so',async()=>{
  const vm=await model(await makeServices(),{});
  assert.equal(vm.chart_variable,'pulse');
  const chart=section(vm,'chart').charts[0];
  const rows=Object.fromEntries(chart.table.rows.map(r=>[r.day,r.value]));
  assert.equal(rows['2026-11-13'],'70 bpm');assert.match(rows['2026-11-14'],/not recorded/);assert.equal(rows['2026-11-15'],'76 bpm');
  assert.equal(chart.segments.length,2,'the line does not cross the day without data' && chart.segments.length);
  const other=await vm.interactions.chooseVariable('glucose');assert.equal(other.chart_variable,'glucose');
  assert.equal((await model(await makeServices(),{variable:'banana'})).chart_variable,'pulse');
});

test('M11-X4: hostile services, no score keys, no reassuring words',async()=>{
  const base=await makeServices();
  for(const broken of [{store:undefined},{readings:{}},{catalogs:{}},{subject:''},{clock:'x'}]) assert.equal((await model({...base,...broken},{})).state,'error');
  for(const input of [undefined,null,'x',7]) assert.equal((await model(input,{})).state,'error');
  const vm=await model(base,{});
  for(const key of viewKit.keysOf(vm)) assert.equal(SCORE_KEYS.includes(key),false,key);
  for(const text of viewKit.textsOf(vm)) assert.doesNotMatch(text,FORBIDDEN_WORDS,text);
  assert.ok(NOW);
});
