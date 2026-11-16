"""G6 (BROWSER level): the packaged file behaves like the served app and makes no network request. Development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 tests/walkthrough/g6-browser.py

It builds dist/orbita.html (node scripts/package.mjs), then runs one script on the served app (http) and on the file opened from file://:
the text of all ten views, and the episode journey (choose a symptom, open the episode, generate the summary, close). W1: the two runs give the
same lines. W2: the requests of the packaged page are the file itself (blob: module loads and data: URLs are counted apart and reported);
a copy with the policy removed and a remote stylesheet added shows a second request (the detector works), and with the policy kept the remote
load is blocked. P4: what the app says about storage on file://. The keyboard walks of each view are the other g*-browser.py scripts.
Prediction (written before the run): identical lines, one request. Limits: one engine (Chromium), no second browser, no screen reader.
"""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / 'dist' / 'orbita.html'
VIEWS = ['my-health', 'adaptation', 'habitat', 'my-progress', 'my-day', 'my-plan', 'on-board', 'i-feel-different', 'nasa-cases', 'review', 'ground']
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


def wait_js(page, expression, timeout=15000):
    """Poll with evaluate: Playwright's wait_for_function evaluates text inside the page, which the packaged file's policy rightly forbids."""
    waited = 0
    while waited <= timeout:
        if page.evaluate(expression): return
        page.wait_for_timeout(100); waited += 100
    raise AssertionError(f'timed out waiting for: {expression}')


def settle(page):
    wait_js(page, "!!document.querySelector('#view-body') && !document.querySelector('#view-body').textContent.includes('Loading')")
    page.wait_for_timeout(200)


def run_script(page):
    """The manual script. Returns a list of lines; the two runs must return the same list."""
    lines = []
    for view in VIEWS:
        page.evaluate(f"location.hash = '#/{view}'"); settle(page)
        lines.append(f'view {view}: ' + page.locator('#app').inner_text().replace('\n', ' / '))
    page.evaluate("location.hash = '#/i-feel-different'"); settle(page)
    page.select_option('#feel-symptom', 'headache'); page.click('#feel-open'); page.wait_for_selector('#sec-data', timeout=10000)
    lines.append('episode opened: ' + page.locator('#feel-message').inner_text())
    lines.append('episode order: ' + ' < '.join(page.evaluate("[...document.querySelectorAll('#view h3')].map(h => h.textContent)")))
    lines.append('episode card: ' + page.locator('#view').inner_text().replace('\n', ' / '))
    page.click('#feel-summary'); page.wait_for_selector('#feel-summary-text', timeout=10000)
    lines.append('summary: ' + page.locator('#feel-summary-text').inner_text().replace('\n', ' / '))
    lines.append('summary message: ' + page.locator('#feel-message').inner_text())
    page.click('#feel-close'); page.wait_for_selector('#feel-symptom', timeout=10000)
    lines.append('episode closed: ' + page.locator('#feel-message').inner_text())
    # Random ids (crypto.randomUUID) differ on every run, in either mode; nothing else may.
    return [re.sub(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '<uuid>', line) for line in lines]


build = subprocess.run(['node', 'scripts/package.mjs'], cwd=ROOT, capture_output=True, text=True)
check('build: node scripts/package.mjs succeeds', build.returncode == 0, build.stdout + build.stderr)
packaged = DIST.read_bytes(); digest = hashlib.sha256(packaged).hexdigest()[:16]

server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
try:
    match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline())
    assert match, 'server did not announce a loopback origin'
    served_url = f'http://127.0.0.1:{match[1]}/index.html'
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_executable(), headless=True)

        def open_page(url, collect=None):
            context = browser.new_context(viewport={'width': 1100, 'height': 900}); page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
            if collect is not None:
                page.on('request', lambda r: collect.append(r.url))
            page.goto(url); wait_js(page, "document.documentElement.getAttribute('data-modules') === 'loaded'", 20000)
            return context, page, errors

        ctx, page, served_errors = open_page(served_url)
        served_lines = run_script(page); ctx.close()
        requests = []
        ctx, page, packaged_errors = open_page(DIST.as_uri(), requests)
        check('P2: the packaged file starts from file:// (modules loaded)', page.locator('html').get_attribute('data-modules') == 'loaded' and 'did not start' not in page.locator('#app').inner_text())
        packaged_lines = run_script(page)
        storage_probe = {}
        page.select_option('#source-select', 'mine'); wait_js(page, 'document.querySelector("#announce").textContent.includes("Data source changed")', 10000)
        storage_probe['notice'] = page.locator('#storage-notice').inner_text()
        ctx.close()

        check(f'W1: the same script gives the same {len(served_lines)} lines served and packaged', served_lines == packaged_lines,
              [(a[:90], b[:90]) for a, b in zip(served_lines, packaged_lines) if a != b][:2])
        check('W1: the journey completed from file:// (episode opened, summary generated, closed)', any(l.startswith('summary: 1. What happened') or 'Episode summary' in l for l in packaged_lines) and any('closed' in l for l in packaged_lines if l.startswith('episode closed')))
        file_requests = [u for u in requests if not u.startswith(('blob:', 'data:'))]
        check('W2: the only request of the packaged page is the file itself', file_requests == [DIST.as_uri()], file_requests)
        check('W2: no console error and no page error in either run (a policy violation would show here)', not served_errors and not packaged_errors, served_errors + packaged_errors)
        results.append({'check': 'W2 (info): requests that are not the file', 'passed': True, 'detail': f"blob: {sum(u.startswith('blob:') for u in requests)}, data: {sum(u.startswith('data:') for u in requests)}"})

        # The detector and the policy, shown on copies of the file.
        remote = '<link rel="stylesheet" href="https://fonts.example.invalid/x.css">'
        html = packaged.decode('utf-8')
        no_policy = ROOT / 'dist' / 'orbita-control-nopolicy.html'; with_policy = ROOT / 'dist' / 'orbita-control-policy.html'
        no_policy.write_text(re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>', remote, html, count=1)); with_policy.write_text(html.replace('<title>', remote + '<title>', 1))
        try:
            seen = []; ctx, page, _ = open_page(no_policy.as_uri(), seen); ctx.close()
            check('W2 control: with the policy removed and a remote stylesheet added, a second request appears', any('fonts.example.invalid' in u for u in seen), seen[:4])
            seen = []; blocked = []
            context = browser.new_context(); page = context.new_page(); page.on('request', lambda r: seen.append(r.url)); page.on('console', lambda m: blocked.append(m.text))
            page.goto(with_policy.as_uri()); wait_js(page, "document.documentElement.getAttribute('data-modules') === 'loaded'", 20000)
            actually = [u for u in seen if 'fonts.example.invalid' in u]
            check('W2 control: with the policy kept, the remote stylesheet is refused by the browser', any('Content Security Policy' in t or 'Refused' in t for t in blocked), {'requests': actually, 'console': blocked[:2]})
            context.close()
        finally:
            for f in (no_policy, with_policy):
                if f.exists(): f.unlink()

        # P4: IndexedDB from file://, in words.
        ctx, page, _ = open_page(DIST.as_uri())
        page.select_option('#source-select', 'mine'); wait_js(page, 'document.querySelector("#announce").textContent.includes("Data source changed")', 10000)
        note = page.locator('#storage-notice').inner_text(); ctx.close()
        check('P4: the app says in words what it can promise about storage on file://', len(note) > 20 and re.search(r'not encrypted|not saved|memory|could not', note, re.I), note)
        browser.close()
    print(json.dumps({'level': 'BROWSER (Chromium only; no second browser, no screen reader)', 'dist_sha256': digest, 'dist_bytes': len(packaged), 'storage_notice_on_file': storage_probe.get('notice'), 'checks': len(results), 'results': results}, indent=1))
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
