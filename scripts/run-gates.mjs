// G6-W3, second half: repeat every gate experiment in one go and print one line each. Development only (browser scripts need ORBITA_CHROMIUM and Python Playwright).
// It runs the Node suite, the documentation check, every gate walkthrough and every negative-control script, and exits non-zero if any step fails or is skipped.
// A step that cannot run (a missing file or browser) is reported as SKIPPED and counts as a failure: nothing passes by default.
//   ORBITA_CHROMIUM=/path/to/chromium node scripts/run-gates.mjs [--no-browser]
import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const browser = !process.argv.includes('--no-browser');
const steps = [
  ['Node suite (all gates G0–G6 tests, unit and contract tests)', 'npm', ['test'], /# pass (\d+)[\s\S]*# fail 0/],
  ['Documentation check', 'python3', ['scripts/check_docs.py'], /^OK:/m]
];
const py = name => ['python3', [`tests/walkthrough/${name}`]];
if (browser) {
  for (const name of ['g0-browser.py', 'g1-browser.py', 'g2-browser.py', 'g3-browser.py', 'g3-extras-browser.py', 'g3-real-browser.py', 'g4-browser.py', 'g4-extras-browser.py', 'g5-browser.py', 'g5-real-browser.py', 'g6-browser.py', 'review-browser.py', 'contrast-browser.py'])
    steps.push([`Browser: ${name}`, ...py(name), /./]);
  steps.push(['Browser: NASA cases view check', 'python3', ['app/ui/nasa-cases/browser-check.py'], /./]);
}
for (const file of readdirSync(`${root}tests/controls`).filter(name => name.endsWith('.mjs')).sort()) steps.push([`Controls: ${file}`, 'node', [`tests/controls/${file}`], /all controls caught/]);

let failed = 0;
for (const [label, command, args, ok] of steps) {
  const started = Date.now();
  const run = spawnSync(command, args, {cwd: root, encoding: 'utf8', timeout: 900000, env: {...process.env}});
  const out = `${run.stdout ?? ''}${run.stderr ?? ''}`;
  const skipped = /SKIPPED/.test(out);
  const passed = run.status === 0 && ok.test(out) && !skipped && !/AssertionError|Traceback/.test(out);
  if (!passed) failed += 1;
  const note = skipped ? 'SKIPPED (counts as a failure)' : passed ? 'ok' : `FAILED (exit ${run.status})`;
  console.log(`${passed ? 'PASS' : 'FAIL'} | ${label} | ${((Date.now() - started) / 1000).toFixed(0)} s | ${note}`);
  if (!passed) console.log(out.split('\n').filter(Boolean).slice(-6).map(line => `    ${line.slice(0, 200)}`).join('\n'));
}
console.log(failed ? `${failed} step(s) failed` : `all ${steps.length} steps passed`);
process.exit(failed ? 1 : 0);
