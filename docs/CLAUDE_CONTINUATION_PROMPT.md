# Claude Code continuation prompt

Use this prompt in another development environment. main is the current
base; read live repository state rather than relying on an old commit hash.

```text
Continue Orbita at https://github.com/0xnotwired/202611-nasahackathon.

Start from current origin/main. Create mod/f2-claude (or a distinct module
branch) from it; preserve any existing checkout edits. Do not force-push,
reset or overwrite main/f2/english. main already contains the f2 work.

First read AGENTS.md, CLAUDE.md, docs/CURRENT_STATUS.md,
docs/CONTRACTS.md, docs/AGENT_ROADMAP.md and docs/modules.csv.
Select/read the applicable local skills under .agents/skills/.
Run node --test and python3 scripts/check_docs.py. Baseline:100 passing tests.

M00/M01-M05 are implemented/reviewed; F1/G1 accepted. M21 was explicitly
advanced and implements selected CRF/MR079G/MR035G/MR080G/BUTCGM importers.
There is a minimal modular shell, not the planned product views.
Continue F2: M06 readings and M07 base interface, then M08-M12, following
work orders, contract ownership and independent review. Do not rebuild F1
or treat M21 as acceptance of later phase gates.

Use your default environment, checking actual tools first. Product has no
npm dependencies and needs no npm install. Node22.x/Python3 are the known
baseline; Python Playwright and Chromium are development tools for browser
checks. The existing script expects Linux /usr/bin/chromium: diagnose other
platform/tool differences rather than claiming browser validation happened.

Restore originals following docs/LOCAL_DATA_RESTORE.md, using receipt URLs
and SHA256. Raw files, local browser profile and IndexedDB are NOT in Git.
Then run python3 scripts/import-real-samples.py in a compatible environment:
expect3861 exact records after restart; repeated run inserts0/retains3861.
This is a dedicated local profile/database, not a product import screen.
Do not claim those records exist on your machine before checking them.
Optional genetic archive receipts are in
 docs/data/genetic-archive-downloads-2026-11-15.json; current M21 does not
import omics arrays. Synthetic data suffice to start F2 if originals/browser
are unavailable; report remaining validation limits explicitly.

Preserve source identities, missing states, unknown units and clock scopes.
Do not infer CRF/BMD/immune units or invent UTC/medical thresholds.
PhysioNet use is provisionally authorized by the user, with required
licenses/citations and withdrawal if organizers decline; no official approval
has been received. Do not copy external projects/templates/code or add a
library without user approval by name. Source code/docs are English;
communicate with the user in Spanish.

Do not commit, push, publish, deploy or approve gates without authorization
for that action. Finish useful independent work before asking questions.
```
