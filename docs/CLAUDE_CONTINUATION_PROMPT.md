# Continuation prompt

Use this prompt to hand the project to another AI agent. Read live repository state, not an old hash.

```text
Continue Órbita (NASA Space Apps 2026, health monitoring software for astronauts) at
https://github.com/0xnotwired/202611-nasahackathon, branch final-claude.

Setup: git fetch origin && git checkout final-claude, then create your own work branch from it
(for example mod/next-<topic>). Never commit to main, never force-push, never rebase or squash,
never delete branches you did not create. Commit and push only when the user asks for that task.

Read, in this order: docs/HANDOFF.md (what is done and what is left, with the traps),
AGENTS.md (wins over every other file), CLAUDE.md (mistakes that already happened),
docs/CURRENT_STATUS.md, docs/AUDIT.md, docs/CONTRACTS.md, docs/METHOD.md, docs/modules.csv.
Before the first line of work, open .agents/skills/README.md, select the skills your task triggers and
read their SKILL.md bodies; record which and when in the module's experiment record.

Verify the baseline yourself: npm test (435 pass), python3 scripts/check_docs.py (OK),
npm run package, and node scripts/run-gates.mjs with ORBITA_CHROMIUM set to a Chromium
(it needs Python Playwright; real NASA files are not in git, see docs/LOCAL_DATA_RESTORE.md).

State: everything is built and tested; independent AGENT reviews covered F3, F4, F5 and all layers
(G6-W3), their findings are fixed except one; NO gate after G1 is accepted by a person, so keep every
status pending. Do not rebuild layers; do not redo reviews that exist.

Non-negotiable rules: never present as known something that is not known (not recorded is not nothing
new; NA is not 0; a ground analog is not an astronaut; silence is not all fine); no clinical threshold
or rule in code (rules are data with source, version and review status; none is shipped); every claim
carries an evidence level (RUN, BROWSER, READ, SOURCE) and a prediction written before the run; see a
test fail (negative control) before trusting it; everything in the repo in English; no new root
dependencies; contract changes only with a recorded bump (now 0.22).

What is left (docs/HANDOFF.md section 4 has the detail): (A, needs a person) the volunteer test G6-W4,
acceptance of the gates, real guidance rules, organizer decisions on PhysioNet and on data retention;
(B, you can do) a repair path for a damaged stored record (design decision about immutable history first),
a hash-based script policy for dist/orbita.html, IndexedDB write cost and a 10,000-record keep, importer
limits (MR080G, omics, units need a source dictionary - never guess), connecting the teammate's backend
to the main store only after a design decision, other browsers and a screen reader, and the small items
listed there. Ask the user before starting anything in group A or any decision-bearing item in B.

Report like a reviewer: what was run, at which evidence level, what was not verified.
```
