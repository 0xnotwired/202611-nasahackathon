"""BROWSER: extended fictional case, source isolation and restart reset.
Prediction: 502 seeded records, 503 after one fictional entry; the basic demo
stays at 16 and a fresh personal source stays empty. Wrong-case control must fail.
Use ORBITA_CHROMIUM. ORIGINAL_CASE_CONTROL=1 selects the basic demo instead.
"""
import csv,io,os,re,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=ROOT,env={**os.environ,'PORT':'0'},stdout=subprocess.PIPE,text=True)
try:
 port=re.search(r':(\d+)',server.stdout.readline()).group(1)
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('ORBITA_CHROMIUM','/usr/bin/chromium'),headless=True)
  page=browser.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  name='basic' if os.environ.get('ORIGINAL_CASE_CONTROL') else 'complete'
  page.goto(f'http://127.0.0.1:{port}/?case={name}#/review')
  page.wait_for_selector('#review-download-all')
  assert page.locator('#source-select').input_value()=='demo-full','wrong case was loaded'
  def go(view):
   page.evaluate('(v)=>location.hash="#/"+v',view);page.wait_for_timeout(200)
  def export():
   go('review')
   with page.expect_download() as info:page.click('#review-download-all')
   return list(csv.DictReader(io.StringIO(Path(info.value.path()).read_text(encoding='utf-8-sig'))))
  rows=export();assert len(rows)==502,len(rows)
  assert {r['subject'] for r in rows}=={'synthetic-2-crew-007'}
  assert all(r['origin']=='synthetic' for r in rows)
  assert any(r['variable']=='pulse' and r['state']=='not_recorded' and r['value']=='' for r in rows)
  for link in page.locator('nav a').evaluate_all('(es)=>es.map(e=>e.getAttribute("href"))'):
   page.evaluate('(v)=>location.hash=v',link);page.wait_for_timeout(200)
   text=page.locator('#view-body').inner_text()
   assert text and 'could not be loaded' not in text,text[:150]
   if link=='#/on-board':
    for state in ['completed','interrupted','blocked']:assert page.locator(f'[data-state="{state}"]').count()>0,state
   if link=='#/i-feel-different':assert page.locator('button[id^="feel-reopen-"]').count()==1
   if link=='#/ground':assert 'No sharing is preloaded' in text
  go('my-health');page.select_option('#health-variable','pulse');page.fill('#health-value','77');page.fill('#health-method','fictional case edit');page.click('#health-save');page.wait_for_selector('#health-message')
  assert len(export())==503
  page.select_option('#source-select','demo');page.wait_for_timeout(250);assert len(export())==16
  page.select_option('#source-select','demo-full');page.wait_for_timeout(250);assert len(export())==503
  page.select_option('#source-select','mine');page.wait_for_timeout(250);go('my-health')
  assert 'local-user' in page.locator('#view-body').inner_text()
  assert 'synthetic-2-crew-007' not in page.locator('#view-body').inner_text()
  assert page.locator('#origin-select').input_value()==''
  go('review');assert 'No measurement or exam is recorded for this subject yet' in page.locator('#view-body').inner_text()
  page.reload();page.wait_for_selector('#review-download-all');assert page.locator('#source-select').input_value()=='demo-full';assert len(export())==502
  assert not errors,errors
  browser.close();print('PASS: 11 views, 502 valid rows, isolated edits, empty personal store, reload reset, fictional history; no page errors')
finally:server.terminate();server.wait()
