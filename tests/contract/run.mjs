// Run a domain suite directly. A placeholder MUST produce exit status 1.
// node tests/contract/run.mjs core --reference
// node tests/contract/run.mjs all
import {contracts} from './registry.js';
import * as store from './fakes/storage.js';
const target=process.argv[2]??'all';
// The reference remains runnable after M01 retires its placeholder entry.
const selected=target==='core'&&process.argv.includes('--reference')
  ? [{name:'core',suite:'./core.js',check:'checkCore'}]
  : contracts.filter(c=>target==='all'||c.name===target);
if(!selected.length) throw new Error(`Unknown interface: ${target}`);
for(const entry of selected) {
  const implementation=process.argv.includes('--reference')&&entry.name==='core'
    ?await import('./fakes/core.js'):await import(new URL(entry.path,import.meta.url));
  const check=(await import(new URL(entry.suite,import.meta.url)))[entry.check];
  try {await check(implementation,entry.name==='importers'?undefined:{store});console.log(`PASS ${entry.name}`);}
  catch(error) {
    console.error(`FAIL ${entry.name}: ${error.code??error.name}: ${error.message}`);
    process.exitCode=1;
  }
}
