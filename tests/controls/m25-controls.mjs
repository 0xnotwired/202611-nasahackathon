import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const R=new URL('../../',import.meta.url).pathname;
const sha=s=>createHash('sha256').update(s).digest('hex').slice(0,12);
const T={E:'app/export/export.test.js',V:'app/ui/review/review.test.js'};
const EI='app/export/index.js', RM='app/ui/review/model.js';
const M=[
 ['M25-a: formulas not neutralised in the CSV','E',EI,[["const FORMULA = /^[=+\\-@\\t\\r]/;","const FORMULA = /^$/;"]]],
 ['M25-b: an absent state written as 0','E',EI,[["state === 'recorded' && typeof record.value === 'number' ? record.value : null","typeof record.value === 'number' ? record.value : 0"]]],
 ['M25-c: no byte-order mark','E',EI,[["value: `\\uFEFF${lines.join(","value: `${lines.join("]]],
 ['M25-d: a file name keeps path characters','E',EI,[["replace(/[^A-Za-z0-9_-]+/g, '-')","replace(/[^A-Za-z0-9_\\/.-]+/g, '-')"]]],
 ['M25-e: all methods put on one line','V',RM,[["const group = inPeriod.filter(record => record.method === method);","const group = inPeriod;"]]],
 ['M25-f: the comparability rule is bypassed','V',RM,[["const verdict = ctx.core && typeof ctx.core.areComparable === 'function' ? ctx.core.areComparable(reference, latest) : {comparable: false, reason: 'the comparison rules are not available'};","const verdict = {comparable: true};"]]],
 ['M25-g: the period filter is ignored','V',RM,[["const inPeriod = found.timed.filter(record => Date.parse(record.time) >= start);","const inPeriod = found.timed;"]]],
 ['M25-h: the export reads every subject','V',RM,[["const listed = await ctx.store.list('records', {subject: ctx.subject}); if (!listed.ok) return {ok: false, error: {message: `The records could not be read: ${listed.error.message}`}};\n      const csv = ctx.exporter.recordsToCsv(listed.value);","const listed = await ctx.store.list('records', {}); if (!listed.ok) return {ok: false, error: {message: `The records could not be read: ${listed.error.message}`}};\n      const csv = ctx.exporter.recordsToCsv(listed.value);"]]],
 ['M25-i: an untimed value is placed anyway','V',RM,[["const timed = own.filter(record => typeof record.time === 'string' && !Number.isNaN(Date.parse(record.time)))","const timed = own.filter(record => true)"]]],
 ['M25-j: a different origin is compared','V',RM,[["if (reference.origin !== latest.origin) return {difference: null, text: 'Not compared: different origin.'};",""]]],
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
