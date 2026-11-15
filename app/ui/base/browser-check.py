"""Manual browser check for M07 (BROWSER level). Not part of the product; development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 app/ui/base/browser-check.py
Optional: ORBITA_SHOTS=/some/dir to save screenshots there.

Needs Python Playwright and a Chromium executable (see docs/LOCAL_DATA_RESTORE.md). It starts the local
server on a free loopback port, uses a throwaway browser context (no profile, nothing written to the
checkout) and stops the server. Sits under app/ only because that is M07's owned path; the orchestrator
may move it next to the other walkthrough scripts.
"""
import json
import os
from pathlib import Path
import re
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
SHOTS = os.environ.get('ORBITA_SHOTS')
NAV = ['my-health', 'adaptation', 'habitat', 'my-progress', 'my-day', 'my-plan', 'on-board', 'i-feel-different', 'nasa-cases', 'ground']


def chromium_executable():
    configured = os.environ.get('ORBITA_CHROMIUM') or '/usr/bin/chromium'
    resolved = Path(configured).resolve()
    if not resolved.is_file() or not os.access(resolved, os.X_OK):
        raise RuntimeError(f'Chromium is not an executable file: {configured}. Set ORBITA_CHROMIUM.')
    return str(resolved)


def check(results, name, condition, detail=''):
    results.append({'check': name, 'passed': bool(condition), 'detail': detail})
    assert condition, f'{name}: {detail}'


server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env={**os.environ, 'PORT': '0'},
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
results = []
try:
    match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline())
    assert match, 'server did not announce a loopback origin'
    url = f'http://127.0.0.1:{match[1]}/index.html'
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_executable(), headless=True)
        context = browser.new_context(viewport={'width': 1000, 'height': 800})
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        failed = []
        page.on('response', lambda r: failed.append(f'{r.status} {r.url}') if r.status >= 400 else None)
        page.goto(url)
        page.wait_for_selector('html[data-modules="loaded"]', timeout=15000)

        # M07-P6 (server side): the static notice is gone and the shell is there.
        status = page.locator('#status').inner_text()
        check(results, 'P6 server: static notice replaced by the shell status line', 'Modules loaded (contracts' in status and 'Open this page through' not in page.content(), status)
        check(results, 'P4 browser: ten navigation links, in order', page.eval_on_selector_all('nav a', 'els => els.map(e => e.getAttribute("href"))') == [f'#/{n}' for n in NAV])
        page.evaluate("location.hash = '#/my-plan'"); page.wait_for_function("document.querySelector('#view-title').textContent === 'My plan'")
        main_text = page.locator('#view').inner_text()
        check(results, 'P4 browser: unbuilt view says "not available yet"', 'not available yet' in main_text.lower(), main_text)
        check(results, 'F6 browser: the default data source is the synthetic demo and the shell says so', 'Synthetic demo' in page.locator('#source-select option:checked').inner_text(), '')
        page.select_option('#source-select', 'mine')
        page.wait_for_function('document.querySelector("#announce").textContent.includes("Data source changed")')
        storage = page.locator('#storage-notice').inner_text()
        check(results, 'P5 browser: persistent store shows its line, not a promise of protection', 'not encrypted' in storage, storage)

        # M07-X9: keyboard. Tab from the top; every nav link and the select must receive focus with a visible outline.
        page.evaluate('document.activeElement && document.activeElement.blur()')
        seen, outlines = [], []
        for _ in range(20):
            page.keyboard.press('Tab')
            info = page.evaluate('''() => { const e = document.activeElement; const s = getComputedStyle(e);
                return {tag: e.tagName, href: e.getAttribute('href'), id: e.id, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth}; }''')
            seen.append(info['href'] or info['id'] or info['tag'])
            if info['tag'] in ('A', 'SELECT'): outlines.append(info)
        check(results, 'X9: Tab reaches the skip link, the configuration select and all ten views',
              seen[0] == '#view' and 'config-select' in seen and all(f'#/{n}' in seen for n in NAV), str(seen))
        check(results, 'X9: every focused control shows a visible outline', all(o['outlineStyle'] != 'none' and float(o['outlineWidth'].replace('px', '')) >= 2 for o in outlines), str(outlines[:2]))
        if SHOTS: page.screenshot(path=f'{SHOTS}/m07-shell.png')

        # Enter on a link navigates, marks it current and moves focus to the view.
        page.focus('nav a[href="#/habitat"]')
        page.keyboard.press('Enter')
        page.wait_for_function('location.hash === "#/habitat"')
        page.wait_for_function('document.activeElement && document.activeElement.id === "view"')
        check(results, 'X9: Enter navigates, aria-current moves, focus lands on the view',
              page.get_attribute('nav a[href="#/habitat"]', 'aria-current') == 'page' and page.locator('nav a[aria-current="page"]').count() == 1 and page.locator('#view-title').inner_text() == 'Habitat')
        check(results, 'P4 browser: navigation still lists ten views after navigating', page.locator('nav a').count() == 10)

        # Configuration selector: change it and the shell stays whole and announces the change.
        options = page.eval_on_selector_all('#config-select option', 'els => els.map(e => e.textContent)')
        check(results, 'X7 browser: selector lists every scenario configuration with its link and environment', len(options) >= 2 and all(' — ' in o for o in options), str(options))
        page.select_option('#config-select', index=1)
        page.wait_for_function('document.querySelector("#announce").textContent.includes("Mission configuration changed")')
        check(results, 'X7 browser: change is announced and the ten views remain', page.locator('nav a').count() == 10)

        # M07-X10 and X11: render untrusted text and a chart with a gap in a real page.
        outcome = page.evaluate('''async () => {
            const chart = await import('/ui/base/chart.js'); const dom = await import('/ui/base/dom.js');
            const host = document.createElement('div'); host.id = 'probe'; document.body.append(host);
            const table = chart.accessibleTable({caption: 'Injection probe', columns: [{key: 'a', label: 'A'}], rows: [{a: '<img src=x onerror="window.__xss=1"><b>bold</b>'}]});
            host.append(dom.renderTable(document, table));
            const day = n => `2026-03-0${n}`;
            const pt = (n, v) => ({id: 'p' + n, day: day(n), value: v});
            const model = chart.lineChart({points: [pt(1, 60), pt(2, 61), pt(4, 64), pt(5, 63)], gaps: [{day: day(3), reason: 'no_record'}], n: 4, non_comparable_groups: [{reason: 'Different method', key: {}, n: 2, points: []}]}, {unit: 'bpm', label: 'Pulse'});
            host.append(dom.renderChart(document, model));
            host.querySelector('details').open = true;
            const src = chart.lineChart({points: [pt(1, 5.5), pt(2, 5.6)], gaps: [], n: 2, clock: {scope: 's', calendar: 'shifted', precision: 'second', timezone: null},
                non_comparable_groups: [{reason: 'Unknown unit: not comparable', key: {method: null, unit: null, unit_status: 'unknown'}, n: 1, points: [{id: 'q', day: day(2), value: 7, unit: null, method: 'm', origin: 'ground_analog'}]}]}, {unit: 'mmol/L', label: 'Glucose'});
            const host2 = document.createElement('div'); host2.id = 'probe2'; document.body.append(host2);
            host2.append(dom.renderChart(document, src)); host2.querySelector('details').open = true;
            const sourceView = {caption: host2.querySelector('figcaption').textContent, head: host2.querySelector('thead th').textContent,
                                rows: [...host2.querySelectorAll('tbody tr')].map(r => r.textContent), circles: host2.querySelectorAll('svg circle.point').length};
            const times = ['08:00:00', '08:05:00', '08:10:10', '08:40:00', '08:45:00'];
            const tod = chart.lineChart({points: times.map((t, i) => ({id: 't' + i, day: '2100-01-01', time: null, source_time: '2100-01-01T' + t, value: 5 + i / 10, unit: 'mmol/L'})),
                gaps: [], n: 5, non_comparable_groups: [], clock: {scope: 's', calendar: 'shifted', precision: 'second', timezone: null}},
                {unit: 'mmol/L', label: 'Glucose', resolution: 'time', day: '2100-01-01', sampling: {interval_s: 300, source: 'BUT CGM README'}});
            const host3 = document.createElement('div'); host3.id = 'probe3'; document.body.append(host3);
            host3.append(dom.renderChart(document, tod)); host3.querySelector('details').open = true;
            const timeView = {lines: host3.querySelectorAll('svg path.line').length, gaps: host3.querySelectorAll('svg line.gap').length, head: host3.querySelector('thead th').textContent,
                              legend: host3.querySelector('.legend').textContent, rows: [...host3.querySelectorAll('tbody tr')].map(r => r.textContent)};
            return {sourceView, timeView, xss: window.__xss ?? null, img: host.querySelector('td img, th img') !== null, cell: host.querySelector('td, tbody th').textContent,
                    lines: host.querySelectorAll('svg path.line').length, points: host.querySelectorAll('svg circle.point').length, gaps: host.querySelectorAll('svg line.gap').length,
                    rows: [...host.querySelectorAll('.chart-block tbody tr')].map(r => r.textContent), note: host.querySelector('.notice-warning').textContent};
        }''')
        check(results, 'X10: markup in a cell is shown as text, never parsed', outcome['xss'] is None and not outcome['img'] and '<img' in outcome['cell'], str(outcome['cell']))
        check(results, 'X11: two separate drawn lines, four markers, one visible gap mark', (outcome['lines'], outcome['points'], outcome['gaps']) == (2, 4, 1), str(outcome))
        check(results, 'X11: the table beside the chart has five rows and day 3 reads "not recorded"', len(outcome['rows']) == 5 and 'not recorded' in outcome['rows'][2], str(outcome['rows']))
        sv = outcome['sourceView']
        check(results, 'Y3: a source-clock chart says source days and time zone not established, in caption and table head',
              'time zone not established' in sv['caption'] and 'Source day' in sv['head'], str(sv))
        check(results, 'Y3: the unknown-unit value is in the table as not drawn and has no marker',
              any('7 (unit unknown)' in r and 'not drawn' in r for r in sv['rows']) and sv['circles'] == 2, str(sv))
        tv = outcome['timeView']
        check(results, 'Y10: time-of-day chart in a page: two lines, one break mark, time-of-day column, break legend, break row',
              tv['lines'] == 2 and tv['gaps'] == 1 and 'Source time of day' in tv['head'] and 'sampling intervals' in tv['legend']
              and any('no reading for 29 min 50 s' in r for r in tv['rows']), str(tv))
        check(results, 'X11: the gap mark has a visible legend', 'Dashed vertical mark' in page.locator('#probe .legend').inner_text())
        check(results, 'X4 browser: values with another method are named, not drawn', '2 values' in outcome['note'] and 'method' in outcome['note'], outcome['note'])
        if SHOTS:
            page.locator('#probe3 .chart-block').screenshot(path=f'{SHOTS}/m07-time-of-day.png')
            page.locator('#probe').scroll_into_view_if_needed()
            page.locator('#probe .chart-block').screenshot(path=f'{SHOTS}/m07-chart.png')
        check(results, 'no page error or console error on the main page', not errors, f'{errors} failed requests: {failed}')

        if SHOTS:  # look at the dark scheme once; the checks above ran in the default (light) scheme
            dark = browser.new_context(viewport={'width': 1000, 'height': 500}, color_scheme='dark')
            dark_page = dark.new_page()
            dark_page.goto(url)
            dark_page.wait_for_selector('html[data-modules="loaded"]', timeout=15000)
            dark_page.screenshot(path=f'{SHOTS}/m07-shell-dark.png')
            dark.close()

        # M07-P5 control: no IndexedDB at all. The store never falls back silently; the shell must say so.
        nodb = context.new_page()
        nodb.add_init_script('Object.defineProperty(window, "indexedDB", {value: undefined})')
        nodb.goto(url)
        nodb.wait_for_selector('html[data-modules="loaded"]', timeout=15000)
        nodb.select_option('#source-select', 'mine')
        nodb.wait_for_function('document.querySelector("#announce").textContent.includes("Data source changed")')
        warning = nodb.locator('#storage-notice').inner_text()
        check(results, 'P5 browser: without IndexedDB the shell says data is not saved and why', 'Not saved' in warning and 'IndexedDB could not be used' in warning, warning)

        # M07-P6 controls: transport failure keeps the plain-text notice (same control as G0-W2).
        broken = context.new_page()
        broken.route('**/contracts/data.js', lambda route: route.abort())
        broken.goto(url)
        check(results, 'P6 control: a module that cannot load leaves the plain-text notice and no shell',
              'Open this page through the local server' in broken.locator('#status').inner_text() and broken.locator('html').get_attribute('data-modules') is None and broken.locator('nav').count() == 0)

        file_observation = 'not attempted'
        file_page = context.new_page()
        try:
            file_page.goto((ROOT / 'app/index.html').as_uri())
            file_page.wait_for_timeout(1500)
            file_ok = 'Open this page through the local server' in file_page.locator('#status').inner_text() and file_page.locator('html').get_attribute('data-modules') is None
            check(results, 'P6 file://: the plain-text notice stays and the shell does not start', file_ok)
            file_observation = 'file page opened; notice visible; modules did not run'
        except AssertionError:
            raise
        except Exception as error:
            if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(error): raise
            file_observation = 'blocked by managed policy before the page loaded; file:// behaviour NOT verified'
        print(json.dumps({'gate': 'M07 browser check', 'browser': browser.version, 'file_observation': file_observation,
                          'passed': sum(r['passed'] for r in results), 'total': len(results), 'checks': results}, indent=1))
        browser.close()
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
