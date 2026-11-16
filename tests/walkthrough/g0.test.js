import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {cp,mkdtemp,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {contracts} from '../contract/registry.js';

const root=fileURLToPath(new URL('../../',import.meta.url));
const run=(command,args,cwd=root)=>spawnSync(command,args,{cwd,encoding:'utf8',timeout:30000});

test('G0-W1: direct runners reject every placeholder and accept the core reference',()=>{
  const red=run(process.execPath,['tests/contract/run.mjs','all']);
  assert.equal(red.error,undefined); assert.equal(red.status,1);
  const failures=red.stderr.split('\n').filter(line=>line.startsWith('FAIL '));
  assert.equal(failures.length,contracts.length);
  for(const entry of contracts) assert.ok(failures.some(line=>line.startsWith(`FAIL ${entry.name}: ERR_ASSERTION:`)),entry.name);
  const green=run(process.execPath,['tests/contract/run.mjs','core','--reference']);
  assert.equal(green.error,undefined); assert.equal(green.status,0);
  assert.equal(green.stdout.trim(),'PASS core');
});

test('G0-W3: documentation checks pass and missing experiment is detected',async()=>{
  const green=run('python3',['scripts/check_docs.py']);
  assert.equal(green.error,undefined); assert.equal(green.status,0,green.stdout+green.stderr);
  assert.match(green.stdout,/OK: 2 consistent matrices; 26 modules/);
  const temp=await mkdtemp(join(tmpdir(),'orbita-g0-docs-'));
  try {
    // Copy only documentation inputs. No .git, credentials, data or dependencies.
    await cp(join(root,'docs'),join(temp,'docs'),{recursive:true});
    await cp(join(root,'demo'),join(temp,'demo'),{recursive:true});
    await cp(join(root,'scripts'),join(temp,'scripts'),{recursive:true});
    for(const name of ['README.md','AGENTS.md','CLAUDE.md','LICENSE']) await cp(join(root,name),join(temp,name));
    // AGENTS now links to the user-authorized local skill snapshot. Copy only
    // linked documentation inputs; never include private agent configuration.
    for(const name of ['.agents/SKILLS_SOURCE.json','.agents/skills/README.md','.agents/skills/red-team/README.md']) {
      await mkdir(dirname(join(temp,name)),{recursive:true});
      await cp(join(root,name),join(temp,name));
    }
    // Establish parity before the mutation so missing copied files cannot fake red.
    const control=run('python3',['scripts/check_docs.py'],temp);
    assert.equal(control.status,0,control.stdout+control.stderr);
    const boardPath=join(temp,'docs/modules.csv');
    const board=await readFile(boardPath,'utf8');
    // Any pending module will do: its record is removed from the temporary copy first, so the control does not depend on how far the project has got.
    const chosen=board.split('\n').find(line=>/^M\d\d,/.test(line)&&line.endsWith(',pending'));
    assert.ok(chosen,'control needs a pending module');
    const id=chosen.split(',')[0];
    await rm(join(temp,'docs/experiments',id+'.md'),{force:true});
    assert.equal(existsSync(join(temp,'docs/experiments',id+'.md')),false);
    const mutated=board.replace(chosen,chosen.replace(/,pending$/,',in_review'));
    assert.notEqual(mutated,board);
    await writeFile(boardPath,mutated);
    const red=run('python3',['scripts/check_docs.py'],temp);
    assert.equal(red.error,undefined); assert.equal(red.status,1);
    assert.ok(red.stdout.includes(`${id} is in_review but docs/experiments/${id}.md does not exist`),red.stdout);
  } finally {await rm(temp,{recursive:true,force:true});}
});
