import assert from 'node:assert/strict';
import {record,context} from './samples.js';
import {success,failure} from './assertions.js';
export async function checkSync(m,{store:storage}) {
  const link=m.createLink({...context,mode:'no_link',delay_ms:1000});
  assert.equal(typeof link.setMode,'function');
  const store=success(await storage.openStore({kind:'memory',name:'sync-contract'}));
  try {
    failure(await m.enqueue(store,'unshared',context));
    assert.deepEqual(success(await m.received(store,{})),[]);
    const shared={id:'shared',schema_version:1,subject:record.subject,time:record.time,what:[record.id],with:'team demo',channel:'simulated'};
    success(await store.save('shared',shared));
    const delivery=success(await m.enqueue(store,shared.id,context)); assert.equal(delivery.shared_id,shared.id);
    await m.advance(store,link,context);
    assert.deepEqual(success(await m.received(store,{})),[]);
    link.setMode('real_time'); await m.advance(store,link,context); await m.advance(store,link,context);
    assert.equal(success(await m.received(store,{subject:record.subject})).length,1);
    assert.deepEqual(success(await m.received(store,{subject:'other'})),[]);
  } finally {await store.close();}
}
