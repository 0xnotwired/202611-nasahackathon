import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const R=new URL('../../',import.meta.url).pathname;
const sha=s=>createHash('sha256').update(s).digest('hex').slice(0,12);
const T={N:'app/ui/nasa-cases/nasa-cases.test.js',S:'app/store/store.test.js',R:'tests/walkthrough/g5-realfiles.test.js',I:'app/importers/importers.test.js'};
const NM='app/ui/nasa-cases/model.js', PF='app/ui/nasa-cases/profiles.js', II='app/importers/index.js', SI='app/store/index.js';
const M=[
 ['F5-a: CRF caveats removed','N',PF,[["    caveats: Object.freeze([","    caveats: Object.freeze([]), _unused: Object.freeze(["]]],
 ['F5-b: unread columns dropped silently','N',II,[["unread_columns:headers.filter(h=>!allowed.has(h))","unread_columns:[]"]]],
 ['F5-c: the memory store revalidates the whole collection on every write','S',SI,[["const loaded={ok:true,value:new Map(collections.get(collection))};","const loaded=load(collection,[...collections.get(collection).values()]);if(!loaded.ok)return loaded;"]]],
 ['F5-d: one kept batch of 1000 records','N',NM,[["const KEEP_BATCH = 256;","const KEEP_BATCH = 1000;"]]],
 ['F5-e: removal without the confirmation','N',NM,[["if (!plain(input) || own(input, 'confirmed') !== true) return message(","if (false) return message("]]],
 ['F5-f: kept cases are not restored','N',NM,[["  const records = await opened.value.list('records', {}); const cards","  return null; const records = await opened.value.list('records', {}); const cards"]]],
 ['F5-g: a file is marked kept although nothing was written','N',NM,[["  const mine = all.value.filter(record => fileKeyOf(record) === card.file_key);","  const mine = all.value.filter(record => fileKeyOf(record) === card.file_key); if (mine.length) { card.kept = true; }"]]],
 ['F5-h: an empty cell becomes a rejected row instead of not recorded','R',II,[["const raw=row[column],absent=missing(raw);","const raw=row[column],absent=false&&missing(raw);"]]],
 ['F5-i: the importer reads the wrong column for pulse','R',II,[["const CRF_COLUMNS=['Pulse','SysBP',","const CRF_COLUMNS=['SysBP','Pulse',"]]],
 ['F5r-F1: NA counted as free text','I',II,[["if(row[column]?.trim()&&!missing(row[column]))skipped.push","if(row[column]?.trim())skipped.push"]]],
 ['F5r-F2a: a kept card is trusted as it is','N',NM,[["const card = cleanCard(entry.card); if (card) good.push(card); else bad += 1;","const card = entry.card; if (card) good.push(card); else bad += 1;"]]],
 ['F5r-F2b: an unreadable kept store cannot be removed','N',NM,[["session.kept.unreadable = true; session.kept_reason","session.kept = null; session.kept_reason"]]],
 ['F5r-F3: records without a card come back bare','N',NM,[["for (const [key, list] of orphans) good.push(orphanCard(key, list));",""]]],
 ['F5r-F4: kept flags never refreshed','N',NM,[["async function refreshKept(services, session) {\n  if (!session.kept || session.kept.unreadable) return;","async function refreshKept(services, session) {\n  return;"]]],
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
