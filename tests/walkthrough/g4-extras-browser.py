"""G4 extras (BROWSER level): the suggestion path with the fictional demo rule, and episode history with reopen. Development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 tests/walkthrough/g4-extras-browser.py

Prediction (written before the run): choosing "fatigue" shows data and gaps before a suggestion that names its source, version and "demo" status with a
caution that it is not reviewed guidance; "back pain" (no rule) says there is no reviewed guidance; a closed episode appears in the history and reopens
only with a reason, which stays in the history. Limits: Chromium only; the rule is fictional and says nothing about health.
"""
import json
import os
from pathlib import Path
import re
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
results = []


def chromium_executable():
    configured = os.environ.get('ORBITA_CHROMIUM') or '/usr/bin/chromium'
    resolved = Path(configured).resolve()
    if not resolved.is_file() or not os.access(resolved, os.X_OK):
        raise RuntimeError(f'Chromium is not an executable file: {configured}. Set ORBITA_CHROMIUM.')
    return str(resolved)


def check(name, condition, detail=''):
    results.append({'check': name, 'passed': bool(condition), 'detail': str(detail)[:240]})
    assert condition, f'{name}: {detail}'


server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
try:
    match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline())
    assert match, 'server did not announce a loopback origin'
    url = f'http://127.0.0.1:{match[1]}/index.html'
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_executable(), headless=True)
        page = browser.new_context(viewport={'width': 1100, 'height': 900}).new_page(); errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.goto(url + '#/i-feel-different'); page.wait_for_selector('#feel-symptom', timeout=15000)
        page.select_option('#feel-symptom', 'back_pain'); page.click('#feel-open'); page.wait_for_selector('#sec-suggestion', timeout=10000)
        text = page.locator('#view').inner_text()
        check('S1: a symptom with no rule says there is no reviewed guidance', 'There is no reviewed guidance for this.' in text, text[:200])
        page.click('#feel-close'); page.wait_for_selector('#feel-symptom', timeout=10000)
        page.select_option('#feel-symptom', 'fatigue'); page.click('#feel-open'); page.wait_for_selector('#sec-suggestion', timeout=10000)
        text = page.locator('#view').inner_text()
        check('S2: the demo rule appears with source, version and status', 'Team demo, fictional rule' in text and 'demo-1' in text and 'team demo (fictional rule, no clinical source)' in text, text[:200])
        check('S3: it carries the caution that it is not reviewed guidance', 'not reviewed guidance' in text)
        check('S4: data and gaps come before the suggestion in the page', text.index('What you recorded') < text.index('What is missing') < text.index('Suggestion'))
        check('S5: the history lists the earlier (back pain) episode, closed', 'Earlier episodes' in text and 'closed' in text.split('Earlier episodes')[1])
        hist = page.locator('button[id^="feel-reopen-"]').first
        check('S6: while one episode is open, reopening another is disabled and says why', hist.is_disabled() and 'Another episode is open' in page.locator('#view').inner_text())
        page.click('#feel-close'); page.wait_for_selector('#feel-symptom', timeout=10000)
        check('S7: two closed episodes are listed', page.locator('button[id^="feel-reopen-"]').count() == 2)
        first_id = page.locator('button[id^="feel-reopen-"]').first.get_attribute('id').replace('feel-reopen-', '')
        page.click(f'#feel-reopen-{first_id}'); page.wait_for_function('document.querySelector("#feel-message").textContent.toLowerCase().includes("say why")', timeout=10000)
        check('S8: reopening without a reason is refused in words', page.locator('#feel-message').get_attribute('role') == 'alert')
        page.fill(f'#feel-reopen-why-{first_id}', 'closed by mistake'); page.click(f'#feel-reopen-{first_id}')
        page.wait_for_function('document.querySelector("#feel-message").textContent.includes("open again")', timeout=10000)
        check('S9: the episode is open again (the start form is gone)', page.locator('#feel-symptom').count() == 0 and 'Open episode' in page.locator('#view').inner_text())
        page.click('#feel-close'); page.wait_for_selector('#feel-symptom', timeout=10000)
        check('S10: the reason of the reopening stays in the history', 'closed by mistake' in page.locator('#view').inner_text())
        # A rules file, a stored summary, and the ground panel reading the summary text.
        rules = json.dumps([{'id': 'f1', 'when': {'recorded_variable': 'headache'}, 'suggestion': 'Fictional file rule.', 'source': 'test file (fictional)', 'version': 'f-1', 'review_status': 'draft'}]).encode()
        page.set_input_files('#feel-rules-file', files=[{'name': 'rules.json', 'mimeType': 'application/json', 'buffer': rules}]); page.click('#feel-rules-load')
        page.wait_for_function('document.querySelector("#feel-message").textContent.includes("Loaded 1 rule")', timeout=10000)
        check('F1: the loaded rule is listed with its status and source', 'f1' in page.locator('#view').inner_text() and 'draft' in page.locator('#view').inner_text() and 'test file (fictional)' in page.locator('#view').inner_text())
        page.set_input_files('#feel-rules-file', files=[{'name': 'bad.json', 'mimeType': 'application/json', 'buffer': b'{not json'}]); page.click('#feel-rules-load')
        page.wait_for_function('document.querySelector("#feel-message").textContent.startsWith("Rules not loaded")', timeout=10000)
        check('F2: a bad file is refused in words and loads nothing', page.locator('#feel-message').get_attribute('role') == 'alert' and 'f1' in page.locator('#view').inner_text())
        page.select_option('#feel-symptom', 'headache'); page.click('#feel-open'); page.wait_for_selector('#sec-suggestion', timeout=10000)
        text = page.locator('#view').inner_text()
        check('F3: the card uses the file rule and says it is not reviewed guidance', 'Fictional file rule.' in text and 'not reviewed guidance' in text)
        page.click('#feel-summary'); page.wait_for_selector('#feel-summary-text', timeout=10000)
        check('F4: the summary says it was saved on this device and sent nothing', 'saved on this device' in page.locator('#feel-message').inner_text() and 'Nothing was sent' in page.locator('#feel-message').inner_text())
        page.check('#feel-confirm'); page.click('#feel-share'); page.wait_for_function('document.querySelector("#feel-message").textContent.startsWith("Shared")', timeout=10000)
        page.evaluate("location.hash = '#/ground'"); page.wait_for_selector('#sec-share, .card', timeout=10000); page.wait_for_timeout(500)
        ground = page.locator('#view').inner_text()
        check('F5: the ground panel shows the summary text that was shared', 'and 1 summary' in ground and 'Episode summary' in ground and 'What was measured and how' in ground, ground[-400:])
        # Upgrade: a profile saved by the previous schema (v2, no `summaries` or `rules`) opens as v3 and keeps what it had.
        ctx2 = browser.new_context(viewport={'width': 1100, 'height': 900}); old = ctx2.new_page(); old.goto(url); old.wait_for_selector('html[data-modules="loaded"]', timeout=15000)
        made = old.evaluate('''async () => { await new Promise(r => { const q = indexedDB.deleteDatabase('orbita'); q.onsuccess = q.onerror = q.onblocked = () => r(); });
          return await new Promise((res, rej) => { const q = indexedDB.open('orbita', 2); q.onupgradeneeded = () => { const db = q.result; for (const n of ['records','executions','tasks','episodes','shared','deliveries','config','procedures']) db.createObjectStore(n, {keyPath: 'id'}); };
            q.onsuccess = () => { const db = q.result; const tx = db.transaction('procedures', 'readwrite'); tx.objectStore('procedures').put({id: 'keep-me@1', schema_version: 2, procedure_id: 'keep-me'}); tx.oncomplete = () => { db.close(); res(true); }; }; q.onerror = () => rej('open failed'); }); }''')
        check('U0: a version-2 profile was prepared', made is True)
        old.goto(url); old.wait_for_selector('html[data-modules="loaded"]', timeout=15000); old.select_option('#source-select', 'mine'); old.wait_for_function('document.querySelector("#announce").textContent.includes("Data source changed")', timeout=10000)
        info = old.evaluate('''async () => await new Promise(res => { const q = indexedDB.open('orbita'); q.onsuccess = () => { const db = q.result; const tx = db.transaction('procedures'); const g = tx.objectStore('procedures').get('keep-me@1');
          g.onsuccess = () => { res({version: db.version, stores: [...db.objectStoreNames].sort(), kept: !!g.result}); db.close(); }; }; })''')
        check('U1: the profile is now version 3 with the two new collections and keeps its data', info['version'] == 3 and 'summaries' in info['stores'] and 'rules' in info['stores'] and info['kept'], info)
        check('U2: the app says nothing about a storage problem', 'could not' not in old.locator('#storage-notice').inner_text().lower() if old.locator('#storage-notice').count() else True)
        ctx2.close()
        check('no console or page errors', not errors, errors)
        browser.close()
    print(json.dumps({'level': 'BROWSER (Chromium only; no second browser, no screen reader)', 'checks': results}, indent=1))
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
