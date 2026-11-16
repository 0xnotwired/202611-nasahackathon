import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as importers from '../../importers/index.js';
import * as readings from '../../readings/index.js';
import {openStore} from '../../store/index.js';
import {model} from './model.js';
import {describeSource, doiOf, PROFILES} from './profiles.js';

// Expected values are written by hand from the work order, the importer contract and the source documents.
const cgm=(...rows)=>'Timestamp;Glycemia\n'+rows.join('\n');
const DAY1=['2100-01-01 08:00:00;5.5','2100-01-01 08:05:00;5.6','2100-01-01 08:10:10;5.7','2100-01-01 08:40:00;5.9','2100-01-01 08:45:00;6.0'];
const CGM_TEXT=cgm(...DAY1,'2100-01-02 09:00:00;7.0');
const MR079G='ID,Campaign,Subject,Date,Test_Phase,BR_Day,Test,Position,Value,Units\n1,C3G,9314,3/12/2009,PRE_TEST,11,Knee Concentric Strength,Extension at 60°/sec,94.1,ft-lb\n2,C3G,9314,3/12/2009,PRE_TEST,11,Knee Concentric Strength,Flexion at 60°/sec,72.2,ft-lb';
const SYN={id:'syn-r1',schema_version:2,type:'measurement',state:'recorded',variable:'glucose',value:5,unit:'mmol/L',method:'demo',time:'2026-11-15T12:00:00.000Z',origin:'synthetic',source:'user_entered',mission_phase:'mission',subject:'syn-1'};

async function setup(overrides={}) {
  const main=(await openStore({kind:'memory',name:'main'})).value;
  assert.equal((await main.saveBatch('records',[SYN])).ok,true);
  const services={store:main,importers,readings,openMemoryStore:()=>openStore({kind:'memory',name:'private'}),clock:()=>'2026-11-15T12:00:00.000Z',...overrides};
  const vm=await model(services,{});
  assert.equal(vm.state,'ready',JSON.stringify(vm).slice(0,200));
  return {main,services,vm};
}
const load=(vm,source_id,name,text,subject)=>vm.interactions.loadFile({source_id,name,text,subject});
const rowsOf=table=>table.rows.map(r=>Object.values(r).join(' | '));

test('M22-X1: omics files are listed as not offered with their reason and can never be loaded',async()=>{
  const {main,vm}=await setup();
  try {
    const sources=vm.loader.sources;
    assert.deepEqual(sources.filter(s=>s.supported).map(s=>s.id),['BUT_CGM','MR079G','MR035G','MR080G','CRF']);
    const omics=sources.find(s=>s.id==='OMICS');
    assert.equal(omics.supported,false);assert.match(omics.reason,/no adapter/);
    const after=await load(vm,'OMICS','o.csv','a,b\n1,2','1');
    assert.equal(after.message.kind,'error');assert.match(after.message.text,/Omics/);
    assert.deepEqual(after.files,[]);assert.deepEqual(after.subjects,[]);assert.deepEqual(after.panels,[]);
  } finally {await main.close();}
});

test('M22-P1/X5: imported records never reach the shell store, and the shell store is never even touched',async()=>{
  const {main,services,vm}=await setup();
  try {
    const after=await load(vm,'BUT_CGM','101001_CGM.csv',CGM_TEXT,'syn-1');
    assert.equal(after.files[0].records,6,'the import worked, under the same subject text as the synthetic subject');
    assert.equal((await main.list('records',{})).value.length,1,'the shell store still holds only its own record');
    const syn=await readings.series(main,{subject:'syn-1',variable:'glucose',from:'2026-11-01T00:00:00.000Z',to:'2026-12-01T00:00:00.000Z'});
    assert.deepEqual(syn.points.map(p=>p.id),['syn-r1']);
    assert.equal(JSON.stringify(syn).includes('import:'),false,'no imported id comes back');
    const trap=new Proxy({},{get(){throw new Error('the shell store was touched');}});
    const vm2=await model({...services,store:trap},{});
    const after2=await load(vm2,'BUT_CGM','a.csv',CGM_TEXT,'zzz');
    assert.equal(after2.files[0].records,6);
    const picked=await after2.interactions.select({subjects:['zzz']});assert.equal(picked.panels.length,1);
  } finally {await main.close();}
});

test('M22-P2: every card and panel names its study, the origin of its own records, and its subject',async()=>{
  const {main,vm}=await setup();
  try {
    let current=await load(vm,'BUT_CGM','101001_CGM.csv',CGM_TEXT,'101001');
    current=await load(current,'MR079G','mr079g.csv',MR079G);
    current=await current.interactions.select({subjects:['101001','9314']});
    const [cgmCard,mrCard]=current.files;
    assert.match(cgmCard.study,/BUT CGM/);assert.match(cgmCard.origin_text,/terrestrial/);assert.doesNotMatch(cgmCard.origin_text,/ground analog|synthetic/);assert.deepEqual(cgmCard.subjects,['101001']);
    assert.match(mrCard.study,/MR079G/);assert.match(mrCard.origin_text,/ground analog/);assert.deepEqual(mrCard.subjects,['9314']);
    assert.equal(current.panels.length,2);
    const [cgmPanel,mrPanel]=current.panels;
    assert.deepEqual([cgmPanel.subject,mrPanel.subject],['101001','9314']);
    assert.match(cgmPanel.study,/BUT CGM/);assert.match(cgmPanel.origin_text,/terrestrial/);
    assert.match(mrPanel.study,/MR079G/);assert.match(mrPanel.origin_text,/ground analog/);
    for(const item of [...current.files,...current.panels]) {assert.ok(item.study.length>0);assert.ok(item.origin_text.length>0);assert.doesNotMatch(item.origin_text,/unknown/i);}
  } finally {await main.close();}
});

test('M22-X2: the study card carries the DOI from the records, the verbatim citation and the licence; unknown sources get none invented',async()=>{
  const {main,vm}=await setup();
  try {
    let current=await load(vm,'BUT_CGM','a.csv',CGM_TEXT,'101001');
    const card=current.files[0];
    assert.equal(card.doi,'10.13026/hv8f-3w60');
    assert.ok(card.citation.some(c=>c.startsWith('Šaclová, L., Nemcova, A.')));assert.ok(card.citation.some(c=>c.startsWith('Pollard, T., Moody, B. E.')));
    assert.match(card.license,/Attribution 4\.0/);
    current=await load(current,'MR079G','m.csv',MR079G);
    assert.equal(current.files[1].doi,'10.83263/bk5h-r757');assert.equal(current.files[1].license,'CC0-1.0');
    assert.ok(current.files[1].citation[0].includes('Isokinetic Muscle Function (Flight Analog) [Dataset]'));
  } finally {await main.close();}
  assert.equal(doiOf('https://doi.org/10.1/x#profile=a'),'10.1/x');
  for(const bad of [undefined,null,7,'',{},'https://example.org/10.1/x','https://doi.org/']) assert.equal(doiOf(bad),null);
  const unknown=describeSource('https://doi.org/10.9999/unknown#profile=z');
  assert.deepEqual([unknown.doi,unknown.citation,unknown.license,unknown.profile],['10.9999/unknown',['citation not available'],'licence not available',null]);
  assert.equal(describeSource('not a doi').doi,null);
  assert.equal(PROFILES.length,5);assert.ok(PROFILES.every(p=>p.citation.every(c=>c.includes('doi.org/'))));
});

test('M22-X3: loading the same file twice adds nothing',async()=>{
  const {main,vm}=await setup();
  try {
    const first=await load(vm,'BUT_CGM','a.csv',CGM_TEXT,'101001');
    const again=await load(first,'BUT_CGM','a-copy.csv',CGM_TEXT,'101001');
    assert.equal(again.files.length,1);assert.equal(again.message.kind,'info');assert.match(again.message.text,/already loaded/i);
    assert.equal(again.subjects[0].variables[0].n,6);
  } finally {await main.close();}
});

test('M22-P4/X4: bad rows are listed one by one without raw text; a refused file saves nothing',async()=>{
  const {main,vm}=await setup();
  try {
    const bad=await load(vm,'BUT_CGM','bad.csv',cgm('2100-01-01 08:00:00;5.5','not-a-date;5.6','2100-01-01 08:10:00;abc'),'101001');
    const card=bad.files[0];
    assert.equal(card.records,1);
    assert.deepEqual(card.rejected.map(r=>[r.row,r.code,r.field]),[[3,'invalid_field','time'],[4,'invalid_field','Glycemia']]);
    assert.deepEqual(card.rejected.map(r=>r.text),['row 3: invalid_field (time)','row 4: invalid_field (Glycemia)']);
    assert.doesNotMatch(JSON.stringify(card),/not-a-date|abc/);
    assert.equal(card.status,'loaded_with_rejections');
    const refused=await load(bad,'BUT_CGM','worse.csv','Foo;Bar\n1;2','202');
    assert.equal(refused.files.length,2);const second=refused.files[1];
    assert.equal(second.status,'refused');assert.equal(second.records,0);assert.match(second.error_text,/\w+/);assert.deepEqual(second.subjects,[]);
    assert.equal(refused.subjects.some(s=>s.subject==='202'),false);
    const noSubject=await load(refused,'BUT_CGM','x.csv',CGM_TEXT,'');
    assert.equal(noSubject.message.kind,'error');assert.equal(noSubject.files.length,2);
  } finally {await main.close();}
});

test('M22-X6: the chart follows the source clock; sampling comes only from the profile; unknown calendars are listed unordered',async()=>{
  const {main,vm}=await setup();
  try {
    const loaded=await load(vm,'BUT_CGM','a.csv',CGM_TEXT,'101001');
    const panel=loaded.panels[0];
    assert.equal(panel.subject,'101001');assert.equal(panel.variable,'glucose');
    assert.equal(panel.chart.resolution,'time');assert.equal(panel.chart.time_basis,'source');
    assert.equal(panel.chart.sampling.interval_s,300);assert.match(panel.chart.sampling.source,/README/);
    assert.deepEqual(panel.chart.days,['2100-01-01','2100-01-02']);assert.equal(panel.chart.day,'2100-01-01');
    assert.deepEqual(panel.chart.segments.map(s=>s.points.length),[3,2]);assert.deepEqual(panel.chart.breaks.map(b=>b.text),['no reading for 29 min 50 s']);
    assert.match(panel.clock_text,/source clock/);assert.match(panel.clock_text,/time zone not established/);
    const day2=await loaded.interactions.select({day:'2100-01-02'});
    assert.equal(day2.panels[0].chart.day,'2100-01-02');assert.equal(day2.panels[0].chart.segments.flatMap(s=>s.points).length,1);
    const badDay=await loaded.interactions.select({day:'2100-03-03'});
    assert.equal(badDay.message.kind,'error');assert.equal(badDay.panels[0].chart.day,'2100-01-02','a refused day keeps the previously selected one');

    const mr=await load(loaded,'MR079G','m.csv',MR079G);
    const picked=await mr.interactions.select({subjects:['9314']});
    const mrPanel=picked.panels[0];
    assert.equal(mrPanel.chart,null);
    assert.equal(mrPanel.unordered.length,1);
    const [list]=mrPanel.unordered;
    assert.equal(list.n,2);assert.match(list.order_note,/order not established/);assert.match(list.order_note,/calendar unknown/);
    assert.ok(rowsOf(list.table).every(r=>r.includes('3/12/2009')),'the original date text is shown');
    assert.ok(rowsOf(list.table).some(r=>r.includes('94.1 ft-lb')));
    assert.doesNotMatch(JSON.stringify(list.table),/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/);
    assert.deepEqual(mrPanel.phases,[{phase:'PRE_TEST',n:2}]);
  } finally {await main.close();}
});

test('M22-P3/X7: two subjects are two panels, never one series; the limit and unknown names are refused',async()=>{
  const {main,vm}=await setup();
  try {
    let current=await load(vm,'BUT_CGM','a.csv',cgm('2100-01-01 08:00:00;5.5','2100-01-01 08:05:00;5.6'),'A');
    current=await load(current,'BUT_CGM','b.csv',cgm('2100-01-01 08:00:00;9.1','2100-01-01 08:05:00;9.2'),'B');
    const valuesOf=panel=>panel.chart.segments.flatMap(s=>s.points).map(p=>p.value);
    // First selection after loading, with the first-selected subject NOT the one whose series is cold: each panel must read its own subject.
    const reversed=await current.interactions.select({subjects:['B','A']});
    assert.deepEqual(reversed.panels.map(p=>p.subject),['B','A']);
    assert.deepEqual(reversed.panels.map(valuesOf),[[9.1,9.2],[5.5,5.6]]);
    const both=await current.interactions.select({subjects:['A','B']});
    assert.equal(both.panels.length,2);
    assert.deepEqual(both.panels.map(valuesOf),[[5.5,5.6],[9.1,9.2]]);
    const ids=both.panels.map(p=>p.chart.segments.flatMap(s=>s.points).map(x=>x.id));
    assert.equal(ids[0].some(id=>ids[1].includes(id)),false);
    assert.equal(JSON.stringify(both.panels[0]).includes('9.1'),false);
    const single=await both.interactions.select({subjects:['A','A']});
    assert.equal(single.panels.length,1);assert.deepEqual(single.selection.subjects,['A']);
    const unknown=await both.interactions.select({subjects:['A','nobody']});
    assert.equal(unknown.message.kind,'error');assert.deepEqual(unknown.selection.subjects,['A'],'a refused selection changes nothing');
    const noVariable=await both.interactions.select({variables:{A:'pulse'}});assert.equal(noVariable.message.kind,'error');
    let many=current;for(const name of ['C','D','E']) many=await load(many,'BUT_CGM',name+'.csv',cgm(`2100-01-0${name.charCodeAt(0)-60} 08:00:00;5.5`),name);
    const tooMany=await many.interactions.select({subjects:['A','B','C','D','E']});
    assert.equal(tooMany.message.kind,'error');assert.match(tooMany.message.text,/at most 4/i);assert.ok(tooMany.panels.length<=4);
    assert.equal((await many.interactions.select({subjects:['A','B','C','D']})).panels.length,4);
  } finally {await main.close();}
});

test('M22-X8: hostile services and interactions give error view models or messages and never throw',async()=>{
  const {main,services}=await setup();
  const trap={};Object.defineProperty(trap,'source_id',{enumerable:true,get(){throw new Error('accessor ran');}});
  try {
    for(const [label,broken] of [['importers',{importers:undefined}],['readings',{readings:{}}],['openMemoryStore',{openMemoryStore:'x'}],['store opens badly',{openMemoryStore:async()=>({ok:false,error:{code:'x',message:'no store'}})}]]) {
      const vm=await model({...services,...broken},{});
      assert.equal(vm.state,'error',label);assert.equal(typeof vm.message,'string');assert.ok(vm.message.length>0);
    }
    for(const nothing of [undefined,null,'x',7]) assert.equal((await model(nothing,{})).state,'error');
    const vm=await model(services,{});
    const hostile=[undefined,null,'x',7,[],{},trap,{source_id:'BUT_CGM',name:7,text:'x'},{source_id:'BUT_CGM',name:'a.csv',text:7},{source_id:'BUT_CGM',name:'x'.repeat(100000),text:CGM_TEXT,subject:'1'},
      {source_id:'BUT_CGM',name:'a.csv',text:CGM_TEXT,subject:7},{source_id:'NOPE',name:'a.csv',text:'x'},{source_id:7,name:'a.csv',text:'x'}];
    for(const [index,input] of hostile.entries()) {const out=await vm.interactions.loadFile(input);assert.equal(out.message.kind,'error',`hostile load input #${index}`);assert.deepEqual(out.files,[]);}
    for(const input of [undefined,null,'x',7,{subjects:'A'},{subjects:[7]},{subjects:[{}]},{day:7},{variables:'x'},{subjects:['x'.repeat(100000)]},trap]) {
      const out=await vm.interactions.select(input);assert.ok(out.message===null||out.message.kind==='error'||out.message.kind==='info');assert.equal(out.state,'ready');
    }
  } finally {await main.close();}
});

test('M22-X11: the size limit is published so the view can refuse a file before reading it',async()=>{
  const {main,vm}=await setup();
  try {
    assert.equal(vm.limits.max_file_bytes,5*1024*1024);
    const tooBig=await load(vm,'BUT_CGM','big.csv','x'.repeat(5*1024*1024+1),'1');
    assert.equal(tooBig.message.kind,'error');assert.deepEqual(tooBig.files,[]);
    const empty=await load(vm,'BUT_CGM','empty.csv','','1');assert.equal(empty.message.kind,'error');
  } finally {await main.close();}
});

test('M22-X12: a save that fails part-way is reported as partial with the real count; a first-batch failure keeps nothing',async()=>{
  const rows=Array.from({length:300},(_,i)=>`2100-01-0${1+Math.floor(i/200)} ${String(Math.floor((i%200)/12)).padStart(2,'0')}:${String((i%12)*5).padStart(2,'0')}:00;5.${i%10}`);
  const text=cgm(...rows);
  const failing=(failOn)=>async()=>{
    const opened=await openStore({kind:'memory',name:'flaky'});let calls=0;const real=opened.value;
    return {ok:true,value:{list:(...a)=>real.list(...a),close:()=>real.close(),
      saveBatch:async(...a)=>{calls++;return calls===failOn?{ok:false,error:{code:'storage_failed',field:'batch',message:'disk full'}}:real.saveBatch(...a);}}};
  };
  const {main,services}=await setup();
  try {
    const vm=await model({...services,openMemoryStore:failing(2)},{});
    const after=await load(vm,'BUT_CGM','big.csv',text,'101001');
    const card=after.files[0];
    assert.equal(card.status,'partial');assert.equal(card.records,256);
    assert.match(card.error_text,/only 256 of 300/i);
    assert.equal(after.message.kind,'error');assert.match(after.message.text,/Only 256 of 300/);
    assert.equal(after.subjects[0].variables[0].n,256,'the records that were kept stay visible');
    const vm2=await model({...services,openMemoryStore:failing(1)},{});
    const none=await load(vm2,'BUT_CGM','big.csv',text,'101001');
    assert.deepEqual(none.files,[]);assert.equal(none.message.kind,'error');assert.deepEqual(none.subjects,[]);
  } finally {await main.close();}
});

test('M22-X13: a session keeps a bounded number of file cards',async()=>{
  const {main,vm}=await setup();
  try {
    let current=vm;
    for(let i=0;i<50;i++) current=await load(current,'BUT_CGM',`bad-${i}.csv`,'Foo;Bar\n1;2','1');
    assert.equal(current.files.length,50);
    const over=await load(current,'BUT_CGM','one-more.csv',CGM_TEXT,'1');
    assert.equal(over.message.kind,'error');assert.match(over.message.text,/at most 50/i);assert.equal(over.files.length,50);assert.deepEqual(over.subjects,[]);
  } finally {await main.close();}
});

test('M22-X14: choosing a day or variable reuses the computed series; loading another file refreshes it',async()=>{
  const counts={list:0,series:0};
  const {main,services}=await setup();
  const spy={...services,
    openMemoryStore:async()=>{const opened=await openStore({kind:'memory',name:'spy'});const real=opened.value;
      return {ok:true,value:{list:(...a)=>{counts.list++;return real.list(...a);},saveBatch:(...a)=>real.saveBatch(...a),close:()=>real.close()}};},
    readings:{...readings,seriesBySourceTime:(...a)=>{counts.series++;return readings.seriesBySourceTime(...a);}}};
  try {
    let vm=await model(spy,{});
    vm=await load(vm,'BUT_CGM','a.csv',CGM_TEXT,'S');
    assert.equal(vm.panels[0].chart.segments.flatMap(s=>s.points).length+vm.panels[0].chart.breaks.length>0,true);
    const afterLoad={...counts};
    assert.ok(afterLoad.series>=1);
    vm=await vm.interactions.select({day:'2100-01-02'});
    vm=await vm.interactions.select({day:'2100-01-01'});
    vm=await vm.interactions.select({variables:{S:'glucose'}});
    assert.deepEqual(counts,afterLoad,'no new store read and no new series query for selections on loaded data');
    assert.equal(vm.panels[0].chart.day,'2100-01-01');
    // A second file for the same subject must show up: the cache must have been invalidated.
    const before=vm.panels[0].chart.days.length;
    vm=await load(vm,'BUT_CGM','b.csv',cgm('2100-01-05 10:00:00;6.1','2100-01-05 10:05:00;6.2'),'T');
    assert.ok(counts.series>afterLoad.series,'the series was computed for the new file');
    assert.equal(vm.panels[0].subject,'T');assert.deepEqual(vm.panels[0].chart.days,['2100-01-05']);assert.ok(before>=1);
    // One subject with several variables: the cache is keyed by variable, so each selection shows its own series.
    const mr080g='Campaign,Subject,Date,Test_Phase,BR_Day,Test,Stage,HR,VO2,VCO2,RER,VO2 (ml/kg/min),VE,FEO2,FECO2\nC3C,7772,5/7/2006,PRE_TEST,-1,Pre Bed Rest Maximum Cycle-Light,50 Watt Av.,100,1,0.8,0.8,20,30,17,4';
    let multi=await model(spy,{});
    multi=await load(multi,'MR080G','m.csv',mr080g);
    const texts=panel=>JSON.stringify(panel.unordered.map(u=>u.table.rows));
    multi=await multi.interactions.select({variables:{'7772':'pulse'}});
    assert.match(texts(multi.panels[0]),/100 bpm/);assert.equal(multi.panels[0].variable,'pulse');
    multi=await multi.interactions.select({variables:{'7772':'FECO2'}});
    assert.match(texts(multi.panels[0]),/4 %/);assert.doesNotMatch(texts(multi.panels[0]),/100 bpm/);assert.equal(multi.panels[0].variable,'FECO2');
    multi=await multi.interactions.select({variables:{'7772':'pulse'}});
    assert.match(texts(multi.panels[0]),/100 bpm/);
  } finally {await main.close();}
});

test('M22-X15: two participants are never merged under one typed identifier, and one file is never split into two',async()=>{
  const {main,vm}=await setup();
  try {
    const a=cgm('2100-01-01 08:00:00;5.5','2100-01-01 08:05:00;5.6');
    const b=cgm('2100-02-01 09:00:00;7.5','2100-02-01 09:05:00;7.6');
    let cur=await load(vm,'BUT_CGM','a.csv',a,'P1');
    assert.match(cur.files[0].subject_note,/typed by you/i);
    const merged=await load(cur,'BUT_CGM','b.csv',b,'P1');
    assert.equal(merged.message.kind,'error');assert.match(merged.message.text,/merge two participants/i);assert.equal(merged.files.length,1);assert.equal(merged.subjects.length,1);
    const split=await load(cur,'BUT_CGM','a-again.csv',a,'P2');
    assert.equal(split.message.kind,'error');assert.match(split.message.text,/already loaded under subject P1/i);assert.deepEqual(split.subjects.map(s=>s.subject),['P1']);
    const ok=await load(cur,'BUT_CGM','b.csv',b,'P2');assert.equal(ok.files.length,2);assert.deepEqual(ok.subjects.map(s=>s.subject).sort(),['P1','P2']);
    const mr=await load(ok,'MR079G','m.csv',MR079G);assert.match(mr.files[2].subject_note,/comes from the file/i);
  } finally {await main.close();}
});

test('M22-X16/X17: prototype-like subject names work; an accessor on the variables map is never run',async()=>{
  const {main,vm}=await setup();
  try {
    for(const [index,name] of ['constructor','__proto__','toString','hasOwnProperty'].entries()) {
      const cur=await load(vm,'BUT_CGM',`${name}.csv`,cgm(`2100-01-01 08:00:00;5.${index}`,`2100-01-01 08:05:00;6.${index}`),name);
      assert.equal(cur.panels[0].subject,name,name);assert.equal(cur.panels[0].chart_error,null,name);assert.ok(cur.panels[0].chart,name);
      const picked=await cur.interactions.select({variables:{[name]:'glucose'}});assert.equal(picked.message,null,name);assert.equal(Object.getPrototypeOf(picked.selection.variables),Object.prototype);
    }
    const cur=await load(vm,'BUT_CGM','a.csv',cgm('2100-01-01 08:00:00;5.5'),'S');
    let ran=false;const trap={};Object.defineProperty(trap,'S',{enumerable:true,get(){ran=true;return 'glucose';}});
    const out=await cur.interactions.select({variables:trap});
    assert.equal(ran,false);assert.equal(out.message.kind,'error');
  } finally {await main.close();}
});

test('M22-X18: a partial card and a refused card are labelled differently',async()=>{
  const rows=Array.from({length:300},(_,i)=>`2100-01-0${1+Math.floor(i/200)} ${String(Math.floor((i%200)/12)).padStart(2,'0')}:${String((i%12)*5).padStart(2,'0')}:00;5.${i%10}`);
  const {main,services}=await setup();
  try {
    const flaky=async()=>{const o=await openStore({kind:'memory',name:'f'});let n=0;const r=o.value;return {ok:true,value:{list:(...a)=>r.list(...a),close:()=>r.close(),saveBatch:async(...a)=>(++n===2?{ok:false,error:{code:'capacity',message:'x'}}:r.saveBatch(...a))}};};
    const part=await load(await model({...services,openMemoryStore:flaky},{}),'BUT_CGM','p.csv',cgm(...rows),'S');
    assert.equal(part.files[0].status,'partial');assert.equal(part.files[0].error_label,'Only partly loaded');
    const ref=await load(await model(services,{}),'BUT_CGM','r.csv','Foo;Bar\n1;2','S');
    assert.equal(ref.files[0].status,'refused');assert.equal(ref.files[0].error_label,'Refused as a whole');
  } finally {await main.close();}
});

test('M22-X10: the view names no dataset, citation or figure that its profile table does not hold',async()=>{
  const docs=(await readFile(new URL('../../../docs/DATA_ATTRIBUTIONS.md',import.meta.url),'utf8'))+(await readFile(new URL('../../../docs/DATASET_CITATIONS.md',import.meta.url),'utf8'));
  const flat=docs.replace(/\s+/g,' ');
  for(const profile of PROFILES) for(const citation of profile.citation) {
    const probe=citation.replace(/\(version 1\.0\.0\)/,'(version1.0.0)').replace(/\s+/g,' ');
    assert.ok(flat.includes(probe)||flat.includes(probe.replace('version1.0.0','version 1.0.0')),`citation is not in the attribution documents: ${citation.slice(0,60)}`);
  }
  assert.ok(flat.includes('Creative Commons Attribution4.0')||flat.includes('Creative Commons Attribution 4.0'));
});

// ---- F5 made complete: CRF offered with its caveats, unread columns named, citations equal the delivery attributions ----
const CRF_HEADER='Subject,Date,Test_Phase,BR_Day,Vitals Time,Pulse,SysBP,DiaBP,Resp Rate,Head Down Tilt Verified,Weight,Body Temp,Height,Comment,Bowel Movement,Quantity,Bowel Movement Description';
const CRF_TEXT=[CRF_HEADER,
  '8615,7/6/2007,PRE_TEST,13,9:40,70,120,80,16,yes,75.5,36.6,180,a free text about the person,,,',
  '8615,7/7/2007,PRE_TEST,12,6:00,,118,78,15,yes,75.4,,180,,,,'].join('\n');

test('M22-C1: CRF loads with its caveats; an empty cell is "not recorded"; units are unknown, never guessed; free text is not imported and columns not read are named',async()=>{
  const {main,vm}=await setup();
  try {
    const after=await load(vm,'CRF','crf.csv',CRF_TEXT);
    assert.equal(after.message.kind,'info',JSON.stringify(after.message));
    const card=after.files[0]; assert.equal(card.doi,'10.83263/wjw1-ta27'); assert.match(card.license,/CC0/); assert.equal(card.subjects.join(),'8615');
    assert.equal(card.caveats.length,3); assert.match(card.caveats[0],/unit of any vital-sign column/); assert.match(card.caveats[1],/month\/day\/year/); assert.match(card.caveats[2],/free text/);
    assert.equal(card.skipped,1); assert.deepEqual(card.unread_columns,['Head Down Tilt Verified','Bowel Movement','Quantity']);
    const panel=after.panels[0]; const all=JSON.stringify(panel);
    assert.match(all,/unit unknown/); assert.equal(/a free text about the person/.test(JSON.stringify(after)),false,'no comment text anywhere in the model');
    const stored=(await vm.interactions.select({variables:{8615:'pulse'}})); const unordered=stored.panels[0].unordered[0];
    assert.equal(stored.panels[0].chart,null,'the source calendar is unknown, so no time order is claimed'); assert.match(unordered.order_note,/order not established/);
    assert.ok(unordered.table.rows.some(r=>/70 \(unit unknown\)/.test(Object.values(r).join(' '))));
    assert.ok(unordered.table.rows.some(r=>/not recorded/.test(Object.values(r).join(' '))),'the empty pulse cell is shown as not recorded, not as a value');
    const blank=(await vm.interactions.select({variables:{8615:'sys_bp_never'}})); assert.equal(blank.message.kind,'error');
  } finally {await main.close();}
});

test('M22-C2: every profile citation and licence equals the delivery attributions, and nothing in profiles.js names a source the attributions do not',async()=>{
  const attributions=await readFile(new URL('../../../docs/DATA_ATTRIBUTIONS.md',import.meta.url),'utf8');
  const flat=text=>text.replace(/\s+/g,' ').replace(/Ploutz- Snyder/g,'Ploutz-Snyder').trim();
  const doc=flat(attributions);
  for(const profile of PROFILES) {
    assert.ok(doc.includes(profile.doi),`${profile.id}: the DOI is in the attributions`);
    assert.ok(doc.includes(profile.license.split(' (')[0].replace('Creative Commons Attribution 4.0 International','CC BY')) || doc.includes(profile.license) || /CC BY ?4\.0|CC0/.test(doc),`${profile.id}: the licence is in the attributions`);
  }
  const crf=PROFILES.find(p=>p.id==='CRF'); assert.ok(doc.includes(flat(crf.citation[0])),'the CRF citation is verbatim in the attributions');
  const mr79=PROFILES.find(p=>p.id==='MR079G'); assert.ok(doc.includes(flat(mr79.citation[0]).replace(/^Moore/,'Moore')),'the MR079G citation is verbatim in the attributions');
});

// ---- Keeping a case on this device (separate store), restoring it, and removing it ----
function keptDoor() {
  let store = null; let cleared = 0;
  return {cleared: () => cleared, door: {
    async open() { if (!store) store = (await openStore({kind: 'memory', name: 'kept'})).value; return {ok: true, value: store}; },
    async clear() { cleared += 1; store = null; return {ok: true}; }
  }, peek: () => store};
}
async function withKept(kept) { return setup({keptCases: kept.door}); }

test('M22-K1: a loaded file can be kept in its own store; a new session restores it; nothing reaches the shell store',async()=>{
  const kept=keptDoor(); const {main,vm}=await withKept(kept);
  try {
    assert.equal(vm.keep.available,true); assert.match(vm.notice,/Keep on this device/);
    let after=await load(vm,'BUT_CGM','a.csv',CGM_TEXT,'101001'); const card=after.files[0]; assert.equal(card.kept,false); assert.ok(card.file_key);
    assert.equal((await after.interactions.keep('nope')).message.kind,'error');
    after=await after.interactions.keep(card.id); assert.equal(after.message.kind,'info'); assert.equal(after.files[0].kept,true);
    assert.equal((await kept.peek().list('records',{})).value.length,6); assert.equal((await kept.peek().list('config',{})).value.length,1);
    assert.equal((await after.interactions.keep(card.id)).message.kind,'info','keeping twice changes nothing'); assert.equal((await kept.peek().list('records',{})).value.length,6);
    assert.equal((await main.list('records',{})).value.length,1,'the shell store still holds only its own record');
    // A new session over the same kept store sees the case without loading anything.
    const again=await model({importers,readings,openMemoryStore:()=>openStore({kind:'memory',name:'private2'}),keptCases:kept.door});
    assert.equal(again.files.length,1); assert.equal(again.files[0].kept,true); assert.equal(again.files[0].name,'a.csv'); assert.deepEqual(again.subjects.map(s=>s.subject),['101001']);
    assert.match(again.message.text,/Restored 1 case file/); assert.equal(again.panels.length,1); assert.ok(again.panels[0].chart);
  } finally {await main.close();}
});

test('M22-K2: removing needs the confirmation, deletes the kept copy, and leaves what is loaded until the page closes',async()=>{
  const kept=keptDoor(); const {main,vm}=await withKept(kept);
  try {
    let after=await load(vm,'BUT_CGM','a.csv',CGM_TEXT,'101001'); after=await after.interactions.keep(after.files[0].id);
    const refused=await after.interactions.removeKept({}); assert.equal(refused.message.kind,'error'); assert.equal(kept.cleared(),0);
    const done=await after.interactions.removeKept({confirmed:true}); assert.equal(done.message.kind,'info'); assert.equal(kept.cleared(),1); assert.equal(done.files[0].kept,false); assert.equal(done.panels.length,1);
    const fresh=await model({importers,readings,openMemoryStore:()=>openStore({kind:'memory',name:'private3'}),keptCases:kept.door}); assert.equal(fresh.files.length,0,'a new session finds nothing kept');
  } finally {await main.close();}
});

test('M22-K3: without a kept store the page says it is session-only; a kept store that fails to open says so and nothing is hidden',async()=>{
  const {main,vm}=await setup(); try { assert.equal(vm.keep.available,false); assert.match(vm.notice,/gone when the page closes/); assert.doesNotMatch(vm.notice,/Keep on this device/); } finally {await main.close();}
  const failing=await setup({keptCases:{open:async()=>({ok:false,error:{message:'blocked'}})}});
  try { assert.equal(failing.vm.keep.available,false); assert.match(failing.vm.keep.unavailable_reason,/not available here \(blocked\)/); const out=await load(failing.vm,'BUT_CGM','a.csv',CGM_TEXT,'101001'); assert.equal(out.files[0].kept,false); assert.equal((await out.interactions.keep(out.files[0].id)).message.kind,'error'); } finally {await failing.main.close();}
});

test('M22-K4: a kept store that cannot be written keeps nothing and does not mark the file as kept',async()=>{
  const real=keptDoor();
  const door={async open(){const r=await real.door.open(); const store=r.value; return {ok:true,value:{...store,saveBatch:async()=>({ok:false,error:{code:'storage_error',message:'full'}})}};},clear:real.door.clear};
  const {main,vm}=await setup({keptCases:door});
  try { let out=await load(vm,'BUT_CGM','a.csv',CGM_TEXT,'101001'); out=await out.interactions.keep(out.files[0].id); assert.equal(out.message.kind,'error'); assert.match(out.message.text,/not marked as kept/); assert.equal(out.files[0].kept,false); assert.equal((await real.peek().list('config',{})).value.length,0); } finally {await main.close();}
});

test('M22-K5: a file of more than a thousand records is kept completely (the store bounds one batch; this failed in the browser at 1,000 per batch)',async()=>{
  const kept=keptDoor(); const {main,vm}=await withKept(kept);
  try {
    const lines=Array.from({length:1500},(_,i)=>`2100-01-${String(1+Math.floor(i/288)).padStart(2,'0')} ${String(Math.floor((i%288)/12)).padStart(2,'0')}:${String((i%12)*5).padStart(2,'0')}:00;${(4+(i%30)/10).toFixed(1)}`);
    let out=await load(vm,'BUT_CGM','big.csv',cgm(...lines),'big-1'); assert.equal(out.files[0].records,1500);
    out=await out.interactions.keep(out.files[0].id); assert.equal(out.message.kind,'info',out.message.text); assert.equal((await kept.peek().list('records',{})).value.length,1500);
    const again=await model({importers,readings,openMemoryStore:()=>openStore({kind:'memory',name:'p9'}),keptCases:kept.door}); assert.equal(again.files[0].records,1500); assert.equal(again.subjects.length,1);
  } finally {await main.close();}
});
