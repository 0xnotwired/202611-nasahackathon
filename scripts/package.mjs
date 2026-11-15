/**
 * Packages app/ into one file, dist/orbita.html, using only node: modules.
 *
 * How: every module's source is embedded as text with its relative imports rewritten to a placeholder; a small inline script creates the
 * modules as blob: URLs in dependency order and starts the application, so the packaged code is the same ES modules that are tested, not a
 * transformed copy. A content security policy forbids every load except inline code and those blob: modules.
 * The build fails loudly on a cycle, a missing file, a non-relative import, a missing entry or a view that does not exist.
 *
 *   node scripts/package.mjs        writes dist/orbita.html and prints what it contains
 */
import {readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, statSync} from 'node:fs';
import {dirname, join, relative, resolve, sep, posix} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';

const REPO = fileURLToPath(new URL('../', import.meta.url));
const CSP = "default-src 'none'; script-src 'unsafe-inline' blob:; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'";
const DYNAMIC_VIEW_IMPORT = 'import(`../${view.id}/index.js`)';
const PACKAGED_STATUS = 'The application did not start. This file contains all of it and needs no server; if you read this, the browser stopped it from running.';
const BOOT = `(() => {
  const status = text => { const p = document.querySelector('#status'); if (p) p.textContent = text; };
  try {
    const data = JSON.parse(document.getElementById('orbita-modules').textContent); const urls = {};
    for (const path of data.order) {
      let source = data.sources[path];
      for (const dep of data.deps[path]) source = source.split('@orbita/' + dep).join(urls[dep]);
      urls[path] = URL.createObjectURL(new Blob([source], {type: 'text/javascript'}));
    }
    globalThis.__ORBITA_VIEWS = Object.fromEntries(Object.entries(data.views).map(([id, path]) => [id, urls[path]]));
    import(urls[data.entry]).catch(error => status('The application could not start: ' + error.message));
  } catch (error) { status('The application could not start: ' + error.message); }
})();`;

// Only real module clauses: `import x`, `import {a}`, `import * as x`, `import x, {a}`, `export {a}`, `export * [as x]`, each followed by from "spec", and `import "spec"`.
const IMPORT_FROM = /^import\s+(?:[\w$]+\s*,\s*)?(?:\*\s+as\s+[\w$]+|\{[^}]*\}|[\w$]+)\s*from\s*(['"])([^'"\n]+)\1/gm;
const EXPORT_FROM = /^export\s*(?:\*(?:\s+as\s+[\w$]+)?|\{[^}]*\})\s*from\s*(['"])([^'"\n]+)\1/gm;
const STATIC_BARE = /^import\s*(['"])([^'"\n]+)\1/gm;
const files = dir => readdirSync(dir).flatMap(name => { const p = join(dir, name); return statSync(p).isDirectory() ? files(p) : [p]; });
const id = (root, file) => relative(root, file).split(sep).join(posix.sep);

/** buildPackage({ root, views? }) → { html, modules, bytes }. `root` is the app directory; `views` are the folders under ui/ loaded on demand. */
export function buildPackage({root, views} = {}) {
  root = resolve(root ?? join(REPO, 'app'));
  const indexPath = join(root, 'index.html');
  if (!existsSync(indexPath)) throw new Error(`No index.html in ${root}`);
  const index = readFileSync(indexPath, 'utf8');
  const entries = [...index.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
  if (entries.length !== 1) throw new Error(`Expected exactly one inline module entry in index.html, found ${entries.length}`);
  const viewIds = views ?? (existsSync(join(root, 'ui')) ? readdirSync(join(root, 'ui')).filter(n => n !== 'base' && existsSync(join(root, 'ui', n, 'index.js'))).sort() : []);

  const sources = {}; const deps = {}; const raw = {}; let dynamicCount = 0;
  const entryId = '__entry__.js';
  raw[entryId] = {file: join(root, entryId), text: entries[0][1]};
  const load = (file, text) => {
    const found = []; let rewritten = text;
    if (text.includes(DYNAMIC_VIEW_IMPORT)) { dynamicCount += text.split(DYNAMIC_VIEW_IMPORT).length - 1; rewritten = rewritten.split(DYNAMIC_VIEW_IMPORT).join('import(globalThis.__ORBITA_VIEWS[view.id])'); }
    const swap = (match, spec) => {
      if (!/^\.{1,2}\//.test(spec)) throw new Error(`${relative(root, file)} imports "${spec}", which is not a relative file: nothing remote or bare can be packaged`);
      const target = resolve(dirname(file), spec);
      if (!target.startsWith(root + sep) || !existsSync(target) || !statSync(target).isFile()) throw new Error(`${relative(root, file)} imports ${spec}, which does not exist inside app/`);
      const dep = id(root, target); found.push(dep);
      return match.replace(spec, `@orbita/${dep}`);
    };
    rewritten = rewritten.replace(IMPORT_FROM, (m, _q, spec) => swap(m, spec)).replace(EXPORT_FROM, (m, _q, spec) => swap(m, spec)).replace(STATIC_BARE, (m, _q, spec) => swap(m, spec));
    return {text: rewritten, deps: [...new Set(found)]};
  };

  const order = []; const state = new Map();
  const visit = (moduleId, file, text, trail) => {
    if (state.get(moduleId) === 'done') return;
    if (state.get(moduleId) === 'visiting') throw new Error(`Import cycle: ${[...trail, moduleId].join(' -> ')}`);
    state.set(moduleId, 'visiting');
    const {text: out, deps: direct} = load(file, text ?? readFileSync(file, 'utf8'));
    sources[moduleId] = out; deps[moduleId] = direct;
    for (const dep of direct) visit(dep, join(root, dep), undefined, [...trail, moduleId]);
    state.set(moduleId, 'done'); order.push(moduleId);
  };
  visit(entryId, raw[entryId].file, raw[entryId].text, []);
  const viewMap = {};
  for (const view of viewIds) {
    const path = `ui/${view}/index.js`;
    if (!existsSync(join(root, path))) throw new Error(`View ${view} has no ${path}`);
    viewMap[view] = path; visit(path, join(root, path), undefined, []);
  }
  if (viewIds.length && dynamicCount !== 1) throw new Error(`Expected the dynamic view import exactly once, found ${dynamicCount}; the loader changed and the packager must be updated`);

  const data = {entry: entryId, order, sources, deps, views: viewMap};
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  let html = index.replace(entries[0][0], () => `<script type="application/json" id="orbita-modules">${json}</script>\n<script>\n${BOOT}\n</script>`);
  const css = html.match(/<link rel="stylesheet" href="([^"]+)">/);
  if (css) {
    const text = readFileSync(resolve(root, css[1]), 'utf8');
    if (/<\/style|@import|url\(\s*["']?(?!data:)/i.test(text)) throw new Error('The stylesheet loads something or contains </style');
    html = html.replace(css[0], () => `<style>\n${text}\n</style>`);
  }
  html = html.replace(/(<p id="status">)[\s\S]*?(<\/p>)/, (_m, a, b) => `${a}${PACKAGED_STATUS}${b}`);
  const head = `<meta http-equiv="Content-Security-Policy" content="${CSP}">`;
  html = /<meta charset="utf-8">/i.test(html) ? html.replace(/<meta charset="utf-8">/i, m => `${m}\n${head}`) : html.replace(/<!doctype html>/i, m => `${m}\n<meta charset="utf-8">\n${head}`);
  return {html, modules: order.length, bytes: Buffer.byteLength(html)};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const out = join(REPO, 'dist', 'orbita.html'); const built = buildPackage();
    mkdirSync(dirname(out), {recursive: true}); writeFileSync(out, built.html);
    console.log(`dist/orbita.html: ${built.modules} modules, ${built.bytes} bytes, sha256 ${createHash('sha256').update(built.html).digest('hex').slice(0, 16)}`);
  } catch (error) { console.error(`Packaging failed: ${error.message}`); process.exit(1); }
}
