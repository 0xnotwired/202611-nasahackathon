import assert from 'node:assert/strict';
export async function checkCatalogs(m) {
  const sources=m.sources(); assert.ok(Array.isArray(sources));
  const ids=new Set(sources.map(s=>s.id));
  for(const [name,fields] of Object.entries({observations:['id','label','source_ids'],variables:['id','label','unit','type'],equipment:['id','label'],sources:['id','citation','reading_level','url']})) {
    const entries=m[name](); assert.ok(Array.isArray(entries),name);
    assert.ok(entries.length>0,name);
    assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
    for(const entry of entries) for(const field of fields) assert.ok(Object.hasOwn(entry,field),field);
  }
  for(const o of m.observations()) {assert.ok(o.source_ids.length>0); for(const id of o.source_ids) assert.ok(ids.has(id));}
}
