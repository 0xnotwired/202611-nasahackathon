import assert from 'node:assert/strict';
import {procedure,config,context,record} from './samples.js';
import {success,failure} from './assertions.js';
export async function checkProcedures(m,{store:storage}) {
  assert.deepEqual(success(m.validateProcedure(procedure)),procedure);
  for(const invalid of [null,{}, {...procedure,steps:'wrong'}, {...procedure,version:''}]) failure(m.validateProcedure(invalid));
  assert.equal(m.availability(procedure,config).available,true);
  const unavailable=m.availability(procedure,{...config,available_equipment:[]});
  assert.equal(unavailable.available,false); assert.deepEqual(unavailable.missing,['demo-device']);
  assert.equal(unavailable.alternative_id,undefined);
  const store=success(await storage.openStore({kind:'memory',name:'procedures-contract'}));
  try {
    const blocked=success(await m.start(store,procedure,{...config,available_equipment:[]},{...context,subject:record.subject}));
    assert.equal(blocked.state,'blocked');
    const execution=success(await m.start(store,procedure,config,{...context,newId:()=> 'execution',subject:record.subject}));
    assert.equal(execution.procedure_version,'1');
    assert.equal(success(await m.interrupt(store,execution.id,{reason:'demo interruption'})).state,'interrupted');
    assert.equal(success(await m.resume(store,execution.id)).state,'in_progress');
    assert.equal(success(await m.advance(store,execution.id,{})).procedure_version,'1');
    await m.finish(store,execution.id,{state:'completed',difficulties:[]});
    assert.equal(success(await store.get('executions',execution.id)).state,'completed');
  } finally {await store.close();}
}
