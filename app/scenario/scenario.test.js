import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {generateScenario} from './index.js';
import {validateRecord,SCHEMA_VERSION} from '../core/index.js';
import {validateConfig,hasEquipment} from '../mission/index.js';
import {variables,equipment} from '../catalogs/index.js';
import {checkScenario} from '../../tests/contract/scenario.js';

function build(seed=1) {
  const output=generateScenario({seed});
  for(const name of ['config','records','tasks','procedures']) assert.ok(Array.isArray(output[name]),`${name} array required`);
  return output;
}
export function checkOrigins(output) {
  for(const record of output.records) {
    assert.equal(validateRecord(record).ok,true,JSON.stringify(validateRecord(record)));
    assert.equal(record.origin,'synthetic');
    assert.equal(record.source,'user_entered');
    assert.match(record.note,/team demo/i);
    assert.notEqual(record.unit,'as_recorded');
  }
}
export function checkStates(output) {
  assert.deepEqual([...new Set(output.records.map(r=>r.state))].sort(),['confirmed_none','not_recorded','recorded']);
  const environment=output.records.filter(r=>r.type==='environment');
  assert.equal(new Set(environment.map(r=>r.place)).size,2);
  for(const record of output.records.filter(r=>r.state!=='recorded')) assert.equal(Object.hasOwn(record,'value'),false);
  assert.ok(output.tasks.some(task=>task.completion==='pending'));
  const none=output.records.filter(r=>r.state==='confirmed_none');
  assert.ok(none.length>=2);
  assert.ok(none.every(r=>r.method==='self_report'&&r.note.includes('week')));
}
export function checkPair(output) {
  const procedure=output.procedures[0];
  assert.ok(procedure.required_equipment.length>0);
  const hasAll=config=>procedure.required_equipment.every(id=>hasEquipment(config,id));
  assert.deepEqual(output.config.slice(0,2).map(hasAll),[true,false]);
  assert.deepEqual(output.config.slice(0,2).map(c=>c.communication),['real_time','delayed']);
}
export function checkPresets(output) {
  assert.deepEqual(output.config.map(c=>c.environment),['station','spacecraft','rover','surface_base']);
  const criteria=output.config.flatMap(c=>c.attention_criteria);
  assert.ok(criteria.length<=2);
  for(const criterion of criteria) {
    assert.equal(criterion.review_status,'demo');
    assert.equal(criterion.defined_by,'team demo');
    assert.equal(criterion.source,'team_defined');
  }
}
export function checkReferences(output) {
  const variableIds=new Set(variables().map(v=>v.id));
  const equipmentIds=new Set(equipment().map(e=>e.id));
  for(const record of output.records) assert.ok(variableIds.has(record.variable),record.variable);
  for(const config of output.config) {
    assert.equal(validateConfig(config).ok,true,JSON.stringify(validateConfig(config)));
    for(const id of config.available_equipment) assert.ok(equipmentIds.has(id),id);
  }
  for(const procedure of output.procedures) {
    for(const id of procedure.required_equipment) assert.ok(equipmentIds.has(id),id);
    for(const step of procedure.steps) if(step.records) assert.ok(variableIds.has(step.records),step.records);
  }
  const subjects=new Set(output.records.map(record=>record.subject));
  assert.equal(subjects.size,1,'scenario must contain one fictional record subject');
  const subject=[...subjects][0];
  const procedureIds=new Set(output.procedures.map(procedure=>procedure.id));
  const recordIds=new Set(output.records.map(record=>record.id));
  assert.ok(output.tasks.some(task=>procedureIds.has(task.procedure_id)),'demo task must link to its procedure');
  for(const task of output.tasks) {
    assert.equal(task.subject,subject,'task subject must match the fictional record subject');
    if(task.procedure_id!==undefined) assert.ok(procedureIds.has(task.procedure_id),'unknown task procedure');
    assert.ok(Array.isArray(task.result_ids),'task result_ids must be an array');
    for(const id of task.result_ids) assert.ok(recordIds.has(id),'unknown task result record');
  }
  for(const item of [...output.records,...output.config,...output.tasks,...output.procedures]) assert.equal(item.schema_version,SCHEMA_VERSION);
}

test('M05: reusable scenario contract',()=>checkScenario({generateScenario}));
test('M05-P1: same seed produces equal bytes and another seed changes ids and values',()=>{
  const first=build(1),repeat=build(1),other=build(2);
  assert.equal(JSON.stringify(first),JSON.stringify(repeat));
  assert.notEqual(first.records[0].id,other.records[0].id);
  assert.notDeepEqual(first.records.filter(r=>r.state==='recorded').map(r=>r.value),other.records.filter(r=>r.state==='recorded').map(r=>r.value));
});
test('M05-P2: actual core validates every record and all provenance is synthetic',()=>checkOrigins(build()));
test('M05-P3: gaps, confirmed-none weeks, two places and pending task survive',()=>checkStates(build()));
test('M05-P4: focal equipment and communication configurations differ',()=>checkPair(build()));
test('M05-P5: four environment presets and only explicitly demo criteria',()=>checkPresets(build()));
test('M05-X1: all actual mission/catalog references and saved schemas are valid',()=>checkReferences(build()));
test('M05: includes explicitly fictional old bone assessment, mood and nonclinical procedure',()=>{
  const output=build();
  const old=output.records.find(r=>r.variable==='bone_density');
  assert.equal(old.type,'exam');assert.equal(old.method,'dxa');
  assert.ok(old.time<'2026-01-01T00:00:00.000Z');
  const mood=output.records.filter(r=>r.variable==='mood');assert.ok(mood.length>0);
  for(const record of mood) {
    assert.equal(record.method,'self_report');assert.equal(record.unit,'team_scale_1_5');
    assert.ok(Number.isInteger(record.value)&&record.value>=1&&record.value<=5);
    assert.match(record.note,/not validated/);
  }
  for(const procedure of output.procedures) {
    assert.equal(procedure.review_status,'demo');assert.equal(procedure.source,'team_defined');
    assert.match(procedure.title,/fictional/i);assert.ok(procedure.steps.length>0);
  }
  assert.equal(new Set(output.records.map(r=>r.id)).size,output.records.length);
  assert.equal(new Set(output.config.map(c=>c.id)).size,output.config.length);
});
test('M05-X2: caller mutations do not leak into later generations',()=>{
  const expected=structuredClone(build());
  const changed=build();changed.records[0].origin='flight';changed.config[0].available_equipment.push('invented');
  changed.procedures[0].steps[0].text='changed';changed.tasks[0].completion='done';
  assert.deepEqual(build(),expected);
});
test('M05-X2: hostile seeds/options fail on a programming-argument boundary',()=>{
  for(const seed of [undefined,null,'1',{},[],NaN,Infinity,-1,1.5,4294967296,1n]) assert.throws(()=>generateScenario({seed}),TypeError);
  for(const options of [undefined,null,[],1,'seed',{}, {seed:1,extra:true}]) assert.throws(()=>generateScenario(options),TypeError);
  let called=false;const accessor={};Object.defineProperty(accessor,'seed',{enumerable:true,get(){called=true;return 1;}});
  assert.throws(()=>generateScenario(accessor),TypeError);assert.equal(called,false);
  const symbol={seed:1,[Symbol('extra')]:1};assert.throws(()=>generateScenario(symbol),TypeError);
});
test('M05-X3: fresh processes produce identical JSON bytes',()=>{
  const expected=JSON.stringify(build());
  const source=`import {generateScenario} from ${JSON.stringify(new URL('./index.js',import.meta.url).href)};process.stdout.write(JSON.stringify(generateScenario({seed:1})));`;
  for(let i=0;i<2;i++) {
    const child=spawnSync(process.execPath,['--input-type=module','-e',source],{encoding:'utf8',timeout:10000});
    assert.equal(child.status,0,child.stderr);assert.equal(child.stdout,expected);
  }
});
test('M05-X3: no ambient clock or random generator is read',()=>{
  const random=Math.random,now=Date.now;
  try {
    Math.random=()=>{throw new Error('Ambient randomness read');};Date.now=()=>{throw new Error('Ambient clock read');};
    checkOrigins(build());
  } finally {Math.random=random;Date.now=now;}
});
