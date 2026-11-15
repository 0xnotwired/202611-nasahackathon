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

test('M22-X1: CRF is listed as unsupported with its reason and can never be loaded',async()=>{
  const {main,vm}=await setup();
  try {
    const sources=vm.loader.sources;
    assert.deepEqual(sources.filter(s=>s.supported).map(s=>s.id),['BUT_CGM','MR079G','MR035G','MR080G']);
    const crf=sources.find(s=>s.id==='CRF');
    assert.equal(crf.supported,false);assert.match(crf.reason,/unconfirmed/);
    const after=await load(vm,'CRF','crf.csv','Subject,Date\n1,2','1');
    assert.equal(after.message.kind,'error');assert.match(after.message.text,/CRF/);
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
  assert.equal(PROFILES.length,4);assert.ok(PROFILES.every(p=>p.citation.every(c=>c.includes('doi.org/'))));
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
    const both=await current.interactions.select({subjects:['A','B']});
    assert.equal(both.panels.length,2);
    const valuesOf=panel=>panel.chart.segments.flatMap(s=>s.points).map(p=>p.value);
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

test('M22-X10: the view names no dataset, citation or figure that its profile table does not hold',async()=>{
  const docs=(await readFile(new URL('../../../docs/DATA_ATTRIBUTIONS.md',import.meta.url),'utf8'))+(await readFile(new URL('../../../docs/DATASET_CITATIONS.md',import.meta.url),'utf8'));
  const flat=docs.replace(/\s+/g,' ');
  for(const profile of PROFILES) for(const citation of profile.citation) {
    const probe=citation.replace(/\(version 1\.0\.0\)/,'(version1.0.0)').replace(/\s+/g,' ');
    assert.ok(flat.includes(probe)||flat.includes(probe.replace('version1.0.0','version 1.0.0')),`citation is not in the attribution documents: ${citation.slice(0,60)}`);
  }
  assert.ok(flat.includes('Creative Commons Attribution4.0')||flat.includes('Creative Commons Attribution 4.0'));
});
