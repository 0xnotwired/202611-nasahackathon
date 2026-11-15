# Work order M00 — Foundation

Phase F0 · wave 1 · level - · contracts version 0.3

**Goal.** Get the ground ready so the other modules can be built in parallel: contracts in code, reusable contract tests, placeholders for each module and the way to run and test everything.

**Owned paths.** `package.json`, `scripts/serve.mjs`, `app/contracts/`, `tests/contract/`, `docs/THREAT_MODEL.md`. Nothing outside them. Exception for this work order: it creates the placeholder `index.js` of the other modules.

**Depends on.** Nothing.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/ORCHESTRATION_PLAN.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M9).

## Deliverables

- `docs/THREAT_MODEL.md` **before writing code**: who uses the device, what leaves it, which inputs are untrusted (imported files, procedure content) and what is not protected (there is no encryption).
- `package.json` with `"type": "module"`, no dependencies, and the `test` and `serve` scripts.
- `scripts/serve.mjs`: our own static server using `node:` modules; it serves only `app/`, only on `127.0.0.1`.
- `app/contracts/`: JSDoc definitions of every type and interface in CONTRACTS.md.
- `tests/contract/`: one test suite per interface, which receives an implementation and checks it; plus valid and invalid sample data.
- `app/<module>/index.js` for each module M01–M22 and M24: a placeholder that answers `{ ok: false, error: { code: "not_implemented" } }` in the shape of the contract.
- `.gitignore` with `data/originals/` and `dist/`.

## Done when

- [ ] `node --test` runs and passes without installing anything.
- [ ] Each contract suite **fails** against the "not implemented" placeholder. If it passes, the suite checks nothing.
- [ ] The server does not deliver files outside `app/` (try `../AGENTS.md`).
- [ ] In a real browser: the shell loads through the server. Also note what happens when `app/index.html` is opened with a double click.
- [ ] CONTRACTS.md and `app/contracts/` name the same fields.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Logic of any module.
- Changing CONTRACTS.md: if something does not fit, report it to the orchestrator.

**The costliest mistake.** A weak contract suite lets incompatible modules through without anyone noticing. A strict suite that forces a discussion about the contract is preferable.

**Skills.** secure-by-construction, validate-at-the-boundary, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
