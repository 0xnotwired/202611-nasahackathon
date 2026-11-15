// Test-only, platform-independent behavior suite used in Node and real Chromium.
export async function checkStoreBehavior(module, assert, {kind='memory',name='m04-contract'}={}) {
  const time='2026-11-15T12:00:00.000Z';
  const record={id:'r1',schema_version:1,type:'measurement',state:'recorded',variable:'demo_variable',value:0,unit:'demo_unit',method:'demo_instrument',time,origin:'synthetic',source:'user_entered',mission_phase:'demo',subject:'A'};
  const opened=await module.openStore({kind,name}); assert.equal(opened.ok,true,JSON.stringify(opened));
  const store=opened.value;
  const good=r=>{assert.equal(r.ok,true,JSON.stringify(r));return r.value;};
  const bad=r=>{assert.equal(r.ok,false);assert.equal(typeof r.error.code,'string');assert.ok(r.error.message.length>0);};
  try {
    const status=store.status(); assert.equal(status.kind,kind);assert.equal(status.persistent,kind==='indexeddb');
    if(kind==='memory') assert.ok(status.reason.length>0);
    const input=structuredClone(record); assert.deepEqual(good(await store.save('records',input)),record);
    input.value=999;
    bad(await store.save('records',{...record,value:9}));
    assert.deepEqual(good(await store.get('records','r1')),record);
    const output=good(await store.get('records','r1')); output.value=999;
    assert.deepEqual(good(await store.get('records','r1')),record);
    bad(await store.updateState('records','r1',{state:'confirmed_none'}));
    bad(await store.updateState('records','r1',{value:1}));
    assert.deepEqual(good(await store.get('records','r1')),record);
    const shared=good(await store.save('shared',{id:'shared',subject:'A',time,what:['r1'],with:'team demo',channel:'simulated'}));
    assert.equal(shared.schema_version,1);
    bad(await store.updateState('shared','shared',{channel:'changed'}));
    assert.deepEqual(good(await store.get('shared','shared')),shared);
    bad(await store.saveBatch('records',[{...record,id:'before'},record,{...record,id:'after'}]));
    assert.deepEqual(good(await store.list('records',{})).map(x=>x.id),['r1']);
    bad(await store.saveBatch('records',[{...record,id:'before'},{...record,id:'invalid',method:''}]));
    assert.deepEqual(good(await store.list('records',{})).map(x=>x.id),['r1']);
    bad(await store.save('records',{...record,id:'future',schema_version:2}));
    bad(await store.save('tasks',{id:'future-task',schema_version:2}));
    const more=[{...record,id:'b',subject:'B',value:-1},{...record,id:'later',time:'2026-11-16T12:00:00.000Z'}];
    assert.equal(good(await store.saveBatch('records',more)),2);
    assert.deepEqual(good(await store.list('records',{subject:'A'})).map(x=>x.id).sort(),['later','r1']);
    assert.deepEqual(good(await store.list('records',{subject:'A',from:time,to:'2026-11-16T12:00:00.000Z'})).map(x=>x.id),['r1']);
    assert.deepEqual(good(await store.list('records',{from:time,to:time})),[]);
    bad(await store.list('records',{from:'2026-02-30T00:00:00Z'}));
    bad(await store.list('records',{from:'2027-01-01T00:00:00Z',to:time}));
    bad(await store.list('records',{subject:[]}));
    bad(await store.save('records',{...record,id:'wrong-origin',origin:'flight'}));
    bad(await store.saveBatch('records',[{...record,id:'new-synthetic',subject:'new'},{...record,id:'new-real',subject:'new',origin:'terrestrial'}]));
    assert.deepEqual(good(await store.list('records',{subject:'new'})),[]);
    const originRace=await Promise.all([store.save('records',{...record,id:'origin-race-synthetic',subject:'origin-race'}),store.save('records',{...record,id:'origin-race-real',subject:'origin-race',origin:'flight'})]);
    assert.equal(originRace.filter(x=>x.ok).length,1);
    assert.equal(good(await store.list('records',{subject:'origin-race'})).length,1);
    const race=await Promise.all([store.save('records',{...record,id:'race'}),store.save('records',{...record,id:'race'})]);
    assert.equal(race.filter(x=>x.ok).length,1);
    for(const collection of ['executions','tasks','episodes','deliveries']) {
      good(await store.save(collection,{id:'mutable',subject:'A',state:'pending'}));
      assert.equal(good(await store.updateState(collection,'mutable',{state:'done'})).state,'done');
      for(const changes of [{id:'other'},{subject:'B'},{schema_version:2}]) bad(await store.updateState(collection,'mutable',changes));
    }
    for(const collection of ['unknown','__proto__',null]) bad(await store.list(collection,{}));
    bad(await store.get('records','missing')); bad(await store.get('records',7));
    bad(await store.save('records',null)); bad(await store.saveBatch('records',{}));
    let invoked=0; const hostile={id:'hostile'};Object.defineProperty(hostile,'value',{enumerable:true,get(){invoked++;return 1;}});
    bad(await store.save('records',hostile));assert.equal(invoked,0);
    const cycle={id:'cycle'};cycle.self=cycle;bad(await store.save('tasks',cycle));
    await store.close();await store.close();
    for(const result of [await store.get('records','r1'),await store.list('records',{}),await store.save('records',record),await store.saveBatch('records',[]),await store.updateState('tasks','mutable',{state:'done'})]) {
      bad(result);assert.equal(result.error.code,'closed');
    }
  } finally {await store.close();}
}
