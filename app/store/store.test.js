import test from 'node:test';
import assert from 'node:assert/strict';
import * as store from './index.js';
import {checkStoreBehavior} from './contract-checks.js';
import {checkStore} from '../../tests/contract/store.js';

test('M04 memory passes shared behavior and inherited contract',async()=>{
  await checkStoreBehavior(store,assert);
  await checkStore(store);
});
test('M04 fails visibly when IndexedDB or options are unavailable',async()=>{
  for(const options of [null,[],{}, {kind:'other'},{kind:'memory',name:''},{kind:'memory',name:null}]) {
    const result=await store.openStore(options);assert.equal(result.ok,false);assert.ok(result.error.message.length>0);
  }
  const result=await store.openStore({kind:'indexeddb'});
  assert.equal(result.ok,false);assert.equal(result.error.code,'unavailable');
});

test('M04-R1: loading ten thousand records in batches is not quadratic (a whole collection is not validated again on every write)', async () => {
  const store = (await (await import('./index.js')).openStore({kind: 'memory', name: 'perf'})).value;
  const make = i => ({id: `r${i}`, schema_version: 2, type: 'measurement', state: 'recorded', variable: 'glucose', value: 5 + (i % 10) / 10, unit: 'mmol/L', method: 'm', time: '2026-11-15T10:00:00.000Z', origin: 'terrestrial', source: 'x', mission_phase: 'source_observation', subject: 's'});
  const started = Date.now();
  for (let i = 0; i < 9990; i += 256) { const r = await store.saveBatch('records', Array.from({length: Math.min(256, 9990 - i)}, (_, k) => make(i + k))); assert.equal(r.ok, true, JSON.stringify(r.error)); }
  const took = Date.now() - started;
  assert.ok(took < 2500, `9,990 records took ${took} ms; the quadratic version took about 4,500 ms here`);
  assert.equal((await store.list('records', {})).value.length, 9990);
  const refused = await store.saveBatch('records', [make(1)]); assert.equal(refused.ok, false, 'a duplicate id is still refused'); assert.equal((await store.list('records', {})).value.length, 9990, 'a refused write leaves the collection untouched');
});
