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
        check('no console or page errors', not errors, errors)
        browser.close()
    print(json.dumps({'level': 'BROWSER (Chromium only; no second browser, no screen reader)', 'checks': results}, indent=1))
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
