/** Portable contract checker: same function runs against memory and IndexedDB.
 * No Node imports; browser caller supplies the real module and a fresh DB name.
 */
export async function checkStore(m, options = {}) {
  const fail=message=>{const error=new Error(message);error.code='ERR_ASSERTION';throw error;};
  const expect=(condition,message)=>{if(!condition) fail(message);};
  const normalize=value=>Array.isArray(value)?value.map(normalize):value&&typeof value==='object'
    ?Object.fromEntries(Object.keys(value).sort().map(key=>[key,normalize(value[key])])):value;
  const equal=(actual,expected,message)=>expect(JSON.stringify(normalize(actual))===JSON.stringify(normalize(expected)),message);
  const success=result=>{expect(result?.ok===true,'Valid store operation must succeed');return result.value;};
  const failure=result=>{expect(result?.ok===false&&typeof result.error?.code==='string'&&result.error.code!=='not_implemented','Invalid operation needs an implemented error');};
  const kind=options.kind??'memory';
  const record={id:'007',schema_version:1,type:'measurement',state:'recorded',variable:'demo_variable',value:12,unit:'demo_unit',method:'demo_instrument',time:'2026-11-15T12:00:00.000Z',origin:'synthetic',source:'user_entered',mission_phase:'demo',subject:'demo-subject'};
  const store=success(await m.openStore({kind,name:options.name??'contract'}));
  try {
    expect(store.status().kind===kind,'Actual backend must match request');
    expect(store.status().persistent===(kind==='indexeddb'),'Persistence status must match backend');
    if(kind==='memory') expect(typeof store.status().reason==='string'&&store.status().reason.length>0,'Memory status needs a reason');
    const original=structuredClone(record);
    equal(success(await store.save('records',original)),record,'Save changed record');
    original.origin='flight';
    equal(success(await store.get('records',record.id)),record,'Saved object aliases input');
    failure(await store.save('records',record));
    failure(await store.updateState('records',record.id,{state:'confirmed_none'}));
    equal(success(await store.list('records',{subject:'other'})),[],'Subject filter leaked another subject');
    failure(await store.saveBatch('records',[{...record,id:'batch'},record]));
    equal(success(await store.list('records',{})),[record],'Failed batch was partially saved');
    failure(await store.saveBatch('records',[{...record,id:'fresh-duplicate'},{...record,id:'fresh-duplicate'}]));
    failure(await store.get('records','fresh-duplicate'));
    failure(await store.save('records',{...record,id:'bad',schema_version:999}));
    failure(await store.save('records',null));
    const read=success(await store.get('records',record.id));read.value=999;
    equal(success(await store.get('records',record.id)),record,'Get aliases stored state');
    const concurrent=await Promise.all([store.save('records',{...record,id:'concurrent'}),store.save('records',{...record,id:'concurrent'})]);
    expect(concurrent.filter(result=>result.ok).length===1,'Concurrent duplicate writes must have exactly one winner');
    const before=success(await store.list('records',{}));
    failure(await store.saveBatch('records',[{...record,id:'valid-batch'}, {...record,id:'invalid-batch',origin:'unknown'}]));
    equal(success(await store.list('records',{})),before,'Invalid batch changed existing data');
    const shared={id:'shared',schema_version:1,subject:record.subject,time:record.time,what:[record.id],with:'team demo',channel:'simulated'};
    success(await store.save('shared',shared));
    failure(await store.updateState('shared',shared.id,{what:[]}));
    equal(success(await store.get('shared',shared.id)),shared,'Shared history was changed');
    return {kind,checked:'shared store contract'};
  } finally {await store.close();}
}
