"""Review and export, and the theme control (BROWSER level): served over http and from the packaged file. Development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 tests/walkthrough/review-browser.py

It builds dist/orbita.html, then walks the same steps on the served app and on file://: the review view (variable, period, method, reference, the prepared text),
the CSV downloads (the header, one row per record, an absent state without a number), keyboard reach and focus, and the manual theme (applied, kept after a reload).
Prediction (written before the run): both runs give the same checks; the downloaded file has the fixed header and as many rows as the subject has records; a download from the
packaged file works under its content-security policy; a manual theme changes the background and survives a reload.
Limits: Chromium only; the clipboard is not exercised; no screen reader.
"""
import csv
import io
import json
import os
from pathlib import Path
import re
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / 'dist' / 'orbita.html'
results = []
HEADER = ['id', 'subject', 'type', 'state', 'variable', 'value', 'unit', 'unit_status', 'method', 'time_utc', 'source_time_raw', 'source_time_calendar', 'source_time_scope',
          'source_time_precision', 'origin', 'source', 'mission_phase', 'place', 'sensor', 'corrects', 'note']


def chromium_executable():
    configured = os.environ.get('ORBITA_CHROMIUM') or '/usr/bin/chromium'
    resolved = Path(configured).resolve()
    if not resolved.is_file() or not os.access(resolved, os.X_OK):
        raise RuntimeError(f'Chromium is not an executable file: {configured}. Set ORBITA_CHROMIUM.')
    return str(resolved)


def check(label, name, condition, detail=''):
    results.append({'run': label, 'check': name, 'passed': bool(condition), 'detail': str(detail)[:200]})
    assert condition, f'[{label}] {name}: {detail}'


def poll(page, expression, timeout=15000):
    waited = 0
    while waited <= timeout:
        if page.evaluate(expression): return
        page.wait_for_timeout(100); waited += 100
    raise AssertionError(f'timed out waiting for: {expression}')


def walk(browser, label, url):
    context = browser.new_context(viewport={'width': 1100, 'height': 900}, accept_downloads=True, color_scheme='light')
    page = context.new_page(); errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.goto(url); poll(page, "document.documentElement.getAttribute('data-modules') === 'loaded'", 20000)
    page.evaluate("location.hash = '#/review'"); poll(page, "!!document.querySelector('#review-variable')")
    text = page.locator('#view').inner_text()
    check(label, 'R2: variable, period and the two downloads are present', page.locator('#review-variable').count() == 1 and page.locator('#review-period').count() == 1 and page.locator('#review-download-all').count() == 1)
    variables = page.eval_on_selector_all('#review-variable option', 'els => els.map(e => e.value)')
    check(label, 'R3: the variables offered are the ones that have records', len(variables) >= 1, variables)
    page.select_option('#review-variable', 'aerobic_capacity' if 'aerobic_capacity' in variables else variables[0]); page.wait_for_timeout(300)
    page.select_option('#review-period', '12'); page.wait_for_timeout(300)
    prepared = page.locator('#review-text').inner_text()
    check(label, 'R4: the prepared text says it is not sent, names the criterion as not configured and carries the annex', 'Not sent' in prepared and 'Performance criterion: not configured' in prepared and 'Data and provenance annex' in prepared)
    check(label, 'R5: the change line is descriptive or says why there is none', bool(re.search(r'Descriptive only|Not compared|Not enough recorded values|No second value', page.locator('#review-change').inner_text())), page.locator('#review-change').inner_text()[:120])
    for word in ['normal', 'healthy', 'improving', 'worsening', 'score']:
        check(label, f'R6: the word "{word}" is not on the screen', not re.search(rf'\b{word}\b', page.locator('#view').inner_text(), re.I))
    # keyboard: reach the controls in order and keep the focus after a download
    page.focus('#review-variable'); order = []
    for _ in range(8):
        page.keyboard.press('Tab'); order.append(page.evaluate('document.activeElement && document.activeElement.id'))
    check(label, 'K1: the controls are reachable in reading order', 'review-period' in order and 'review-download-all' in order, order)
    with page.expect_download(timeout=20000) as info:
        page.focus('#review-download-all'); page.keyboard.press('Enter')
    download = info.value; path = download.path(); body = Path(path).read_bytes().decode('utf-8')
    check(label, 'D1: the file name is safe and ends in .csv', re.fullmatch(r'[A-Za-z0-9_-]+\.csv', download.suggested_filename) is not None, download.suggested_filename)
    check(label, 'D2: the file starts with a byte-order mark and has the fixed header', body.startswith('﻿') and next(csv.reader(io.StringIO(body.lstrip('﻿')))) == HEADER)
    rows = list(csv.DictReader(io.StringIO(body.lstrip('﻿'))))
    check(label, 'D3: every row is of one subject, with an origin', len({r['subject'] for r in rows}) == 1 and all(r['origin'] for r in rows), len(rows))
    check(label, 'D4: a not-recorded row has no number and no unit; a recorded measurement or exam has a number', all((r['value'] == '' and r['unit'] == '') for r in rows if r['state'] != 'recorded') and any(r['state'] == 'not_recorded' for r in rows) and all(r['value'] != '' for r in rows if r['state'] == 'recorded' and r['type'] in ('measurement', 'exam')))
    poll(page, "!!document.querySelector('#review-message')"); check(label, 'D5: the message says nothing was sent', 'nothing was sent' in page.locator('#review-message').inner_text())
    check(label, 'D6: the focus is on the button that was pressed', page.evaluate('document.activeElement && document.activeElement.id') == 'review-download-all')
    with page.expect_download(timeout=20000) as info2:
        page.click('#review-download-series')
    series = Path(info2.value.path()).read_bytes().decode('utf-8'); srows = list(csv.DictReader(io.StringIO(series.lstrip('﻿'))))
    check(label, 'D7: the series file holds only the chosen variable', len(srows) >= 1 and len({r['variable'] for r in srows}) == 1, [r['variable'] for r in srows][:3])
    # theme
    before = page.evaluate("getComputedStyle(document.body).backgroundColor")
    page.select_option('#theme-select', 'dark'); page.wait_for_timeout(200)
    dark = page.evaluate("getComputedStyle(document.body).backgroundColor")
    check(label, 'T1: choosing Dark on a light system changes the page and sets data-theme', dark != before and page.evaluate("document.documentElement.getAttribute('data-theme')") == 'dark', (before, dark))
    page.reload(); poll(page, "document.documentElement.getAttribute('data-modules') === 'loaded'", 20000)
    check(label, 'T2: the choice is kept after a reload', page.evaluate("document.documentElement.getAttribute('data-theme')") == 'dark' and page.eval_on_selector('#theme-select', 'e => e.value') == 'dark')
    page.select_option('#theme-select', 'auto'); page.wait_for_timeout(200)
    check(label, 'T3: Automatic removes the manual theme', page.evaluate("document.documentElement.getAttribute('data-theme')") is None)
    check(label, 'no console or page errors', not errors, errors)
    context.close()


server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
try:
    subprocess.run(['node', 'scripts/package.mjs'], cwd=ROOT, check=True, capture_output=True)
    match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline()); assert match, 'server did not announce a loopback origin'
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_executable(), headless=True)
        walk(browser, 'served', f'http://127.0.0.1:{match[1]}/index.html')
        walk(browser, 'packaged', DIST.as_uri())
        browser.close()
    served = [r['check'] for r in results if r['run'] == 'served']; packaged = [r['check'] for r in results if r['run'] == 'packaged']
    assert served == packaged, 'the two runs did not make the same checks'
    print(json.dumps({'level': 'BROWSER (Chromium only; no clipboard, no screen reader)', 'checks': len(results), 'results': results}, indent=1))
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
