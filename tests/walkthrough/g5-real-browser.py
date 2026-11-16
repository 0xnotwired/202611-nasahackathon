"""G5 on the real files (BROWSER level): CRF with its caveats, the viewer against the whole BUT CGM file, and keeping a case on this device. Development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 tests/walkthrough/g5-real-browser.py

Needs data/originals/ (outside git). Without the two files it prints what it skipped and exits 1: it never passes by default.
Prediction (written before the run): (1) the CRF card shows its three caveats, the unread columns and the free-text count, and no comment text; (2) for every one of
the 11 days of BUT CGM the viewer's table equals the file row by row (time and value) and the day counts add up to 3,016; (3) after "Keep on this device" and a
reload the case is restored with the same first day, while the nine views of the synthetic subject read the same as before; (4) removing deletes it for good.
Limits: Chromium only; one participant file and one CRF file; the viewer reads a file the person gives it; no second tab.
"""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
CGM = ROOT / 'data/originals/but-cgm-1.0.0/101001_CGM.csv'
CRF = ROOT / 'data/originals/CRF-daily-vitals.csv'
VIEWS = ['my-health', 'adaptation', 'habitat', 'my-progress', 'my-day', 'my-plan', 'on-board', 'i-feel-different', 'review', 'ground']
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


if not (CGM.exists() and CRF.exists()):
    print('SKIPPED: the real files are not on this machine (data/originals is outside git); nothing was checked'); sys.exit(1)

# The file read independently: BUT CGM is "Timestamp;Glycemia", the first line carries a BOM.
rows = [line.split(';') for line in CGM.read_bytes().decode('utf-8-sig').strip().splitlines()[1:]]
by_day = {}
for stamp, value in rows:
    by_day.setdefault(stamp[:10], []).append((stamp[11:], value))

server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
try:
    match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline())
    assert match, 'server did not announce a loopback origin'
    url = f'http://127.0.0.1:{match[1]}/index.html'
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_executable(), headless=True)
        context = browser.new_context(viewport={'width': 1100, 'height': 900})
        page = context.new_page(); errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

        def boot():
            page.goto(url); page.wait_for_selector('html[data-modules="loaded"]', timeout=15000)

        def read_views():
            texts = {}
            for view in VIEWS:
                page.evaluate(f"location.hash = '#/{view}'"); page.wait_for_timeout(500)
                texts[view] = page.locator('#view').inner_text()
            return texts

        def open_cases():
            page.evaluate("location.hash = '#/nasa-cases'"); page.wait_for_selector('#nc-form', timeout=15000)

        def load(source, path, subject=None):
            page.select_option('#nc-source', source)
            if subject is not None: page.fill('#nc-subject-id', subject)
            page.set_input_files('#nc-file', files=[{'name': path.name, 'mimeType': 'text/csv', 'buffer': path.read_bytes()}])
            page.click('#nc-load'); page.wait_for_function('(name) => document.querySelector("#nc-message, [role=status]") && document.querySelector("#view").textContent.includes("Loaded") && Array.from(document.querySelectorAll("#view h4")).some(h => h.textContent === name) && document.querySelector("[role=status]").textContent.includes(name)', arg=path.name, timeout=120000)

        boot(); before = read_views()
        check('before: the nine views of the synthetic subject rendered', all(len(t) > 80 for t in before.values()))
        open_cases()
        # (1) CRF
        load('CRF', CRF)
        text = page.locator('#view').inner_text()
        check('C1: the CRF card shows its three caveats', 'What this source does not tell us' in text and 'unit of any vital-sign column' in text and 'month/day/year' in text and 'free text about a person' in text)
        check('C2: columns not read and the free-text count are named', 'Head Down Tilt Verified' in text and '226 cells were left out on purpose' in text)
        comments = [l.split(',')[13] if len(l.split(',')) > 13 else '' for l in CRF.read_text(encoding='utf-8-sig').splitlines()[1:]]
        sample = next((c for c in comments if len(c.strip()) > 12), None)
        check('C3: no comment text from the file is on the page', sample is None or sample.strip() not in text, sample)
        check('C4: values are shown with "(unit unknown)", never with a guessed unit', '(unit unknown)' in text and not re.search(r'\b\d+(\.\d+)? (kg|lb|°C|bpm|mmHg)\b', text))
        # (2) BUT CGM against the whole file
        load('BUT_CGM', CGM, '101001')
        panel = page.locator('section[aria-labelledby="nc-panel-0"], section[aria-labelledby^="nc-panel-"]').last
        days = page.eval_on_selector_all('select[id^="nc-day-"] option', 'els => els.map(e => e.value)')
        check('W2a: the viewer offers exactly the days of the file', days == sorted(by_day), {'viewer': days[:3], 'file': sorted(by_day)[:3]})
        total = 0
        for day in days:
            page.select_option('select[id^="nc-day-"]', day); page.wait_for_timeout(250)
            table = page.eval_on_selector_all('.chart-block .data-table tbody tr', 'els => els.map(e => Array.from(e.children).map(c => c.textContent))')
            # numeric equality: the file's "5.0" is shown as "5" (the value is a number; the trailing zero is not kept, a display difference noted in the record)
            gaps = [r for r in table if r[1].startswith('no reading')]  # the viewer marks a missing slot; it is never a value
            shown = [(r[0], float(r[1].replace(' mmol/L', ''))) for r in table if not r[1].startswith('no reading')]
            expected = [(t, float(v)) for t, v in by_day[day]]
            check(f'W2b: {day}: the table equals the file row by row ({len(gaps)} gap marker(s) are not values)', shown == expected, {'first_difference': next(((i, a, b) for i, (a, b) in enumerate(zip(shown, expected)) if a != b), None), 'n': (len(shown), len(expected))})
            total += len(shown)
        check('W2c: the days add up to every row of the file', total == len(rows), {'viewer': total, 'file': len(rows)})
        page.select_option('select[id^="nc-day-"]', days[0]); page.wait_for_timeout(250)
        first_table = page.eval_on_selector_all('.chart-block .data-table tbody tr', 'els => els.map(e => Array.from(e.children).map(c => c.textContent))')
        # (3) keep, reload, restore
        keeps = page.locator('button[id^="nc-keep-"]'); check('K1: each file card offers "Keep on this device"', keeps.count() >= 2)
        keeps.nth(1).click(); page.wait_for_function('document.querySelector("[role=status], [role=alert]") && /Kept |Only |could not/.test(document.querySelector("[role=status], [role=alert]").textContent)', timeout=90000)
        check('K2: the message says how many records were kept and that they are not encrypted', '3016 records, not encrypted' in page.locator('#view').inner_text(), page.locator('[role=status], [role=alert]').first.inner_text())
        boot(); after_keep = read_views()
        for view in VIEWS: check(f'K3: {view} of the synthetic subject reads the same after keeping a real case', after_keep[view] == before[view])
        open_cases(); page.wait_for_timeout(800)
        text = page.locator('#view').inner_text()
        check('K4: after a reload the kept case is restored with its card and the "kept" note', '101001_CGM.csv' in text and 'Kept on this device' in text and 'Restored 1 case file' in text, text[:300])
        check('K5: the CRF file that was not kept is gone', 'CRF-daily-vitals.csv' not in text)
        restored = page.eval_on_selector_all('.chart-block .data-table tbody tr', 'els => els.map(e => Array.from(e.children).map(c => c.textContent))')
        check('K6: the restored first day equals the first day shown before', restored == first_table, {'n': (len(restored), len(first_table))})
        # (4) removal
        page.click('#nc-remove-kept'); page.wait_for_function('document.querySelector("#view").textContent.includes("Not removed")', timeout=10000)
        check('R1: removing without the confirmation is refused', page.locator('[role="alert"]').count() >= 1)
        page.check('#nc-remove-confirm'); page.click('#nc-remove-kept'); page.wait_for_function('document.querySelector("#view").textContent.includes("deleted from this device")', timeout=15000)
        boot(); open_cases(); page.wait_for_timeout(800)
        check('R2: after the removal and a reload nothing is kept', '101001_CGM.csv' not in page.locator('#view').inner_text() and page.locator('button[id^="nc-keep-"]').count() == 0)
        boot(); after_remove = read_views()
        for view in VIEWS: check(f'R3: {view} still reads the same after the removal', after_remove[view] == before[view])
        check('no console or page errors', not errors, errors)
        browser.close()
    print(json.dumps({'level': 'BROWSER (Chromium only; no second browser, no second tab, no screen reader)', 'checks': len(results), 'results': results}, indent=1))
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
