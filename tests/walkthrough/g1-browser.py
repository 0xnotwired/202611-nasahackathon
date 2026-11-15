"""G1 browser gate: real IndexedDB, restart, isolated profiles and failures.

Run from repository root with the preinstalled development Playwright/Chromium.
No browser tooling is shipped with the product and no packages are installed.
"""
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OPERATIONS = (ROOT / 'tests/walkthrough/g1-operations.js').read_text()
CONTRACT = (ROOT / 'tests/contract/store.js').read_text()
server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT,
                          env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE, text=True)
try:
    match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline())
    assert match, 'Server did not announce a loopback port'
    url = f'http://127.0.0.1:{match[1]}/index.html'
    with tempfile.TemporaryDirectory(prefix='orbita-g1-profile-') as profile, \
         tempfile.TemporaryDirectory(prefix='orbita-g1-fresh-') as fresh, sync_playwright() as p:
        def open_profile(path):
            return p.chromium.launch_persistent_context(
                path, executable_path='/usr/bin/chromium', headless=True)

        context = open_profile(profile)
        try:
            page = context.new_page()
            page.goto(url)
            result = page.evaluate('''async ({operations, contract}) => {
                const core = await import('/core/index.js');
                const store = await import('/store/index.js');
                const scenario = await import('/scenario/index.js');
                const run = new Function(operations.replace('export async function', 'async function') + '; return runG1Operations;')();
                const check = new Function(contract.replace('export async function', 'async function') + '; return checkStore;')();
                const shared = await check(store, {kind:'indexeddb', name:'g1-contract'});
                const integration = await run({...core,...store,...scenario}, {kind:'indexeddb', name:'g1-scenario'});
                const opened = await store.openStore({kind:'indexeddb',name:'g1-restart'});
                if (!opened.ok) throw new Error('Cannot open restart test database');
                const record = scenario.generateScenario({seed:1}).records[0];
                const saved = await opened.value.save('records',record);
                if (!saved.ok) throw new Error('Cannot save restart test record');
                await opened.value.close();
                return {shared,integration,record};
            }''', {'operations': OPERATIONS, 'contract': CONTRACT})
        finally:
            context.close()

        context = open_profile(profile)
        try:
            page = context.new_page()
            page.goto(url)
            restarted = page.evaluate('''async expected => {
                const {openStore} = await import('/store/index.js');
                const opened = await openStore({kind:'indexeddb',name:'g1-restart'});
                if (!opened.ok) throw new Error('Cannot reopen IndexedDB');
                const record = await opened.value.get('records',expected.id);
                await opened.value.close();
                if (!record.ok || JSON.stringify(record.value)!==JSON.stringify(expected)) throw new Error('Restart lost or changed record');
                // Simulate future-version on-disk data through the browser API,
                // not a bypass or repair hook in the production store.
                const db = await new Promise((resolve,reject)=>{
                    const req=indexedDB.open('g1-restart');
                    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
                });
                await new Promise((resolve,reject)=>{
                    const tx=db.transaction('records','readwrite');
                    tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error); tx.onabort=()=>reject(tx.error);
                    tx.objectStore('records').put({...expected,id:'gate-future-raw',schema_version:999});
                });
                db.close();
                const futureStore=await openStore({kind:'indexeddb',name:'g1-restart'});
                const failure=futureStore.ok?await futureStore.value.get('records','gate-future-raw'):futureStore;
                if (futureStore.ok) await futureStore.value.close();
                if (failure.ok || !/version/i.test(failure.error.message+' '+failure.error.field)) throw new Error('Future schema read was not explicitly rejected');
                return 'same record after browser restart; future-version read rejected';
            }''', result['record'])
        finally:
            context.close()

        context = open_profile(fresh)
        try:
            page = context.new_page()
            page.goto(url)
            isolated = page.evaluate('''async id=>{
                const {openStore}=await import('/store/index.js');
                const s=await openStore({kind:'indexeddb',name:'g1-restart'});
                if(!s.ok) throw new Error('Fresh profile could not open IndexedDB');
                const empty=await s.value.list('records',{});
                const missing=await s.value.get('records',id); await s.value.close();
                if(!empty.ok||!Array.isArray(empty.value)||empty.value.length!==0) throw new Error('Fresh profile was not a successfully readable empty database');
                if(missing.ok||missing.error?.code!=='not_found') throw new Error('Fresh profile must explicitly report absence, not an arbitrary read error');
                return 'fresh profile has no prior records';
            }''', result['record']['id'])
        finally:
            context.close()

        browser = p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
        try:
            private = browser.new_context()
            page = private.new_page()
            page.goto(url)
            private_result = page.evaluate('''async record=>{
                const {openStore}=await import('/store/index.js');
                const s=await openStore({kind:'indexeddb',name:'g1-private'});
                const available=s.ok;
                if(s.ok) {
                    const saved=await s.value.save('records',record);
                    if(!saved.ok) throw new Error('Private-context IndexedDB save failed');
                    await s.value.close();
                    const reopened=await openStore({kind:'indexeddb',name:'g1-private'});
                    if(!reopened.ok) throw new Error('Private-context IndexedDB reopen failed');
                    const read=await reopened.value.get('records',record.id);
                    await reopened.value.close();
                    if(!read.ok||JSON.stringify(read.value)!==JSON.stringify(record)) throw new Error('Private-context save/read/reopen changed data');
                } else if(typeof s.error?.code!=='string'||!s.error.message) throw new Error('Private-context denial must be explicit');
                const message=available?'IndexedDB save/read/reopen verified in an isolated private context; lifetime remains private-context scoped':s.error.message;
                const notice=document.createElement('p');notice.id='g1-private-status';notice.textContent=message;document.body.append(notice);
                return {available,message};
            }''', result['record'])
            assert page.locator('#g1-private-status').inner_text() == private_result['message']
            private.close()
            blocked = browser.new_context()
            blocked.add_init_script("Object.defineProperty(globalThis,'indexedDB',{value:undefined,configurable:true});")
            page = blocked.new_page()
            page.goto(url)
            unavailable = page.evaluate('''async()=>{
                const {openStore}=await import('/store/index.js');
                const denied=await openStore({kind:'indexeddb',name:'g1-denied'});
                if(denied.ok||!denied.error.message) throw new Error('IndexedDB unavailable silently fell back');
                const memory=await openStore({kind:'memory'});
                if(!memory.ok||memory.value.status().persistent||!memory.value.status().reason) throw new Error('Explicit memory fallback lacks warning');
                await memory.value.close();
                const notice=document.createElement('p');notice.id='g1-storage-error';notice.textContent=denied.error.message;document.body.append(notice);
                return 'explicit IndexedDB error; memory only on explicit caller request';
            }''')
            assert page.locator('#g1-storage-error').inner_text().strip()
            blocked.close()
            print(json.dumps({'gate':'G1','browser':browser.version,
                              'shared_contract':result['shared'],
                              'integration':result['integration'],
                              'restart':restarted,'isolation':isolated,
                              'private_context':private_result['available'],
                              'unavailable':unavailable}))
        finally:
            browser.close()
finally:
    server.terminate()
    try:
        server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill()
        server.wait(timeout=10)
