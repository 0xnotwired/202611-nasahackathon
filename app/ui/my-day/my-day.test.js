import test from 'node:test';
import assert from 'node:assert/strict';
import {model} from './model.js';
import {viewKit} from '../base/index.js';
import {makeServices,makeRecord,DAY,SUBJECT,FORBIDDEN_WORDS,SCORE_KEYS} from '../../../tests/walkthrough/fixtures.js';

const section=(vm,id)=>vm.sections.find(s=>s.id===id);
const task=(id,completion='pending')=>({id,schema_version:2,subject:SUBJECT,day:DAY(15),description:`Pending item ${id}`,assigned_by:'team_defined',completion,result_ids:[]});
const episode=(extra={})=>({id:'ep-1',schema_version:2,subject:SUBJECT,opened:`${DAY(15)}T10:00:00.000Z`,observation_id:'o1',execution_ids:[],record_ids:[],task_ids:['t1','t2','t3'],alert_issued:false,...extra});

test('M12-P1: while plan answers not_implemented the tasks section says "not available yet" and the rest is ready',async()=>{
  const notYet={tasksFor:async()=>({ok:false,error:{code:'not_implemented',message:'plan is not implemented'}})};
  const vm=await model(await makeServices({plan:notYet}),{});
  assert.equal(vm.state,'ready');assert.equal(section(vm,'tasks').state,'not_available');assert.match(section(vm,'tasks').text,/not available yet/i);
  for(const id of ['known_today','not_recorded_today','access']) assert.equal(section(vm,id).state,'ready',id);
  const listed=await model(await makeServices({plan:{tasksFor:async()=>({ok:true,value:[task('t1')]})}}),{});assert.equal(section(listed,'tasks').state,'ready');assert.match(section(listed,'tasks').items[0].text,/Pending item t1/);
});

test('M12-X4: any other plan failure stays in the tasks section; the view survives',async()=>{
  for(const plan of [{tasksFor:async()=>({ok:false,error:{code:'x',message:'boom'}})},{tasksFor:async()=>{throw new Error('x');}},{},null]) {
    const vm=await model(await makeServices({plan}),{});assert.equal(vm.state,'ready');assert.notEqual(section(vm,'tasks').state,'ready');assert.equal(section(vm,'known_today').state,'ready');
  }
  const failing=await model(await makeServices({plan:{tasksFor:async()=>({ok:false,error:{code:'x',message:'boom'}})}}),{});assert.match(section(failing,'tasks').text,/boom/);
});

test('M12-P2/X1: a day with no sleep entry lists sleep as "not recorded", never "nothing new"; known today holds only today',async()=>{
  const services=await makeServices({without:r=>r.variable==='sleep_hours'});
  const vm=await model(services,{});
  const sleep=section(vm,'not_recorded_today').entries.find(e=>e.variable==='sleep_hours');
  assert.equal(sleep.has_record,false);assert.equal(sleep.value_text,'not recorded');assert.doesNotMatch(JSON.stringify(sleep),/nothing new|confirmed/i);
  const missing=section(vm,'not_recorded_today').entries.map(e=>e.variable).sort();assert.deepEqual(missing,['diastolic_pressure','mass','respiration_rate','sleep_hours','systolic_pressure','temperature']);
  const known=section(vm,'known_today').entries;assert.ok(known.length>=4);assert.ok(known.every(e=>e.time.startsWith(DAY(15))));assert.equal(known.some(e=>e.id==='synthetic-1-record-001'),false,'a value of another day is not today\'s');
  const withSleep=await model(await makeServices(),{});assert.equal(section(withSleep,'not_recorded_today').entries.some(e=>e.variable==='sleep_hours'),false);
  const nothing=await model(await makeServices({without:r=>r.variable==='sleep_hours',records:[makeRecord({id:'cn',type:'observation',variable:'other',state:'confirmed_none',method:'self_report'})]}),{});
  assert.equal(section(nothing,'not_recorded_today').entries.some(e=>e.variable==='sleep_hours'),true,'a nothing-new confirmation does not stand in for sleep');
});

test('M12-P3: no score, total, traffic light or summary field, and no reassuring words',async()=>{
  const vm=await model(await makeServices(),{});
  for(const key of viewKit.keysOf(vm)) assert.equal(SCORE_KEYS.includes(key),false,key);
  assert.deepEqual(Object.keys(vm).sort(),['alerts','interactions','sections','state','title']);
  for(const text of viewKit.textsOf(vm)) assert.doesNotMatch(text,FORBIDDEN_WORDS,text);
});

test('M12-P4/X2: an open episode with three pending items gives exactly one alert that groups them; closed or empty ones give none',async()=>{
  const open=await model(await makeServices({objects:{episodes:[episode()],tasks:[task('t1'),task('t2'),task('t3')]}}),{});
  assert.equal(open.alerts.length,1);assert.equal(open.alerts[0].episode_id,'ep-1');assert.equal(open.alerts[0].items.length,3);assert.match(open.alerts[0].text,/3 items are pending/);
  assert.equal(section(open,'alerts').items.length,1);
  const closed=await model(await makeServices({objects:{episodes:[episode({closed:`${DAY(15)}T12:00:00.000Z`})],tasks:[task('t1'),task('t2'),task('t3')]}}),{});assert.deepEqual(closed.alerts,[]);
  const done=await model(await makeServices({objects:{episodes:[episode()],tasks:[task('t1','done'),task('t2','done'),task('t3','not_done')]}}),{});assert.deepEqual(done.alerts,[]);
  const two=await model(await makeServices({objects:{episodes:[episode(),episode({id:'ep-2',task_ids:['t4']})],tasks:[task('t1'),task('t2'),task('t3'),task('t4')]}}),{});assert.equal(two.alerts.length,2,'one alert per episode');
  const other=await model(await makeServices({objects:{episodes:[episode({subject:'someone-else'})],tasks:[task('t1')]}}),{});assert.deepEqual(other.alerts,[]);
});

test('M12-X3: links to "I feel different" and the other views are always there',async()=>{
  const links=section(await model(await makeServices(),{}),'access').links;
  assert.deepEqual(links.map(l=>l.href),['#/i-feel-different','#/my-health','#/adaptation','#/habitat','#/my-progress']);
  assert.match(links[0].label,/I feel different/);
});

test('M12: hostile services give an error view model',async()=>{
  const base=await makeServices();
  for(const broken of [{store:undefined},{readings:{}},{catalogs:{}},{subject:''},{clock:'x'}]) assert.equal((await model({...base,...broken},{})).state,'error');
  for(const input of [undefined,null,'x',7]) assert.equal((await model(input,{})).state,'error');
});
