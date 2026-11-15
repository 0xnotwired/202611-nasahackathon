# Work order M23 — Packaging

Phase F6 · wave 1 · level - · contracts version 0.3

**Goal.** Produce a single HTML file that opens with a double click, like the current mockup.

**Owned paths.** `scripts/package.mjs`. Nothing outside them.

**Depends on.** M20 I feel different view. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/ORCHESTRATION_PLAN.md` (Known traps), `docs/DEMO_README.md`.

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

## Out of scope

- Minifying, transpiling or using an external bundler.

**The costliest mistake.** A packaging step that changes behavior without anyone comparing.

**Skills.** pipeline-trust, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
