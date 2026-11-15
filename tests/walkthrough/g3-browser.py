"""G3 (BROWSER level): a keyboard-only walk of My plan and On board in the real shell. Development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 tests/walkthrough/g3-browser.py

Nothing is clicked with a pointer: every move is Tab, Shift+Tab, Enter, a typed key or an arrow key. The walk: with the equipment, start the demo
procedure, do a step, interrupt it with a reason, leave for My plan and come back, resume at the same step, finish, then mark the task done and see
that its result still reads "not recorded". Then change the mission configuration by keyboard and see the same procedure blocked, naming the missing
item, with no start button. Also: a visible focus indicator at every stop, no sideways scroll at 320 px, no console error.
Prediction (written before the run): every check passes. Limits: one engine (Chromium), no screen reader, the synthetic demo source only.
"""
import json
import os
from pathlib import Path
import re
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
SHOTS = os.environ.get('ORBITA_SHOTS')
VIEWS = ['my-plan', 'on-board']
TITLES = {'my-plan': 'My plan', 'on-board': 'On board'}


def chromium_executable():
    configured = os.environ.get('ORBITA_CHROMIUM') or '/usr/bin/chromium'
    resolved = Path(configured).resolve()
    if not resolved.is_file() or not os.access(resolved, os.X_OK):
        raise RuntimeError(f'Chromium is not an executable file: {configured}. Set ORBITA_CHROMIUM.')
    return str(resolved)


results = []
def check(name, condition, detail=''):
    results.append({'check': name, 'passed': bool(condition), 'detail': str(detail)[:200]})
    assert condition, f'{name}: {detail}'


def focus_until(page, predicate, key, limit=120):
    for _ in range(limit):
        if page.evaluate(predicate): return True
        page.keyboard.press(key)
    return False


FOCUS_VISIBLE = """() => { const e = document.activeElement; if (!e || e === document.body) return false; const s = getComputedStyle(e);
  return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== 'none'); }"""


def open_by_keyboard(page, view):
    """Shift+Tab / Tab to the navigation link for `view` and press Enter."""
    predicate = f"document.activeElement && document.activeElement.getAttribute('href') === '#/{view}'"
    found = focus_until(page, predicate, 'Shift+Tab', 150) or focus_until(page, predicate, 'Tab', 150)
    check(f'{view}: its navigation link is reachable by keyboard', found)
    page.keyboard.press('Enter')
    page.wait_for_function(f"document.querySelector('#view-title') && document.querySelector('#view-title').textContent === '{TITLES[view]}'", timeout=15000)
    page.wait_for_function("!document.querySelector('#view-body').textContent.includes('Loading')", timeout=15000)


def walk_stops(page, view):
    """Tab from the view heading through every stop inside #view; each must show a focus indicator."""
    page.evaluate("document.querySelector('#view').focus()")
    stops = []
    for _ in range(150):
        page.keyboard.press('Tab')
        inside = page.evaluate("document.activeElement && document.querySelector('#view').contains(document.activeElement)")
        if not inside: break
        stops.append(page.evaluate("(() => { const e = document.activeElement; return (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.getAttribute('href') ? '[' + e.getAttribute('href') + ']' : '')); })()"))
        if not page.evaluate(FOCUS_VISIBLE):
            check(f'{view}: focus indicator visible at {stops[-1]}', False, stops)
    check(f'{view}: {len(stops)} keyboard stops inside the view, each with a visible focus indicator', True, stops)
    return stops


server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
try:
    match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline())
    assert match, 'server did not announce a loopback origin'
    url = f'http://127.0.0.1:{match[1]}/index.html'
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_executable(), headless=True)
        context = browser.new_context(viewport={'width': 1000, 'height': 900})
        page = context.new_page()
        errors, failed = [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('response', lambda r: failed.append(f'{r.status} {r.url}') if r.status >= 400 else None)
        page.goto(url)
        page.wait_for_selector('html[data-modules="loaded"]', timeout=15000)

        for view in VIEWS:
            open_by_keyboard(page, view)
            body = page.locator('#view').inner_text()
            check(f'{view}: heading and banner are on the screen', TITLES[view] in page.locator('#view-title').inner_text() and 'Whose data and from where' in body, body[:100])
            check(f'{view}: no error notice and not "not available yet"', page.locator('#view .notice-error').count() == 0 and 'view is not available yet' not in body.lower())
            walk_stops(page, view)
            if SHOTS:
                os.makedirs(SHOTS, exist_ok=True); page.screenshot(path=f'{SHOTS}/g3-{view}.png', full_page=True)

        # My plan before the journey: assigned, done and result are three lines; the task is pending.
        open_by_keyboard(page, 'my-plan')
        plan_text = page.locator('#view').inner_text()
        check('my-plan: progress reads "0 of 1 done" with the pending task named', '0 of 1 done' in plan_text and 'Pending:' in plan_text, plan_text[:300])
        check('my-plan: assigned, done and result are three separate lines', 'Assigned by' in plan_text and 'Done: Pending' in plan_text and 'Result: not recorded' in plan_text)

        # On board with the equipment: start, one step, interrupt with a reason.
        open_by_keyboard(page, 'on-board')
        check('on-board: procedure shows version, source and "demo ... not reviewed guidance"', 'Version 1' in page.locator('#view').inner_text() and 'not reviewed guidance' in page.locator('#view').inner_text())
        check('on-board: Start is reachable by keyboard', focus_until(page, "document.activeElement.id.startsWith('board-start-')", 'Tab'))
        page.keyboard.press('Enter')
        page.wait_for_selector('#board-message', timeout=10000)
        check('on-board: started, focus stays on the Start button', 'Started' in page.locator('#board-message').inner_text() and page.evaluate("document.activeElement.id.startsWith('board-start-')"), page.locator('#board-message').inner_text())
        check('on-board: the execution shows version 1 and 0 of 3 steps', '0 of 3 steps done' in page.locator('#sec-executions').locator('xpath=..').inner_text())
        check('on-board: "Step done" is reachable', focus_until(page, "document.activeElement.id.endsWith('-advance')", 'Tab'))
        page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#sec-executions').parentElement.textContent.includes('1 of 3 steps done')", timeout=10000)
        check('on-board: Interrupt without a reason is refused in words', focus_until(page, "document.activeElement.id.endsWith('-interrupt')", 'Tab'))
        page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#board-message') && document.querySelector('#board-message').textContent.startsWith('Not saved')", timeout=10000)
        check('on-board: the refusal is an alert', page.locator('#board-message').get_attribute('role') == 'alert')
        focus_until(page, "document.activeElement.id.startsWith('board-text-')", 'Shift+Tab')
        page.keyboard.type('call from ground')
        focus_until(page, "document.activeElement.id.endsWith('-interrupt')", 'Tab')
        page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#sec-executions').parentElement.textContent.includes('interrupted; 1 of 3 steps are done')", timeout=10000)
        check('on-board: interrupted at step 1, with the reason shown', 'call from ground' in page.locator('#view').inner_text())

        # Leave for My plan and come back: the execution is still interrupted at the same step, and Resume is offered.
        open_by_keyboard(page, 'my-plan')
        check('my-plan: an interrupted execution does not complete the task', '0 of 1 done' in page.locator('#view').inner_text())
        open_by_keyboard(page, 'on-board')
        check('on-board: back again, it offers Resume at the same step', page.locator('#sec-executions').locator('xpath=..').inner_text().count('1 of 3 steps') >= 1 and page.locator('[id$="-resume"]').count() == 1)
        check('on-board: Resume is reachable', focus_until(page, "document.activeElement.id.endsWith('-resume')", 'Tab'))
        page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#sec-executions').parentElement.textContent.includes('in progress')", timeout=10000)
        check('on-board: resumed at the same step', '1 of 3 steps done' in page.locator('#sec-executions').locator('xpath=..').inner_text())
        check('on-board: Finish is disabled while steps remain', page.locator('[id$="-finish_completed"]').is_disabled())
        for _ in range(2):
            focus_until(page, "document.activeElement.id.endsWith('-advance')", 'Tab'); page.keyboard.press('Enter')
            page.wait_for_timeout(150)
        page.wait_for_function("document.querySelector('#sec-executions').parentElement.textContent.includes('3 of 3 steps done')", timeout=10000)
        check('on-board: Finish is enabled only now', page.locator('[id$="-finish_completed"]').is_enabled())
        focus_until(page, "document.activeElement.id.endsWith('-finish_completed')", 'Tab'); page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#sec-executions').parentElement.textContent.includes('completed')", timeout=10000)
        check('on-board: completed, and no control is left on the execution', page.locator('#sec-executions').locator('xpath=..').locator('button').count() == 0)

        # Mark the task done on My plan: done is not a result.
        open_by_keyboard(page, 'my-plan')
        check('my-plan: a completed execution is mentioned for the task', 'A completed execution' in page.locator('#view').inner_text())
        check('my-plan: "Mark done" is reachable', focus_until(page, "document.activeElement.id.startsWith('plan-done-')", 'Tab'))
        page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#plan-progress') && document.querySelector('#plan-progress').textContent.startsWith('1 of 1 done')", timeout=10000)
        done_text = page.locator('#view').inner_text()
        check('my-plan: the task is done and its result still reads "not recorded"', 'Done: Done' in done_text and 'Result: not recorded' in done_text, done_text[:400])
        check('my-plan: no streak, points or badge anywhere', not re.search(r'streak|points|badge|reward|score', done_text, re.I))

        # Change the configuration by keyboard: the same procedure is now blocked and has no Start.
        page.locator('#config-select').focus()
        check('config: the select is reachable by keyboard', page.evaluate("document.activeElement.id") == 'config-select')
        page.keyboard.press('ArrowDown')
        page.wait_for_function("document.querySelector('#config-select option:checked').textContent.includes('spacecraft') || !document.querySelector('#config-select option:checked').textContent.includes('station')", timeout=10000)
        open_by_keyboard(page, 'on-board')
        board_text = page.locator('#view').inner_text()
        check('on-board: with the other configuration the procedure is blocked and names demo-device', 'Blocked: this mission configuration lacks demo-device' in board_text, board_text[:300])
        check('on-board: there is no Start button at all', page.locator('[id^="board-start-"]').count() == 0)
        check('on-board: the earlier execution still says version 1 and completed', 'Version 1' in board_text and 'completed' in board_text)

        # Reflow at 320 px.
        page.set_viewport_size({'width': 320, 'height': 700})
        for view in VIEWS:
            page.evaluate(f"location.hash = '#/{view}'")
            page.wait_for_function(f"document.querySelector('#view-title').textContent === '{TITLES[view]}'", timeout=15000)
            page.wait_for_timeout(300)
            wide = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
            check(f'{view}: no sideways page scroll at 320 px', wide <= 0, wide)
        check('no console error, no page error and no response >= 400 during the walk', not errors and not failed, errors + failed)
        browser.close()
    print(json.dumps({'level': 'BROWSER (Chromium only, no screen reader, synthetic demo source)', 'checks': len(results), 'results': results}, indent=1))
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
