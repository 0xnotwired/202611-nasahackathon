# Work order M23 — Packaging

Phase F6 · wave 1 · level - · contracts version 0.4

**Goal.** Produce a single HTML file that opens with a double click, like the current mockup.

**Owned paths.** `scripts/package.mjs`, and the record `docs/experiments/M23.md`. Nothing outside them.

**Depends on.** M20 I feel different view. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/ORCHESTRATION_PLAN.md` (Known traps), `docs/DEMO_README.md`.

## Deliverables

- `scripts/package.mjs`: bundles the modules in `app/` into `dist/orbita.html` using only `node:` modules.

## Done when

- [ ] `dist/orbita.html` opens from `file://` in a real browser and completes the episode.
- [ ] The file makes no network request.
- [ ] What is packaged behaves the same as what is served: the manual script gives the same result.
- [ ] If IndexedDB does not work from `file://`, the app says so on screen.
- [ ] `dist/` is in `.gitignore`.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M23.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M23-X1`, `M23-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M23-P1 | Search `dist/orbita.html` for module imports | No `import … from` that points to a file and no script with a `src` | Leave one import: from `file://` it fails as in E00-P3 |
| M23-P2 | In a browser, open `dist/orbita.html` from `file://`, record the network requests and complete the episode | The only request is the file; the episode completes. BROWSER level; if not run, the record says "not verified in a browser" | Add a remote font: a second request appears |
| M23-P3 | Run the manual script on the served app and on the packaged file | The same results, line by line | — |
| M23-P4 | IndexedDB from `file://` in each browser the team will present on | It works in Chrome (E00-P5); in any browser where it does not, the app says so on screen | Fresh profile: nothing is restored |

## Out of scope

- Minifying, transpiling or using an external bundler.

**The costliest mistake.** A packaging step that changes behavior without anyone comparing.

**Skills.** pipeline-trust, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
