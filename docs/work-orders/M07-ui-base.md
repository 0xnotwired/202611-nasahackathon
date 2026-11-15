# Work order M07 — Base interface

Phase F2 · wave 1 · level 1 · contracts version 0.4

**Goal.** Build the shell, the navigation and the shared components that make a piece of data look the same in every view.

**Owned paths.** `app/index.html`, `app/ui/base/`, and the record `docs/experiments/M07.md`. Nothing outside them.

**Depends on.** M00 Foundation. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/CONTRACTS.md §5`, `demo/orbita.html` (visual reference; it is team code), `docs/ACADEMIC_BASE.md` (S04, S05).

## Deliverables

- Shell with navigation to every planned view, each pointing to its folder.
- `stateLabel`, `originLabel`, `valueWithContext`, `accessibleTable`, `lineChart`.
- Assembly of `services` and a mission configuration selector.
- A visible notice when the store is not persistent.
- A plain-text notice in `app/index.html`, visible when the modules do not load (double click), that the shell removes when it starts.

## Done when

- [ ] A view that is not implemented shows "not available yet" and does not break navigation.
- [ ] The three record states can be told apart by reading the text alone.
- [ ] The chart shows gaps as gaps and offers the same information as a table.
- [ ] All navigation can be done with the keyboard and focus is visible.
- [ ] Component models are tested in Node; drawing is checked with the manual script.
- [ ] `dataStateBadge` distinguishes current, old, not recorded, confirmed nothing new and not comparable by text alone; no badge says "normal".
- [ ] `attentionBadge` shows `defined_by`, source and review status, and reads `no_criterion` as "no attention criterion defined for this mission".
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M07.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M07-X1`, `M07-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M07-P1 | `stateLabel` for each of the three states | Three different texts: "recorded", "confirmed nothing new", "not recorded" | Map `not_recorded` to the `confirmed_none` text (R1) |
| M07-P2 | `lineChart` model for points day 1 = 60, day 2 missing, day 3 = 62 | Two separate segments, and a table model of three rows where day 2 reads "not recorded" | Join the line across the missing day (R2) |
| M07-P3 | `originLabel` for each value of `ORIGINS`, and for an unknown text | A different non-empty label for each; the unknown one says the origin is unknown, never "synthetic" | Default to "synthetic" (R4) |
| M07-P4 | Shell model when one view's module answers `not_implemented` | That view shows "not available yet"; the navigation still lists every view | Let the error stop the shell |
| M07-P5 | Shell model built on a memory store | A storage notice with text is present | Hide the notice when `persistent` is `false` |
| M07-P6 | Open `app/index.html` with a double click, then through the server | From `file://` a plain-text notice says the page must be opened through the local server; through the server the shell replaces it. BROWSER level; if not run, the record says "not verified in a browser" | Remove the static notice: the page is blank from `file://` |
| M07-P7 | `dataStateBadge` for each data state; `attentionBadge` for `no_criterion` and for a demo `outside` | Five different texts, none containing "normal" or "fine"; the attention texts name the missing criterion, and the demo one says "demo" with its source | Map `no_criterion` to a green "OK" |

## Out of scope

- The content of each view.
- UI or chart libraries.

**The costliest mistake.** If every view draws the state its own way, "not recorded" ends up looking like "nothing new" in one of them.

**Skills.** frontend-accessibility-by-construction, resilient-ui-states, non-overwhelming-ux, frontend-component-boundaries.

Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
