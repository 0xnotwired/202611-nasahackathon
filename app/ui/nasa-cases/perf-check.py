"""Timing of large files through the NASA cases view (BROWSER level, lab conditions). Development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 app/ui/nasa-cases/perf-check.py

It builds synthetic BUT-CGM-shaped CSV files (no real data needed), loads each through the real file input and reports
wall time from the click to the chart, the longest main-thread task seen, the DOM size and the time of one follow-up
interaction (choosing another day). The importer's own bound is 10000 records per call, so 10001 rows must be refused.

What this is not: field data. web.dev's INP threshold (200 ms at the 75th percentile of real users) is quoted by the
frontend-performance-budgets skill as a reference; one lab run on one machine cannot pass or fail it. The numbers are
reported as observations, with no verdict.
"""
import json
import os
from pathlib import Path
import re
import subprocess
from datetime import datetime, timedelta
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]


def chromium_executable():
    configured = os.environ.get('ORBITA_CHROMIUM') or '/usr/bin/chromium'
    resolved = Path(configured).resolve()
    if not resolved.is_file() or not os.access(resolved, os.X_OK):
        raise RuntimeError(f'Chromium is not an executable file: {configured}. Set ORBITA_CHROMIUM.')
    return str(resolved)


def cgm_file(rows, seconds_between):
    start = datetime(2100, 1, 1)
    lines = ['Timestamp;Glycemia']
    for index in range(rows):
        moment = start + timedelta(seconds=index * seconds_between)
        lines.append(f'{moment:%Y-%m-%d %H:%M:%S};{4 + (index % 40) / 10:.1f}')
    return ('\n'.join(lines) + '\n').encode()


CASES = [('1,000 readings, 5-minute spacing', 1000, 300), ('5,000 readings, 5-minute spacing', 5000, 300),
         ('9,990 readings, 5-minute spacing (35 days)', 9990, 300), ('9,990 readings on ONE day (8-second spacing)', 9990, 8),
         ('10,001 readings (one over the importer bound)', 10001, 300)]

server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
results = []
try:
    match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline())
    assert match, 'server did not announce a loopback origin'
    url = f'http://127.0.0.1:{match[1]}/index.html#/nasa-cases'
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_executable(), headless=True)
        for label, rows, spacing in CASES:
            context = browser.new_context(viewport={'width': 1100, 'height': 900})
            page = context.new_page()
            page.goto(url); page.wait_for_selector('#nc-form', timeout=15000)
            page.evaluate('() => { window.__long = []; new PerformanceObserver(list => list.getEntries().forEach(e => window.__long.push(e.duration))).observe({type: "longtask", buffered: true}); }')
            body = cgm_file(rows, spacing)
            page.select_option('#nc-source', 'BUT_CGM'); page.fill('#nc-subject-id', '1')
            page.set_input_files('#nc-file', files=[{'name': 'synthetic.csv', 'mimeType': 'text/csv', 'buffer': body}])
            clock = page.evaluate('performance.now()')
            page.click('#nc-load')
            if rows <= 10000:
                page.wait_for_selector('.chart-block svg', timeout=120000)
                loaded = page.evaluate(f'performance.now() - {clock}')
                row = {'case': label, 'file_kb': round(len(body) / 1024), 'ms_click_to_chart': round(loaded),
                       'dom_nodes': page.evaluate('document.getElementsByTagName("*").length'), 'svg_points': page.locator('.chart-block svg circle.point').count()}
                days = page.eval_on_selector_all('#nc-day-0 option', 'els => els.map(e => e.value)') if page.locator('#nc-day-0').count() else []
                if len(days) > 1:
                    before = page.evaluate('performance.now()')
                    page.select_option('#nc-day-0', days[-1])
                    page.wait_for_function(f'document.querySelector(".data-table caption") && document.querySelector(".data-table caption").textContent.includes("{days[-1]}")', timeout=60000)
                    row['ms_choose_another_day'] = round(page.evaluate(f'performance.now() - {before}'))
                row['days_selectable'] = len(days)
            else:
                page.wait_for_function('document.body.innerText.includes("refused as a whole")', timeout=60000)
                row = {'case': label, 'file_kb': round(len(body) / 1024), 'ms_click_to_message': round(page.evaluate(f'performance.now() - {clock}')),
                       'message': page.locator('.notice-error').first.inner_text()[:120], 'cards_with_records': page.locator('.card dd:text-is("10001")').count()}
            row['longest_task_ms'] = round(max(page.evaluate('window.__long') or [0]))
            results.append(row)
            context.close()
        print(json.dumps({'browser': browser.version, 'note': 'one lab run on one machine; not field data and not an INP measurement', 'results': results}, indent=1))
        browser.close()
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
