import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const R=new URL('../../',import.meta.url).pathname;
const sha=s=>createHash('sha256').update(s).digest('hex').slice(0,12);
const T={Q:'app/ui/my-plan/my-plan.test.js',O:'app/ui/on-board/on-board.test.js',L:'app/plan/plan.test.js'};
const LI='app/plan/index.js', PM='app/ui/my-plan/model.js', OM='app/ui/on-board/model.js';
const M=[
 ['F7: no retries','L',LI,[["const RETRIES = 12;","const RETRIES = 1;"]]],
 ['F11a: a value from before the task is a result','L',LI,[["if (Date.parse(found.value.time) < Date.parse(from)) return fail(","if (false) return fail("]]],
 ['F11b: a value with no time is a result','L',LI,[["if (typeof found.value.time !== 'string' || Number.isNaN(Date.parse(found.value.time))) return fail(","if (false) return fail("]]],
 ['F11c: fractional minutes accepted by the plan','L',LI,[["!Number.isInteger(input.planned_minutes) ||","typeof input.planned_minutes !== 'number' ||"]]],
 ['F11d: the screen offers values from before the task','Q',PM,[[" && typeof r.time === 'string' && Date.parse(r.time) >= from)",")"]]],
 ['F11e: 0x10 accepted as minutes','Q',PM,[["/^\\d{1,5}$/.test(String(v).trim())","!Number.isNaN(Number(v))"]]],
 ['F10: retire message hides the version offered next','O',OM,[[" Version ${after.version} is offered again: check it is the one you want."," "]]],
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
