"""Load verified local samples through the product importer API into isolated IDB.

No downloads or dependency installation. Uses preinstalled development Chromium.
Raw source/IndexedDB data stay in ignored local directories, not stdout/Git.
Run from repo root: python3 scripts/import-real-samples.py

The browser executable is read from ORBITA_CHROMIUM and defaults to
/usr/bin/chromium. It must resolve to an executable regular file; a directory,
a missing path or a non-executable file fails before any import starts.
"""
from pathlib import Path
import hashlib
import json
import os
import re
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'data/local-import-profile'
OUTPUT = ROOT / 'data/imported'
DB_NAME = 'orbita-real-samples'
DEFAULT_CHROMIUM = '/usr/bin/chromium'
SAMPLES = [
    ('CRF', 'data/originals/CRF-daily-vitals.csv', 'importCRF', None, 791),
    ('MR079G', 'data/originals/MR079G-muscle-function.csv', 'importAdaptation', {'study': 'MR079G'}, 12),
    ('MR035G', 'data/originals/additional/MR035G-sample-1.csv', 'importAdaptation', {'study': 'MR035G'}, 10),
    ('MR080G', 'data/originals/additional/MR080G-sample-1.csv', 'importAdaptation', {'study': 'MR080G'}, 32),
    ('BUT_CGM', 'data/originals/but-cgm-1.0.0/101001_CGM.csv', 'importGlucose', {'subject': '101001'}, 3016),
]


def chromium_executable():
    """Return a validated browser path; never guess another location."""
    configured = os.environ.get('ORBITA_CHROMIUM') or DEFAULT_CHROMIUM
    resolved = Path(configured).resolve()  # follows symlinks; the target is what runs
    if not resolved.exists():
        raise RuntimeError(f'Chromium not found: {configured}. Set ORBITA_CHROMIUM to an executable file.')
    if not resolved.is_file():
        raise RuntimeError(f'Chromium path is not a file: {configured} (resolves to {resolved})')
    if not os.access(resolved, os.X_OK):
        raise RuntimeError(f'Chromium path is not executable: {configured} (resolves to {resolved})')
    return str(resolved)


def verified_sources():
    receipts = {}
    for name in ['acquisition-2026-11-15.json', 'additional-acquisition-2026-11-15.json']:
        data = json.loads((ROOT / 'docs/data' / name).read_text())
        def visit(value):
            if isinstance(value, dict):
                if isinstance(value.get('file'), str) and isinstance(value.get('sha256'), str):
                    receipts[value['file']] = value['sha256']
                for child in value.values():
                    visit(child)
            elif isinstance(value, list):
                for child in value:
                    visit(child)
        visit(data)
    result = []
    for name, rel, method, options, count in SAMPLES:
        path = (ROOT / rel).resolve(strict=True)
        if not path.is_relative_to((ROOT / 'data/originals').resolve()):
            raise RuntimeError('Source path is outside original-data directory')
        raw = path.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if digest != receipts.get(rel):
            raise RuntimeError(f'Original source checksum mismatch: {name}')
        result.append({'name': name, 'method': method, 'options': options,
                       'text': raw.decode('utf-8'), 'expected': count,
                       'sha256': digest})
    return result


def load():
    chromium = chromium_executable()  # Fail on a bad browser path before any import work.
    sources = verified_sources()  # Complete every custody check before opening DB.
    PROFILE.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT,
                              env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE,
                              stderr=subprocess.PIPE, text=True)
    try:
        match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline())
        if not match:
            raise RuntimeError('App server did not announce a loopback origin')
        # IndexedDB is origin-scoped. Persist the chosen port to support reruns.
        origin_file = OUTPUT / 'origin.json'
        port = int(match[1])
        if origin_file.exists():
            saved_port = json.loads(origin_file.read_text())['port']
            if saved_port != port:
                server.terminate()
                server.wait(timeout=10)
                server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT,
                                          env={**os.environ, 'PORT': str(saved_port)},
                                          stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                line = server.stdout.readline()
                if f'127.0.0.1:{saved_port}' not in line:
                    raise RuntimeError('Saved loopback origin unavailable; no new-origin DB created')
                port = saved_port
        else:
            origin_file.write_text(json.dumps({'port': port}) + '\n')
        url = f'http://127.0.0.1:{port}/index.html'
        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(str(PROFILE), executable_path=chromium, headless=True)
            try:
                page = context.new_page()
                page.goto(url)
                summary =page.evaluate('''async ({sources,name}) => {
                    const api=await import('/importers/index.js');
                    const {validateRecord}=await import('/core/index.js');
                    const {openStore}=await import('/store/index.js');
                    const reports=[];const records=[];
                    for(const s of sources) {
                        const result=api[s.method](s.text,s.options);
                        if(!result.ok) throw new Error('Import failed: '+s.name+' '+result.error.code);
                        const report=result.value;
                        if(report.records.length!==s.expected || report.rejected.length)
                            throw new Error('Source count/rejection mismatch: '+s.name);
                        for(const r of report.records) if(!validateRecord(r).ok) throw new Error('Invalid emitted record');
                        records.push(...report.records);
                        reports.push({source:s.name,sha256:s.sha256,records:report.records.length,
                            rejected:report.rejected.length,skipped:report.skipped.length});
                    }
                    if(new Set(records.map(r=>r.id)).size!==records.length) throw new Error('Colliding source IDs');
                    const opened=await openStore({kind:'indexeddb',name});
                    if(!opened.ok) throw new Error('IndexedDB unavailable');
                    const store=opened.value;
                    try {
                        const existing=await store.list('records',{});
                        if(!existing.ok) throw new Error('Cannot inspect existing records');
                        const indexed=new Map(existing.value.map(r=>[r.id,r]));const fresh=[];
                        const coordinates=new Map(existing.value.map(r=>[JSON.stringify([r.source,r.subject,r.variable,r.method]),r.id]));
                        for(const r of records) {
                            if(indexed.has(r.id)) {
                                if(JSON.stringify(indexed.get(r.id))!==JSON.stringify(r)) throw new Error('Existing record differs; overwrite forbidden');
                            } else {
                                const oldId=coordinates.get(JSON.stringify([r.source,r.subject,r.variable,r.method]));
                                if(oldId) throw new Error('Source measurement exists with another ID; explicit migration required');
                                fresh.push(r);
                            }
                        }
                        if(existing.value.length+fresh.length>10000) throw new Error('Store capacity exceeded');
                        for(let i=0;i<fresh.length;i+=256) {
                            const saved=await store.saveBatch('records',fresh.slice(i,i+256));
                            if(!saved.ok) throw new Error('Atomic batch failed: '+saved.error.code+':'+saved.error.field);
                        }
                        const restored=await store.list('records',{});
                        if(!restored.ok) throw new Error('Readback failed');
                        const got=new Map(restored.value.map(r=>[r.id,r]));
                        for(const r of records) if(JSON.stringify(got.get(r.id))!==JSON.stringify(r)) throw new Error('Stored value differs');
                        return {database:name,reports,imported_records:records.length,inserted:fresh.length,
                            unchanged:records.length-fresh.length,persistent:store.status().persistent,batch_size:256};
                    } finally {await store.close();}
                }''', {'sources': sources, 'name': DB_NAME})
            finally:
                context.close()
            context = p.chromium.launch_persistent_context(str(PROFILE), executable_path=chromium, headless=True)
            try:
                page = context.new_page()
                page.goto(url)
                count =page.evaluate('''async ({name,sources}) => {
                    const {openStore}=await import('/store/index.js');
                    const api=await import('/importers/index.js');
                    const opened=await openStore({kind:'indexeddb',name});
                    if(!opened.ok) throw new Error('Cannot reopen real-data DB');
                    try {
                        const r=await opened.value.list('records',{});if(!r.ok) throw new Error('Restart read failed');
                        const byId=new Map(r.value.map(v=>[v.id,v]));
                        for(const source of sources) {
                            const expected=api[source.method](source.text,source.options);
                            if(!expected.ok) throw new Error('Restart source parse failed');
                            for(const value of expected.value.records)
                                if(JSON.stringify(byId.get(value.id))!==JSON.stringify(value)) throw new Error('Restart record differs');
                        }
                        return r.value.length;
                    } finally {await opened.value.close();}
                }''', {'name': DB_NAME,'sources':sources})
                if count < summary['imported_records']:
                    raise RuntimeError('Records lost on browser restart')
                summary['browser_restart_records'] = count
                summary['browser_restart_exact_readback'] = True
                summary['scope'] = 'Isolated local real-data profile/database; no product views or clinical interpretation.'
                (OUTPUT / 'report.json').write_text(json.dumps(summary, indent=2) + '\n')
                print(json.dumps(summary))
            finally:
                context.close()
    finally:
        server.terminate()
        server.wait(timeout=10)


if __name__ == '__main__':
    load()
