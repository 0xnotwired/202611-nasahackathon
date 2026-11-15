// Collaborator fixture for domain suites, not a reference M04 implementation.
// Deliberately only implements the exercised storage protocol. No IndexedDB,
// validation or transaction guarantees; run checkStore on the real M04 later.
export async function openStore() {
  const collections=new Map();
  const data=name=>{if(!collections.has(name)) collections.set(name,new Map()); return collections.get(name);};
  const ok=value=>({ok:true,value:structuredClone(value)});
  const missing=()=>({ok:false,error:{code:'missing',message:'Missing object'}});
  return {ok:true,value:{
    status:()=>({kind:'memory',persistent:false}),
    async save(collection,object) {
      if(data(collection).has(object.id)) return {ok:false,error:{code:'duplicate',message:'Duplicate id'}};
      data(collection).set(object.id,structuredClone(object)); return ok(object);
    },
    async get(collection,id) {return data(collection).has(id)?ok(data(collection).get(id)):missing();},
    async list(collection,filter={}) {
      return ok([...data(collection).values()].filter(o=>Object.entries(filter).every(([k,v])=>o[k]===v)));
    },
    async updateState(collection,id,changes) {
      if(!data(collection).has(id)) return missing();
      const updated={...data(collection).get(id),...changes}; data(collection).set(id,updated); return ok(updated);
    },
    async close() {}
  }};
}
