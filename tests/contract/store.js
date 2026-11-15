import assert from 'node:assert/strict';
import {record} from './samples.js';
import {success,failure} from './assertions.js';
export async function checkStore(m) {
  const store=success(await m.openStore({kind:'memory',name:'contract'}));
  try {
    assert.equal(store.status().kind,'memory'); assert.equal(store.status().persistent,false);
    const original=structuredClone(record);
    assert.deepEqual(success(await store.save('records',original)),record);
    original.origin='flight';
    assert.deepEqual(success(await store.get('records',record.id)),record);
    failure(await store.save('records',record));
    failure(await store.updateState('records',record.id,{state:'confirmed_none'}));
    assert.deepEqual(success(await store.list('records',{subject:'other'})),[]);
    failure(await store.saveBatch('records',[{...record,id:'batch'},record]));
    assert.deepEqual(success(await store.list('records',{})),[record]);
    failure(await store.save('records',{...record,id:'bad',schema_version:999}));
    failure(await store.save('records',null));
  } finally { await store.close(); }
}
