# Work order M15 — My plan and On board views

Phase F3 · wave 2 · level 2 · contracts version 0.3

**Goal.** Show the day's tasks and guide the execution of a procedure step by step.

**Owned paths.** `app/ui/my-plan/`, `app/ui/on-board/`. Nothing outside them.

**Depends on.** M07 Base interface, M13 Procedures, M14 Plan. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/APPLIED_RESEARCH.md` (A01), `docs/FINAL_PROPOSAL.md` (Proposed demo).

## Deliverables

- My plan view and On board view, with equipment and preparation checks before starting.

## Done when

- [ ] With the configuration that lacks the equipment, the procedure shows as blocked, with the reason and no start button.
- [ ] When the configuration changes, the same procedure visibly changes behavior.
- [ ] It is possible to interrupt, leave, come back and resume.
- [ ] "I could not complete it" asks for the difficulty and stores it.
- [ ] Source, version and review status of the procedure are visible; "demo" reads as such.
- [ ] Assigned plan, action taken and result are shown as three things.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Offering an "equivalent" test that the procedure does not declare.

**The costliest mistake.** A demo procedure that looks like medical guidance.

**Skills.** resilient-ui-states, frontend-accessibility-by-construction, non-overwhelming-ux.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
