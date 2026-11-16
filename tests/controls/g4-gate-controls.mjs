import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const R=new URL('../../',import.meta.url).pathname;
const sha=s=>createHash('sha256').update(s).digest('hex').slice(0,12);
const T={G:'tests/walkthrough/g4.test.js'};
const M=[
 ['G4-W1: a summary value differs from the history','G','app/summary/index.js',[["return isText(r.unit) && r.unit !== 'not_applicable' ? `${r.value} ${r.unit}` : `${r.value} (unit unknown)`;","return isText(r.unit) && r.unit !== 'not_applicable' ? `${r.value + 1} ${r.unit}` : `${r.value} (unit unknown)`;"]]],
 ['G4-W2: generating the summary shares and queues (enqueue from generate)','G','app/ui/i-feel-different/model.js',[["    generateSummary: run(async ctx => {\n      const e = await current(ctx); if (!e) return {message: msg('error', 'Not done: no episode is open.')};","    generateSummary: run(async ctx => {\n      const e = await current(ctx); if (!e) return {message: msg('error', 'Not done: no episode is open.')};\n      ctx.session.unlock(); await ctx.privacy.logShared(ctx.store, {subject: ctx.subject, what: [e.observation_id], with: 'x', channel: 'y'}, {clock: ctx.clock, newId: ctx.newId, session: ctx.session});"]]],
 ['G4-W3: a not-recorded value is written as 0 in the summary','G','app/summary/index.js',[["if (r.state === 'not_recorded') return 'not recorded';","if (r.state === 'not_recorded') return '0';"]]],
 ['G4-W4: the configuration is ignored by start','G','app/procedures/index.js',[["state: found.available ? 'in_progress' : 'blocked'","state: 'in_progress'"]]],
 ['G4-W4b: a delivery is received before the delay passes','G','app/sync/index.js',[["if (state === 'in_transit' && Date.parse(now) >= Date.parse(sent) + delay) state = 'received';","if (state === 'in_transit') state = 'received';"]]],
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
