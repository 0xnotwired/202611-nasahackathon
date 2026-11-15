"""G5 (BROWSER level): NASA data never changes a view of the synthetic astronaut, and the viewer shows the file. Development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 tests/walkthrough/g5-browser.py

W1: the text of nine views of the synthetic subject is read, a BUT CGM file is loaded through the real file input in "NASA cases", and the nine
views are read again: the texts are identical. W2: the first value of the first day in the viewer's table equals the first reading of the file,
parsed here independently. The real file is data/originals/but-cgm-1.0.0/101001_CGM.csv when it exists; otherwise a generated file is used and the
report says so. The keyboard walk and the layout checks of "NASA cases" itself are app/ui/nasa-cases/browser-check.py.
Prediction (written before the run): identical texts, matching first value. Limits: one engine (Chromium), the synthetic demo source only.
"""
import json
import os
from pathlib import Path
import re
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
REAL = ROOT / 'data/originals/but-cgm-1.0.0/101001_CGM.csv'
VIEWS = ['my-health', 'adaptation', 'habitat', 'my-progress', 'my-day', 'my-plan', 'on-board', 'i-feel-different', 'ground']
results = []


def chromium_executable():
    configured = os.environ.get('ORBITA_CHROMIUM') or '/usr/bin/chromium'
    resolved = Path(configured).resolve()
    if not resolved.is_file() or not os.access(resolved, os.X_OK):
        raise RuntimeError(f'Chromium is not an executable file: {configured}. Set ORBITA_CHROMIUM.')
    return str(resolved)


def check(name, condition, detail=''):
    results.append({'check': name, 'passed': bool(condition), 'detail': str(detail)[:200]})
    assert condition, f'{name}: {detail}'


if REAL.exists():
    body = REAL.read_bytes(); source = 'the real file on this machine'
    first = [l.split(';') for l in body.decode('utf-8-sig').strip().splitlines()[1:]][0]
else:
    lines = ['Timestamp;Glycemia'] + [f'2100-01-01 08:{m:02d}:00;{4 + m / 10:.1f}' for m in range(0, 50, 5)]
    body = ('\n'.join(lines) + '\n').encode(); source = 'a generated file (the real one is not on this machine)'
    first = lines[1].split(';')
first_day, first_value = first[0][:10], first[1]

server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
try:
    match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline())
    assert match, 'server did not announce a loopback origin'
    url = f'http://127.0.0.1:{match[1]}/index.html'
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_executable(), headless=True)
        page = browser.new_context(viewport={'width': 1100, 'height': 900}).new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.goto(url); page.wait_for_selector('html[data-modules="loaded"]', timeout=15000)

        def read_views():
            texts = {}
            for view in VIEWS:
                page.evaluate(f"location.hash = '#/{view}'")
                page.wait_for_function("document.querySelector('#view-body') && !document.querySelector('#view-body').textContent.includes('Loading')", timeout=15000)
                page.wait_for_timeout(250)
                texts[view] = page.locator('#view').inner_text()
            return texts

        before = read_views()
        check('before: every view of the synthetic subject rendered', all(len(t) > 80 for t in before.values()), {k: len(v) for k, v in before.items()})
        page.evaluate("location.hash = '#/nasa-cases'"); page.wait_for_selector('#nc-form', timeout=15000)
        page.select_option('#nc-source', 'BUT_CGM'); page.fill('#nc-subject-id', '101001')
        page.set_input_files('#nc-file', files=[{'name': '101001_CGM.csv', 'mimeType': 'text/csv', 'buffer': body}])
        page.click('#nc-load'); page.wait_for_selector('.chart-block svg', timeout=120000)
        check(f'import: the file loaded ({source})', 'terrestrial' in page.locator('#view').inner_text())
        rows = page.eval_on_selector_all('.chart-block .data-table tbody tr', 'els => els.map(e => e.textContent)')
        check('W2: the viewer\'s table starts with the first reading of the file', len(rows) > 0 and first_value.strip() in rows[0].replace(',', '.'), {'file': first, 'table': rows[:2]})
        check('W2: the viewer is on the first day of the file', first_day in page.locator('.data-table caption').first.text_content(), page.locator('.data-table caption').first.text_content())
        after = read_views()
        for view in VIEWS:
            check(f'W1: {view} reads exactly the same after the import', after[view] == before[view], '')
        # The hard case: a second file typed under the synthetic subject's own identifier. Isolation is by store, so no view may change.
        synthetic_id = re.search(r'Subject (\S+)\.', before['my-health']).group(1).rstrip('.')
        trap = ('Timestamp;Glycemia\n' + '\n'.join(f'2100-02-01 09:{m:02d}:00;9.{m}' for m in range(0, 50, 5)) + '\n').encode()
        page.evaluate("location.hash = '#/nasa-cases'"); page.wait_for_selector('#nc-form', timeout=15000)
        page.select_option('#nc-source', 'BUT_CGM'); page.fill('#nc-subject-id', synthetic_id)
        page.set_input_files('#nc-file', files=[{'name': 'trap.csv', 'mimeType': 'text/csv', 'buffer': trap}])
        page.click('#nc-load'); page.wait_for_function("document.querySelector('#view').textContent.includes('Loaded')", timeout=30000)
        again = read_views()
        for view in VIEWS:
            check(f'W1 (same identifier): {view} still reads exactly the same', again[view] == before[view], '')
        check('W1: no text of any synthetic view mentions the imported subject or the file', not any('101001' in t or 'terrestrial' in t.lower() for t in after.values()))
        check('no console error or page error', not errors, errors)
        browser.close()
    print(json.dumps({'level': 'BROWSER (Chromium only, synthetic demo source)', 'file': source, 'checks': len(results), 'results': results}, indent=1))
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
