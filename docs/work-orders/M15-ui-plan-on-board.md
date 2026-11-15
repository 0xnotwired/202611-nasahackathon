# Work order M15 — My plan and On board views

Phase F3 · wave 2 · level 2 · contracts version 0.4

**Goal.** Show the day's tasks and guide the execution of a procedure step by step.

**Owned paths.** `app/ui/my-plan/`, `app/ui/on-board/`, and the record `docs/experiments/M15.md`. Nothing outside them.

**Depends on.** M07 Base interface, M13 Procedures, M14 Plan. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/APPLIED_RESEARCH.md` (A01), `docs/FINAL_PROPOSAL.md` (Proposed demo).

## Deliverables

- My plan view and On board view, with equipment and preparation checks before starting.

## Done when

- [ ] With the configuration that lacks the equipment, the procedure shows as blocked, with the reason and no start button.
- [ ] When the configuration changes, the same procedure visibly changes behavior.
- [ ] It is possible to interrupt, leave, come back and resume.
- [ ] "I could not complete it" asks for the difficulty and stores it.
- [ ] Source, version and review status of the procedure are visible; "demo" reads as such.
- [ ] Assigned plan, action taken and result are shown as three things.
- [ ] The day's plan shows progress as "n of m done", with not done and pending visible; no streaks, points or badges for results or for "nothing new".
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M15.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M15-X1`, `M15-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M15-P1 | On board model with the configuration that lacks the equipment | Blocked, with the missing items by name, and no start action | Offer the start action |
| M15-P2 | The same procedure with each of the two configurations | One model can start and the other cannot | Ignore the configuration |
| M15-P3 | Interrupt at step 2, leave the view, come back | The model offers to resume at step 2 | Start again from step 0 |
| M15-P4 | Model for a procedure whose `review_status` is `demo` | The text says "demo"; source and version are present | Hide the review status |
| M15-P5 | My plan model for a task marked `done` with no result | Assigned, done and result are three fields; result reads "not recorded" | Show the result as fine when the task is done |
| M15-P6 | My plan model for a day with 2 done, 1 not done, 1 pending | Text "2 of 4 done"; the not done and pending items are listed by name; no streak or score field | Hide not done items from the count |

## Out of scope

- Offering an "equivalent" test that the procedure does not declare.

**The costliest mistake.** A demo procedure that looks like medical guidance.

**Skills.** resilient-ui-states, frontend-accessibility-by-construction, non-overwhelming-ux.

Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
