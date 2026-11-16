import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const R=new URL('../../',import.meta.url).pathname;
const sha=s=>createHash('sha256').update(s).digest('hex').slice(0,12);
const T={Q:'app/ui/my-plan/my-plan.test.js',O:'app/ui/on-board/on-board.test.js',P:'app/procedures/procedures.test.js',L:'app/plan/plan.test.js',S:'app/store/store.test.js'};
const PI='app/procedures/index.js', LI='app/plan/index.js', OM='app/ui/on-board/model.js', PM='app/ui/my-plan/model.js', SI='app/store/index.js';
const M=[
 ['R-S1: expect ignored by the store','S',SI,[["expect=e;","expect=null;"]]],
 ['R-L1: task write unconditional','L',LI,[["{expect: {rev: Number.isInteger(task.rev) ? task.rev : null}}","{}"]]],
 ['R-L2: undo drops the linked results','L',LI,[["execution_id: null, not_done_note: null,","execution_id: null, not_done_note: null, result_ids: [],"]]],
 ['R-L3: undo keeps no history','L',LI,[["history: [...(Array.isArray(task.history) ? task.history : []), {completion: 'pending'","history: [{completion: 'pending'"]]],
 ['R-L4: undo allowed on a pending task','L',LI,[["if (task.completion === 'pending') return fail('not_marked'","if (false) return fail('not_marked'"]]],
 ['R-P1: execution write unconditional','P',PI,[["{expect: {rev: Number.isInteger(e.rev) ? e.rev : null}}","{}"]]],
 ['R-P2: start ignores the preparation','P',PI,[["context.preparation_confirmed !== true) return fail","context.preparation_confirmed === 'never') return fail"]]],
 ['R-P3: a step may record another variable','P',PI,[["if (declared !== null && found.value.variable !== declared) return fail('wrong_variable'","if (false) return fail('wrong_variable'"]]],
 ['R-P4: a recording step advances silently','P',PI,[["if (opts.value.no_record !== true) return fail('record_required'","if (false) return fail('record_required'"]]],
 ['R-P5: a retired version is still offered','P',PI,[["const retired = new Set(retirements.map(r => keyOf(r.procedure_id, r.version)));","const retired = new Set();"]]],
 ['R-O1: the screen offers a not-recorded entry as a result','Q',PM,[["r.state === 'recorded' && !task.result_ids.includes(r.id)","!task.result_ids.includes(r.id)"]]],
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
