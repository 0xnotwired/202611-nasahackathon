import assert from 'node:assert/strict';
import {context,record} from './samples.js';
import {success,failure} from './assertions.js';
export async function checkPrivacy(m,{store:storage}) {
  const session=m.createSession(context);
  assert.equal(typeof session.active,'function');
  assert.equal(session.active(),false);
  session.unlock(); assert.equal(session.active(),true);
  session.unlock(); assert.equal(session.active(),true);
  session.close(); assert.equal(session.active(),false);
  const store=success(await storage.openStore({kind:'memory',name:'privacy-contract'}));
  try {
    const fields={subject:record.subject,what:[record.id],with:'demo recipient',channel:'simulated'};
    const shared=success(await m.logShared(store,fields,context));
    assert.deepEqual(shared,{...fields,id:'007',schema_version:1,time:context.clock()});
    assert.deepEqual(success(await m.sharedLog(store,{subject:'other'})),[]);
    assert.deepEqual(success(await m.sharedLog(store,{subject:record.subject})),[shared]);
    failure(await m.logShared(store,{...fields,subject:''},context));
  } finally {await store.close();}
}
