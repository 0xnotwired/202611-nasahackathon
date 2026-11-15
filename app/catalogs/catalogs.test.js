import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as implementation from './index.js';
import {checkCatalogs} from '../../tests/contract/catalogs.js';

const items=(module,name,...args)=>{
  const output=module[name](...args);
  assert.ok(Array.isArray(output),`${name} must return a catalog array`);
  return output;
};
const catalog=Object.fromEntries(Object.keys(implementation).map(name=>[name,(...args)=>items(implementation,name,...args)]));

// Independent document parser for source reading levels; handles quoted CSV cells.
function rows(text) {
  const result=[]; let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(c==='"') {if(quoted&&text[i+1]==='"') {field+='"';i++;} else quoted=!quoted;}
    else if(c===','&&!quoted) {row.push(field);field='';}
    else if(c==='\n'&&!quoted) {row.push(field.replace(/\r$/,''));result.push(row);row=[];field='';}
    else field+=c;
  }
  if(field||row.length) {row.push(field);result.push(row);}
  return result;
}
const matrix=rows(await readFile(new URL('../../docs/RESEARCH_MATRIX_B.csv',import.meta.url),'utf8'));
const readingIndex=matrix[0].indexOf('reading_level');
const readingLevels=new Map(matrix.slice(1).map(row=>[row[0],row[readingIndex]]));
const keys=(items,expected)=>{for(const item of items) assert.deepEqual(Object.keys(item).sort(),[...expected].sort());};

export function checkReferences(implementation) {
  const available=new Set(items(implementation,'sources').map(s=>s.id));
  for(const observation of items(implementation,'observations')) {
    assert.ok(observation.source_ids.length>0,observation.id);
    for(const id of observation.source_ids) assert.ok(available.has(id),`${observation.id}: missing ${id}`);
  }
}
export function checkSpecificSources(implementation) {
  const observation=id=>items(implementation,'observations').find(o=>o.id===id);
  assert.deepEqual(observation('fatigue').source_ids,['S09']);
  assert.deepEqual(observation('vision').source_ids,['S12']);
}
export function checkReadingLevels(implementation) {
  for(const source of items(implementation,'sources')) if(source.id.startsWith('B')) {
    assert.ok(readingLevels.has(source.id),source.id);
    assert.equal(source.reading_level,readingLevels.get(source.id),source.id);
  }
}
export function checkShapes(implementation) {
  keys(items(implementation,'observations'),['id','label','source_ids']);
  keys(items(implementation,'variables'),['id','label','unit','type']);
  keys(items(implementation,'equipment'),['id','label']);
  keys(items(implementation,'sources'),['id','citation','reading_level','url']);
}
export function checkMood(implementation) {
  const mood=items(implementation,'variables').find(v=>v.id==='mood');
  assert.equal(mood.type,'observation');
  assert.equal(mood.unit,'team_scale_1_5');
  assert.match(mood.label,/team scale 1–5/);
  assert.match(mood.label,/not validated/);
  assert.match(mood.label,/not a screening/);
  assert.doesNotMatch(mood.label,/Beck|Profile of Mood States|PHQ|POMS/);
}

test('M03: reusable catalog suite',()=>checkCatalogs(catalog));
test('M03-P1: every observation points to an existing source',()=>checkReferences(catalog));
test('M03-P2: fatigue and vision retain their specific evidence',()=>checkSpecificSources(catalog));
test('M03-P3: B source reading levels equal the independent research matrix',()=>checkReadingLevels(catalog));
test('M03-P4: every item has exactly its contracted keys',()=>checkShapes(catalog));
test('M03-P5: mood is an explicitly unvalidated team self-report',()=>checkMood(catalog));
test('M03: glucose metadata preserves source-unit uncertainty',()=>{
  const glucose=catalog.variables().find(v=>v.id==='glucose');
  assert.equal(glucose.unit,'as_recorded');
  assert.match(glucose.label,/mg\/dL or mmol\/L as recorded/);
  assert.match(glucose.label,/no conversion/);
});
test('M03: required observations and source levels are present without diagnoses',()=>{
  assert.deepEqual(catalog.observations().map(o=>o.id),['skin','congestion','headache','back_pain','sleep','nausea_dizziness','fatigue','vision','other']);
  for(const source of catalog.sources()) {
    assert.ok(['FT','AB','S'].includes(source.reading_level));
    assert.match(source.url,/^https:\/\//);
    assert.ok(source.citation.length>0);
  }
  assert.doesNotMatch(JSON.stringify(catalog.observations()),/diagnosis|normal_range|normal_value|threshold|depression|syndrome/i);
});
for(const name of ['observations','variables','equipment','sources']) test(`M03-X1: ${name} callers cannot alter shared catalog data`,()=>{
  const expected=structuredClone(catalog[name]());
  const mutated=catalog[name]();
  mutated[0].id='changed';mutated.push({id:'added'});
  if(name==='observations') mutated[0].source_ids.push('B99');
  assert.deepEqual(catalog[name](),expected);
});
test('M03-X2: ignored hostile extra arguments cannot change no-argument catalogs',()=>{
  for(const name of ['observations','variables','equipment','sources']) {
    const expected=catalog[name]();
    for(const extra of [null,[],{},'x'.repeat(100000),Infinity]) assert.deepEqual(catalog[name](extra),expected);
  }
});
