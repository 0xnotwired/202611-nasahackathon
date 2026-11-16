# Handoff: where Órbita stands and what is left (2026-11-16)

For the next person or AI agent. Written by the builder session because it may run out of budget. Read this, then [AGENTS.md](../AGENTS.md) (it wins over this file), [CLAUDE.md](../CLAUDE.md), [CURRENT_STATUS.md](CURRENT_STATUS.md) and [AUDIT.md](AUDIT.md). Nothing here is an acceptance of any gate.

## 1. State in one paragraph

Órbita is a personal health application for astronauts (NASA Space Apps 2026, health monitoring). The delivered state is the GitHub branch **final-claude** of `0xnotwired/202611-nasahackathon`. It contains the whole product as vanilla ES modules with no runtime dependencies: data core with three record states and origins (F1, accepted by the user), the situation views (F2), plan and procedures (F3), episodes, copilot, summary and simulated sync (F4), NASA cases (F5), packaging into `dist/orbita.html`, a review and export view and a manual theme (F6, M25). `frontend/` is a teammate's separate Next.js edition; its useful parts were re-implemented as M25. 435 Node tests pass; browser walkthroughs and negative controls pass; independent *agents* reviewed F3, F4, F5 and every layer together (G6-W3). **No gate after G1 has been accepted by a person**, so every module after M05 (and M21) stays `pending` in `docs/modules.csv`. Do not change a status to accepted without the user.

## 2. First ten minutes

```bash
git fetch origin && git checkout final-claude && git status && git log --oneline -5
npm test                                   # 435 tests, Node 22, no install
python3 scripts/check_docs.py              # must print OK
npm run package                            # dist/orbita.html (git-ignored)
# Browser scripts need: pip install playwright (Python package only; Chromium is preinstalled)
export ORBITA_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome   # or any Chromium
node scripts/run-gates.mjs                 # repeats every gate experiment and every negative control; ~3 min
```

Real NASA files are not in git (`data/originals/`): [LOCAL_DATA_RESTORE.md](LOCAL_DATA_RESTORE.md). Without them the real-file checks say SKIPPED / exit non-zero (that is intended: nothing passes by default).

Work on a new branch from `final-claude` (for example `mod/next-<topic>`), never directly on `main`. Commit and push only when the user asks for that task. Commit messages in English with prefix `feat(agent):`, `fix(agent):` or `docs(agent):` and the co-author line the session gives. Do not rebase, squash or force-push. Do not delete branches you did not create (a local `claude-final` and `worktree-agent-*` branches exist; leave them).

## 3. The rules that matter most (details in AGENTS.md and CLAUDE.md)

1. **Never present as known something that is not known.** "Not recorded" is not "nothing new"; NA is not 0; a ground analog is not an astronaut; silence is not "all fine"; a figure read in an abstract is not a verified figure. When in doubt show less certainty.
2. **No clinical rule, threshold or diagnosis anywhere in code.** Attention criteria and guidance rules exist only as data with who defined them, source, version and review status. The copilot ships none for real use.
3. **Evidence discipline:** every claim in a record carries RUN / BROWSER / READ / SOURCE; write the prediction before the run; see a test fail (a negative control) before trusting it. Controls are in `tests/controls/` and re-run with `node tests/controls/<file>.mjs`.
4. **Select and read the applicable skills in `.agents/skills/` BEFORE the work** and record which ones and when (CLAUDE.md mistake 7). Skills most used: honest-degradation, validate-at-the-boundary, secure-by-construction, falsifiable-testing, discriminating-proof, claim-provenance-discipline, atomic-state-mutation, decision-record-discipline, surgical-patcher, git-discipline.
5. Everything in the repo is **English** (UI, code, docs, commits). No MVP language. Do not add dependencies to the root `package.json`. Do not edit `docs/CONTRACTS.md` outside a contract bump that is recorded in its changelog and in `app/contracts/data.js` (`CONTRACT_VERSION`, currently 0.22).
6. Evidence before status: check `git status`, `git log`, `git branch --show-current` and run the checks before reporting anything.

## 4. What is left, in priority order

### A. Needs a person (an agent cannot do it)
- **G6-W4, the formative test with 6–8 volunteers** (`docs/experiments/G6.md`). Plan: give each volunteer `dist/orbita.html`, ask them to complete "I feel different" (report a symptom, read the card, generate and share the summary) and "My plan" (add a task, run a procedure, link a result), observe, list problems. Its limit (it finds problems, it does not validate) must be stated.
- **Accept the gates** G2–G6 (and the modules behind them) in `docs/modules.csv`, with the agents' review reports in the gate addenda as input. Only the user can do this.
- **Real guidance rules** from someone qualified (a clinician or a published, reviewed source). Load them through the "I feel different" rules file; never write one in code. Until then the product says "no reviewed guidance", which is the honest state.
- Decide the organizers' position on PhysioNet use (BUT CGM), on retention of NASA data in the browser ("Keep on this device"), and on the origin of real entries in "My records" (terrestrial / ground analog / flight chosen by the person).

### B. Open engineering items (an agent can do them)
1. **No repair path for a damaged stored record** (G6-W3 finding M-2). One invalid row in IndexedDB makes the whole subject unreadable; the views and a banner say so, but the only way out is removing the site data. Needs a design decision about immutable history (R7): quarantine ("skip and name the bad record") or a per-record delete with a recorded reason. Start in `app/store/index.js` (`load` validates the whole collection) and `app/ui/base/start.js` (`#store-health`).
2. **Hash-based script policy** for `dist/orbita.html` (`scripts/package.mjs`, constant `CSP`): replace `script-src 'unsafe-inline'` so a future DOM sink cannot become XSS. Add tests in `tests/package/package.test.js`.
3. **IndexedDB backend still validates the whole collection on every write** (`indexedBackend` in `app/store/index.js`); the memory backend was fixed. Measure a 10,000-record keep to IndexedDB (never measured).
4. **Importers:** MR080G accepts one campaign/subject/date/test only; omics files have no adapter; CRF and MR035G units and the immune denominators are unconfirmed (need a source dictionary; never guess); the 10,000-record bound is the store's capacity.
5. **Teammate's backend** (`frontend/backend/`) serves its own seed, not the main app's store; connecting them is a design decision (see `frontend/INTEGRATION.md`). His slope/scenarios/research case were deliberately not ported.
6. **Other browsers and a screen reader** were never run (only Chromium here). Firefox could not be installed in the build environment. Test blob modules, IndexedDB and `file://` storage (every `file://` page shares one storage in Chromium).
7. **Smaller known items:** rule retirement ("a loaded rule cannot be retired"); an "old" marker for old exams in the episode summary; keep the chosen file after a failed rules load; `parseRules` counts characters, not bytes; a 5 MB note is accepted by export; origin lock lives only in `localStorage`; the F5 "kept store" would need a migration if `SCHEMA_VERSION` ever moves past 2; period labels in the review view count back from the newest value, not from today.
8. **Docs debt:** modules M13–M20 have no formal `## Replication` section (the review reports are in the G3/G4/G5/G6 addenda); some old "Not verified" lines in M-records are superseded by addenda (read the addenda, the newest wins).

### C. Do not redo
F1 (accepted), the importers' row-by-row checks (done on the five real files), the packaging determinism check, the contrast measurements (four theme runs), the independent reviews (reports summarised in `docs/experiments/G3.md`, `G4.md`, `G5.md`, `G6.md`, `M23.md`).

## 5. Map

| Where | What |
|---|---|
| `app/core`, `store`, `mission`, `catalogs`, `scenario`, `readings` | F1/F2 domain |
| `app/procedures`, `plan`, `episode`, `copilot`, `summary`, `privacy`, `sync`, `importers`, `export` | F3–F5, M25 domain |
| `app/ui/<view>/` (`model.js` = no DOM, `view.js` = DOM only) | views; `app/ui/base/` is the shell, kit and `start.js` (composition root) |
| `scripts/package.mjs`, `scripts/serve.mjs`, `scripts/run-gates.mjs` | packaging, dev server, gate runner |
| `tests/walkthrough/` | gate tests (`g*.test.js`) and browser walks (`g*-browser.py`, `review-browser.py`, `contrast-browser.py`) |
| `tests/controls/` | negative controls (break the code, a test must go red; the script restores the file and checks the hash) |
| `docs/experiments/` | one record per module and per gate: predictions, runs, decisions, "Not verified", dated addenda |
| `frontend/` | teammate's Next.js edition (own deps, own CI under `.github/workflows/frontend-*.yml`) |

## 6. Traps that already cost time

- `node --test` bare also runs `frontend/`'s TypeScript tests: use `npm test`.
- `git checkout <file>` throws away uncommitted work in that file: commit or stash first.
- Browser selectors like `[role=alert]` also match hidden banners (`#store-health`); scope them to `#view`.
- A wait like "message includes Loaded" can already be true from the previous step; wait for the new file name.
- The store limits a batch by the size of its object graph (256 records is safe, 1,000 is refused).
- Controls patch a unique string: when code changes, a control can silently stop matching (`ERROR`) or become equivalent; `node scripts/run-gates.mjs` flags both.
- Playwright `wait_for_function` is forbidden by the packaged file's policy; poll with `evaluate`.
- Another process may change the working tree during a long task; run `git status` before committing.
