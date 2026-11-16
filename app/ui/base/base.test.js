import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stateLabel,originLabel,valueWithContext,accessibleTable,lineChart,dataStateBadge,attentionBadge,viewKit} from './index.js';
import {PLANNED_VIEWS,buildShell,assembleServices,storageNotice,configSelector,sourceSelector} from './shell-model.js';
import {ORIGINS} from '../../core/index.js'; // tests may cross-check against core; the module itself does not import it

// Expected values are written by hand from the work order, never computed by the code under test.
const FORBIDDEN=/\b(normal|fine|ok|good|healthy)\b/i;
const NOW='2026-03-12T12:00:00.000Z';
const clock=()=>NOW;
const base={id:'r1',schema_version:2,type:'measurement',state:'recorded',variable:'pulse',value:72,unit:'bpm',method:'demo-device',
  time:'2026-03-10T12:00:00.000Z',origin:'synthetic',source:'user_entered',mission_phase:'mission',subject:'s'};
const absent=state=>{const r={...base,state};delete r.value;delete r.unit;return r;};

test('M07-P1: the three record states read differently by text alone (R1)',()=>{
  assert.equal(stateLabel({...base,state:'recorded'}),'recorded');
  assert.equal(stateLabel({...base,state:'confirmed_none'}),'confirmed nothing new');
  assert.equal(stateLabel({...base,state:'not_recorded'}),'not recorded');
  assert.equal(stateLabel('not_recorded'),'not recorded');
  for(const unknown of [undefined,null,{},{state:'banana'},'banana',7]) assert.equal(stateLabel(unknown),'state unknown');
});

const day=n=>`2026-03-${String(n).padStart(2,'0')}`;
const point=(n,value)=>({id:`p${n}`,day:day(n),time:`${day(n)}T12:00:00.000Z`,value,unit:'bpm',method:'demo-device',origin:'synthetic'});
const walk=(node,found=[])=>{found.push(node);for(const child of node.children??[])walk(child,found);return found;};
const klass=(node,name)=>String(node.attrs?.class??'').split(' ').includes(name);

test('M07-P2: a missing day splits the line into two segments and the table reads "not recorded" (R2)',()=>{
  const model=lineChart({points:[point(1,60),point(3,62)],gaps:[{day:day(2),reason:'no_record'}],n:2,non_comparable_groups:[]},{unit:'bpm',label:'Pulse'});
  assert.equal(model.segments.length,2);
  assert.deepEqual(model.segments.map(s=>s.points.map(p=>p.value)),[[60],[62]]);
  assert.equal(model.table.rows.length,3);
  assert.deepEqual(model.table.rows.map(r=>r.day),[day(1),day(2),day(3)]);
  assert.match(model.table.rows[1].value,/not recorded/);
  assert.equal(model.table.rows[0].value,'60 bpm');
});

test('M07-P2b: drawing — two lines, a marker per value, and a visible mark on the gap',()=>{
  const model=lineChart({points:[point(1,60),point(2,61),point(4,64),point(5,63)],gaps:[{day:day(3),reason:'not_recorded'}],n:4,non_comparable_groups:[]},{unit:'bpm',label:'Pulse'});
  const nodes=walk(model.svg);
  assert.equal(nodes.filter(n=>n.tag==='path'&&klass(n,'line')).length,2);
  assert.equal(nodes.filter(n=>n.tag==='circle'&&klass(n,'point')).length,4);
  assert.equal(nodes.filter(n=>klass(n,'gap')).length,1);
  assert.equal(model.svg.tag,'svg');assert.equal(model.svg.attrs.role,'img');
  assert.ok(String(model.svg.attrs['aria-label']).includes('Pulse'));
  assert.deepEqual(model.table.rows.map(r=>r.day),[day(1),day(2),day(3),day(4),day(5)]);
});

test('M07-X4: an unlisted missing day still splits; a lone point is drawn; every gap reason has its own wording',()=>{
  const split=lineChart({points:[point(1,60),point(3,62)],gaps:[],n:2,non_comparable_groups:[]},{unit:'bpm',label:'Pulse'});
  assert.equal(split.segments.length,2,'distance between points is read, not only the gap list');
  assert.equal(walk(split.svg).filter(n=>klass(n,'point')).length,2);
  const reasons=['no_record','not_recorded','confirmed_none','no_value','other_group','superseded'];
  const model=lineChart({points:[],gaps:reasons.map((reason,i)=>({day:day(i+1),reason})),n:0,non_comparable_groups:[]},{unit:'bpm',label:'Pulse'});
  assert.equal(new Set(model.table.rows.map(r=>`${r.value}|${r.note}`)).size,6);
  assert.match(model.table.rows[2].value,/confirmed nothing new/);
  assert.doesNotMatch(model.table.rows[1].value,/nothing new/,'not recorded never reads as nothing new');
  assert.doesNotMatch(model.table.rows.map(r=>`${r.value} ${r.note}`).join(' '),/\b0\b/,'a gap is never worded as zero');
  const unknownReason=lineChart({points:[],gaps:[{day:day(1),reason:'made_up'}],n:0,non_comparable_groups:[]},{unit:'bpm',label:'Pulse'});
  assert.match(unknownReason.table.rows[0].note,/not recognised/);
});

test('M07-X4b: empty and degenerate series draw no fake line and no NaN; other-method groups are named',()=>{
  const bad=/NaN|Infinity|undefined/;
  const same=lineChart({points:[point(1,60),point(2,60)],gaps:[],n:2,non_comparable_groups:[]},{unit:'bpm',label:'Pulse'});
  const empty=lineChart({points:[],gaps:[{day:day(1),reason:'no_record'}],n:0,non_comparable_groups:[]},{unit:'bpm',label:'Pulse'});
  const grouped=lineChart({points:[point(1,60),point(2,61)],gaps:[],n:2,non_comparable_groups:[{reason:'Different method',key:{method:'b',unit:'bpm'},n:3,points:[]}]},{unit:'bpm',label:'Pulse'});
  for(const model of [same,empty,grouped]) for(const node of walk(model.svg)) for(const value of Object.values(node.attrs??{})) assert.doesNotMatch(String(value),bad,JSON.stringify(node.attrs));
  assert.equal(empty.empty,true);assert.match(empty.empty_text,/no values/i);
  assert.equal(walk(empty.svg).filter(n=>klass(n,'line')||klass(n,'point')).length,0);
  assert.equal(grouped.not_drawn.n,3);assert.match(grouped.not_drawn.text,/3/);assert.match(grouped.not_drawn.text,/method/i);
  assert.equal(same.empty,false);
});

test('M07-X4c: hostile chart input returns an implemented error Result and never throws',()=>{
  for(const input of [null,undefined,'x',7,[],{},{points:'x',gaps:[]},{points:[],gaps:null},{points:[{day:'yesterday',value:1}],gaps:[]},{points:[{day:day(1),value:NaN}],gaps:[]},{points:[{day:day(1),value:'5'}],gaps:[]}]) {
    const out=lineChart(input,{unit:'bpm',label:'x'});
    assert.equal(out.ok,false,JSON.stringify(input));assert.notEqual(out.error.code,'not_implemented');assert.equal(typeof out.error.message,'string');
  }
});

const CLOCK={scope:'BUT_CGM:1.0.0:101001',calendar:'shifted',precision:'second',timezone:null};
test('M07-Y1: a series on a source clock says so; a UTC series does not',()=>{
  const input={points:[point(1,60),point(3,62)],gaps:[{day:day(2),reason:'no_record'}],n:2,non_comparable_groups:[]};
  const source=lineChart({...input,clock:CLOCK},{unit:'bpm',label:'Glucose'});
  assert.equal(source.time_basis,'source');
  for(const text of [source.summary,source.svg.attrs['aria-label']]) {assert.match(text,/source dates/);assert.match(text,/time zone not established/);}
  assert.match(source.table.columns[0].label,/Source day/);assert.match(source.table.columns[0].label,/time zone not established/);
  const utc=lineChart(input,{unit:'bpm',label:'Pulse'});
  assert.equal(utc.time_basis,'utc');assert.equal(utc.table.columns[0].label,'Day');assert.doesNotMatch(utc.summary,/source/i);
  assert.equal(lineChart({...input,clock:null},{unit:'bpm',label:'x'}).time_basis,'source','the key clock marks a source series even when no clock could be used');
});

test('M07-Y2: values that are not drawn are still in the table, noted, and never in the drawing',()=>{
  const unknownUnit={reason:'Unknown unit: these values cannot be compared with each other or with any other record',key:{method:null,unit:null,unit_status:'unknown'},n:2,
    points:[{id:'q1',day:day(2),value:7,unit:null,method:'m',origin:'ground_analog'},{id:'q2',day:day(4),value:8.5,unit:null,method:'m',origin:'ground_analog'}]};
  const otherMethod={reason:'Different method',key:{method:'b',unit:'bpm'},n:1,points:[{id:'b1',day:day(3),value:99,unit:'bpm',method:'b',origin:'synthetic'}]};
  const model=lineChart({points:[point(1,60),point(2,61)],gaps:[],n:2,non_comparable_groups:[unknownUnit,otherMethod]},{unit:'bpm',label:'Pulse'});
  const rows=model.table.rows;
  assert.deepEqual(rows.map(r=>r.day),[day(1),day(2),day(2),day(3),day(4)]);
  const undrawn=rows.filter(r=>/not drawn/.test(r.note));
  assert.deepEqual(undrawn.map(r=>r.value),['7 (unit unknown)','99 bpm','8.5 (unit unknown)']);
  assert.ok(undrawn.every(r=>/not comparable/.test(r.note)));
  assert.match(undrawn[0].note,/Unknown unit/);assert.match(undrawn[1].note,/Different method/);
  assert.equal(model.segments.flatMap(s=>s.points).length,2,'only the primary values are drawn');
  assert.equal(walk(model.svg).filter(n=>klass(n,'point')).length,2);
  assert.doesNotMatch(JSON.stringify(walk(model.svg).map(n=>n.attrs)),/99|8\.5/);
  const onlyUndrawn=lineChart({points:[],gaps:[],n:0,non_comparable_groups:[unknownUnit]},{unit:'',label:'Pulse'});
  assert.equal(onlyUndrawn.empty,true);assert.equal(onlyUndrawn.table.rows.length,2);
  for(const bad of [{...unknownUnit,points:'x'},{...unknownUnit,points:[{day:'yesterday',value:1}]},{...unknownUnit,points:[{day:day(1),value:'5'}]}]) {
    const out=lineChart({points:[],gaps:[],n:0,non_comparable_groups:[bad]},{unit:'',label:'x'});assert.equal(out.ok,false);assert.notEqual(out.error.code,'not_implemented');
  }
});

const DAY='2100-01-01';
const srcPoint=(time,value,day=DAY)=>({id:`g-${day}-${time}`,day,time:null,source_time:time?`${day}T${time}`:day,value,unit:'mmol/L',method:'m',origin:'terrestrial'});
const SAMPLING={interval_s:300,source:'BUT CGM README: every 5th minute'};
const TIMES=['08:00:00','08:05:00','08:10:10','08:40:00','08:45:00'];
const timeSeries=(points,extra={})=>({points,gaps:[],n:points.length,non_comparable_groups:[],clock:CLOCK,...extra});
const timeOpts=(extra={})=>({unit:'mmol/L',label:'Glucose',resolution:'time',day:DAY,...extra});

test('M07-Y4: by time of day, readings join only within the declared sampling; a hole is a break in drawing and table',()=>{
  const model=lineChart(timeSeries(TIMES.map((t,i)=>srcPoint(t,5+i/10))),timeOpts({sampling:SAMPLING}));
  assert.deepEqual(model.segments.map(s=>s.points.length),[3,2]);
  assert.deepEqual(model.breaks,[{from:'08:10:10',to:'08:40:00',text:'no reading for 29 min 50 s'}]);
  assert.equal(model.table.rows.length,6);
  assert.match(model.table.rows[3].note,/no reading for 29 min 50 s/);
  assert.deepEqual(model.table.rows.filter(r=>!/no reading/.test(r.note)).map(r=>r.time),TIMES);
  const nodes=walk(model.svg);
  assert.equal(nodes.filter(n=>n.tag==='path'&&klass(n,'line')).length,2);
  assert.equal(nodes.filter(n=>klass(n,'point')).length,5);
  assert.equal(nodes.filter(n=>klass(n,'gap')).length,1);
  assert.deepEqual(model.sampling,SAMPLING);
  for(const node of nodes) for(const value of Object.values(node.attrs??{})) assert.doesNotMatch(String(value),/NaN|Infinity|undefined/);
});

test('M07-Y5: without a declared sampling interval nothing is joined and no break is invented',()=>{
  const model=lineChart(timeSeries(TIMES.map((t,i)=>srcPoint(t,5+i/10))),timeOpts());
  const nodes=walk(model.svg);
  assert.equal(nodes.filter(n=>klass(n,'line')).length,0);assert.equal(nodes.filter(n=>klass(n,'point')).length,5);
  assert.match(model.summary,/not joined/);assert.match(model.summary,/no sampling interval/);
  assert.deepEqual(model.breaks,[]);assert.equal(model.sampling,null);
  assert.equal(model.table.rows.length,5);assert.ok(model.table.rows.every(r=>!/no reading/.test(r.note)));
});

test('M07-Y6: only the chosen day is drawn and tabled; the days present are listed',()=>{
  const model=lineChart(timeSeries([...TIMES.map((t,i)=>srcPoint(t,5+i/10)),srcPoint('09:00:00',7,'2100-01-02')]),timeOpts({sampling:SAMPLING}));
  assert.equal(walk(model.svg).filter(n=>klass(n,'point')).length,5);
  assert.equal(model.table.rows.filter(r=>!/no reading/.test(r.note)).length,5);
  assert.deepEqual(model.days,['2100-01-01','2100-01-02']);
  const other=lineChart(timeSeries([...TIMES.map((t,i)=>srcPoint(t,5+i/10)),srcPoint('09:00:00',7,'2100-01-02')]),timeOpts({day:'2100-01-02',sampling:SAMPLING}));
  assert.equal(walk(other.svg).filter(n=>klass(n,'point')).length,1);
});

test('M07-Y7: a source clock is labelled as such; a UTC series uses its UTC time of day',()=>{
  const source=lineChart(timeSeries(TIMES.map((t,i)=>srcPoint(t,5+i/10))),timeOpts({sampling:SAMPLING}));
  assert.match(source.table.columns[0].label,/Source time of day/);assert.match(source.table.columns[0].label,/time zone not established/);
  assert.match(source.summary,/source clock/);assert.match(source.svg.attrs['aria-label'],/time zone not established/);
  const utcPts=['08:00:00','08:05:00'].map((t,i)=>({id:'u'+i,day:'2026-03-01',time:`2026-03-01T${t}.000Z`,value:60+i,unit:'bpm',method:'m',origin:'synthetic'}));
  const utc=lineChart({points:utcPts,gaps:[],n:2,non_comparable_groups:[]},{unit:'bpm',label:'Pulse',resolution:'time',day:'2026-03-01',sampling:{interval_s:300,source:'team demo'}});
  assert.equal(utc.table.columns[0].label,'Time of day (UTC)');assert.equal(utc.time_basis,'utc');
  assert.deepEqual(utc.table.rows.map(r=>r.time),['08:00:00','08:05:00']);assert.equal(utc.segments.length,1);
  assert.doesNotMatch(utc.summary,/source/i);
});

test('M07-Y8: bad time options are refused, and a date-only point never gets an invented time of day',()=>{
  const series=timeSeries(TIMES.map((t,i)=>srcPoint(t,5+i/10)));
  for(const bad of [{resolution:'time'},{resolution:'time',day:'yesterday'},{resolution:'time',day:'2100-02-30'},{resolution:'banana',day:DAY},
    {resolution:'time',day:DAY,sampling:{interval_s:0,source:'x'}},{resolution:'time',day:DAY,sampling:{interval_s:-5,source:'x'}},
    {resolution:'time',day:DAY,sampling:{interval_s:'300',source:'x'}},{resolution:'time',day:DAY,sampling:{interval_s:300}},{resolution:'time',day:DAY,sampling:'300'}]) {
    const out=lineChart(series,{unit:'mmol/L',label:'x',...bad});assert.equal(out.ok,false,JSON.stringify(bad));assert.notEqual(out.error.code,'not_implemented');
  }
  const dated=lineChart(timeSeries([srcPoint('08:00:00',5),srcPoint(null,6)]),timeOpts({sampling:SAMPLING}));
  assert.equal(walk(dated.svg).filter(n=>klass(n,'point')).length,1);
  const row=dated.table.rows.find(r=>/no time of day/.test(r.note));
  assert.ok(row,'the date-only value is in the table');assert.match(row.note,/no time of day in the source/);assert.equal(row.time,'');
});

const clockCtx={clock};
test('M07-F1: one record becomes one entry, with the same value text as valueWithContext and nothing invented',()=>{
  const e=viewKit.recordEntry(base,clockCtx);
  assert.equal(e.has_record,true);assert.equal(e.id,'r1');assert.equal(e.variable,'pulse');assert.equal(e.state,'recorded');assert.equal(e.state_text,'recorded');
  assert.equal(e.value,72);assert.equal(e.unit,'bpm');assert.equal(e.value_text,'72 bpm');assert.equal(e.method,'demo-device');assert.equal(e.time,'2026-03-10T12:00:00.000Z');
  assert.equal(e.origin,'synthetic');assert.match(e.origin_text,/synthetic/);assert.equal(e.text,valueWithContext(base,clockCtx).text);assert.equal(valueWithContext(base,clockCtx).text.startsWith(e.value_text),true);
  assert.equal(e.badge.kind,'age_only');
  const missing=viewKit.recordEntry(absent('not_recorded'),clockCtx);
  assert.equal(missing.value,null);assert.equal(missing.value_text,'not recorded');assert.equal(missing.state,'not_recorded');assert.equal(missing.badge.kind,'not_recorded');assert.doesNotMatch(JSON.stringify(missing),/"value":0|\b0 bpm/);
  const none=viewKit.recordEntry(absent('confirmed_none'),clockCtx);assert.equal(none.value_text,'confirmed nothing new');assert.equal(none.state,'confirmed_none');
  const unitless=viewKit.recordEntry({...base,unit:null,unit_status:'unknown',value:5},clockCtx);assert.equal(unitless.value_text,'5 (unit unknown)');assert.equal(unitless.unit,null);
  const source=viewKit.recordEntry({...base,time:null,unit:null,unit_status:'unknown',value:5,source_time:{value:'2026-03-02',raw:'03/02/2026',precision:'date',timezone:null,calendar:'original',scope:'s'}},clockCtx);
  assert.equal(source.time,null);assert.equal(source.source_time_raw,'03/02/2026');assert.equal(source.age_days,null);
  for(const bad of [{...base,state:'banana'},'x',7,[],{}]) {const out=viewKit.recordEntry(bad,clockCtx);assert.equal(out.has_record,false,JSON.stringify(bad));assert.equal(out.state,'not_recorded');}
});

test('M07-F2: an absent entry is "not recorded", never "nothing new"',()=>{
  const e=viewKit.recordEntry(null,{...clockCtx,variable:'sleep_hours',label:'Self-reported rest duration'});
  assert.equal(e.has_record,false);assert.equal(e.id,null);assert.equal(e.variable,'sleep_hours');assert.equal(e.label,'Self-reported rest duration');
  assert.equal(e.value,null);assert.equal(e.value_text,'not recorded');assert.equal(e.state,'not_recorded');assert.equal(e.text,'Self-reported rest duration: not recorded');
  assert.equal(e.method,null);assert.equal(e.time,null);assert.doesNotMatch(JSON.stringify(e),/nothing new|confirmed_none/);
  assert.equal(viewKit.recordEntry(undefined,{}).variable,null);
});

const goodServices=()=>({store:{list:async()=>({ok:true,value:[]}),status:()=>({kind:'memory',persistent:false})},readings:{series(){},latest(){},baseline(){},environment(){},cumulative(){},attention(){}},
  catalogs:{variables:()=>[{id:'pulse',label:'Pulse',unit:'bpm',type:'measurement'}]},subject:'subject-a',clock:()=>'2026-03-12T18:00:00.000Z',config:null});
test('M07-F3: the view context names what is missing, never throws and never defaults a subject',()=>{
  const ok=viewKit.contextOf(goodServices());
  assert.equal(ok.ok,true);assert.equal(ok.value.subject,'subject-a');assert.equal(ok.value.now_iso,'2026-03-12T18:00:00.000Z');
  assert.deepEqual(ok.value.today,{from:'2026-03-12T00:00:00.000Z',to:'2026-03-13T00:00:00.000Z'});assert.equal(ok.value.config,null);
  for(const [part,patch] of [['store',{store:undefined}],['readings',{readings:{series(){}}}],['catalogs',{catalogs:{}}],['subject',{subject:''}],['subject',{subject:undefined}],['clock',{clock:'x'}],['clock',{clock:()=>'not a date'}]]) {
    const out=viewKit.contextOf({...goodServices(),...patch});assert.equal(out.ok,false,part);assert.match(out.error.message,new RegExp(part),part);assert.notEqual(out.error.code,'not_implemented');
  }
  const trap={};Object.defineProperty(trap,'subject',{enumerable:true,get(){throw new Error('accessor ran');}});
  for(const input of [undefined,null,'x',7,[],trap]) assert.equal(viewKit.contextOf(input).ok,false);
  assert.equal(viewKit.contextOf({...goodServices(),clock:()=>{throw new Error('x');}}).ok,false);
});

test('M07-F4: textsOf and keysOf see every string and key, nested or not',()=>{
  const m={title:'T',sections:[{id:'a',entries:[{text:'deep',tags:['x',['y']]}]}],n:3,flag:true,nothing:null};
  assert.deepEqual(viewKit.textsOf(m).sort(),['T','a','deep','x','y']);
  assert.deepEqual(viewKit.keysOf(m).sort(),['entries','flag','id','n','nothing','sections','tags','text','title']);
  const loop={a:'x'};loop.self=loop;assert.deepEqual(viewKit.textsOf(loop),['x']);
  assert.deepEqual(viewKit.textsOf(()=>1),[]);
});

test('M07-F5: services accept the F2 fields and the source selector never invents a selection',()=>{
  const configs=[{id:'a',name:'A',communication:'real_time',environment:'station',available_equipment:[]}];
  const parts={store:{status:()=>({kind:'memory',persistent:false})},clock,newId:()=>'1',configs,subject:'s-1',data_source:{id:'demo',label:'Synthetic demo',synthetic:true},writable:true,record_origin:'synthetic',flags:{career_limit:false}};
  const out=assembleServices(parts);
  assert.equal(out.ok,true);assert.equal(out.value.subject,'s-1');assert.equal(out.value.data_source.id,'demo');assert.equal(out.value.writable,true);assert.equal(out.value.record_origin,'synthetic');assert.deepEqual(out.value.flags,{career_limit:false});
  const mine=assembleServices({...parts,subject:undefined,data_source:{id:'mine',label:'My records',synthetic:false},writable:false,record_origin:undefined,flags:undefined});
  assert.equal(mine.ok,true);assert.equal(mine.value.subject,null);assert.equal(mine.value.writable,false);assert.deepEqual(mine.value.flags,{});
  for(const key of ['subject','data_source','writable','record_origin','flags']) assert.equal(assembleServices({...parts,collaborators:{[key]:1}}).ok,false,key);
  assert.equal(assembleServices({...parts,writable:'yes'}).ok,false);assert.equal(assembleServices({...parts,data_source:{id:'',label:'x'}}).ok,false);assert.equal(assembleServices({...parts,flags:[]}).ok,false);
  const sources=[{id:'demo',label:'Synthetic demo (fictional)',synthetic:true},{id:'mine',label:'My records',synthetic:false}];
  const picked=sourceSelector(sources,'mine');
  assert.deepEqual(picked.options.map(o=>o.id),['demo','mine']);assert.equal(picked.selected_id,'mine');assert.match(picked.options[0].detail,/fictional/i);assert.match(picked.options[1].detail,/this browser/i);
  assert.equal(sourceSelector(sources,null).selected_id,null);assert.equal(sourceSelector(sources,'zzz').selected_id,null);assert.deepEqual(sourceSelector('x',null).options,[]);
});

test('M07-R1/R2: badge tones are pinned; the freshness boundary and the age floor are exact',()=>{
  const rule={clock,old_after_days:7};
  assert.equal(dataStateBadge(absent('not_recorded'),rule).tone,'absent');assert.equal(dataStateBadge(absent('confirmed_none'),rule).tone,'none');
  assert.equal(dataStateBadge(base,rule).tone,'current');assert.equal(dataStateBadge({...base,time:'2026-02-01T12:00:00.000Z'},rule).tone,'old');
  assert.equal(dataStateBadge(base,{...rule,comparable:false,reason:'x'}).tone,'incomparable');assert.equal(dataStateBadge(null,rule).tone,'unknown');
  const ago=days=>({...base,time:new Date(Date.parse(NOW)-days*86400000).toISOString()});
  assert.equal(dataStateBadge(ago(7),rule).kind,'current');assert.equal(dataStateBadge(ago(8),rule).kind,'old');
  assert.equal(valueWithContext({...base,time:new Date(Date.parse(NOW)-1.9999*86400000).toISOString()},{clock}).parts.age_days,1);
});

test('M07-R4/R5: prototype names are unknown, the caveats stay, non-finite values are never printed',()=>{
  for(const name of ['toString','constructor','__proto__','hasOwnProperty']) {assert.equal(originLabel(name),'origin unknown');assert.equal(stateLabel(name),'state unknown');}
  assert.match(originLabel('cell_culture'),/not a person/);assert.match(originLabel('terrestrial'),/not a spaceflight analog/);
  for(const bad of [NaN,Infinity,-Infinity]) {
    const text=valueWithContext({...base,value:bad},{clock}).text;assert.doesNotMatch(text,/NaN|Infinity/);
    assert.equal(accessibleTable({caption:'x',columns:[{key:'a',label:'A'}],rows:[{a:bad}]}).ok,false);
  }
  assert.equal(accessibleTable({caption:'x',columns:[{key:'a',label:'A'},{key:'a',label:'B'}],rows:[]}).ok,false);
});

test('M07-R3: two readings exactly 1.5 sampling intervals apart are joined; one second more breaks',()=>{
  const mk=(t,v)=>({id:'x'+t,day:DAY,time:null,source_time:`${DAY}T${t}`,value:v,unit:'mmol/L',method:'m',origin:'terrestrial'});
  const joined=lineChart(timeSeries([mk('08:00:00',5),mk('08:07:30',6)]),timeOpts({sampling:SAMPLING}));
  assert.equal(joined.segments.length,1);
  const broken=lineChart(timeSeries([mk('08:00:00',5),mk('08:07:31',6)]),timeOpts({sampling:SAMPLING}));
  assert.equal(broken.segments.length,2);
});

test('M07-R6: a view that never answers gets its own error and the navigation still draws',async()=>{
  const hanging=allViews();hanging[0]={...hanging[0],load:()=>new Promise(()=>{})};
  const shell=await buildShell({views:hanging,currentId:'my-health',services:services(),timeout_ms:50});
  assert.equal(shell.current.state,'error');assert.match(shell.current.text,/did not respond/i);assert.deepEqual(shell.nav.map(n=>n.id),PLANNED_VIEWS.map(v=>v.id));
  const slowModel=await buildShell({views:allViews({'my-health':()=>new Promise(()=>{})}),currentId:'my-health',services:services(),timeout_ms:50});
  assert.equal(slowModel.current.state,'error');assert.match(slowModel.current.text,/did not respond/i);
});

test('M07-R7: large or extreme chart input gives error Results or finite drawings, never an exception',()=>{
  const many=Array.from({length:200000},(_,i)=>({day:day(1),value:i}));
  const big=lineChart({points:many,gaps:[],n:many.length,non_comparable_groups:[]},{unit:'x',label:'x'});
  assert.equal(big.ok,false);assert.notEqual(big.error.code,'not_implemented');
  const mid=Array.from({length:20001},(_,i)=>({day:day(1),value:i}));
  const midOut=lineChart({points:mid,gaps:[],n:mid.length,non_comparable_groups:[]},{unit:'x',label:'x'});
  assert.equal(midOut.ok,false,'the table error is returned, not hidden inside a model');
  const extreme=lineChart({points:[point(1,1e308),point(2,-1e308)],gaps:[],n:2,non_comparable_groups:[]},{unit:'x',label:'x'});
  for(const node of walk(extreme.svg)) for(const value of Object.values(node.attrs??{})) assert.doesNotMatch(String(value),/NaN|Infinity|undefined/);
});

test('M07-R8: a ready view without mount is an error; a series result with a clock key is a source series even when the clock is null',async()=>{
  const noMount=allViews();noMount[0]={...noMount[0],load:async()=>({model:async()=>({state:'ready'})})};
  const shell=await buildShell({views:noMount,currentId:'my-health',services:services()});
  assert.equal(shell.current.state,'error');assert.match(shell.current.text,/no mount/i);
  const empty=lineChart({points:[],gaps:[],n:0,non_comparable_groups:[],clock:null},{unit:'x',label:'x'});
  assert.equal(empty.time_basis,'source');assert.match(empty.table.columns[0].label,/Source day/);
});

test('M07-F7: banner, attention note, variable lists and the latest entry keep absence and failure visible',async()=>{
  const ctx=viewKit.contextOf({...goodServices(),readings:{...goodServices().readings,
    latest:async(store,q)=>q.variable==='pulse'?{record:base,age_days:2}:q.variable==='none'?{record:null,age_days:null}:{ok:false,error:{code:'unresolved_time',message:'x'}},
    attention:(r,c)=>({status:'within',criterion:{id:'c',variable:'pulse',unit:'bpm',low:1,high:99,defined_by:'team demo',source:'team_defined',review_status:'demo'}})},
    data_source:{id:'demo',label:'Synthetic demo',synthetic:true,note:'Fictional.'},config:{attention_criteria:[]}}).value;
  const banner=viewKit.bannerSection(ctx);assert.match(banner.note,/Subject subject-a/);assert.match(banner.note,/Synthetic demo/);assert.equal(banner.id,'source');
  assert.match(viewKit.bannerSection({...ctx,data_source:null}).note,/not named/);
  assert.match(viewKit.attentionNote(ctx),/No attention criteria/);assert.equal(viewKit.attentionNote({...ctx,config:{attention_criteria:[{id:'c'}]}}),null);
  assert.deepEqual(viewKit.variablesOfType(ctx,['measurement']).map(v=>v.id),['pulse']);assert.deepEqual(viewKit.variablesOfType({...ctx,catalogs:{variables:()=>{throw new Error('x');}}},['measurement']),[]);
  const hit=await viewKit.latestEntry(ctx,{id:'pulse',label:'Pulse'});assert.equal(hit.has_record,true);assert.equal(hit.attention.kind,'within');assert.match(hit.attention.text,/Demo criterion/);
  const none=await viewKit.latestEntry(ctx,{id:'none',label:'None'});assert.equal(none.has_record,false);assert.equal(none.value_text,'not recorded');assert.equal(none.attention,null);
  const bad=await viewKit.latestEntry(ctx,{id:'other',label:'Other'});assert.equal(bad.has_record,false);assert.match(bad.value_text,/time is not established/);assert.notEqual(bad.value_text,'not recorded');assert.equal(bad.badge.kind,'unknown');
  const thrown=await viewKit.latestEntry({...ctx,readings:{...ctx.readings,latest:async()=>{throw new Error('x');}}},{id:'pulse',label:'P'});assert.match(thrown.value_text,/could not be read/);
});

test('M07-P3: every origin has its own label; an unknown origin says so and never defaults to synthetic (R4)',()=>{
  const labels=ORIGINS.map(origin=>originLabel(origin));
  assert.equal(new Set(labels).size,ORIGINS.length);
  for(const label of labels) assert.ok(typeof label==='string'&&label.length>0);
  assert.match(originLabel('synthetic'),/synthetic/i);assert.match(originLabel('flight'),/flight/i);
  for(const unknown of ['banana','',undefined,null,{},7]) {
    assert.match(originLabel(unknown),/unknown/i);assert.doesNotMatch(originLabel(unknown),/synthetic/i);
  }
});

const view=(id,model)=>({id,label:id,folder:`app/ui/${id}/`,load:async()=>({model,mount(){}})});
const services=(status={kind:'indexeddb',persistent:true})=>({store:{status:()=>status},configs:[{id:'a',name:'Station demo',communication:'real_time',environment:'station',available_equipment:[]}],
  config:{id:'a',name:'Station demo',communication:'real_time',environment:'station',available_equipment:[]},clock,newId:()=>'1'});
const allViews=(overrides={})=>PLANNED_VIEWS.map(v=>({...v,...(overrides[v.id]?view(v.id,overrides[v.id]):{load:async()=>({model:async()=>({ok:false,error:{code:'not_implemented',message:'x'}}),mount(){}})})}));
const placeholder=async()=>({ok:false,error:{code:'not_implemented',message:'not yet'}});

test('M07-P4: a not-implemented view says "not available yet" and navigation still lists every planned view',async()=>{
  assert.deepEqual(PLANNED_VIEWS.map(v=>v.id),['my-health','adaptation','habitat','my-progress','my-day','my-plan','on-board','i-feel-different','nasa-cases','review','ground']);
  for(const v of PLANNED_VIEWS) assert.equal(v.folder,`app/ui/${v.id}/`);
  const shell=await buildShell({views:allViews({'my-health':placeholder}),currentId:'my-health',services:services()});
  assert.equal(shell.current.state,'not_available');assert.match(shell.current.text,/not available yet/i);
  assert.deepEqual(shell.nav.map(n=>n.id),PLANNED_VIEWS.map(v=>v.id));
  assert.equal(shell.nav.filter(n=>n.current).length,1);assert.equal(shell.nav.find(n=>n.current).id,'my-health');
  assert.equal(shell.nav[0].href,'#/my-health');
});

test('M07-X5: a view that cannot load or whose model throws fails alone; unexplained empty is an error',async()=>{
  const nav=PLANNED_VIEWS.map(v=>v.id);
  const broken=allViews();broken[0]={...broken[0],load:async()=>{throw new Error('module transport failed');}};
  const loadFail=await buildShell({views:broken,currentId:'my-health',services:services()});
  assert.equal(loadFail.current.state,'error');assert.match(loadFail.current.text,/could not be loaded/i);assert.deepEqual(loadFail.nav.map(n=>n.id),nav);
  const thrown=await buildShell({views:allViews({'my-health':async()=>{throw new Error('boom');}}),currentId:'my-health',services:services()});
  assert.equal(thrown.current.state,'error');assert.deepEqual(thrown.nav.map(n=>n.id),nav);
  const cases=[[{state:'empty',reason:'No records yet for this subject.'},'empty',/No records yet/],[{state:'empty'},'error',/without saying why/i],
    [{state:'loading'},'loading',/loading/i],[{state:'error',message:'Store closed'},'error',/Store closed/],[{state:'ready',x:1},'ready',/./],
    [{state:'banana'},'error',/unrecognised/i],[null,'error',/did not return/i],[{ok:false,error:{code:'invalid_query',message:'bad range'}},'error',/bad range/]];
  for(const [vm,state,text] of cases) {
    const shell=await buildShell({views:allViews({'my-health':async()=>vm}),currentId:'my-health',services:services()});
    assert.equal(shell.current.state,state,JSON.stringify(vm));assert.match(shell.current.text,text);
  }
  const unknownRoute=await buildShell({views:allViews(),currentId:'nope',services:services()});
  assert.equal(unknownRoute.current.state,'unknown_view');assert.deepEqual(unknownRoute.nav.map(n=>n.id),nav);
});

test('M07-P5: a memory store always produces a visible storage notice',async()=>{
  const memory=await buildShell({views:allViews(),currentId:'my-health',services:services({kind:'memory',persistent:false,reason:'chosen for this session'})});
  assert.equal(memory.storage.kind,'warning');assert.ok(memory.storage.text.length>0);assert.match(memory.storage.text,/not saved/i);assert.match(memory.storage.text,/chosen for this session/);
  const saved=await buildShell({views:allViews(),currentId:'my-health',services:services()});
  assert.equal(saved.storage.kind,'info');assert.match(saved.storage.text,/not encrypted/i);
});

test('M07-X6: storage notice never goes silent and never claims protection',()=>{
  for(const status of [undefined,null,{},{kind:'memory'},{persistent:'yes'},'x',{kind:'indexeddb',persistent:1}]) {
    const notice=storageNotice(status);assert.equal(notice.kind,'warning',JSON.stringify(status));assert.match(notice.text,/unknown/i);
  }
  assert.match(storageNotice({kind:'indexeddb',persistent:true}).text,/this browser/i);
  assert.doesNotMatch(JSON.stringify([storageNotice({kind:'indexeddb',persistent:true}),storageNotice({kind:'memory',persistent:false})]),/\b(secure|protected|safe|encrypted by)\b/i);
});

test('M07-X7: services assembly refuses missing parts and never picks a configuration silently',()=>{
  const configs=[{id:'a',name:'Station demo',communication:'real_time',environment:'station',available_equipment:[]},{id:'b',name:'Rover demo',communication:'delayed',environment:'rover',available_equipment:[]}];
  const store={status:()=>({kind:'memory',persistent:false})};const newId=()=>'1';
  const ok=assembleServices({store,clock,newId,configs,selected_config_id:'b',collaborators:{readings:{series(){}}}});
  assert.equal(ok.ok,true);assert.equal(ok.value.config.id,'b');assert.equal(typeof ok.value.readings.series,'function');assert.ok(Object.isFrozen(ok.value));
  assert.equal(assembleServices({store,clock,newId,configs}).value.config,null,'no selection stays no selection');
  for(const bad of [{clock,newId,configs},{store,newId,configs},{store,clock:'x',newId,configs},{store,clock,newId,configs,selected_config_id:'zzz'},
    {store,clock,newId,configs:'x'},{store,clock,newId,configs,collaborators:{store:{}}},{store,clock,newId,configs,collaborators:{clock(){}}},null,undefined,'x']) {
    const out=assembleServices(bad);assert.equal(out.ok,false,JSON.stringify(bad)?.slice(0,60));assert.notEqual(out.error.code,'not_implemented');
  }
  assert.equal(assembleServices({store,clock,newId,configs,selected_config_id:'zzz'}).error.code,'unknown_config');
  const selector=configSelector(configs,'b');
  assert.deepEqual(selector.options.map(o=>o.id),['a','b']);assert.equal(selector.selected_id,'b');
  assert.match(selector.options[1].detail,/delayed/i);assert.match(selector.options[1].detail,/rover/i);assert.match(selector.options[0].detail,/station/i);
  assert.equal(configSelector(configs,null).selected_id,null);
});

test('M07-X1: value with context never invents a unit, a zero or an age',()=>{
  const full=valueWithContext(base,{clock});
  assert.ok(full.text.includes('72 bpm'));assert.ok(full.text.includes('demo-device'));assert.ok(full.text.includes('2026-03-10T12:00:00.000Z'));
  assert.match(full.text,/2 days ago/);assert.match(full.text,/synthetic/i);assert.equal(full.parts.age_days,2);
  const unitless=valueWithContext({...base,unit:null,unit_status:'unknown',value:5},{clock});
  assert.match(unitless.text,/5/);assert.match(unitless.text,/unit unknown/);assert.equal(unitless.parts.unit,null);assert.doesNotMatch(unitless.text,/bpm/);
  const none=valueWithContext(absent('not_recorded'),{clock});
  assert.match(none.text,/not recorded/);assert.equal(none.parts.value,null);assert.doesNotMatch(none.text,/\b0\b/);
  const nothingNew=valueWithContext(absent('confirmed_none'),{clock});
  assert.match(nothingNew.text,/confirmed nothing new/);assert.equal(nothingNew.parts.value,null);
  const source=valueWithContext({...base,time:null,unit:null,unit_status:'unknown',value:5,origin:'ground_analog',
    source_time:{value:'2026-03-02',raw:'03/02/2026',precision:'date',timezone:null,calendar:'original',scope:'demo-source'}},{clock});
  assert.ok(source.text.includes('03/02/2026'));assert.match(source.text,/age not computed/);assert.equal(source.parts.age_days,null);assert.match(source.text,/time zone/i);
  assert.match(valueWithContext(base,{}).text,/age not computed/);assert.equal(valueWithContext(base,undefined).parts.age_days,null);
  assert.match(valueWithContext(base,{clock:()=>'2026-03-01T00:00:00.000Z'}).text,/after the clock|age not computed/);
  for(const bad of [null,undefined,'x',{},{...base,state:'banana'}]) assert.match(valueWithContext(bad,{clock}).text,/unknown|invalid/i);
});

test('M07-P7: the data states read differently, none says "normal"; attention names its criterion and its source',()=>{
  const rule={clock,old_after_days:7};
  const current=dataStateBadge(base,rule);
  const old=dataStateBadge({...base,time:'2026-02-01T12:00:00.000Z'},rule);
  const missing=dataStateBadge(absent('not_recorded'),rule);
  const nothingNew=dataStateBadge(absent('confirmed_none'),rule);
  const incomparable=dataStateBadge(base,{...rule,comparable:false,reason:'Different method'});
  const texts=[current,old,missing,nothingNew,incomparable].map(b=>b.text);
  assert.equal(new Set(texts).size,5);
  assert.deepEqual([current,old,missing,nothingNew,incomparable].map(b=>b.kind),['current','old','not_recorded','confirmed_none','not_comparable']);
  for(const b of [current,old,missing,nothingNew,incomparable]) {assert.doesNotMatch(b.text,FORBIDDEN);assert.ok(b.symbol.length>0);assert.ok(b.tone.length>0);}
  assert.match(incomparable.text,/Different method/);
  assert.match(current.text,/current/);assert.match(old.text,/old/);assert.match(old.text,/39 days/);
  assert.match(missing.text,/not recorded/);assert.match(nothingNew.text,/confirmed nothing new/);

  const none=attentionBadge({status:'no_criterion'});
  assert.match(none.text,/no attention criterion defined for this mission/i);assert.doesNotMatch(JSON.stringify(none),FORBIDDEN);
  const demo=attentionBadge({status:'outside',reason:'the value is above the criterion high',criterion:{id:'c',variable:'pulse',unit:'bpm',high:70,defined_by:'team demo',source:'team_defined',review_status:'demo'}});
  assert.match(demo.text,/demo/);assert.match(demo.text,/team_defined/);assert.match(demo.text,/team demo/);assert.match(demo.text,/outside/i);assert.doesNotMatch(demo.text,FORBIDDEN);
  assert.deepEqual(demo.provenance,{defined_by:'team demo',source:'team_defined',review_status:'demo'});
});

test('M07-X2: freshness is data — without old_after_days the badge states the age and judges nothing',()=>{
  const noRule=dataStateBadge(base,{clock});
  assert.equal(noRule.kind,'age_only');assert.match(noRule.text,/2 days/);assert.doesNotMatch(noRule.text,/current|\bold\b/);
  for(const rule of [{clock,old_after_days:-1},{clock,old_after_days:'7'},{clock,old_after_days:NaN}]) assert.equal(dataStateBadge(base,rule).kind,'age_only');
  assert.equal(dataStateBadge({...base,unit:null,unit_status:'unknown',value:5},{clock,old_after_days:7}).kind,'not_comparable');
  assert.match(dataStateBadge({...base,unit:null,unit_status:'unknown',value:5},{clock,old_after_days:7}).text,/unit/i);
  const sourceOnly=dataStateBadge({...base,time:null,source_time:{value:'2026-03-02',raw:'03/02/2026',precision:'date',timezone:null,calendar:'original',scope:'s'}},{clock,old_after_days:7});
  assert.equal(sourceOnly.kind,'age_unknown');assert.match(sourceOnly.text,/age not established/);
  for(const bad of [null,undefined,'x',{},{...base,state:'banana'}]) assert.equal(dataStateBadge(bad,{clock}).kind,'unknown');
  assert.equal(dataStateBadge(base,undefined).kind,'age_unknown');
  assert.equal(dataStateBadge({...base,time:'2026-03-20T00:00:00.000Z'},{clock,old_after_days:7}).kind,'age_unknown','a future record gets no age and no "current"');
});

test('M07-X3: attention without provenance or with an unknown status never reads as within',()=>{
  const full={id:'c',variable:'pulse',unit:'bpm',low:50,high:70,defined_by:'flight surgeons',source:'cited-source',review_status:'reviewed'};
  const within=attentionBadge({status:'within',criterion:full});
  assert.match(within.text,/flight surgeons/);assert.match(within.text,/cited-source/);assert.match(within.text,/reviewed/);assert.equal(within.kind,'within');assert.doesNotMatch(within.text,FORBIDDEN);
  for(const incomplete of [undefined,null,{},{...full,defined_by:''},{...full,source:undefined},{...full,review_status:'draft'},'x']) {
    for(const status of ['within','outside']) {
      const badge=attentionBadge({status,criterion:incomplete});
      assert.equal(badge.kind,'not_assessed',JSON.stringify(incomplete));assert.match(badge.text,/not assessed/i);assert.notEqual(badge.kind,'within');
    }
  }
  for(const odd of [undefined,null,{},{status:'banana'},'within',7]) assert.equal(attentionBadge(odd).kind,'not_assessed');
  const notAssessed=attentionBadge({status:'not_assessed',reason:'the unit of this value is unknown'});
  assert.match(notAssessed.text,/the unit of this value is unknown/);assert.equal(notAssessed.kind,'not_assessed');
  assert.equal(new Set([none(),notAssessed.text,within.text].map(String)).size,3);
  function none(){return attentionBadge({status:'no_criterion'}).text;}
});

test('M07-X: accessible table keeps its caption, columns and rows, and refuses an unnamed table',()=>{
  const table=accessibleTable({caption:'Pulse by day',columns:[{key:'day',label:'Day'},{key:'value',label:'Value'}],rows:[{day:'2026-03-01',value:'60 bpm'},{day:'2026-03-02',value:'not recorded'}]});
  assert.equal(table.caption,'Pulse by day');assert.deepEqual(table.columns.map(c=>c.key),['day','value']);assert.equal(table.rows.length,2);assert.equal(table.rows[1].value,'not recorded');
  const one=[{key:'a',label:'A'}];
  for(const noCaption of [{caption:'',columns:one,rows:[]},{columns:one,rows:[]},{caption:7,columns:one,rows:[]}]) {
    const out=accessibleTable(noCaption);assert.equal(out.ok,false,'caption is checked on its own: '+JSON.stringify(noCaption));assert.equal(out.error.field,'caption');
  }
  for(const bad of [null,{},{caption:'',columns:[],rows:[]},{caption:'x',columns:[],rows:[]},{caption:'x',columns:[{key:'a',label:'A'}],rows:'x'},{caption:'x',columns:[{key:'a'}],rows:[]},
    {caption:'x',columns:[{key:'a',label:'A'}],rows:[{a:{html:'<b>'}}]}]) {
    const out=accessibleTable(bad);assert.equal(out.ok,false,JSON.stringify(bad));assert.notEqual(out.error.code,'not_implemented');
  }
  const missingCell=accessibleTable({caption:'x',columns:[{key:'a',label:'A'}],rows:[{}]});
  assert.equal(missingCell.rows[0].a,'','an absent cell is empty text, never 0');
});

test('M07-X8: no string literal in the module says normal, fine, ok, good or healthy',async()=>{
  const found=[];
  for(const name of ['index.js','labels.js','chart.js','shell-model.js','dom.js']) {
    const source=await readFile(new URL(`./${name}`,import.meta.url),'utf8');
    const code=source.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');
    for(const match of code.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)) if(FORBIDDEN.test(match[2])) found.push(`${name}: ${match[2].slice(0,60)}`);
  }
  assert.deepEqual(found,[]);
});
