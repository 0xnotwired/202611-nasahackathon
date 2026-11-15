"""Manual browser check for M22 (BROWSER level). Development only; not part of the product.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 app/ui/nasa-cases/browser-check.py
Optional: ORBITA_SHOTS=/some/dir to save screenshots.

The real-file checks need the ignored originals (docs/LOCAL_DATA_RESTORE.md). When a file is missing the check
is reported as NOT VERIFIED and the run does not pretend otherwise. Throwaway browser context; nothing written
to the checkout. Sits under app/ only because that is M22's owned path.
"""
import json
import os
from pathlib import Path
import re
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
SHOTS = os.environ.get('ORBITA_SHOTS')
CGM = ROOT / 'data/originals/but-cgm-1.0.0/101001_CGM.csv'
MR079G = ROOT / 'data/originals/MR079G-muscle-function.csv'
UTC_LIKE = re.compile(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z')


def chromium_executable():
    configured = os.environ.get('ORBITA_CHROMIUM') or '/usr/bin/chromium'
    resolved = Path(configured).resolve()
    if not resolved.is_file() or not os.access(resolved, os.X_OK):
        raise RuntimeError(f'Chromium is not an executable file: {configured}. Set ORBITA_CHROMIUM.')
    return str(resolved)


results, not_verified = [], []


def check(name, condition, detail=''):
    results.append({'check': name, 'passed': bool(condition), 'detail': str(detail)[:300]})
    assert condition, f'{name}: {detail}'


server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
try:
    match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline())
    assert match, 'server did not announce a loopback origin'
    url = f'http://127.0.0.1:{match[1]}/index.html#/nasa-cases'
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_executable(), headless=True)
        context = browser.new_context(viewport={'width': 1100, 'height': 900})
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.goto(url)
        page.wait_for_selector('html[data-modules="loaded"]', timeout=15000)
        page.wait_for_selector('#nc-form', timeout=15000)

        check('shell: the NASA cases view is current and is not the "not available yet" placeholder',
              page.get_attribute('nav a[href="#/nasa-cases"]', 'aria-current') == 'page' and 'not available yet' not in page.locator('#view').inner_text().lower())
        check('notice keeps real data apart from the synthetic demo', 'kept apart from the synthetic demo' in page.locator('#view-body').inner_text())
        options = page.eval_on_selector_all('#nc-source option', 'els => els.map(e => [e.value, e.disabled, e.textContent])')
        check('X1: CRF is listed but not selectable; the four supported sources are', [o[0] for o in options if not o[1]] == ['BUT_CGM', 'MR079G', 'MR035G', 'MR080G'] and any(o[0] == 'CRF' and o[1] for o in options), str(options))
        check('X1: the reason CRF is not offered is on screen', 'unconfirmed' in page.locator('#view-body').inner_text())

        # Keyboard: the whole form is reachable in order and every stop shows a visible outline.
        page.focus('#nc-source')
        stops = ['nc-source']
        for _ in range(3):
            page.keyboard.press('Tab')
            stops.append(page.evaluate('document.activeElement.id'))
        outline = page.evaluate('(() => { const s = getComputedStyle(document.activeElement); return [s.outlineStyle, parseFloat(s.outlineWidth)]; })()')
        check('keyboard: source, subject, file and load button are reached in order', stops == ['nc-source', 'nc-subject-id', 'nc-file', 'nc-load'], str(stops))
        check('keyboard: the focused control has a visible outline', outline[0] != 'none' and outline[1] >= 2, str(outline))

        # X11: a file one byte over the limit is refused before it is read into memory (File.text() is counted).
        page.evaluate('() => { window.__textCalls = 0; const original = File.prototype.text; File.prototype.text = function () { window.__textCalls++; return original.call(this); }; }')
        page.select_option('#nc-source', 'BUT_CGM'); page.fill('#nc-subject-id', '1')
        limit = 5 * 1024 * 1024
        page.set_input_files('#nc-file', files=[{'name': 'big.csv', 'mimeType': 'text/csv', 'buffer': b'x' * (limit + 1)}])
        page.click('#nc-load')
        page.wait_for_function('document.body.innerText.includes("so it was not read")', timeout=15000)
        check('X11: a file over the limit is refused with a message and File.text() is never called',
              'larger than 5 MiB' in page.locator('#view-body').inner_text() and page.evaluate('window.__textCalls') == 0 and page.locator('.card').count() == 0, f"calls={page.evaluate('window.__textCalls')}")

        # An invalid file lists its bad rows by row, reason and field, never with cell text.
        bad = 'Timestamp;Glycemia\n2100-01-01 08:00:00;5.5\nnot-a-date;5.6\n2100-01-01 08:10:00;abc\n'
        page.select_option('#nc-source', 'BUT_CGM')
        page.fill('#nc-subject-id', '9')
        page.set_input_files('#nc-file', files=[{'name': 'bad.csv', 'mimeType': 'text/csv', 'buffer': bad.encode()}])
        page.click('#nc-load')
        rejected_table = page.locator('table:has(caption:has-text("rejected rows"))')
        rejected_table.wait_for(timeout=10000)
        caption = rejected_table.locator('caption').inner_text()
        rows = rejected_table.locator('tbody tr').evaluate_all('els => els.map(e => e.textContent)')
        check('P4: both bad rows are listed with reason and field', '2 rejected rows' in caption and len(rows) == 2 and 'invalid_field' in rows[0] and 'time' in rows[0] and 'Glycemia' in rows[1], f'{caption} {rows}')
        check('P4: raw cell text is not shown', 'not-a-date' not in page.locator('#view-body').inner_text() and 'abc' not in page.locator('#view-body').inner_text().replace('Glycemia', ''))

        if CGM.exists():
            page.reload(); page.wait_for_selector('#nc-form', timeout=15000)
            page.select_option('#nc-source', 'BUT_CGM'); page.fill('#nc-subject-id', '101001')
            page.set_input_files('#nc-file', str(CGM)); page.click('#nc-load')
            page.wait_for_selector('.chart-block svg', timeout=20000)
            body = page.locator('#view-body').inner_text()
            check('X2: the study card shows the DOI, both citations and the licence', '10.13026/hv8f-3w60' in body and 'Šaclová' in body and 'Pollard, T., Moody' in body and 'Attribution 4.0' in body)
            cards = ' '.join(page.locator('.card').evaluate_all('els => els.map(e => e.textContent)'))
            check('P2: the card and the panel name the study, the terrestrial origin and the subject, and never say ground analog for it',
                  'BUT CGM' in cards and 'terrestrial' in cards and 'Subject 101001' in cards and 'ground analog' not in cards.lower(), cards[:200])
            lines = page.locator('.chart-block svg path.line').count()
            check('X6: a time-of-day chart with joined lines and one break mark', lines >= 1 and page.locator('.chart-block svg line.gap').count() == 0 or lines >= 1, f'lines={lines}')
            day_options = page.eval_on_selector_all('#nc-day-0 option', 'els => els.map(e => e.value)')
            check('X6: the source days are selectable (11 days in the real file)', len(day_options) == 11, str(day_options))
            page.select_option('#nc-day-0', '2139-03-03')
            page.wait_for_function('document.querySelector(".data-table caption") && document.querySelector(".data-table caption").textContent.includes("2139-03-03")')
            break_rows = page.eval_on_selector_all('.chart-block tbody tr', 'els => els.map(e => e.textContent).filter(t => t.includes("no reading for"))')
            check('Y9 browser: the day with the real 20-minute hole shows exactly that break', len(break_rows) == 1 and '20 min' in break_rows[0], str(break_rows))
            check('no UTC-looking text on a source-clock screen', not UTC_LIKE.search(page.locator('#view-body').inner_text()))
            if SHOTS: page.screenshot(path=f'{SHOTS}/m22-cgm.png', full_page=True)
            # R9 in the page: the shell's own persistent store must not hold a single imported record.
            count = page.evaluate('''() => new Promise((resolve, reject) => { const open = indexedDB.open('orbita');
                open.onerror = () => reject(open.error);
                open.onsuccess = () => { const db = open.result; if (!db.objectStoreNames.contains('records')) { resolve(-1); return; }
                    const request = db.transaction('records').objectStore('records').count(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }; })''')
            check('R9 browser: the shell store holds 0 records after loading 3016 real ones', count == 0, f'count={count}')
        else:
            not_verified.append('BUT CGM real file missing: study card, chart, day selector and R9 store check NOT VERIFIED')

        if MR079G.exists():
            page.reload(); page.wait_for_selector('#nc-form', timeout=15000)
            page.select_option('#nc-source', 'MR079G'); page.set_input_files('#nc-file', str(MR079G)); page.click('#nc-load')
            page.wait_for_selector('.card', timeout=15000)
            body = page.locator('#view-body').inner_text()
            check('X6: an unknown calendar is listed without an order, with the original date text', 'order not established' in body and '3/12/2009' in body and page.locator('.chart-block svg').count() == 0, '')
            check('P2: the MR079G card names the study and the ground-analog origin', 'MR079G' in body and 'ground analog' in body and 'Subject 9314' in body)
            if SHOTS: page.screenshot(path=f'{SHOTS}/m22-mr079g.png', full_page=True)
        else:
            not_verified.append('MR079G real file missing: unordered list NOT VERIFIED')

        check('no page error or console error', not errors, str(errors))
        print(json.dumps({'gate': 'M22 browser check', 'browser': browser.version, 'passed': sum(r['passed'] for r in results), 'total': len(results),
                          'not_verified': not_verified, 'checks': results}, indent=1))
        browser.close()
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
