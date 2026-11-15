"""G4 (BROWSER level): a keyboard-only walk of the procedure editor, the simulated ground panel and the IndexedDB v1 to v2 upgrade. Development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 tests/walkthrough/g4-browser.py

Nothing is clicked with a pointer after the page loads. Walk: (1) a database created at schema version 1, with a record in it, is opened by the
current store: the record is still there and the new `procedures` collection works. (2) On board: write a procedure by keyboard, publish it as a
draft, then change an existing one and see its next version. (3) Ground panel: nothing sent; share a recorded and a not-recorded entry with the
confirmation; deliver; the ground list keeps "not recorded"; switch the mission configuration to the delayed and the no-link ones and see the link
follow it. Also: focus indicators, 320 px reflow, no console error.
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
VIEWS = ['on-board', 'ground']
TITLES = {'on-board': 'On board', 'ground': 'Ground panel (simulated sync)'}


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

        # (1) Upgrade: a version 1 database with the seven original collections and one record, opened by the current store.
        upgrade = page.evaluate("""async () => {
          const name = 'legacy-v1-check';
          await new Promise((resolve, reject) => { const r = indexedDB.open(name, 1); r.onupgradeneeded = () => { for (const c of ['records','executions','tasks','episodes','shared','deliveries','config']) r.result.createObjectStore(c, {keyPath: 'id'}); };
            r.onsuccess = () => { const tx = r.result.transaction('records', 'readwrite'); tx.objectStore('records').put({id: 'legacy-1', schema_version: 2, type: 'measurement', state: 'recorded', variable: 'pulse', value: 61, unit: 'bpm', method: 'm', time: '2026-01-01T00:00:00.000Z', origin: 'synthetic', source: 'user_entered', mission_phase: 'x', subject: 's'});
              tx.oncomplete = () => { r.result.close(); resolve(); }; tx.onerror = () => reject(tx.error); }; r.onerror = () => reject(r.error); });
          const {openStore} = await import('./store/index.js'); const {publishProcedure, listProcedures} = await import('./procedures/index.js');
          const opened = await openStore({kind: 'indexeddb', name}); if (!opened.ok) return {opened: opened.error};
          const store = opened.value; const kept = await store.get('records', 'legacy-1');
          const proc = {id: 'p', version: '1', title: 't', purpose: 'x', required_equipment: [], preparation: [], steps: [{id: 'a', text: 'b'}], source: 'user_entered', review_status: 'draft'};
          const published = await publishProcedure(store, proc, {clock: () => '2026-11-15T10:00:00.000Z'}); const listed = await listProcedures(store);
          await store.close(); await new Promise(resolve => { const d = indexedDB.deleteDatabase(name); d.onsuccess = d.onerror = d.onblocked = resolve; });
          return {opened: true, record: kept.ok ? kept.value.value : null, published: published.ok, listed: listed.ok ? listed.value.length : listed.error};
        }""")
        check('upgrade: a version 1 database opens with the current store', upgrade.get('opened') is True, upgrade)
        check('upgrade: the record saved before the upgrade is still there, unchanged', upgrade.get('record') == 61, upgrade)
        check('upgrade: the new procedures collection works after the upgrade', upgrade.get('published') is True and upgrade.get('listed') == 1, upgrade)

        for view in VIEWS:
            open_by_keyboard(page, view)
            body = page.locator('#view').inner_text()
            check(f'{view}: heading and banner are on the screen', TITLES[view] in page.locator('#view-title').inner_text() and 'Whose data and from where' in body, body[:100])
            check(f'{view}: no error notice', page.locator('#view .notice-error').count() == 0)
            walk_stops(page, view)
            if SHOTS:
                os.makedirs(SHOTS, exist_ok=True); page.screenshot(path=f'{SHOTS}/g4-{view}.png', full_page=True)

        # (2) The editor, by keyboard.
        open_by_keyboard(page, 'on-board')
        check('editor: the summary opens the form by keyboard', focus_until(page, "document.activeElement.tagName === 'SUMMARY' && document.activeElement.textContent.includes('Write or change')", 'Tab'))
        page.keyboard.press('Enter')
        check('editor: the form is open', page.locator('#editor-form').is_visible())
        page.locator('#editor-title').focus(); page.keyboard.type('Hydration check')
        focus_until(page, "document.activeElement.id === 'editor-purpose'", 'Tab'); page.keyboard.type('Write down the amount drunk')
        focus_until(page, "document.activeElement.id === 'editor-equipment'", 'Tab'); page.keyboard.type('demo-device')
        focus_until(page, "document.activeElement.id === 'editor-steps'", 'Tab'); page.keyboard.type('Fill the cup'); page.keyboard.press('Enter'); page.keyboard.type('Drink')
        focus_until(page, "document.activeElement.id === 'editor-publish'", 'Tab'); page.keyboard.press('Enter')
        page.wait_for_selector('#board-message', timeout=10000)
        check('editor: published as a draft, in words', 'Published version 1' in page.locator('#board-message').inner_text() and 'draft' in page.locator('#board-message').inner_text(), page.locator('#board-message').inner_text())
        text = page.locator('#view').inner_text()
        check('editor: the new procedure is listed as a draft that is not reviewed guidance, with its source', 'Hydration check' in text and 'draft: written by a person, not reviewed guidance' in text and 'source user_entered' in text)
        check('editor: the form is kept open and emptied after a good publish', page.locator('#editor-form').is_visible() and page.locator('#editor-title').input_value() == '')
        focus_until(page, "document.activeElement.id === 'editor-publish'", 'Tab')
        page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#board-message') && document.querySelector('#board-message').textContent.startsWith('Not saved')", timeout=10000)
        check('editor: an empty form is refused in words, as an alert', page.locator('#board-message').get_attribute('role') == 'alert', page.locator('#board-message').inner_text())
        page.locator('#editor-based-on').focus()
        page.keyboard.type('Change: Fictional')
        check('editor: choosing an existing procedure fills the form from its current version', 'Fictional recording walkthrough' in page.locator('#editor-title').input_value() and page.locator('#editor-steps').input_value().count('\n') == 2)
        page.locator('#editor-title').focus(); page.keyboard.press('End'); page.keyboard.type(' (edited)')
        focus_until(page, "document.activeElement.id === 'editor-publish'", 'Tab'); page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#board-message').textContent.includes('Published version 2')", timeout=10000)
        check('editor: the change is version 2 of the same procedure, in words', 'Published version 2' in page.locator('#board-message').inner_text())
        check('editor: the list shows version 2 of the edited procedure', 'Fictional recording walkthrough — team demo only (edited)' in page.locator('#view').inner_text() and 'Version 2' in page.locator('#view').inner_text())

        # (3) The ground panel, by keyboard.
        open_by_keyboard(page, 'ground')
        text = page.locator('#view').inner_text()
        check('ground: it says simulated sync and shows no users, passwords or encryption', 'Simulated sync' in text and not re.search(r'password|log in|encrypt|secure', text, re.I))
        check('ground: the station configuration gives a real-time link', 'Link: real time' in page.locator('#ground-mode').inner_text())
        panel = page.locator('#sec-ground').locator('xpath=..').inner_text()
        check('ground: a subject that sent nothing reads "Nothing sent" in the received list, never "nothing new"', 'Nothing sent' in panel and 'nothing new' not in panel.lower(), panel)
        check('ground: the first record choice is reachable', focus_until(page, "document.activeElement.type === 'checkbox' && document.activeElement.id.startsWith('share-choice-')", 'Tab'))
        page.keyboard.press('Space')
        check('ground: a not-recorded entry can be chosen', focus_until(page, "document.activeElement.type === 'checkbox' && document.activeElement.labels[0].textContent.includes('not recorded')", 'Tab'))
        page.keyboard.press('Space')
        focus_until(page, "document.activeElement.id === 'share-send'", 'Tab'); page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#ground-message') && document.querySelector('#ground-message').textContent.startsWith('Not shared')", timeout=10000)
        check('ground: without the confirmation nothing is shared, in words, as an alert', page.locator('#ground-message').get_attribute('role') == 'alert' and 'Nothing sent' in page.locator('#view').inner_text())
        check('ground: the chosen records are still chosen after the refusal', page.locator('input[id^="share-choice-"]:checked').count() == 2)
        focus_until(page, "document.activeElement.id === 'share-confirm'", 'Shift+Tab'); page.keyboard.press('Space')
        focus_until(page, "document.activeElement.id === 'share-send'", 'Tab'); page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#ground-message').textContent.startsWith('Shared')", timeout=10000)
        text = page.locator('#view').inner_text()
        check('ground: shared, logged and queued, and not yet received', 'queued: waiting for the link' in text and 'Nothing has arrived yet' in text, text[-600:])
        check('ground: "Deliver what is due" is reachable', focus_until(page, "document.activeElement.id === 'ground-advance'", 'Tab'))
        page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#ground-message').textContent.includes('received by the ground panel')", timeout=10000)
        ground_text = page.locator('#sec-ground').locator('xpath=..').inner_text()
        check('ground: the delivery arrived with times and the age of the data', 'received by the ground panel' in ground_text and 'Created 2026-11-15T18:00:00' in ground_text and 'Data created less than 1 h ago' in ground_text, ground_text[:300])
        check('ground: the not-recorded entry arrived as "not recorded", with its origin', 'not recorded' in ground_text and 'synthetic' in ground_text)

        # The link follows the mission configuration.
        page.locator('#config-select').focus(); page.keyboard.press('ArrowDown')
        page.wait_for_function("document.querySelector('#ground-mode') && document.querySelector('#ground-mode').textContent.includes('delayed')", timeout=10000)
        check('ground: the spacecraft configuration gives a delayed link that waits for a delay', 'Set the delay to start moving deliveries' in page.locator('#view').inner_text())
        page.locator('#ground-delay').focus(); page.keyboard.type('20')
        focus_until(page, "document.activeElement.id === 'ground-set-delay'", 'Tab'); page.keyboard.press('Enter')
        page.wait_for_function("document.querySelector('#ground-message').textContent.startsWith('Delay set')", timeout=10000)
        check('ground: the delay is set in minutes, in words', '20 minutes' in page.locator('#ground-message').inner_text())
        page.locator('#config-select').focus(); page.keyboard.press('ArrowDown')
        page.wait_for_function("document.querySelector('#ground-mode') && document.querySelector('#ground-mode').textContent.includes('no link')", timeout=10000)
        check('ground: the rover configuration has no link: the earlier delivery is still shown as received, new ones would stay queued', 'Link: no link' in page.locator('#ground-mode').inner_text() and 'received by the ground panel' in page.locator('#view').inner_text())

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
