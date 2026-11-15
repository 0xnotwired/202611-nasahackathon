"""Run M04's same adapter contract in real Chromium, including restart controls."""
from pathlib import Path
import json
import os
import re
import subprocess
import tempfile
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=ROOT,env={**os.environ,'PORT':'0'},stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
try:
    match=re.search(r'127\.0\.0\.1:(\d+)',server.stdout.readline())
    assert match,'server startup failed'
    url=f'http://127.0.0.1:{match[1]}/index.html'
    with tempfile.TemporaryDirectory(prefix='orbita-m04-profile-') as temp, sync_playwright() as p:
        profile=Path(temp)/'persistent'
        browser=p.chromium.launch_persistent_context(str(profile),executable_path='/usr/bin/chromium',headless=True)
        page=browser.new_page();page.goto(url)
        result=page.evaluate('''async()=>{
          const module=await import('/store/index.js');
          const {checkStoreBehavior}=await import('/store/contract-checks.js');
          const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
          const assert={equal(a,b,message=''){if(!Object.is(a,b))throw Error('equal '+message+' '+JSON.stringify([a,b]));},deepEqual(a,b){if(JSON.stringify(canonical(a))!==JSON.stringify(canonical(b)))throw Error('deepEqual '+JSON.stringify([a,b]));},ok(v,message=''){if(!v)throw Error('assert '+message);}};
          await checkStoreBehavior(module,assert,{kind:'memory'});
          await checkStoreBehavior(module,assert,{kind:'indexeddb',name:'m04-persistent'});
          return {memory:'passed',indexeddb:'passed'};
        }''')
        browser.close()
        browser=p.chromium.launch_persistent_context(str(profile),executable_path='/usr/bin/chromium',headless=True)
        page=browser.new_page();page.goto(url)
        restarted=page.evaluate('''async()=>{const m=await import('/store/index.js');const s=await m.openStore({kind:'indexeddb',name:'m04-persistent'});if(!s.ok)throw Error(JSON.stringify(s));const r=await s.value.get('records','r1');await s.value.close();return r;}''')
        expected={'id':'r1','schema_version':1,'type':'measurement','state':'recorded','variable':'demo_variable','value':0,'unit':'demo_unit','method':'demo_instrument','time':'2026-11-15T12:00:00.000Z','origin':'synthetic','source':'user_entered','mission_phase':'demo','subject':'A'}
        assert restarted=={'ok':True,'value':expected},restarted
        # Corrupt via raw IndexedDB, outside the product's public write boundary.
        corruption=page.evaluate('''async()=>{
          const m=await import('/store/index.js');
          const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('m04-persistent',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
          await new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite');tx.objectStore('records').put({id:'future',schema_version:3});tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});db.close();
          const opened=await m.openStore({kind:'indexeddb',name:'m04-persistent'});if(!opened.ok)throw Error(JSON.stringify(opened));
          const result=await opened.value.get('records','future');const listed=await opened.value.list('records',{});await opened.value.close();
          return {result,listed};
        }''')
        for r in corruption.values():
            assert r['ok'] is False and r['error']['code']=='schema_version',corruption
        browser.close()
        # A fresh persistent profile is the restart negative control.
        fresh=p.chromium.launch_persistent_context(str(Path(temp)/'fresh'),executable_path='/usr/bin/chromium',headless=True)
        page=fresh.new_page();page.goto(url)
        absent=page.evaluate('''async()=>{const m=await import('/store/index.js');const s=await m.openStore({kind:'indexeddb',name:'m04-persistent'});if(!s.ok)throw Error(JSON.stringify(s));const r=await s.value.get('records','r1');await s.value.close();return r;}''')
        assert absent['ok'] is False and absent['error']['code']=='not_found',absent
        fresh.close()
        private=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
        context=private.new_context();page=context.new_page();page.goto(url)
        private_result=page.evaluate('''async()=>{const m=await import('/store/index.js');const result=await m.openStore({kind:'indexeddb',name:'m04-private'});document.querySelector('#status').textContent=result.ok?'IndexedDB available in private context':result.error.message;if(result.ok)await result.value.close();return {ok:result.ok,text:document.querySelector('#status').textContent};}''')
        assert private_result['text']
        private.close()
        print(json.dumps({'browser':'Chromium','adapters':result,'restart':'exact record persisted','fresh_profile':'not_found','future_version':'get/list rejected','private_context':private_result}))
finally:
    server.terminate()
    try:server.wait(timeout=10)
    except subprocess.TimeoutExpired:server.kill();server.wait(timeout=10)
