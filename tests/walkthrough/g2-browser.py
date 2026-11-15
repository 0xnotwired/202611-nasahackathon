"""G2-W5 (BROWSER level): a keyboard-only walk of the five F2 views in the real shell. Development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 tests/walkthrough/g2-browser.py
Optional: ORBITA_SHOTS=/some/dir saves one screenshot per view there.

Nothing is clicked with a pointer: every move is Tab, Shift+Tab, Enter, a typed key or an arrow key. For each view it checks the
heading, the whose-data-and-where banner, the origin label, that every Tab stop inside the view shows a visible focus
indicator, and that the page does not scroll sideways at 320 px. Then each view's own control is used by keyboard:
nothing new and a measurement (M08), the place select (M10), the variable select (M11) and the links of M12.
Prediction (written before the run): all five views pass with no console error. A failure is reported, not hidden.
Limits: one engine (Chromium), no screen reader, the synthetic demo source only.
"""
import json
import os
from pathlib import Path
import re
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
SHOTS = os.environ.get('ORBITA_SHOTS')
VIEWS = ['my-health', 'adaptation', 'habitat', 'my-progress', 'my-day']
TITLES = {'my-health': 'My health', 'adaptation': 'Adaptation', 'habitat': 'Habitat', 'my-progress': 'My progress', 'my-day': 'My day'}


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
        check('start: the default source is the synthetic demo', 'Synthetic demo' in page.locator('#source-select option:checked').inner_text())

        for view in VIEWS:
            open_by_keyboard(page, view)
            body = page.locator('#view').inner_text()
            check(f'{view}: heading, banner and origin are on the screen', TITLES[view] in page.locator('#view-title').inner_text() and 'Whose data and from where' in body and 'Synthetic demo' in body, body[:120])
            check(f'{view}: no error notice and no "not available yet"', page.locator('#view .notice-error').count() == 0 and 'not available yet' not in body.lower().replace('tasks are not available yet', ''))
            check(f'{view}: the nav marks the current view', page.evaluate(f"document.querySelector('nav a[aria-current=\"page\"]').getAttribute('href') === '#/{view}'"))
            walk_stops(page, view)
            if SHOTS:
                os.makedirs(SHOTS, exist_ok=True); page.screenshot(path=f'{SHOTS}/g2-{view}.png', full_page=True)

        # M08 by keyboard: nothing new, a bad measurement (typed input kept), then a good one.
        open_by_keyboard(page, 'my-health')
        check('my-health: "Record: nothing new" is reachable', focus_until(page, "document.activeElement.id === 'health-nothing-new'", 'Tab'))
        page.keyboard.press('Enter')
        page.wait_for_selector('#health-message', timeout=10000)
        check('my-health: nothing new is confirmed in words and focus stays on the button', 'nothing new, confirmed' in page.locator('#health-message').inner_text() and page.evaluate("document.activeElement.id") == 'health-nothing-new', page.locator('#health-message').inner_text())
        check('my-health: the confirmation is not a number or "normal"', not re.search(r'\b(normal|fine|ok|good)\b', page.locator('#health-message').inner_text(), re.I))
        focus_until(page, "document.activeElement.id === 'health-variable'", 'Tab')
        page.keyboard.type('Pulse')
        focus_until(page, "document.activeElement.id === 'health-save'", 'Tab')
        page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#health-message') && document.querySelector('#health-message').textContent.startsWith('Not saved')", timeout=10000)
        check('my-health: an empty value is refused in words, the chosen variable is kept', page.locator('#health-variable').input_value() == 'pulse' and page.locator('#health-message').get_attribute('role') == 'alert', page.locator('#health-message').inner_text())
        focus_until(page, "document.activeElement.id === 'health-value'", 'Shift+Tab')
        page.keyboard.type('88')
        page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#health-message') && document.querySelector('#health-message').textContent.startsWith('Saved: pulse')", timeout=10000)
        check('my-health: a good value is saved and then read back as the newest pulse', '88 bpm' in page.locator('#view').inner_text(), page.locator('#health-message').inner_text())

        # M10 by keyboard: a place is attributed only after the person chooses it.
        open_by_keyboard(page, 'habitat')
        check('habitat: before a choice nothing is attributed to the person', 'nothing is attributed to you' in page.locator('#view').inner_text().lower())
        check('habitat: the place select is reachable', focus_until(page, "document.activeElement.id === 'habitat-place'", 'Tab'))
        page.keyboard.press('ArrowDown')
        page.wait_for_function("document.querySelector('#view').textContent.includes('the place you chose')", timeout=10000)
        check('habitat: after the choice its readings are shown with "the place you chose", focus kept', page.evaluate("document.activeElement.id") == 'habitat-place')
        check('habitat: the other place stays marked as not attributed', 'Not attributed to you' in page.locator('#view').inner_text())

        # M11 by keyboard: another variable on the chart; a gap stays a gap.
        open_by_keyboard(page, 'my-progress')
        check('my-progress: the variable select is reachable', focus_until(page, "document.activeElement.id === 'progress-variable'", 'Tab'))
        before = page.locator('#sec-chart').inner_text()
        page.keyboard.press('ArrowDown')
        page.wait_for_function(f"document.querySelector('#sec-chart').textContent !== {json.dumps(before)}", timeout=10000)
        check('my-progress: another variable is charted and focus is kept', page.evaluate("document.activeElement.id") == 'progress-variable', page.locator('#sec-chart').inner_text())
        page.keyboard.press('Home')
        page.wait_for_function(f"document.querySelector('#sec-chart').textContent === {json.dumps(before)}", timeout=10000)
        page.locator('#view details.table-toggle summary').first.focus()
        page.keyboard.press('Enter')
        table = page.locator('#view table.data-table').first.inner_text()
        check('my-progress: the chart table opens by keyboard and says "not recorded" for the empty day', 'not recorded' in table, table[:200])

        # M12 by keyboard: the link to "I feel different" is a real link.
        open_by_keyboard(page, 'my-day')
        check('my-day: the link to "I feel different" is reachable and works', focus_until(page, "document.activeElement.getAttribute('href') === '#/i-feel-different' && document.querySelector('#view').contains(document.activeElement)", 'Tab'))
        page.keyboard.press('Enter')
        page.wait_for_function("location.hash === '#/i-feel-different'", timeout=10000)
        check('my-day: that view is not built, and says so', 'not available yet' in page.locator('#view').inner_text().lower())

        # Reflow: no sideways page scroll at 320 px in any of the five views.
        page.set_viewport_size({'width': 320, 'height': 700})
        for view in VIEWS:
            page.evaluate(f"location.hash = '#/{view}'")
            page.wait_for_function(f"document.querySelector('#view-title').textContent === '{TITLES[view]}'", timeout=15000)
            page.wait_for_function("!document.querySelector('#view-body').textContent.includes('Loading')", timeout=15000)
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
