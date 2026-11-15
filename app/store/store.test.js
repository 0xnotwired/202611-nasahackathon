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
  for(const options of [null,[],{}, {kind:'other'},{kind:'memory',name:''}]) {
    const result=await store.openStore(options);assert.equal(result.ok,false);assert.ok(result.error.message.length>0);
  }
  const result=await store.openStore({kind:'indexeddb'});
  assert.equal(result.ok,false);assert.equal(result.error.code,'unavailable');
});
