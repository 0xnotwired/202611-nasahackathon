/** Same integration operations in Node/memory and a real browser/IndexedDB.
 * No node imports or DOM dependencies. All records here are synthetic.
 */
export async function runG1Operations(api, options = {}) {
  const kind=options.kind??'memory';
  const name=options.name??'orbita-g1';
  const expect=(condition,message)=>{if(!condition) throw new Error(message);};
  const normalize=value=>Array.isArray(value)?value.map(normalize):value&&typeof value==='object'
    ?Object.fromEntries(Object.keys(value).sort().map(key=>[key,normalize(value[key])])):value;
  const equal=(a,b,message)=>expect(JSON.stringify(normalize(a))===JSON.stringify(normalize(b)),message);
  const good=result=>{expect(result?.ok===true,`Expected success: ${JSON.stringify(result)}`);return result.value;};
  const bad=result=>{
    expect(result?.ok===false&&typeof result.error?.code==='string'&&result.error.code!=='not_implemented','Expected implemented error Result');
    expect(typeof result.error.message==='string'&&result.error.message.length>0,'Error must explain failure');
    return result.error;
  };
  const scenario=api.generateScenario({seed:1});
  expect(Array.isArray(scenario.records)&&scenario.records.length>0,'Scenario must contain records');
  const expected=structuredClone(scenario.records);
  for(const state of ['recorded','confirmed_none','not_recorded']) expect(expected.some(r=>r.state===state),`Missing ${state}`);
  for(const record of expected) {
    expect(record.origin==='synthetic','Only synthetic records belong to the scenario');
    good(api.validateRecord(record));
  }
  const store=good(await api.openStore({kind,name}));
  try {
    equal(Object.keys(store).sort(),['status','save','get','list','saveBatch','updateState','close'].sort(),'Store exposes an undeclared mutation or deletion API');
    expect(store.status().kind===kind,'Backend status must name actual kind');
    expect(store.status().persistent===(kind==='indexeddb'),'Persistence must match actual backend');
    if(kind==='memory') expect(typeof store.status().reason==='string'&&store.status().reason.length>0,'Memory needs an explicit reason');
    good(await store.saveBatch('records',scenario.records));
    // Changing the input after save cannot alter stored history.
    scenario.records[0].source='gate-mutated-input';
    for(const record of expected) equal(good(await store.get('records',record.id)),record,`Record ${record.id} changed on save`);
    const ordered=records=>[...records].sort((a,b)=>a.id.localeCompare(b.id));
    equal(ordered(good(await store.list('records',{}))),ordered(expected),'Round-trip records differ');
    const first=expected[0];
    const absent=expected.find(r=>r.state==='not_recorded');
    const gap=good(await store.get('records',absent.id));
    expect(gap.state==='not_recorded'&&!Object.hasOwn(gap,'value'),'Missing measurement became a value or reassurance');
    bad(await store.save('records',{...first,source:'gate-overwrite'}));
    bad(await store.saveBatch('records',[{...first,id:'gate-atomic-before'},first,{...first,id:'gate-atomic-after'}]));
    bad(await store.get('records','gate-atomic-before'));
    bad(await store.get('records','gate-atomic-after'));
    bad(await store.updateState('records',first.id,{state:'confirmed_none'}));
    equal(good(await store.get('records',first.id)),first,'Immutable record was changed');
    const shared={id:'gate-shared',schema_version:1,subject:first.subject,time:first.time,what:[first.id],with:'team demo',channel:'simulated'};
    good(await store.save('shared',shared));
    bad(await store.updateState('shared',shared.id,{what:[]}));
    equal(good(await store.get('shared',shared.id)),shared,'Shared audit entry changed');
    const invalid={...first,id:'gate-invalid'};delete invalid.origin;
    bad(await store.save('records',invalid));
    bad(await store.saveBatch('records',[{...first,id:'gate-valid-before-invalid'},invalid]));
    bad(await store.get('records','gate-valid-before-invalid'));
    const futureError=bad(await store.save('records',{...first,id:'gate-future',schema_version:api.SCHEMA_VERSION+1}));
    expect(/version/i.test(futureError.message+futureError.field),'Unknown schema version needs a named explanation');
    const other={...first,id:'gate-other-record',subject:'gate-other-subject'};
    good(await store.save('records',other));
    const own=good(await store.list('records',{subject:first.subject}));
    equal(ordered(own),ordered(expected.filter(r=>r.subject===first.subject)),'Subject isolation filter failed');
    const slice=good(await store.list('records',{subject:first.subject,from:first.time,to:first.time}));
    equal(slice,[],'Half-open empty time range must be empty');
    const until=new Date(Date.parse(first.time)+1).toISOString();
    const atTime=good(await store.list('records',{subject:first.subject,from:first.time,to:until}));
    equal(ordered(atTime),ordered(expected.filter(r=>r.subject===first.subject&&Date.parse(r.time)===Date.parse(first.time))),'Time range discarded or incorrect');
    bad(await store.list('records',{from:'yesterday'}));
    bad(await store.list('records',{from:until,to:first.time}));
    // Never mix NASA/terrestrial data into an established synthetic subject.
    bad(await store.save('records',{...first,id:'gate-provenance',origin:'ground_analog'}));
    bad(await store.saveBatch('records',[{...first,id:'gate-partition-a',subject:'gate-new-subject'},
      {...first,id:'gate-partition-b',subject:'gate-new-subject',origin:'terrestrial'}]));
    bad(await store.get('records','gate-partition-a'));
    const detached=good(await store.get('records',first.id));detached.source='gate-mutated-output';
    equal(good(await store.get('records',first.id)),first,'Read result aliases stored data');
    return {records:expected.length,states:['recorded','confirmed_none','not_recorded'],kind,
      checks:['round_trip','absence','immutable_records','immutable_shared','atomic_batch','schema','subject','time_range','provenance','detached_values']};
  } finally {
    await store.close();
    await store.close();
    bad(await store.get('records',expected[0].id));
  }
}
