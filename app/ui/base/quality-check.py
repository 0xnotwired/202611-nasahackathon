"""Measured accessibility and layout checks (BROWSER level, one browser). Development only; not part of the product.

Run from the repository root:
    ORBITA_CHROMIUM=/path/to/chromium python3 app/ui/base/quality-check.py
Optional: ORBITA_SHOTS=/some/dir for screenshots.

What it measures, with the thresholds WCAG 2.2 states (not invented here):
  * contrast of every visible text element against its resolved background: 4.5:1, or 3:1 for large text (1.4.3);
  * contrast of control borders, the focus outline and the chart's drawn marks against their background: 3:1 (1.4.11);
  * reflow at 320 CSS px wide with no horizontal scroll, data tables reported separately (1.4.10);
  * target size of links, buttons and fields, at least 24x24 CSS px (2.5.8);
  * an accessible name on every link, button, field, checkbox, select and image, read from Chromium's accessibility tree;
  * heading levels that do not skip.
It cannot replace a screen reader: it reads the accessibility tree, it does not listen to one.
Loads the real BUT CGM, MR079G, MR035G and MR080G files if they exist (docs/LOCAL_DATA_RESTORE.md); otherwise the
data-dependent parts are reported as NOT VERIFIED. Throwaway browser contexts; nothing is written to the checkout.
"""
import json
import os
from pathlib import Path
import re
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
SHOTS = os.environ.get('ORBITA_SHOTS')
FILES = [('BUT_CGM', ROOT / 'data/originals/but-cgm-1.0.0/101001_CGM.csv', '101001'), ('MR079G', ROOT / 'data/originals/MR079G-muscle-function.csv', ''),
         ('MR035G', ROOT / 'data/originals/additional/MR035G-sample-1.csv', ''), ('MR080G', ROOT / 'data/originals/additional/MR080G-sample-1.csv', '')]


def chromium_executable():
    configured = os.environ.get('ORBITA_CHROMIUM') or '/usr/bin/chromium'
    resolved = Path(configured).resolve()
    if not resolved.is_file() or not os.access(resolved, os.X_OK):
        raise RuntimeError(f'Chromium is not an executable file: {configured}. Set ORBITA_CHROMIUM.')
    return str(resolved)


def channel(value):
    value = value / 255
    return value / 12.92 if value <= 0.03928 else ((value + 0.055) / 1.055) ** 2.4


def luminance(rgb):
    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


COLLECT = r'''() => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1}; };
  const probe = document.createElement('div'); probe.style.backgroundColor = 'Canvas'; document.body.append(probe);
  const canvas = parse(getComputedStyle(probe).backgroundColor); probe.remove();
  const bgOf = el => { const layers = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } }
    let base = canvas; for (const c of layers.reverse()) base = {r: c.r * c.a + base.r * (1 - c.a), g: c.g * c.a + base.g * (1 - c.a), b: c.b * c.a + base.b * (1 - c.a)}; return [base.r, base.g, base.b]; };
  const visible = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('.visually-hidden'); };
  const label = el => (el.id ? '#' + el.id : '') + '.' + (el.getAttribute('class') || '').split(' ').join('.') + ' <' + el.tagName.toLowerCase() + '>';
  const text = [], nontext = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const s = getComputedStyle(el);
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    const isField = ['SELECT', 'INPUT', 'BUTTON'].includes(el.tagName);
    if (own || isField) {
      const c = parse(el instanceof SVGElement ? s.fill : s.color); if (c) text.push({el: label(el), sample: (el.textContent || el.value || '').trim().slice(0, 40), fg: [c.r, c.g, c.b], a: c.a, bg: bgOf(el), size: parseFloat(s.fontSize), weight: parseInt(s.fontWeight, 10)});
    }
    if (isField && el.type !== 'file' && el.type !== 'checkbox') { const b = parse(s.borderTopColor); if (b && parseFloat(s.borderTopWidth) > 0) nontext.push({what: 'border of ' + label(el), fg: [b.r, b.g, b.b], bg: bgOf(el.parentElement || el)}); }
    if (el instanceof SVGElement && el.tagName !== 'svg' && el.tagName !== 'text' && el.tagName !== 'title' && el.tagName !== 'desc') {
      const kind = el.getAttribute('class') || el.tagName; const stroke = s.stroke !== 'none' ? parse(s.stroke) : null; const fill = s.fill !== 'none' ? parse(s.fill) : null; const chart = el.closest('svg');
      const mark = stroke || fill; if (mark && ['line', 'point', 'gap', 'axis'].some(k => kind.includes(k))) nontext.push({what: 'chart ' + kind, fg: [mark.r, mark.g, mark.b], bg: bgOf(chart)});
    }
  }
  return {text, nontext};
}'''


def contrast_report(page, name):
    data = page.evaluate(COLLECT)
    fails = []
    for item in data['text']:
        large = item['size'] >= 24 or (item['size'] >= 18.66 and item['weight'] >= 700)
        need = 3.0 if large else 4.5
        got = ratio(item['fg'], item['bg'])
        if got < need: fails.append(f"{name} text {got:.2f}:1 < {need} {item['el']} '{item['sample']}'")
    for item in data['nontext']:
        got = ratio(item['fg'], item['bg'])
        if got < 3.0: fails.append(f"{name} non-text {got:.2f}:1 < 3 {item['what']}")
    lowest = min((ratio(i['fg'], i['bg']) for i in data['text']), default=None)
    return fails, len(data['text']), len(data['nontext']), lowest


def focus_outline_contrast(page, selector):
    page.focus(selector)
    page.keyboard.press('Shift+Tab'); page.keyboard.press('Tab')  # make the ring a keyboard (focus-visible) ring
    info = page.evaluate('''() => { const e = document.activeElement; const s = getComputedStyle(e);
        const parse = c => { const m = c.match(/rgba?\\(([^)]+)\\)/); const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2]]; };
        const probe = document.createElement('div'); probe.style.backgroundColor = 'Canvas'; document.body.append(probe); const canvas = parse(getComputedStyle(probe).backgroundColor); probe.remove();
        let bg = canvas; for (let n = e; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; if (c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') { bg = parse(c); break; } }
        return {style: s.outlineStyle, width: parseFloat(s.outlineWidth), color: parse(s.outlineColor), bg}; }''')
    return info, ratio(info['color'], info['bg'])


def structure_report(page, name):
    problems = []
    layout = page.evaluate('''() => { const out = {small: [], over: []}; const w = window.innerWidth;
        for (const el of document.querySelectorAll('a, button, select, input, summary')) {
          const r0 = el.getBoundingClientRect(); if (!r0.width || !r0.height || el.closest('.visually-hidden')) continue;
          let r = r0; if (el.type === 'checkbox' && el.id) { const l = document.querySelector(`label[for="${el.id}"]`); if (l) r = l.getBoundingClientRect(); }
          if (r.width < 24 || r.height < 24) out.small.push((el.id || el.tagName) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
        for (const el of document.querySelectorAll('body *')) { const r = el.getBoundingClientRect(); if (r.width && r.right > w + 1 && !el.closest('svg') && !el.closest('.table-scroll')) out.over.push({tag: el.tagName, cls: el.getAttribute('class') || '', table: !!el.closest('table'), right: Math.round(r.right)}); }
        out.scroll = document.documentElement.scrollWidth - w; out.width = w;
        out.headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => +h.tagName[1]); return out; }''')
    if layout['small']: problems.append(f"{name} targets under 24x24: {layout['small'][:5]}")
    levels = layout['headings']
    if any(b - a > 1 for a, b in zip(levels, levels[1:])): problems.append(f'{name} heading levels skip: {levels}')
    return problems, layout


def names_report(page, name):
    cdp = page.context.new_cdp_session(page)
    tree = cdp.send('Accessibility.getFullAXTree')['nodes']
    unnamed, counted = [], 0
    for node in tree:
        if node.get('ignored'): continue
        role = (node.get('role') or {}).get('value')
        if role in {'link', 'button', 'textbox', 'combobox', 'checkbox', 'listbox', 'img', 'table', 'PopUpButton'}:
            counted += 1
            if not ((node.get('name') or {}).get('value') or '').strip(): unnamed.append(f"{role} backendDOMNodeId={node.get('backendDOMNodeId')}")
    cdp.detach()
    return unnamed, counted


server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env={**os.environ, 'PORT': '0'}, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
report, failures, not_verified = [], [], []
try:
    match = re.search(r'127\.0\.0\.1:(\d+)', server.stdout.readline())
    assert match, 'server did not announce a loopback origin'
    base = f'http://127.0.0.1:{match[1]}/index.html'
    have_files = all(path.exists() for _, path, _ in FILES)
    if not have_files: not_verified.append('real data files missing: the NASA view was measured empty only')
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_executable(), headless=True)
        for scheme in ('light', 'dark'):
            for width, height in ((1100, 900), (390, 844), (320, 640)):
                context = browser.new_context(viewport={'width': width, 'height': height}, color_scheme=scheme)
                page = context.new_page()
                weight = {'js': 0, 'css': 0}
                def on_response(r):
                    if r.status == 200 and r.url.endswith('.js'): weight['js'] += len(r.body())
                    if r.status == 200 and r.url.endswith('.css'): weight['css'] += len(r.body())
                page.on('response', on_response)
                page.goto(base + '#/nasa-cases'); page.wait_for_selector('#nc-form', timeout=15000)
                tag = f'{scheme} {width}px'
                if have_files:
                    for source, path, subject in FILES:
                        page.select_option('#nc-source', source)
                        if subject: page.fill('#nc-subject-id', subject)
                        page.set_input_files('#nc-file', str(path)); page.click('#nc-load')
                        page.wait_for_function(f'document.querySelectorAll(".card h4").length >= {[f[0] for f in FILES].index(source) + 1}', timeout=20000)
                    for i in range(4):
                        if not page.is_checked(f'#nc-pick-{i}'): page.check(f'#nc-pick-{i}')
                    page.wait_for_function('document.querySelectorAll("section.card[aria-labelledby^=nc-panel-]").length === 4', timeout=20000)
                    for d in page.locator('details').all(): d.evaluate('e => e.open = true')
                fails, n_text, n_non, lowest = contrast_report(page, tag)
                problems, layout = structure_report(page, tag)
                unnamed, counted = names_report(page, tag)
                if unnamed: problems.append(f'{tag} controls without an accessible name: {unnamed[:5]}')
                body_overflow = [o for o in layout['over'] if not o['table']]
                if width == 320 and layout['scroll'] > 0:
                    if body_overflow: problems.append(f"{tag} horizontal scroll {layout['scroll']}px from non-table content: {body_overflow[:3]}")
                    else: not_verified.append(f"{tag}: horizontal scroll {layout['scroll']}px comes only from data tables (WCAG allows two-dimensional data tables to scroll)")
                elif width < 1100 and body_overflow: problems.append(f'{tag} content wider than the window: {body_overflow[:3]}')
                row = {'view': tag, 'text_elements': n_text, 'non_text_marks': n_non, 'lowest_text_contrast': round(lowest, 2) if lowest else None, 'accessible_names_checked': counted,
                       'headings': layout['headings'][:12], 'scroll_px': layout['scroll'], 'js_bytes': weight['js'], 'css_bytes': weight['css']}
                if width == 1100:
                    info, got = focus_outline_contrast(page, 'nav a[href="#/habitat"]')
                    row['focus_outline'] = {'style': info['style'], 'width': info['width'], 'contrast': round(got, 2)}
                    if info['style'] == 'none' or info['width'] < 2 or got < 3.0: problems.append(f'{tag} focus outline weak: {info} {got:.2f}')
                    if SHOTS: page.screenshot(path=f'{SHOTS}/quality-{scheme}.png', full_page=True)
                failures += fails + problems
                report.append(row)
                context.close()
        print(json.dumps({'browser': browser.version, 'viewports': report, 'failures': failures, 'not_verified': not_verified}, indent=1))
        browser.close()
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill(); server.wait(timeout=10)
raise SystemExit(1 if failures else 0)
