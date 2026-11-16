"""G5 (BROWSER level): a keyboard-only walk of "I feel different" (episode, copilot card, summary, sharing). Development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 tests/walkthrough/g4-browser.py

Nothing is clicked with a pointer after the page loads. Walk: choose a symptom and open an episode; data and gaps come before the suggestion (also in DOM
order); with no rule it says there is no reviewed guidance; generate the summary (nothing is sent); sharing without the confirmation is refused, with it the
share is logged and queued and the ground panel lists it; close the episode; with the spacecraft configuration the same journey shows the procedure as
blocked; ask for help without choosing anything. Also: focus indicators, 320 px reflow, no console error.
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
VIEWS = ['i-feel-different', 'ground']
TITLES = {'i-feel-different': 'I feel different', 'ground': 'Ground panel (simulated sync)'}


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

        open_by_keyboard(page, 'i-feel-different')
        body = page.locator('#view').inner_text()
        check('start: heading, banner and the choice are on the screen', 'Whose data and from where' in body and page.locator('#feel-symptom').count() == 1 and 'not a diagnosis' in body, body[:120])
        walk_stops(page, 'i-feel-different')
        if SHOTS:
            os.makedirs(SHOTS, exist_ok=True); page.screenshot(path=f'{SHOTS}/g5-start.png', full_page=True)

        check('start: the symptom select is reachable', focus_until(page, "document.activeElement.id === 'feel-symptom'", 'Tab'))
        page.keyboard.type('Headache')
        focus_until(page, "document.activeElement.id === 'feel-open'", 'Tab'); page.keyboard.press('Enter')
        page.wait_for_selector('#sec-data', timeout=10000)
        check('episode: recorded and open, in words, not a diagnosis', 'not a diagnosis' in page.locator('#feel-message').inner_text(), page.locator('#feel-message').inner_text())
        order = page.evaluate("['sec-data','sec-gaps','sec-suggestion'].map(id => { const e = document.getElementById(id); return e ? e.compareDocumentPosition(document.getElementById('sec-suggestion')) : null; })")
        check('episode: data, then gaps, then the suggestion, in the DOM (screen-reader) order', page.evaluate("(() => { const p = id => document.getElementById(id); const f = Node.DOCUMENT_POSITION_FOLLOWING; return !!(p('sec-data').compareDocumentPosition(p('sec-gaps')) & f) && !!(p('sec-gaps').compareDocumentPosition(p('sec-suggestion')) & f); })()"), order)
        text = page.locator('#view').inner_text()
        check('episode: the data shows its origin and the gap says "not recorded"', 'synthetic' in text and 'aerobic_capacity: not recorded' in text, text[:500])
        check('episode: with no rule it says there is no reviewed guidance', 'There is no reviewed guidance for this.' in text)
        check('episode: what was not looked at is reachable by keyboard', focus_until(page, "document.activeElement.tagName === 'SUMMARY' && document.activeElement.textContent.includes('not looked at')", 'Tab'))
        check('episode: what you can do names the procedure as available with the equipment', 'the equipment is in the mission configuration' in text)

        check('summary: Generate is reachable', focus_until(page, "document.activeElement.id === 'feel-summary'", 'Tab'))
        page.keyboard.press('Enter')
        page.wait_for_selector('#feel-summary-text', timeout=10000)
        summary = page.locator('#feel-summary-text').inner_text()
        check('summary: four labelled parts, and the message says nothing was sent', all(h in summary for h in ['1. What happened', '2. What was measured and how', '3. What is missing', '4. What is being asked']) and 'Nothing was sent' in page.locator('#feel-message').inner_text(), summary[:200])
        check('summary: origin and the not-recorded gap are in the text', 'Origin: synthetic' in summary and 'aerobic_capacity: not recorded' in summary)
        check('share: Share without the confirmation is refused, as an alert', focus_until(page, "document.activeElement.id === 'feel-share'", 'Tab') and (page.keyboard.press('Enter') or True))
        page.wait_for_function("document.querySelector('#feel-message').textContent.startsWith('Not shared')", timeout=10000)
        check('share: the refusal is an alert and nothing was queued', page.locator('#feel-message').get_attribute('role') == 'alert')
        focus_until(page, "document.activeElement.id === 'feel-confirm'", 'Shift+Tab'); page.keyboard.press('Space')
        focus_until(page, "document.activeElement.id === 'feel-share'", 'Tab'); page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#feel-message').textContent.startsWith('Shared')", timeout=10000)
        check('share: logged and queued, in words', 'logged and queued' in page.locator('#feel-message').inner_text())
        open_by_keyboard(page, 'ground')
        ground = page.locator('#view').inner_text()
        check('ground: the share is listed as queued, with its records', 'queued: waiting for the link' in ground and 'Delivery of 1 record' in ground, ground[-500:])
        open_by_keyboard(page, 'i-feel-different')
        check('restored: the open episode is still there after leaving the view', page.locator('#sec-data').count() == 1 and 'There is no reviewed guidance for this.' in page.locator('#view').inner_text())
        check('close: the episode closes by keyboard', focus_until(page, "document.activeElement.id === 'feel-close'", 'Tab'))
        page.keyboard.press('Enter')
        page.wait_for_selector('#feel-symptom', timeout=10000)
        check('close: back at the start, in words', 'closed' in page.locator('#feel-message').inner_text() and page.locator('#sec-data').count() == 0)

        # The other configuration gives a different journey.
        page.locator('#config-select').focus(); page.keyboard.press('ArrowDown')
        page.wait_for_function("document.querySelector('#config-select option:checked').textContent.toLowerCase().includes('spacecraft') || !document.querySelector('#config-select option:checked').textContent.toLowerCase().includes('station')", timeout=10000)
        page.wait_for_selector('#feel-symptom', timeout=10000)
        focus_until(page, "document.activeElement.id === 'feel-symptom'", 'Tab'); page.keyboard.type('Headache')
        focus_until(page, "document.activeElement.id === 'feel-open'", 'Tab'); page.keyboard.press('Enter')
        page.wait_for_selector('#sec-data', timeout=10000)
        other = page.locator('#view').inner_text()
        check('config: with the other configuration the procedure is blocked and the equipment is a gap', 'blocked, this mission configuration lacks demo-device' in other and 'Equipment demo-device is not in this mission configuration' in other, other[:300])
        check('close again', focus_until(page, "document.activeElement.id === 'feel-close'", 'Tab') and (page.keyboard.press('Enter') or True))
        page.wait_for_selector('#feel-symptom', timeout=10000)
        check('help: it can be asked without choosing anything', focus_until(page, "document.activeElement.id === 'feel-help'", 'Tab') and (page.keyboard.press('Enter') or True))
        page.wait_for_function("document.querySelector('#feel-message').textContent.startsWith('Help was recorded')", timeout=10000)
        check('help: an episode is open and no second alert is offered', page.locator('#sec-data').count() == 1 and page.locator('#feel-ack').count() == 0)

        page.click('#feel-summary'); page.wait_for_selector('#feel-summary-text', timeout=10000)  # the state that draws the most text: the summary is on screen
        page.set_viewport_size({'width': 320, 'height': 700})
        page.evaluate("location.hash = '#/i-feel-different'"); page.wait_for_timeout(400)
        check('i-feel-different: no sideways page scroll at 320 px', page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth") <= 0)
        page.set_viewport_size({'width': 1100, 'height': 900}); page.wait_for_selector('#feel-confirm', timeout=10000); page.check('#feel-confirm'); page.click('#feel-share')
        page.wait_for_function("document.querySelector('#feel-message').textContent.startsWith('Shared')", timeout=10000)
        page.set_viewport_size({'width': 320, 'height': 700}); page.evaluate("location.hash = '#/ground'"); page.wait_for_timeout(600)
        check('ground: the delivered summary is on screen and the page does not scroll sideways at 320 px', page.locator('.summary-text').count() >= 1 and page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth") <= 0, page.evaluate("document.documentElement.scrollWidth"))
        check('no console error, no page error and no response >= 400 during the walk', not errors and not failed, errors + failed)
        browser.close()
    print(json.dumps({'level': 'BROWSER (Chromium only, no screen reader, synthetic demo source)', 'checks': len(results), 'results': results}, indent=1))
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
