import {validateRecord,SCHEMA_VERSION} from '../core/index.js';

const COLLECTIONS=['records','executions','tasks','episodes','shared','deliveries','config'];
const MUTABLE=new Set(['executions','tasks','episodes','deliveries']);
const CAPACITY=10000; // Technical resource bound, never a clinical limit.
const own=(value,key)=>Object.hasOwn(value,key);
const fail=(code,field,message)=>({ok:false,error:{code,field,message}});
const invalid=field=>fail('invalid_field',field,`Invalid or missing field ${field}`);
const ok=value=>({ok:true,value});
const text=value=>typeof value==='string'&&value.trim().length>0&&value.length<=512&&!/[\u0000-\u001f]/.test(value);
const utc=value=>{
  if(typeof value!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value)) return false;
  const time=Date.parse(value);if(!Number.isFinite(time))return false;
  return new Date(time).toISOString()===value.replace(/(?:\.(\d{1,3}))?Z$/,(_,fraction='')=>'.'+fraction.padEnd(3,'0')+'Z');
};

// Reject accessors and cyclic/non-JSON data before any adapter sees the input.
function snapshot(input) {
  let nodes=0;const seen=new Set();
  function visit(value,depth=0) {
    if(++nodes>20000||depth>12) throw 0;
    if(value===null||typeof value==='boolean') return value;
    if(typeof value==='string') {if(value.length>16384)throw 0;return value;}
    if(typeof value==='number') {if(!Number.isFinite(value))throw 0;return value;}
    if(typeof value!=='object'||seen.has(value)) throw 0;
    const array=Array.isArray(value);
    if(Object.getPrototypeOf(value)!==(array?Array.prototype:Object.prototype)&&Object.getPrototypeOf(value)!==null)throw 0;
    const keys=Reflect.ownKeys(value);
    if(keys.length>(array?2049:64))throw 0;
    seen.add(value);const result=array?[]:{};
    if(array&&keys.length!==value.length+1)throw 0;
    for(const key of keys) {
      if(array&&key==='length')continue;
      if(typeof key!=='string'||key.length>128||['__proto__','constructor','prototype'].includes(key))throw 0;
      if(array&&!/^(0|[1-9]\d*)$/.test(key))throw 0;
      const descriptor=Object.getOwnPropertyDescriptor(value,key);
      if(!descriptor?.enumerable||!own(descriptor,'value'))throw 0;
      Object.defineProperty(result,key,{value:visit(descriptor.value,depth+1),enumerable:true,writable:true,configurable:true});
    }
    seen.delete(value);return result;
  }
  try{return ok(visit(input));}catch{return invalid('object');}
}
function normalize(collection,input,stored=false) {
  const copied=snapshot(input);if(!copied.ok)return copied;
  const object=copied.value;
  if(!object||Array.isArray(object)||typeof object!=='object')return invalid('object');
  if(!text(object.id))return invalid('id');
  if(collection!=='records'&&!stored&&!own(object,'schema_version'))object.schema_version=SCHEMA_VERSION;
  if(object.schema_version!==SCHEMA_VERSION)return fail('schema_version','schema_version',`Unsupported schema_version; expected ${SCHEMA_VERSION}`);
  if(collection==='records')return validateRecord(object);
  if(own(object,'subject')&&!text(object.subject))return invalid('subject');
  return ok(object);
}
function filterData(input) {
  const copied=snapshot(input);if(!copied.ok)return invalid('filter');
  const filter=copied.value;
  if(!filter||Array.isArray(filter)||typeof filter!=='object')return invalid('filter');
  for(const [key,value] of Object.entries(filter)) {
    if(key==='from'||key==='to') {if(!utc(value))return invalid(key);}
    else if(value!==null&&!['string','number','boolean'].includes(typeof value))return invalid(key);
  }
  if(filter.from&&filter.to&&Date.parse(filter.from)>Date.parse(filter.to))return invalid('to');
  return ok(filter);
}
function matches(object,filter) {
  for(const [key,value] of Object.entries(filter)) {
    if(key==='from'||key==='to') {
      if(!utc(object.time))return false;
      const time=Date.parse(object.time);
      if(key==='from'&&time<Date.parse(value))return false;
      if(key==='to'&&time>=Date.parse(value))return false;
    } else if(!own(object,key)||object[key]!==value)return false;
  }
  return true;
}
function provenance(objects) {
  const subjects=new Map();
  for(const object of objects) {
    const kind=object.origin==='synthetic'?'synthetic':'real';
    if(subjects.has(object.subject)&&subjects.get(object.subject)!==kind)return fail('subject_origin','subject','A known subject cannot mix synthetic and non-synthetic records');
    subjects.set(object.subject,kind);
  }
  return ok(true);
}
function load(collection,values) {
  const map=new Map();
  if(values.length>CAPACITY)return fail('capacity','collection','Collection exceeds the supported technical capacity');
  for(const value of values) {
    const checked=normalize(collection,value,true);if(!checked.ok)return checked;
    if(map.has(checked.value.id))return fail('duplicate','id','Duplicate stored id');
    map.set(checked.value.id,checked.value);
  }
  if(collection==='records') {const checked=provenance(map.values());if(!checked.ok)return checked;}
  return ok(map);
}
function memoryBackend() {
  const collections=new Map(COLLECTIONS.map(name=>[name,new Map()]));
  return {
    async transact(collection,write,operation) {
      const loaded=load(collection,[...collections.get(collection).values()]);if(!loaded.ok)return loaded;
      const outcome=operation(loaded.value);if(!outcome.ok)return outcome;
      if(write)collections.set(collection,loaded.value);
      return outcome;
    },
    close(){}
  };
}
function indexedBackend(db) {
  return {
    transact(collection,write,operation) {
      return new Promise(resolve=>{
        let outcome;
        let transaction;
        try {
          transaction=db.transaction(collection,write?'readwrite':'readonly');
          const store=transaction.objectStore(collection);
          const request=store.getAll(undefined,CAPACITY+1);
          request.onsuccess=()=>{
            try {
              const loaded=load(collection,request.result);
              outcome=loaded.ok?operation(loaded.value):loaded;
              if(!outcome.ok){transaction.abort();return;}
              if(write) {
                // Snapshot comparison chooses add vs put, preserving duplicate semantics.
                const original=new Map(request.result.map(value=>[value.id,value]));
                for(const [id,value] of loaded.value) {
                  if(!original.has(id))store.add(value);
                  else if(JSON.stringify(original.get(id))!==JSON.stringify(value))store.put(value);
                }
              }
            } catch {outcome=fail('storage_error','object','IndexedDB operation could not be completed');transaction.abort();}
          };
          transaction.oncomplete=()=>resolve(outcome??fail('storage_error','transaction','IndexedDB completed without a result'));
          transaction.onabort=()=>resolve(outcome?.ok===false?outcome:fail('storage_error','transaction','IndexedDB transaction aborted'));
          transaction.onerror=()=>{}; // onabort settles; never reinterpret a write error as success.
        } catch {resolve(fail('storage_error','transaction','IndexedDB transaction is unavailable'));}
      });
    },
    close(){db.close();}
  };
}
function makeStore(kind,backend) {
  let closed=false;
  function access(collection,write,operation) {
    if(closed)return Promise.resolve(fail('closed','store','Store is closed'));
    if(!COLLECTIONS.includes(collection))return Promise.resolve(invalid('collection'));
    return backend.transact(collection,write,operation);
  }
  function insert(collection,objects) {
    return access(collection,true,map=>{
      const ids=new Set();
      for(const object of objects) {
        if(map.has(object.id)||ids.has(object.id))return fail('duplicate','id','An object with this id already exists');
        ids.add(object.id);
      }
      if(map.size+objects.length>CAPACITY)return fail('capacity','collection','Collection technical capacity exceeded');
      if(collection==='records') {
        const checked=provenance([...map.values(),...objects]);if(!checked.ok)return checked;
      }
      for(const object of objects)map.set(object.id,object);
      return ok(objects.length);
    });
  }
  return Object.freeze({
    status(){return kind==='memory'?{kind,persistent:false,reason:'In-memory storage only; closing this instance loses its data'}:{kind,persistent:true};},
    async save(collection,input) {
      if(closed)return fail('closed','store','Store is closed');
      if(!COLLECTIONS.includes(collection))return invalid('collection');
      const checked=normalize(collection,input);if(!checked.ok)return checked;
      const result=await insert(collection,[checked.value]);return result.ok?ok(structuredClone(checked.value)):result;
    },
    async get(collection,id) {
      if(closed)return fail('closed','store','Store is closed');
      if(!text(id))return invalid('id');
      return access(collection,false,map=>map.has(id)?ok(structuredClone(map.get(id))):fail('not_found','id','No object with this id exists'));
    },
    async list(collection,input={}) {
      if(closed)return fail('closed','store','Store is closed');
      const checked=filterData(input);if(!checked.ok)return checked;
      return access(collection,false,map=>ok([...map.values()].filter(value=>matches(value,checked.value)).map(value=>structuredClone(value))));
    },
    async saveBatch(collection,input) {
      if(closed)return fail('closed','store','Store is closed');
      if(!COLLECTIONS.includes(collection))return invalid('collection');
      if(!Array.isArray(input)||input.length>2048)return invalid('objects');
      const copied=snapshot(input);if(!copied.ok)return copied;
      const objects=[];
      for(const object of copied.value){const checked=normalize(collection,object);if(!checked.ok)return checked;objects.push(checked.value);}
      return insert(collection,objects);
    },
    async updateState(collection,id,input) {
      if(closed)return fail('closed','store','Store is closed');
      if(!MUTABLE.has(collection))return fail('immutable','collection','Only executions, tasks, episodes and deliveries allow updateState');
      if(!text(id))return invalid('id');
      const copied=snapshot(input);if(!copied.ok)return copied;
      const changes=copied.value;
      if(!changes||typeof changes!=='object'||Array.isArray(changes))return invalid('changes');
      return access(collection,true,map=>{
        if(!map.has(id))return fail('not_found','id','No object with this id exists');
        const previous=map.get(id);
        for(const field of ['id','subject','schema_version'])if(own(changes,field)&&changes[field]!==previous[field])return invalid(field);
        const checked=normalize(collection,{...previous,...changes},true);if(!checked.ok)return checked;
        map.set(id,checked.value);return ok(structuredClone(checked.value));
      });
    },
    async close(){if(!closed){closed=true;backend.close();}}
  });
}

/** Open explicitly selected storage. No implicit memory fallback is ever made. */
export async function openStore(input) {
  const copied=snapshot(input);if(!copied.ok)return invalid('options');
  const options=copied.value;
  if(!options||Array.isArray(options)||typeof options!=='object')return invalid('options');
  if(!['memory','indexeddb'].includes(options.kind))return invalid('kind');
  if(Object.keys(options).some(key=>!['kind','name'].includes(key)))return invalid('options');
  const name=own(options,'name')?options.name:'orbita';if(!text(name))return invalid('name');
  if(options.kind==='memory')return ok(makeStore('memory',memoryBackend()));
  let factory;
  try {factory=globalThis.indexedDB;}catch{return fail('unavailable','indexeddb','IndexedDB is unavailable; explicitly choose memory storage if appropriate');}
  if(!factory||typeof factory.open!=='function')return fail('unavailable','indexeddb','IndexedDB is unavailable; explicitly choose memory storage if appropriate');
  return new Promise(resolve=>{
    let request;let settled=false;
    const finish=result=>{if(!settled){settled=true;resolve(result);}else if(result.ok)result.value.close();};
    try {request=factory.open(name,1);}catch{finish(fail('unavailable','indexeddb','IndexedDB could not be opened'));return;}
    request.onupgradeneeded=()=>{
      const db=request.result;
      for(const collection of COLLECTIONS)if(!db.objectStoreNames.contains(collection))db.createObjectStore(collection,{keyPath:'id'});
    };
    request.onerror=()=>finish(fail('unavailable','indexeddb','IndexedDB open failed; no memory fallback was made'));
    request.onblocked=()=>finish(fail('unavailable','indexeddb','IndexedDB open is blocked by another connection'));
    request.onsuccess=()=>{
      const db=request.result;
      if(COLLECTIONS.some(collection=>!db.objectStoreNames.contains(collection))){db.close();finish(fail('schema_version','schema_version','IndexedDB schema is incomplete'));return;}
      db.onversionchange=()=>db.close();
      finish(ok(makeStore('indexeddb',indexedBackend(db))));
    };
  });
}
