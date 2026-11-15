# Experiment record E00 — Foundation probes for decisions D1, D3, D4 and D6

Run by the orchestrator on 2026-11-15, before any product code exists. Format and rules: [METHOD.md](../METHOD.md). The probe files were throwaway and lived outside the repository; this record is what remains.

**Question.** Decisions D1 (untranspiled ES modules), D3 (IndexedDB), D4 (`node --test`) and D6 (local server instead of double click) were proposals resting on recalled browser behavior. The plan itself said "not verified: anything in a browser". Do they hold on the machines we actually have?

## Predictions (written before the run)

| Id | Decision | Prediction | Falsifier | Negative control |
|---|---|---|---|---|
| E00-P1 | D4 | In a folder with `package.json` `{"type":"module"}` and no `node_modules`, `node --test` runs one test and exits 0 reporting 1 pass | Any install is needed, or exit code is not 0 | Change the expected value in the test: exit code 1, 1 fail |
| E00-P2 | D1 | The same file `dep.js` exports the string `CANARY-orbita-2026-11-15` when imported by the Node test and when imported in Chrome over `http://127.0.0.1` | The values differ, or one of the two cannot import it | — (covered by P1 and P3 controls) |
| E00-P3 | D6 | Opened from `file://`, a page's classic script runs but its `<script type="module">` does not, and the browser reports a CORS error. Served over `http://127.0.0.1`, both run | The module runs from `file://` | The classic script on the same page: if it runs, the page loaded and only the module was refused |
| E00-P4 | D3 | Over `http://127.0.0.1`, a record `{id:"007"}` written to IndexedDB is read back as the string `"007"` after the browser is closed and reopened with the same profile | The read returns nothing, or `7` | Reopen with a fresh profile: the read returns nothing |
| E00-P5 | D3, M23 | The same as P4 works from `file://` in Chrome. Confidence is lower: this is recalled behavior | The open fails or the value does not survive reopening | Fresh profile returns nothing |

## Runs

Environment: Node v22.23.4; Google Chrome for Testing 153.0.8010.12, headless, driven by Playwright; Linux. One run each, on 2026-11-15.

| Id | What was run | Observed | Result | Evidence level |
|---|---|---|---|---|
| E00-P1 | `node --test` in a folder holding only `package.json` and `dep.test.js` | `tests 1, pass 1, fail 0`, exit code 0 | Confirmed | RUN |
| E00-P2 | The Node test and a browser page both import `site/dep.js` | Node assertion passed on the canary; in Chrome over HTTP `window.moduleRan` was `CANARY-orbita-2026-11-15` | Confirmed | RUN and BROWSER |
| E00-P3 | `index.html` opened from `file://` and from `http://127.0.0.1:8765` | `file://`: `classicRan` true, `moduleRan` absent, console: "blocked by CORS policy: Cross origin requests are only supported for protocol schemes: chrome, chrome-extension, chrome-untrusted, data, http, https, isolated-app". HTTP: both set | Confirmed | BROWSER |
| E00-P4 | Write `{id:"007"}` over HTTP, close Chrome, reopen with the same profile, read | `{id:"007", type:"string"}` after restart | Confirmed | BROWSER |
| E00-P5 | The same from `file://` | `{id:"007", type:"string"}` after restart | Confirmed | BROWSER |

## Negative controls

| For | Control | Observed | Reverted |
|---|---|---|---|
| E00-P1 | Expected value changed to `"WRONG"` | `pass 0, fail 1`, exit code 1 | Yes; exit code 0 again |
| E00-P3 | Classic script on the same page | Ran in both cases, so the page loaded and only the module was refused | — |
| E00-P4 | Read with a fresh profile | `{found:false}` | — |
| E00-P5 | Read with a fresh profile | `{found:false}` | — |

Extra observation, not predicted: the throwaway server (about 10 lines of `node:http`) answered 403 to `curl --path-as-is /../serve.mjs` and 200 to `/dep.js`. It shows that a server limited to one folder is feasible with `node:` modules only. It says nothing about M00's server, which does not exist yet.

## Refuted and surprises

- Nothing was refuted.
- Surprise: the HTTP page logged one "404 (Not Found)". Plausibly the browser asking for `favicon.ico`; the request was not traced, so this stays ASSUMED.

## Not verified

- Firefox and Safari. Everything above is Chrome 153 only. E00-P5 in particular (IndexedDB from `file://`) is known to vary between browsers; M23 must test the browsers the team will present on.
- A private or incognito window, where IndexedDB may be refused. M04 must handle that case and say so on screen.
- Windows and macOS.
- Storage limits and eviction.

## What this changes

- D1, D3, D4 and D6 move from "recalled" to observed on Chrome 153 and Node 22. The trap "ES modules do not load from `file://`" in the plan is now BROWSER-confirmed, with the exact error text above.
- M23 can count on IndexedDB from `file://` in Chrome, and on nothing else.
