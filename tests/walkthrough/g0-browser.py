"""Manual browser gate: python3 tests/walkthrough/g0-browser.py.

Uses the existing development-only Playwright/Chromium installation. Nothing
is installed or written to the checkout; only the server we start is stopped.
"""
import json
import os
from pathlib import Path
import re
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
server = subprocess.Popen(
    ['node', 'scripts/serve.mjs'], cwd=ROOT,
    env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE,
    stderr=subprocess.PIPE, text=True,
)
try:
    startup = server.stdout.readline()
    match = re.search(r'127\.0\.0\.1:(\d+)', startup)
    assert match, 'Expected loopback startup message'
    url = f'http://127.0.0.1:{match[1]}/index.html'
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('ORBITA_CHROMIUM') or '/usr/bin/chromium', headless=True)
        page = browser.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        response = page.goto(url)
        assert response.status == 200
        page.wait_for_selector('html[data-modules="loaded"]', timeout=15000)  # waits for the loader; the default view is now built, so load alone is not enough
        assert page.locator('html').get_attribute('data-modules') == 'loaded'
        expected_version = re.search(r'^Version ([0-9.]+)', (ROOT / 'docs/CONTRACTS.md').read_text(), re.M).group(1)
        assert f'contracts {expected_version}' in page.locator('#status').inner_text()
        assert not errors, errors
        # A distinct control: module transport failure must keep the fallback.
        broken = browser.new_page()
        broken.route('**/contracts/data.js', lambda route: route.abort())
        broken.goto(url)
        assert broken.locator('html').get_attribute('data-modules') is None
        assert 'Open this page through the local server' in broken.locator('#status').inner_text()
        file_observation = 'not attempted'
        file_page = browser.new_page()
        try:
            file_page.goto((ROOT / 'app/index.html').as_uri())
            assert file_page.locator('html').get_attribute('data-modules') is None
            file_observation = 'file page opened; modules did not execute'
        except Exception as error:
            if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(error):
                raise
            file_observation = 'blocked by managed policy before CORS; file control unverified'
        print(json.dumps({'gate': 'G0-W2', 'browser': browser.version,
                          'http_module_execution': 'passed',
                          'blocked_module_control': 'passed',
                          'file_observation': file_observation}))
        browser.close()
finally:
    server.terminate()
    try:
        server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill()
        server.wait(timeout=10)
