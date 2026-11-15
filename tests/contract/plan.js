import assert from 'node:assert/strict';
import {record} from './samples.js';
import {success,failure} from './assertions.js';
export async function checkPlan(m,{store:storage}) {
  const store=success(await storage.openStore({kind:'memory',name:'plan-contract'}));
  const query={subject:record.subject,day:'2026-11-15'};
  try {
    assert.deepEqual(success(await m.tasksFor(store,query)),[]);
    assert.deepEqual(success(await m.progress(store,query)),{total:0,done:0,not_done:0,pending:0});
    const task={id:'task',schema_version:1,...query,description:'Non-clinical fixture',assigned_by:'team_defined',completion:'pending',result_ids:[]};
    success(await store.save('tasks',task));
    assert.equal(success(await m.tasksFor(store,query)).length,1);
    assert.deepEqual(success(await m.tasksFor(store,{...query,subject:'other'})),[]);
    const marked=success(await m.mark(store,task.id,{completion:'done'}));
    assert.equal(marked.completion,'done'); assert.deepEqual(marked.result_ids,[]);
    failure(await m.mark(store,task.id,{completion:'invented'}));
    success(await store.save('records',record));
    assert.deepEqual(success(await m.linkResult(store,task.id,record.id)).result_ids,[record.id]);
  } finally {await store.close();}
}
