import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const R=new URL('../../',import.meta.url).pathname;
const sha=s=>createHash('sha256').update(s).digest('hex').slice(0,12);
const T={I:'app/ui/i-feel-different/i-feel-different.test.js',C:'app/copilot/copilot.test.js',E:'app/episode/episode.test.js',S:'app/summary/summary.test.js',G:'app/ui/ground/ground.test.js'};
const IM='app/ui/i-feel-different/model.js', CI='app/copilot/index.js', EI='app/episode/index.js', SI='app/summary/index.js';
const M=[
 ['G4r-F1a: open ignores another open episode','E',EI,[["if (others.value.some(o => !closed(o))) return fail('another_episode_open', 'observation'","if (false) return fail('another_episode_open', 'observation'"]]],
 ['G4r-F1b: reopen not under the subject lock','E',EI,[["return serial(`subject/${first.value.subject}`, () => reopenLocked(store, episodeId, options));","return reopenLocked(store, episodeId, options);"]]],
 ['G4r-F1c: close without expect','E',EI,[[", {expect: {closed: loaded.value.closed === undefined ? null : loaded.value.closed}});",");"]]],
 ['G4r-F2a: reviewed rule without a caveat','I',IM,[["(status === 'reviewed' ? 'The status","(status === 'reviewed' ? null && 'The status"]]],
 ['G4r-F2b: alert without provenance','C',CI,[["{text: rule.alert, rule_id: rule.id, source: rule.source, version: rule.version, review_status: rule.review_status}","{text: rule.alert}"]]],
 ['G4r-F3a: a clash is not detected','C',CI,[["const found = await store.get('rules', id);","const found = {ok: false};"]]],
 ['G4r-F3b: unknown rule fields accepted','C',CI,[["if (unknown !== undefined) return `a rule has","if (false) return `a rule has"]]],
 ['G4r-F3c: @ allowed in ids','C',CI,[["rule.id.length > 100 || rule.id.includes('@')","false"]]],
 ['G4r-F3d: version tie-break not numeric','C',CI,[["'en', {numeric: true}) > 0)","'en', {numeric: false}) > 0)"]]],
 ['G4r-F4: environment readings unlabelled','S',SI,[["r.type === 'environment' ? `${r.variable ?? 'value'} (environment reading${r.place ? ` at ${r.place}` : ''}, not a personal measurement)` : r.variable ?? 'value'","r.variable ?? 'value'"]]],
 ['G4r-F5: no counter for a second summary','S',SI,[["for (let n = 1; n <= 50; n += 1)","for (let n = 1; n <= 1; n += 1)"]]],
 ['G4r-F7: help claims it was sent','I',IM,[["'Help was recorded on this device. Nothing has been sent yet:","'Help was requested and the alert was issued. Nothing has been sent yet:"]]],
 ['G4r-G: the ground panel shows another subject\'s summary','G','app/ui/ground/model.js',[["s.ok && s.value.subject === d.subject ? {id: s.value.id, text: s.value.text}","s.ok ? {id: s.value.id, text: s.value.text}"]]],
];
const only=process.argv[2];let bad=0;
for(const [label,tk,file,edits] of M){
  if(only&&!label.startsWith(only))continue;
  const path=R+file;const original=readFileSync(path,'utf8');const before=sha(original);let mutated=original;
  try{
    for(const [from,to] of edits){const n=mutated.split(from).length-1;if(n!==1)throw new Error(`pattern found ${n} times: ${from.slice(0,70)}`);mutated=mutated.replace(from,()=>to);}
    writeFileSync(path,mutated);
    const run=spawnSync('node',['--test',R+T[tk]],{encoding:'utf8',timeout:90000,cwd:R});
    const red=[...run.stdout.matchAll(/^not ok \d+ - ([\w/-]+)/gm)].map(m=>m[1]);if(run.status===null)red.push('TIMEOUT(hang)');
    console.log(`${red.length?'RED  ':'GREEN'} | ${label} | failing: ${red.join(', ')||'NONE (control not caught)'}`);
    if(!red.length)bad++;
  }catch(e){console.log(`ERROR | ${label} | ${e.message}`);bad++;}
  finally{writeFileSync(path,original);if(sha(readFileSync(path,'utf8'))!==before){console.log('RESTORE FAILED',file);process.exit(2);}}
}
console.log(bad?`${bad} control(s) not caught`:'all controls caught; files restored');
