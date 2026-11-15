# Work order M07 — Base interface

Phase F2 · wave 1 · level 1 · contracts version 0.3

**Goal.** Build the shell, the navigation and the shared components that make a piece of data look the same in every view.

**Owned paths.** `app/index.html`, `app/ui/base/`. Nothing outside them.

**Depends on.** M00 Foundation. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/CONTRACTS.md §5`, `demo/orbita.html` (visual reference; it is team code), `docs/ACADEMIC_BASE.md` (S04, S05).

## Deliverables

- Shell with navigation to every planned view, each pointing to its folder.
- `stateLabel`, `originLabel`, `valueWithContext`, `accessibleTable`, `lineChart`.
- Assembly of `services` and a mission configuration selector.
- A visible notice when the store is not persistent.

## Done when

- [ ] A view that is not implemented shows "not available yet" and does not break navigation.
- [ ] The three record states can be told apart by reading the text alone.
- [ ] The chart shows gaps as gaps and offers the same information as a table.
- [ ] All navigation can be done with the keyboard and focus is visible.
- [ ] Component models are tested in Node; drawing is checked with the manual script.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- The content of each view.
- UI or chart libraries.

**The costliest mistake.** If every view draws the state its own way, "not recorded" ends up looking like "nothing new" in one of them.

**Skills.** frontend-accessibility-by-construction, resilient-ui-states, non-overwhelming-ux, frontend-component-boundaries.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
