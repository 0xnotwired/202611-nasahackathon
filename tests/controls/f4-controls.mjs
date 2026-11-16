import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const R=new URL('../../',import.meta.url).pathname;
const sha=s=>createHash('sha256').update(s).digest('hex').slice(0,12);
const T={I:'app/ui/i-feel-different/i-feel-different.test.js',C:'app/copilot/copilot.test.js',E:'app/episode/episode.test.js'};
const IM='app/ui/i-feel-different/model.js', CI='app/copilot/index.js', EI='app/episode/index.js';
const M=[
 ['F4-a: summary text not saved','I','app/summary/index.js',[["const saved = await store.save('summaries',","const saved = await store.save('records_unused_never',"]]],
 ['F4-b: share leaves the summary out','I',IM,[["...(lastSummary ? [`summary:${lastSummary.id}`] : [])","...[]"]]],
 ['F4-c: ground ignores the summary','I','app/ui/ground/model.js',[["if (typeof id === 'string' && id.startsWith('summary:'))","if (false)"]]],
 ['F1-a: oversized rules file accepted','C',CI,[["if (text.length > MAX_BYTES) return","if (false) return"]]],
 ['F1-b: stored rule replaced silently','C',CI,[["return failed('version_exists'","return ok(null) && failed('version_exists'"],["if (found.ok) { if (JSON.stringify(found.value.rule) === JSON.stringify(rule)) continue;","if (found.ok) { if (true) continue;"]]],
 ['F1-c: older version wins','C',CI,[["item.saved > newest.get(item.rule.id).saved ||","item.saved < newest.get(item.rule.id).saved ||"]]],
 ['F1-d: stored rules ignored by the card','I',IM,[["const card = ctx.copilot.card(s, ctx.config, found.rules);","const card = ctx.copilot.card(s, ctx.config, ctx.rules);"]]],
 ['F1-e: no caution on a draft rule','I',IM,[["caution: cautionOf(card.suggestion.review_status)}","caution: null}"]]],
 ['E-a: reopen without a reason','E',EI,[["if (!isPlain(options) || !isText(options.reason)) return fail('invalid_reason', 'reason', 'Say why the episode is being reopened');",""]]],
 ['E-b: reopen while another is open','E',EI,[["if (others.value.some(o => o.id !== e.id && !closed(o))) return fail(","if (false) return fail("]]],
 ['E-c: reopen forgets the earlier close','E',EI,[["reopened: [...history, {previous_closed: e.closed, at, reason: options.reason}]","reopened: history"]]],
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
