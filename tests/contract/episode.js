import assert from 'node:assert/strict';
import {context,record,config} from './samples.js';
import {success,failure} from './assertions.js';
export async function checkEpisode(m,{store:storage}) {
  const store=success(await storage.openStore({kind:'memory',name:'episode-contract'}));
  try {
    const observation={...record,type:'observation'}; delete observation.value; delete observation.unit;
    success(await store.save('records',observation));
    const episode=success(await m.open(store,observation,{...context,newId:()=> 'episode'}));
    assert.equal(episode.subject,record.subject); assert.equal(episode.observation_id,record.id); assert.equal(episode.alert_issued,false);
    const situation=await m.situation(store,episode.id,config,context);
    for(const key of ['you_recorded','we_know','missing','you_can','happened','next']) assert.ok(Object.hasOwn(situation,key));
    await m.link(store,episode.id,{record_id:record.id});
    assert.ok(success(await store.get('episodes',episode.id)).record_ids.includes(record.id));
    await m.close(store,episode.id);
    assert.ok(success(await store.get('episodes',episode.id)).closed);
    failure(await m.open(store,null,context));
  } finally {await store.close();}
}
