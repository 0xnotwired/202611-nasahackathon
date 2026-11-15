import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, relative} from 'node:path';
import {buildPackage} from '../../scripts/package.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;
const modulesOf = html => JSON.parse(html.match(/<script type="application\/json" id="orbita-modules">([\s\S]*?)<\/script>/)[1]);
const files = dir => readdirSync(dir).flatMap(name => { const p = join(dir, name); return statSync(p).isDirectory() ? files(p) : [p]; });
const tiny = (sources, index) => {
  const dir = mkdtempSync(join(tmpdir(), 'orbita-pkg-'));
  writeFileSync(join(dir, 'index.html'), index ?? `<!doctype html><title>t</title><link rel="stylesheet" href="./s.css"><p id="status">x</p><div id="app"></div><script type="module">import {start} from './a.js'; start();</script>`);
  writeFileSync(join(dir, 's.css'), 'body{color:black}');
  for (const [name, text] of Object.entries(sources)) { mkdirSync(join(dir, name, '..'), {recursive: true}); writeFileSync(join(dir, name), text); }
  return dir;
};

test('M23-P1: the packaged file has no script with a src, no link, no import that points to a file', () => {
  const {html} = buildPackage({root: join(ROOT, 'app')});
  assert.doesNotMatch(html, /<script[^>]*\ssrc=/i); assert.doesNotMatch(html, /<link\b(?![^>]*\shref="data:)/i, 'a link that is not a data: URL'); assert.doesNotMatch(html, /@import|<iframe|<img[^>]*src=\s*["']?https?:/i);
  const {sources, deps, order} = modulesOf(html);
  // M02 (mission) is a library that no running code imports yet (the shell takes its configurations from the scenario), so it is not reachable and not packaged.
  const NOT_USED_AT_RUNTIME = ['mission/index.js'];
  const expected = files(join(ROOT, 'app')).filter(f => f.endsWith('/index.js') && !f.includes('/contracts/')).map(f => relative(join(ROOT, 'app'), f)).filter(path => !NOT_USED_AT_RUNTIME.includes(path));
  assert.ok(expected.length >= 23, `index files found: ${expected.length}`); assert.deepEqual(expected.filter(path => !Object.hasOwn(sources, path)), [], 'a module folder is not packaged');
  for (const [path, text] of Object.entries(sources)) {
    assert.doesNotMatch(text, /^(?:import|export)\b[^;]*?\bfrom\s*['"]\.{1,2}\//m, `${path} still imports a file`); assert.doesNotMatch(text, /^import\s*['"]\.{1,2}\//m, path);
    for (const dep of deps[path]) assert.ok(Object.hasOwn(sources, dep), `${path} depends on ${dep}, which is not packaged`);
  }
  assert.equal(html.split('id="orbita-modules"').length, 2, 'one module block');
});

test('M23-X1: the application source uses no network API, so the packaged file has nothing to fetch', () => {
  const offenders = [];
  for (const file of files(join(ROOT, 'app')).filter(f => f.endsWith('.js') && !/\.test\.js$/.test(f))) {
    const text = readFileSync(file, 'utf8');
    if (/\b(fetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|importScripts|new\s+Worker|navigator\.serviceWorker)/.test(text.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, ''))) offenders.push(relative(ROOT, file));
  }
  assert.deepEqual(offenders, []);
});

test('M23-X2: a content security policy forbids every remote load, and the build is deterministic', () => {
  const a = buildPackage({root: join(ROOT, 'app')}).html, b = buildPackage({root: join(ROOT, 'app')}).html;
  assert.equal(a, b); const csp = a.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  assert.match(csp, /default-src 'none'/); assert.match(csp, /script-src 'unsafe-inline' blob:/); assert.doesNotMatch(csp, /https?:|\*/); assert.doesNotMatch(csp, /connect-src(?! 'none')/);
});

test('M23-X3: a build that cannot be trusted fails loudly: cycle, missing file, remote import, no entry', () => {
  assert.throws(() => buildPackage({root: tiny({'a.js': "import {b} from './b.js'; export const start = () => b;", 'b.js': "import {start} from './a.js'; export const b = start;"}), views: []}), /cycle/i);
  assert.throws(() => buildPackage({root: tiny({'a.js': "import {b} from './missing.js'; export const start = () => b;"}), views: []}), /missing\.js, which does not exist inside app\//);
  assert.throws(() => buildPackage({root: tiny({'a.js': "import {b} from 'https://example.com/x.js'; export const start = () => b;"}), views: []}), /not a relative file/);
  assert.throws(() => buildPackage({root: tiny({'a.js': 'export const start = () => 1;'}, '<!doctype html><p>no entry</p>'), views: []}), /entry/i);
  assert.throws(() => buildPackage({root: tiny({'a.js': 'export const start = () => 1;', 'v/index.js': "export const model = () => 1;"}), views: ['absent']}), /absent/);
  const ok = buildPackage({root: tiny({'a.js': "import {b} from './b.js'; export const start = () => b;", 'b.js': 'export const b = 1;'}), views: []}); assert.equal(modulesOf(ok.html).order.length, 3);
});

test('M23-X4: dist/ is ignored by git, and the dynamic view import is rewritten exactly once', () => {
  assert.match(readFileSync(join(ROOT, '.gitignore'), 'utf8'), /^dist\/?$/m);
  const {sources} = modulesOf(buildPackage({root: join(ROOT, 'app')}).html); const start = sources['ui/base/start.js'];
  assert.match(start, /import\(globalThis\.__ORBITA_VIEWS\[view\.id\]\)/); assert.doesNotMatch(start, /import\(`/);
});
