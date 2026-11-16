import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const R=new URL('../../',import.meta.url).pathname;
const sha=s=>createHash('sha256').update(s).digest('hex').slice(0,12);
const T={Q:'app/ui/my-plan/my-plan.test.js',O:'app/ui/on-board/on-board.test.js',P:'app/procedures/procedures.test.js'};
const PI='app/procedures/index.js', OM='app/ui/on-board/model.js', PM='app/ui/my-plan/model.js';
const M=[
 ['RV-F1: a not-recorded entry is a step record','P',PI,[["if (found.value.state !== 'recorded') return fail('not_a_result', 'record'","if (false) return fail('not_a_result', 'record'"]]],
 ['RV-F9: retired: ids allowed','P',PI,[["if (checked.value.id.startsWith('retired:')) return fail","if (false) return fail"]]],
 ['RV-F2: zone-less dates accepted','Q',PM,[[String.raw`|| !/^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d(\.\d+)?)?Z$/.test(f.scheduled_at.trim())`,""]]],
 ['RV-F2b: impossible date accepted','Q',PM,[[" || new Date(f.scheduled_at.trim()).toISOString().slice(0, 10) !== f.scheduled_at.trim().slice(0, 10)",""]]],
 ['RV-F3: an old execution evidences today','Q',PM,[["const fits = (e, task) => typeof e.updated","const fits = (e, task) => true || typeof e.updated"]]],
 ['RV-F4: history prints null','Q',PM,[["h.at ?? 'time not recorded'","h.at"]]],
 ['RV-F4b: marks carry no time','Q',PM,[["{completion: 'done', clock: ctx.clock})","{completion: 'done'})"]]],
 ['RV-F5: a stale execution still saves a record','O',OM,[["if (found.value.state !== 'in_progress') return msg('error', `Not saved: this execution is","if (false) return msg('error', `Not saved: this execution is"]]],
 ['RV-F5b: a default method is invented','O',OM,[["if (!isText(typeof input.method === 'string' ? input.method.trim() : '')) return msg(","if (false) return msg("],["method: input.method.trim(),","method: typeof input.method === 'string' && input.method.trim() ? input.method.trim() : 'self_report',"]]],
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
