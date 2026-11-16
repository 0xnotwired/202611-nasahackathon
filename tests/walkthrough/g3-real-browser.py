"""G3 on a real, persistent, writable source (BROWSER level): "My records" records, plans, runs a procedure and keeps everything after a reload. Development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 tests/walkthrough/g3-real-browser.py

Prediction (written before the run): recording is off until the person chooses an origin; after the choice a pulse, a task linked to a procedure, a
procedure with a recording step and its execution are saved; a reload shows all of it from IndexedDB, each record with the origin the person chose.
Limits: one engine (Chromium), fresh browser profile each run, served over http (not file://), no second browser, no screen reader.
"""
import datetime
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
    now = datetime.datetime.now(datetime.timezone.utc)
    when = now.strftime('%Y-%m-%dT%H:%M:%SZ')
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_executable(), headless=True)
        context = browser.new_context(viewport={'width': 1100, 'height': 900})
        page = context.new_page(); errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

        def open_app():
            page.goto(url); page.wait_for_selector('html[data-modules="loaded"]', timeout=15000)
            page.select_option('#source-select', 'mine'); page.wait_for_function('document.querySelector("#announce").textContent.includes("Data source changed")', timeout=10000)

        def go(view, anchor):
            page.evaluate(f"location.hash = '#/{view}'"); page.wait_for_selector(anchor, timeout=15000)

        open_app()
        go('my-health', '#health-nothing-new')
        check('R0: before any choice, recording is off and says why', page.locator('#health-nothing-new').is_disabled() and 'off' in page.locator('#origin-bar').inner_text().lower() + page.locator('#view').inner_text().lower())
        page.select_option('#origin-select', 'terrestrial'); page.wait_for_timeout(500)
        check('R1a: after choosing the origin the focus stays on the origin control', page.evaluate('document.activeElement && document.activeElement.id') == 'origin-select')
        go('my-health', '#health-form')
        check('R1: after the choice, recording is on', not page.locator('#health-nothing-new').is_disabled())
        page.select_option('#health-variable', 'pulse'); page.fill('#health-value', '64'); page.click('#health-save')
        page.wait_for_selector('#health-message, .notice-info'); page.wait_for_timeout(600); check('R2: a pulse is saved', 'Saved' in page.locator('#view').inner_text(), page.locator('#view').inner_text()[:600])
        # my-plan: a task for a procedure that exists only after the editor publishes it.
        go('on-board', '#editor-details'); page.click('#editor-details summary')
        page.fill('#editor-title', 'Pulse check'); page.fill('#editor-purpose', 'Take the pulse'); page.fill('#editor-preparation', 'Hands warm')
        page.fill('#editor-steps', 'Sit down\nTake your pulse | records=pulse'); page.click('#editor-publish')
        page.wait_for_selector('[id^="board-start-"]', timeout=10000)
        check('R3: the published procedure is listed with a preparation checkbox', page.locator('input[type=checkbox][id^="board-prep-"]').count() == 1)
        start_id = page.locator('[id^="board-start-"]').first.get_attribute('id'); proc_id = start_id.replace('board-start-', '')
        page.click(f'#{start_id}'); page.wait_for_function('(document.querySelector("#board-message")||{textContent:""}).textContent.toLowerCase().includes("preparation")', timeout=10000); said = page.locator('#board-message').inner_text()
        check('R4: Start without confirming the check is refused', 'preparation' in said.lower(), said)
        page.check(f'#board-prep-{proc_id}-0'); page.click(f'#{start_id}'); page.wait_for_selector('[id$="-advance"]', timeout=10000)
        adv = page.locator('[id$="-advance"]').first.get_attribute('id'); page.click(f'#{adv}'); page.wait_for_selector('[id^="board-value-"]', timeout=10000)
        page.click(f'#{adv}'); page.wait_for_function('(document.querySelector("#board-message")||{textContent:""}).textContent.toLowerCase().includes("pulse")', timeout=10000); said = page.locator('#board-message').inner_text()
        check('R5: the recording step refuses to advance without a value', 'pulse' in said.lower(), said)
        page.fill('[id^="board-value-"]', '61'); page.fill('[id^="board-method-"]', 'manual count'); page.click(f'#{adv}'); page.wait_for_selector('[id$="-finish_completed"]', timeout=10000)
        page.click('[id$="-finish_completed"]'); page.wait_for_function('document.querySelector("#view").textContent.includes("completed")', timeout=10000)
        # my-plan
        go('my-plan', '#plan-new-form')
        page.fill('#plan-new-description', 'Pulse check today'); page.fill('#plan-new-scheduled_at', when); page.fill('#plan-new-planned_minutes', '5'); page.select_option('#plan-new-procedure_id', proc_id); page.click('#plan-new-save')
        page.wait_for_selector('[id^="plan-done-"]', timeout=10000); done_id = page.locator('[id^="plan-done-"]').first.get_attribute('id'); task_id = done_id.replace('plan-done-', '')
        page.click(f'#{done_id}'); page.wait_for_selector(f'#plan-undo-{task_id}', timeout=10000)
        link_sel = f'#plan-link-{task_id}'; options = page.eval_on_selector_all(f'{link_sel} option', 'els => els.map(e => e.textContent)')
        check('R6: only recorded values are offered as results, with their origin', any('pulse' in o and 'terrestrial' in o for o in options), options)
        page.select_option(link_sel, index=1); page.click(f'#plan-link-btn-{task_id}'); page.wait_for_function('document.querySelector("#view").textContent.includes("1 result linked")', timeout=10000)
        page.fill(f'#plan-undo-why-{task_id}', 'tested the undo'); page.click(f'#plan-undo-{task_id}'); page.wait_for_selector(f'#plan-done-{task_id}', timeout=10000)
        text = page.locator('#view').inner_text(); check('R7: undo returns the task to pending, keeps the history and the linked result', 'tested the undo' in text and '1 result linked' in text)
        page.click(f'#plan-done-{task_id}'); page.wait_for_selector(f'#plan-undo-{task_id}', timeout=10000)
        # lock the origin
        page.check('#origin-lock'); page.wait_for_timeout(400); check('R8a: after locking, the focus stays on the lock control', page.evaluate('document.activeElement && document.activeElement.id') == 'origin-lock'); check('R8: a locked origin cannot be changed', page.locator('#origin-select').is_disabled())
        # reload: everything must come back from IndexedDB
        open_app(); go('my-plan', '[id^="plan-undo-"]'); text = page.locator('#view').inner_text()
        check('R9: after a reload the task is Done with its result and history', 'Pulse check today' in text and 'Done: Done' in text and '1 result linked' in text and 'tested the undo' in text, text[:300])
        go('on-board', '#editor-details'); check('R10: after a reload the execution is still completed', 'completed' in page.locator('#view').inner_text().lower())
        go('my-health', '#health-form'); entry = page.locator('li.entry', has_text='61 bpm').first.inner_text(); check('R11: after a reload the newest pulse (61, taken inside the procedure step) is still there with the origin the person chose', 'terrestrial' in entry.lower() and 'self_report' not in entry.split('\n')[0], entry)
        check('R12: the lock survived the reload', page.locator('#origin-select').is_disabled() and page.locator('#origin-lock').is_checked())
        check('no console or page errors', not errors, errors)
        browser.close()
    print(json.dumps({'level': 'BROWSER (Chromium only; no second browser, no screen reader)', 'checks': results}, indent=1))
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
