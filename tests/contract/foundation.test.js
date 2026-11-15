import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {contracts,implementedContracts,implementedViews,expectedExports} from './registry.js';
import {checkCore} from './core.js';
import * as reference from './fakes/core.js';
import * as store from './fakes/storage.js';

for(const entry of contracts) test(`${entry.name}: suite rejects its placeholder on an assertion`,async()=>{
  const m=await import(new URL(entry.path,import.meta.url));
  assert.deepEqual(Object.keys(m).sort(),expectedExports[entry.name].split(' ').sort(),`${entry.name} exports`);
  const checker=(await import(new URL(entry.suite,import.meta.url)))[entry.check];
  await assert.rejects(()=>checker(m,entry.name==='importers'?undefined:{store}),{code:'ERR_ASSERTION'});
  // Check the temporary unavailable contract independently of the domain suite.
  for(const [name,fn] of Object.entries(m)) if(typeof fn==='function') {
    for(const args of [[],[null],[{},''],['x'.repeat(100000)]]) {
      const output=fn(...args);
      const expectedAsync=name==='model'||name==='openStore'||['series','latest','baseline','environment','cumulative'].includes(name)||
        ['procedures','plan','episode','summary'].includes(entry.name)&&!['validateProcedure','availability'].includes(name)||
        entry.name==='privacy'&&name!=='createSession'||entry.name==='sync'&&name!=='createLink';
      assert.equal(output instanceof Promise,expectedAsync,`${entry.name}.${name} async boundary`);
      const result=await output;
      assert.equal(result.ok,false); assert.equal(result.error.code,'not_implemented');
      assert.equal(typeof result.error.message,'string'); assert.ok(result.error.message.length>0);
    }
  }
});

for(const entry of implementedContracts) test(`${entry.name}: reviewed implementation passes its reusable contract`,async()=>{
  const m=await import(new URL(entry.path,import.meta.url));
  assert.deepEqual(Object.keys(m).sort(),expectedExports[entry.name].split(' ').sort());
  const checker=(await import(new URL(entry.suite,import.meta.url)))[entry.check];
  const actualStore=await import('../../app/store/index.js');
  await checker(m,{store:actualStore});
});

for(const entry of implementedViews) test(`${entry.name}: implemented view exports model and mount and its model answers a ViewModel without a DOM`,async()=>{
  const m=await import(new URL(entry.path,import.meta.url));
  assert.deepEqual(Object.keys(m).sort(),expectedExports[entry.name].split(' ').sort());
  const vm=await m.model({},{});
  assert.ok(['loading','empty','error','ready'].includes(vm.state),'view must return a ViewModel');
  if(vm.state==='empty') assert.equal(typeof vm.reason,'string');
  assert.equal(typeof m.mount,'function');
});

test('core: reference fake passes the reusable suite',()=>checkCore(reference));
for(const mutation of ['state','origin','method','missing-state']) test(`core: ${mutation} corruption is detected`,async()=>{
  const broken={...reference};
  if(mutation==='missing-state') broken.createRecord=(fields,context)=>reference.createRecord({...fields,state:fields.state??'confirmed_none'},context);
  else if(mutation==='method') broken.areComparable=(a,b)=>a.method!==b.method?{comparable:true}:reference.areComparable(a,b);
  else broken.validateRecord=data=>{
    const result=reference.validateRecord(data);
    if(result.ok) {
      if(mutation==='state'&&result.value.state==='not_recorded') result.value.state='confirmed_none';
      if(mutation==='origin') delete result.value.origin;
    }
    return result;
  };
  await assert.rejects(()=>checkCore(broken),{code:'ERR_ASSERTION'});
});

export function documentFields(markdown) {
  const block=markdown.split('```\nRecord\n')[1].split('```')[0];
  const shapes={Record:[]}; let current='Record';
  for(const line of block.split('\n')) {
    if(/^[A-Z][A-Za-z]+$/.test(line)) {current=line; shapes[current]=[];continue;}
    const field=line.replace(/ \([^)]*\)/g,'').match(/^  ([a-z][a-z_]*(?:\?)?(?:, [a-z][a-z_]*(?:\?)?)*)/);
    if(field) shapes[current].push(...field[1].split(', ').map(s=>s.replace('?','')));
    if(/^  time\s/.test(line)) shapes[current].push('interval');
  }
  return shapes;
}
export function jsdocFields(source) {
  const shapes={};
  for(const block of source.matchAll(/\/\*\*([\s\S]*?)\*\//g)) {
    const name=block[1].match(/@typedef \{Object\} (\w+)/)?.[1];
    if(name) shapes[name]=[...block[1].matchAll(/@property \{[^\n]+\} (\[?\w+\]?)/g)].map(m=>m[1].replace(/[\[\]]/g,''));
  }
  return shapes;
}
const docs=await readFile(new URL('../../docs/CONTRACTS.md',import.meta.url),'utf8');
const types=await readFile(new URL('../../app/contracts/data.js',import.meta.url),'utf8');
const sorted=shapes=>Object.fromEntries(Object.entries(shapes).map(([k,v])=>[k,v.sort()]));
test('data fields match the authoritative document for every shape',()=>{
  assert.deepEqual(sorted(jsdocFields(types)),sorted(documentFields(docs)));
});
test('field comparison notices a renamed origin',()=>{
  assert.notDeepEqual(sorted(jsdocFields(types.replace('} origin','} provenance'))),sorted(documentFields(docs)));
});
test('package has no dependencies',async()=>{
  const pkg=JSON.parse(await readFile(new URL('../../package.json',import.meta.url)));
  assert.equal(pkg.type,'module');
  assert.deepEqual(pkg.dependencies??{},{}); assert.deepEqual(pkg.devDependencies??{},{});
  assert.equal(pkg.scripts.test,'node --test');
});

test('export surface check detects removed BaseUI entry points', async()=>{
  const original=await import('../../app/ui/base/index.js');
  const expected=expectedExports['ui/base'].split(' ').sort();
  for(const name of ['valueWithContext','accessibleTable','lineChart']) {
    const broken={...original}; delete broken[name];
    assert.throws(()=>assert.deepEqual(Object.keys(broken).sort(),expected),{code:'ERR_ASSERTION'});
  }
});
