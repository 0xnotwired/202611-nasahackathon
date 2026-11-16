"""Contrast of every visible text in every view, in the light and the dark scheme (BROWSER level). Development only.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 tests/walkthrough/contrast-browser.py

For each view, the text elements that are visible and not disabled are measured: the colour of the text against the first opaque background
found walking up the tree (WCAG 2.x relative luminance). Ratio below 4.5, or below 3 for large text (24px, or 18.66px bold), is a failure.
Two states are measured: the view as opened, and "I feel different" with an open episode and a suggestion (the demo rule), which draws the most text.
Prediction (written before the run): some pair fails, since contrast was never measured on the new views. Limits: computed styles only; text over images or
gradients is not handled (none is used); one engine; disabled controls are exempt by WCAG and are skipped.
"""
import json
import os
from pathlib import Path
import re
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
VIEWS = ['my-health', 'adaptation', 'habitat', 'my-progress', 'my-day', 'my-plan', 'on-board', 'i-feel-different', 'nasa-cases', 'ground']
results = []

MEASURE = """() => {
  const parse = c => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1}; };
  const lum = ({r, g, b}) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (top, under) => ({r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1});
  const background = el => { const stack = []; for (let n = el; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; } } let base = {r: 255, g: 255, b: 255, a: 1}; for (const c of stack.reverse()) base = blend(c, base); return base; };
  const bad = []; let measured = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    if (!t.textContent.trim()) continue; const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || el.getClientRects().length === 0) continue;
    if (el.closest('[disabled], [aria-disabled="true"]') || el.closest('.skip')) continue;
    if (['SCRIPT', 'STYLE'].includes(el.tagName)) continue;
    const fg = parse(cs.color); if (!fg) continue; const bg = background(el); const fgc = blend(fg, bg);
    const l1 = lum(fgc), l2 = lum(bg); const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700; const large = size >= 24 || (bold && size >= 18.66);
    measured += 1; if (ratio < (large ? 3 : 4.5)) bad.push({text: t.textContent.trim().slice(0, 40), ratio: Math.round(ratio * 100) / 100, need: large ? 3 : 4.5, tag: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '')});
  }
  return {measured, bad};
}"""


def chromium_executable():
    configured = os.environ.get('ORBITA_CHROMIUM') or '/usr/bin/chromium'
    resolved = Path(configured).resolve()
    if not resolved.is_file() or not os.access(resolved, os.X_OK):
        raise RuntimeError(f'Chromium is not an executable file: {configured}. Set ORBITA_CHROMIUM.')
    return str(resolved)


server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
failures = []
try:
    match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline())
    assert match, 'server did not announce a loopback origin'
    url = f'http://127.0.0.1:{match[1]}/index.html'
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_executable(), headless=True)
        for scheme in ['light', 'dark']:
            page = browser.new_context(viewport={'width': 1100, 'height': 900}, color_scheme=scheme).new_page()
            page.goto(url); page.wait_for_selector('html[data-modules="loaded"]', timeout=15000)
            for view in VIEWS:
                page.evaluate(f"location.hash = '#/{view}'"); page.wait_for_timeout(700)
                out = page.evaluate(MEASURE); results.append({'scheme': scheme, 'view': view, 'measured': out['measured'], 'failing': len(out['bad'])})
                failures += [{'scheme': scheme, 'view': view, **b} for b in out['bad']]
            page.evaluate("location.hash = '#/i-feel-different'"); page.wait_for_selector('#feel-symptom', timeout=10000)
            page.select_option('#feel-symptom', 'fatigue'); page.click('#feel-open'); page.wait_for_selector('#sec-suggestion', timeout=10000); page.wait_for_timeout(300)
            out = page.evaluate(MEASURE); results.append({'scheme': scheme, 'view': 'i-feel-different (open episode, demo suggestion)', 'measured': out['measured'], 'failing': len(out['bad'])})
            failures += [{'scheme': scheme, 'view': 'i-feel-different (open episode)', **b} for b in out['bad']]
        # Control: the detector must fail on a pair that is known to be low (light grey on white). Otherwise a pass proves nothing.
        page = browser.new_context(viewport={'width': 1100, 'height': 900}, color_scheme='light').new_page()
        page.goto(url); page.wait_for_selector('html[data-modules="loaded"]', timeout=15000)
        page.add_style_tag(content='body, .legend, p { color: #b5b5b5 !important; background: #ffffff !important; } .card { background: #ffffff !important; }'); page.wait_for_timeout(300)
        control = page.evaluate(MEASURE); results.append({'control': 'light grey on white must be detected', 'failing': len(control['bad'])})
        assert control['bad'], 'the contrast detector did not fail on light grey text on white'
        page.evaluate("location.hash = '#/i-feel-different'"); page.wait_for_selector('#feel-symptom', timeout=10000)
        page.select_option('#feel-symptom', 'fatigue'); page.click('#feel-open'); page.wait_for_selector('#sec-suggestion', timeout=10000)
        text = page.locator('#sec-suggestion').locator('xpath=..').inner_text()
        assert 'Team demo, fictional rule' in text and 'not reviewed guidance' in text, text[:300]
        browser.close()
    print(json.dumps({'level': 'BROWSER (Chromium only; computed styles, no screen reader)', 'results': results, 'failures': failures[:40]}, indent=1))
    assert not failures, f'{len(failures)} text element(s) below the minimum contrast'
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
