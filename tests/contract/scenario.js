import assert from 'node:assert/strict';
export async function checkScenario(m) {
  const data=m.generateScenario({seed:1});
  assert.ok(Array.isArray(data.records)); assert.ok(data.records.length>0);
  assert.deepEqual(data,m.generateScenario({seed:1}));
  assert.ok(data.config.length>=2);
  for(const r of data.records) assert.equal(r.origin,'synthetic');
  assert.ok(data.records.some(r=>r.state==='not_recorded'));
}
