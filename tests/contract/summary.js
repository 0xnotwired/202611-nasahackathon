import assert from 'node:assert/strict';
import {config,context,record} from './samples.js';
import {success,failure} from './assertions.js';
export async function checkSummary(m,{store:storage}) {
  const store=success(await storage.openStore({kind:'memory',name:'summary-contract'}));
  try {
    success(await store.save('records',record));
    success(await store.save('episodes',{id:'episode',schema_version:1,subject:record.subject,opened:record.time,observation_id:record.id,execution_ids:[],record_ids:[record.id],task_ids:[],alert_issued:false}));
    const result=success(await m.generate(store,'episode',config,context));
    assert.equal(typeof result.id,'string'); assert.ok(result.text.includes('synthetic'));
    assert.ok(result.origins.includes('synthetic')); assert.equal(result.pending_send,true);
    assert.deepEqual(success(await store.list('shared',{})),[]);
    assert.deepEqual(success(await store.list('deliveries',{})),[]);
    failure(await m.generate(store,'missing',config,context));
  } finally {await store.close();}
}
