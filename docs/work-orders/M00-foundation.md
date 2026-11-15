# Work order M00 — Foundation

Phase F0 · wave 1 · level - · contracts version 0.3

**Goal.** Get the ground ready so the other modules can be built in parallel: contracts in code, reusable contract tests, placeholders for each module and the way to run and test everything.

**Owned paths.** `package.json`, `scripts/serve.mjs`, `app/contracts/`, `tests/contract/`, `docs/THREAT_MODEL.md`, and the record `docs/experiments/M00.md`. Nothing outside them. Exception for this work order: it creates the placeholder `index.js` of the other modules.

**Depends on.** Nothing.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/ORCHESTRATION_PLAN.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M9).

## Deliverables

- `docs/THREAT_MODEL.md` **before writing code**: who uses the device, what leaves it, which inputs are untrusted (imported files, procedure content) and what is not protected (there is no encryption).
- `package.json` with `"type": "module"`, no dependencies, and the `test` and `serve` scripts.
- `scripts/serve.mjs`: our own static server using `node:` modules; it serves only `app/`, only on `127.0.0.1`.
- `app/contracts/`: JSDoc definitions of every type and interface in CONTRACTS.md.
- `tests/contract/`: one test suite per interface, which receives an implementation and checks it; plus valid and invalid sample data.
- `app/<module>/index.js` for each module M01–M22 and M24: a placeholder that answers `{ ok: false, error: { code: "not_implemented" } }` in the shape of the contract.
- `.gitignore` with `data/originals/` and `dist/`.
- `tests/contract/fakes/core.js`: a small reference implementation of `core`, for the tests only, so that the `core` suite can be seen green as well as red.

## Done when

- [ ] `node --test` runs and passes without installing anything.
- [ ] Each contract suite **fails** against the "not implemented" placeholder. If it passes, the suite checks nothing.
- [ ] The server does not deliver files outside `app/` (try `../AGENTS.md`).
- [ ] In a real browser: the shell loads through the server. Also note what happens when `app/index.html` is opened with a double click.
- [ ] CONTRACTS.md and `app/contracts/` name the same fields.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M00.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M00-X1`, `M00-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M00-P1 | Run every contract suite against its placeholder, then the `core` suite against the reference fake in `tests/contract/fakes/core.js` | Every suite fails on an assertion against the placeholder; the `core` suite passes against the fake | This experiment is the control: a suite that is green on a placeholder checks nothing, and one that is red on the fake is broken |
| M00-P2 | `curl --path-as-is http://127.0.0.1:<port>/../AGENTS.md`, then `/index.html` | 403 or 404 for the first, with a body that does not contain "Órbita"; 200 for the second | Remove the root-folder check in `serve.mjs`: the first request returns the file |
| M00-P3 | Open the shell through the server in a real browser; then open `app/index.html` with a double click | Through the server the shell's modules run. From `file://` they do not, with a CORS error, as in E00-P3. BROWSER level; if not run, the record says "not verified in a browser" | A classic inline script on the same page still runs from `file://` |
| M00-P4 | A test extracts the field names of each data shape from `docs/CONTRACTS.md` and from `app/contracts/` | The two sets are equal for every shape | Rename one field in `app/contracts/`: the test goes red |
| M00-P5 | `node --test` with no `node_modules` folder | Exit code 0 | Break one assertion: exit code 1 |

## Out of scope

- Logic of any module.
- Changing CONTRACTS.md: if something does not fit, report it to the orchestrator.

**The costliest mistake.** A weak contract suite lets incompatible modules through without anyone noticing. A strict suite that forces a discussion about the contract is preferable.

**Skills.** secure-by-construction, validate-at-the-boundary, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
