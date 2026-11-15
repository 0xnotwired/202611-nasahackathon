import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {request} from 'node:http';
import {createAppServer} from '../../scripts/serve.mjs';

export function get(server,path,method='GET',host) {
  return new Promise((resolve,reject)=>{
    const req=request({hostname:'127.0.0.1',port:server.address().port,path,method,
      headers:host?{Host:host}:{}},res=>{
      let body=''; res.setEncoding('utf8'); res.on('data',chunk=>body+=chunk);
      res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));
    }); req.on('error',reject); req.end();
  });
}
export async function exerciseServer(create=createAppServer) {
  const dir=await mkdtemp(join(tmpdir(),'orbita-server-'));
  const root=join(dir,'app'); await mkdir(root); await mkdir(join(root,'contracts')); await mkdir(join(dir,'app-old'));
  await writeFile(join(dir,'AGENTS.md'),'OUTSIDE_CANARY Órbita');
  await writeFile(join(dir,'app-old','secret.txt'),'SIBLING_CANARY');
  await writeFile(join(root,'index.html'),'<h1>Fixture shell</h1>');
  await writeFile(join(root,'module.js'),'export const ready=true;');
  await symlink(join(dir,'AGENTS.md'),join(root,'escape.txt'));
  const server=create({root});
  try {
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
    assert.equal(server.address().address,'127.0.0.1');
    assert.equal((await get(server,'/index.html')).status,200);
    assert.equal((await get(server,'/')).status,200);
    for(const path of ['/../AGENTS.md','/%2e%2e/AGENTS.md','/../app-old/secret.txt','/%252e%252e/AGENTS.md','/escape.txt','/contracts/','/missing','/bad%00','/bad%5cname','/bad%ZZ','//outside/path']) {
      const result=await get(server,path);
      assert.ok([400,403,404].includes(result.status),`reject ${path}: ${result.status}`);
      assert.doesNotMatch(result.body,/CANARY|Órbita/);
    }
    assert.equal((await get(server,'/index.html','POST')).status,405);
    assert.equal((await get(server,'/index.html','GET','attacker.example')).status,403);
    const head=await get(server,'/index.html','HEAD');
    assert.equal(head.status,200); assert.equal(head.body,'');
    assert.match((await get(server,'/module.js')).headers['content-type'],/^text\/javascript/);
  } finally {await new Promise(resolve=>server.close(resolve)); await rm(dir,{recursive:true,force:true});}
}
test('HTTP server confines files and enforces methods, host and media types',()=>exerciseServer());
