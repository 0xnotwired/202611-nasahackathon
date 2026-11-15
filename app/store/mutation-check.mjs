// Deliberate negative controls; temporary mutants are never imported by app/.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {checkStoreBehavior} from './contract-checks.js';

const original=await readFile(new URL('./index.js',import.meta.url),'utf8');
const source=original.replace("'../core/index.js'",JSON.stringify(new URL('../core/index.js',import.meta.url).href));
const mutations=[
 ['M04-P1 overwrite',source.replace('if(map.has(object.id)||ids.has(object.id))','if(ids.has(object.id))')],
 ['M04-P2 mutable history',source.replace("new Set(['executions','tasks','episodes','deliveries'])","new Set(['records','shared','executions','tasks','episodes','deliveries'])")],
 ['M04-P4 unknown version',source.replace('if(object.schema_version!==SCHEMA_VERSION)','if(false)')],
 ['M04-P5 persistent memory',source.replace('kind,persistent:false','kind,persistent:true')],
 ['M04-P6 subject filter',source.replace("} else if(!own(object,key)||object[key]!==value)return false;","} else if(false)return false;")],
 ['M04-X1 time bounds',source.replace("if(key==='to'&&time>=Date.parse(value))return false;","if(false)return false;")],
 ['M04-X1 closed store',source.replace('closed=true;backend.close();','closed=false;backend.close();')],
 ['M04-X1 detached reads',source.replace('const checked=normalize(collection,value,true);','const checked=ok(value);').replace('ok(structuredClone(map.get(id)))','ok(map.get(id))')],
 ['M04-X2 provenance',source.replace('function provenance(objects) {','function provenance(objects) { return ok(true);')]
];
const temp=await mkdtemp(join(tmpdir(),'orbita-m04-mutants-'));
try {
 for(const [index,[name,mutant]] of mutations.entries()) {
  assert.notEqual(mutant,source,name+' mutation must apply');
  const path=join(temp,`mutant-${index}.mjs`);await writeFile(path,mutant);
  const module=await import(pathToFileURL(path));
  await assert.rejects(()=>checkStoreBehavior(module,assert),{code:'ERR_ASSERTION'},name+' must fail an assertion');
  console.log('DETECTED '+name);
 }
 // Partial-batch algorithmic mutant uses real single writes without rollback.
 const actual=await import('./index.js');
 const partial={async openStore(options){
   const opened=await actual.openStore(options);if(!opened.ok)return opened;
   const store=opened.value;
   return {ok:true,value:{...store,async saveBatch(collection,objects){
     if(!Array.isArray(objects))return store.saveBatch(collection,objects);
     let n=0;for(const object of objects){const result=await store.save(collection,object);if(!result.ok)return result;n++;}return {ok:true,value:n};
   }}};
 }};
 await assert.rejects(()=>checkStoreBehavior(partial,assert),{code:'ERR_ASSERTION'});
 console.log('DETECTED M04-P3 partial batch');
} finally {await rm(temp,{recursive:true,force:true});}
