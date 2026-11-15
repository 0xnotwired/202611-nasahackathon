import assert from 'node:assert/strict';
import {record,config,context} from './samples.js';
import {success} from './assertions.js';
export async function checkReadings(m,dependencies) {
  assert.equal(m.attention(record,config).status,'no_criterion');
  const criterion={id:'fixture',variable:record.variable,unit:record.unit,low:10,high:20,defined_by:'team demo',source:'team_defined',review_status:'demo'};
  const withCriterion={...config,attention_criteria:[criterion]};
  assert.equal(m.attention(record,withCriterion).status,'within');
  assert.equal(m.attention({...record,value:21},withCriterion).status,'outside');
  for(const data of [{...record,unit:'other'},{...record,value:undefined},{...record,state:'not_recorded'},{...record,state:'confirmed_none'}]) assert.equal(m.attention(data,withCriterion).status,'not_assessed');
  const store=success(await dependencies.store.openStore({kind:'memory',name:'readings-contract'}));
  try {
    const q={subject:record.subject,variable:record.variable,from:'2026-01-01T00:00:00Z',to:'2027-01-01T00:00:00Z'};
    assert.equal((await m.cumulative(store,q)).total,null);
    assert.equal((await m.series(store,q)).n,0);
    assert.equal((await m.latest(store,q,context)).record,null);
    success(await store.save('records',record));
    assert.equal((await m.series(store,q)).n,1);
    assert.equal((await m.series(store,{...q,subject:'other'})).n,0);
    assert.equal((await m.baseline(store,q)).n,1);
    assert.equal((await m.cumulative(store,q)).total,12);
    assert.deepEqual((await m.environment(store,{place:'missing',interval:{from:q.from,to:q.to}})).records,[]);
  } finally {await store.close();}
}
