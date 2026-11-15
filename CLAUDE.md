# CLAUDE.md — session guide for agents working on Órbita

## What this file is and what wins

- **[AGENTS.md](AGENTS.md)** is the product manual: scope, evidence rules, how the product is built by modules, walkthrough invariants. **If this file contradicts it, AGENTS.md wins.**
- The full order of authority between files is at the top of AGENTS.md. This file comes last: it does not define the product.
- **CLAUDE.md** (this file) covers what AGENTS.md does not: how to work through a session without repeating mistakes that already happened here, and where to pick up.

It does not repeat the README or AGENTS.md. Read them.

## Reading order for a new session

1. [AGENTS.md](AGENTS.md)
2. [docs/FINAL_PROPOSAL.md](docs/FINAL_PROPOSAL.md) — what the product is
3. [docs/PROPOSAL_IMPROVEMENTS.md](docs/PROPOSAL_IMPROVEMENTS.md) — what changed and why
4. [docs/ORCHESTRATION_PLAN.md](docs/ORCHESTRATION_PLAN.md) — phases, modules, roles and gates
5. [docs/IMPLEMENTATION_LAYERS.md](docs/IMPLEMENTATION_LAYERS.md) — what each layer must prove, and the evidence behind each decision
6. [docs/CONTRACTS.md](docs/CONTRACTS.md), [docs/METHOD.md](docs/METHOD.md) and your work order in [docs/work-orders/](docs/work-orders/), if you are going to build or review a module
7. [docs/AGENT_ROADMAP.md](docs/AGENT_ROADMAP.md) — when each level is done, and the handoff log
8. [docs/DATASETS.md](docs/DATASETS.md) before touching data

If you are a builder or a reviewer, your role and your report format are in the plan. If nobody assigned you a module, do not start one: ask.

## Skills: select and read them before every task

The skills under `.agents/skills/` are part of how work is done here, not an optional extra. AGENTS.md ("Local skills — required task workflow") sets the duty and a routing table; this section says how to carry it out and what happened when it was not.

**Rule.** Before the first line of code, test, document or commit of any task, and again whenever the kind of work changes inside a session:

1. Open the [skill index](.agents/skills/README.md) and select the skills whose own "activates when" matches the work. The module work order's `Skills` line is the minimum, not the ceiling.
2. Read each selected `SKILL.md` **body**, not only its description or its first lines. Open a bundled reference file or script only when the task needs it, and say so when you do. Do not read all 199 skills: choosing is part of the discipline.
3. Apply their rules to the task. If a skill conflicts with AGENTS.md, CONTRACTS.md or the user's instruction, the authority order in AGENTS.md decides and the conflict goes in the report.
4. Write down which skills were used, **when they were read** (before the work or after) and what each one changed, in the module's experiment record (a `Skills` line under its decision details) or in the handoff. A skill read late is reported as read late, never as applied from the start.

**Triggers that are easy to miss.** A work order may not list them; select at least these when the task touches:

| The task touches | Select at least |
|---|---|
| A file, form, upload or any text that comes from outside (importers, M22) | `secure-by-construction`, `validate-at-the-boundary` |
| Any test, or the claim "it works" | `falsifiable-testing`, `discriminating-proof` |
| Missing, old, degraded or reconstructed data; a save that can fail part-way | `honest-degradation`, `atomic-state-mutation` |
| A surprise, a test that passes when it should not, a bug | `abductive-engineering`, `diagnosing-bugs` |
| A choice someone will ask about later | `decision-record-discipline` |
| A source, a figure, a citation, or reading a README or paper | `claim-provenance-discipline` |
| Editing an existing file | `surgical-patcher` |
| Any commit, branch or push | `git-discipline` |
| A screen, a chart or a form | `frontend-accessibility-by-construction`, `resilient-ui-states`, `non-overwhelming-ux`, `frontend-component-boundaries` |
| An agent instruction file, this one included | `writing-agents-md` |

**Reason.** On 15/11/2026 M06, M07 and M22 were built with the required skills read late or only in part (mistake 7). Reading them afterwards found real gaps that reading them first would have prevented.
**Mechanism:** none automatic. Nothing can prove that a skill was applied; AGENTS.md says the same. The reviewer compares the record's `Skills` line with the skills the task triggers, and a missing line is a finding. `scripts/check_docs.py` does not check it.

## Repository map

```
AGENTS.md                      product manual; wins over this file
CLAUDE.md                      this guide
README.md                      presentation for people
demo/orbita.html               single-file mockup, fictional data; NOT modified when building app/
demo/final-product-vision.html visualization of the finished product for the team; not product code
docs/FINAL_PROPOSAL.md         current proposal and acceptance criteria
docs/PROPOSAL_IMPROVEMENTS.md  improvements M1–M9 derived from series B
docs/ROADMAP.md                levels, from the product side
docs/ORCHESTRATION_PLAN.md     phases, waves, modules, roles, gates
docs/IMPLEMENTATION_LAYERS.md  the claim each layer makes, its gate experiments, decisions and their evidence
docs/METHOD.md                 how a claim is tested and recorded: prediction, red, green, break, evidence level
docs/experiments/              one record per module (MNN.md) and per gate (Gn.md); E00 holds the foundation probes
docs/CONTRACTS.md              interfaces between modules and rules R1–R9; only the orchestrator edits it
docs/modules.csv               board: owned paths, dependencies and status of each module
docs/work-orders/              one work order per module (M00–M24), each with its experiments
docs/AGENT_ROADMAP.md          checklist for each level + handoff log
docs/ACADEMIC_BASE.md          sources S01–S18 (and a copy of A01–A06)
docs/APPLIED_RESEARCH.md       sources A01–A06
docs/EXTENDED_RESEARCH_B.md    sources B01–B26, with reading level
docs/*_MATRIX*.csv             one row per source or claim
docs/DATASETS.md               what NLSP/OSDR and other sources contain, and their integration limits
docs/DATASET_CITATIONS.md      citation of each dataset, with what was and was not retrieved
docs/RESOURCES_USED.md         delivery list: tools, data and AI use, with licenses
docs/RESOURCES.md              reading list and concept references (not the delivery list)
docs/REQUIREMENTS.md           challenge text and its goals; gaps closed by D10–D14
LICENSE                        Apache-2.0
scripts/check_docs.py          consistency of matrices, module board and links
app/                           M00 foundation and implemented M01–M05; later modules remain placeholders
```

## Where to pick up — current handoff

Read [docs/CURRENT_STATUS.md](docs/CURRENT_STATUS.md), inspect git status/HEAD,
and work on a separate branch such as mod/f2-claude. F2 (M06–M12, M22) and F3 (M13–M15) are
built with records and G2/G3 walkthroughs, but not independently reviewed or
accepted; statuses stay `pending`. 334 Node tests pass. The store is IndexedDB schema v2 (a profile is upgraded on open). Run node --test and
python3 scripts/check_docs.py; browser scripts need ORBITA_CHROMIUM.
Original datasets, local IndexedDB profile and source-data reports are not
restored by Git. Use [docs/LOCAL_DATA_RESTORE.md](docs/LOCAL_DATA_RESTORE.md),
verify hashes and rerun scripts/import-real-samples.py before claiming real
records exist on another machine. The previous local run persisted3861
records with exact restart readback and duplicate-free repeat.

Contract0.8/schema2 preserve unknown units and unknown-zone source dates;
MR079G ordering is corroborated but its zone remains unknown. CRF/MR035G
unit and immune denominator/export questions remain unconfirmed despite
primary-paper research. Omics files are acquired/inspected but not supported
by current M21 adapters. PhysioNet use is provisional under the user's
explicit decision, not an organizer response. Keep licenses/citations.

Select and read the relevant local skills before starting (Skills section
above). Preserve source ownership and independent
review; add no dependencies without named approval. Code/docs remain English.
Do not publish, commit, push or approve gates based on this handoff alone.

## The central rule

**Órbita never presents as known something that is not known.** Almost everything else follows from it:

- "Not recorded" is not "nothing new". NA is not zero.
- A ground analog is not an astronaut. Two cohorts are not one person.
- The copilot's silence is not "all fine".
- A figure read in an abstract is not a verified figure.

The two directions of error do not weigh the same. Showing "not assessed" when there was data is annoying and gets noticed. Showing "normal" when there was no data is silent, and it is the error this product exists to avoid. **When in doubt, show less certainty.**

## Mistakes that already happened in this repo

Each rule comes from something that happened in the sessions of 14–15/11/2026. None is automatically enforced unless stated.

### 1. Attributing authors or journals from memory

While writing series B, three attributions were written that were not in any retrieved source ("Lyell 2017", "Jones 2024", "JAMA Ophthalmol 2020"). They were caught in review and removed before the commit.

**Rule:** author, year, journal and figure are only written if they are in text retrieved in that session. Otherwise, cite by title or URL.
**Mechanism:** none automatic. Manual review.

### 2. Citing figures from an abstract as if they came from the article

PMC returned a browser check instead of the article on several downloads, so series B was written almost entirely from abstracts. When the user provided the PDFs of B01, B03 and B06 (15/11), the full reading **corrected a claim**: B03's "ten times more than medical records" compares different cohorts, not the same people, and it had already been carried into PROPOSAL_IMPROVEMENTS.md.

**Rule:** every new source carries a reading level: `FT` (full text), `AB` (abstract) or `S` (snippet or secondary source). A figure at level AB or S does not go into the presentation without opening the original. Full texts read with an automated extraction tool (section 6 of series B) must also be checked against the PDF before presenting.
**Mechanism:** column `reading_level` in `RESEARCH_MATRIX_B.csv`. The script does not validate its content. When a source is upgraded to FT, `grep` every claim that depended on it in the other documents: a correction in a single file leaves the wrong version alive in another.

PDFs provided by the user are read but **not uploaded to the repo**: not all of them have an open license (B03 does not).

### 3. NASA pages that look empty

`nlsp.nasa.gov` and `osdr.nasa.gov` load their content with JavaScript: a plain fetch returns only the portal title. `spaceappschallenge.org` blocked automated reading of the challenge pages; its participant terms (`/legal/`) could be read on 15/11.

**Rule:** "the page has no data" is not a valid conclusion for these sites. Use the API endpoints noted in DATASETS.md, or ask the user for the file. The official 2026 challenge text is **not verified**; REQUIREMENTS.md keeps the user's version.

### 4. The word "MVP"

It appeared in two documents (finding A01) even though the project is built in levels. Fixed on 14/11.

**Rule:** do not propose an MVP, a "quick version" or a throwaway prototype. Under time pressure, fewer levels are built, complete.
**Mechanism:** `grep -rn "MVP" docs README.md` must return only the mentions that reject the term.

### 5. Duplicated documents

`APPLIED_RESEARCH.md` is copied inside `ACADEMIC_BASE.md`. The fix for item 4 had to be made twice.

**Rule:** when editing a claim from A01–A06, look for it in both files. Do not create a third copy.

### 6. Losing track of the working branch

On 15/11 a local branch `integracion` appeared, checked out and identical to `claude`, without anyone recording why. Nothing was lost, but work could have landed on the wrong branch.

**Rule:** run `git branch --show-current` before every commit, and do not delete branches you did not create.

### 7. Reading the required skills late, or not at all

On 15/11/2026 modules M06, M07 and M22 were built with the skills their work orders name read only in part (four interface skills, their first lines) or not read before building. After the user pointed it out, the skills were read and the work was audited against them. The audit found three real gaps in M22 that reading first would have prevented: a file was read into memory before its size was checked, a save that failed part-way left records with no card and no message, and a session accepted unlimited file cards. It also found decisions with no rejected alternatives or revisit triggers, and no threat model for a view that reads untrusted files. Nothing had shipped; each gap was fixed with a test seen red first.

**Rule:** select and read the applicable skills before starting, as the Skills section says, and record which ones and when.
**Mechanism:** none automatic. The reviewer checks the record's `Skills` line against the task; `check_docs.py` does not look at it.

## Values that are decisions, not oversights

| Value | Where | Why not to "normalize" it |
|---|---|---|
| 6–8 volunteers | FINAL_PROPOSAL, formative test | A problem-detection size, not a validation size; its limit is stated (B14) |
| 600 mSv | IMPROVEMENTS M5 | Program requirement read in a technical brief; **not confirmed** in S03. Do not show until confirmed |
| Three record states | AGENT_ROADMAP, data model | Do not collapse to two: that is improvement M2 |
| One alert per episode | IMPROVEMENTS M4 | Not an arbitrary limit; it comes from B13 |
| Simulated sync | ORCHESTRATION_PLAN D9 | Chosen by the user for time reasons; a real server is a later level, not a hidden one |

There are no clinical thresholds in this repo's logic. A criterion for attention may exist only as data in `MissionConfig.attention_criteria`, with who defined it, its source and its review status (D11, rule R6); the demo ones say "team demo". A threshold written into a function is a bug.

## Verified commands

```bash
python3 scripts/check_docs.py
```

An `OK` result proves this and only this: matrices A and B parse as CSV and their ids match those in their documents; every module in `docs/modules.csv` has its work order, and the work order lists experiment ids; a module marked `in_review` or `integrated` has its experiment record with every section and id, plus a filled replication section if integrated; owned paths do not overlap; every dependency sits in an earlier phase or wave; the plan names the same modules; and relative links between `.md` files resolve. It **does not prove** that figures are correct, that sources say what is claimed, that an agent respected their paths when writing code, that a prediction was written before the code, or that an evidence level is honest. The script was seen failing on a real broken link and on six deliberate breakages of the board (overlapping paths, later dependency, same-wave dependency, orphan work order, unknown status, nonexistent dependency), and on five of the experiment checks (work order without ids, module in review without a record, record missing a section and an id, integrated without replication, empty replication).

There is no build, lint or clinical/product workflow test. M00 now supplies foundation and G0 tests via `node --test`; the modular shell runs via `npm run serve`. The original mockup is still opened separately in a browser.

`node --test` will be the test command once M00 creates `package.json`. On 14/11 it was verified that it runs an ES module with its test on Node 22 without installing anything. Nothing was verified in a browser.

## Git

Apply the `git-discipline` skill: a restore tag before each session (`git tag -a pre-session-<date>`), only history-adding operations (`commit`, `merge`, `revert`), never `rebase`, `squash` or `push --force`, and check `git status` and `git log` before stating a status.

- **Nobody commits directly to the default branch**: not the owner, not the team, not an agent. AGENTS.md requires it because this is a team repo. Work happens on branches and is proposed through PRs.
- **Write access is not permission to `git commit` or `git push`.** Every commit and every push needs an instruction from the user for that task. An authorization covers that action, not the rest of the session.
- The `english` branch was created on 15/11/2026 at the user's request, because the hackathon requires English. It was the integration branch then; the later user decision makes main the current base. The `claude` branch keeps the Spanish history up to that date.
- **Everything that lands in the repo is in English** (AGENTS.md, Work and verification): commit messages and PR descriptions included, even when the user writes in Spanish.
- Module branches are named `mod/mNN-name`. **Not `claude/...`**: Git answers `cannot lock ref` while the `claude` branch exists. Verified on 14/11.
- An agent's commits carry the prefix `docs(agent):`, `feat(agent):` or `fix(agent):` so they can be filtered, plus the co-author line given by the session.
- Every throwaway test file goes into `.gitignore` in the same action that creates it.

## Anna's skills

The user explicitly requested a local copy of `github.com/annatchijova/SKILLS`. The complete snapshot now lives under `.agents/skills/`; `.agents/SKILLS_SOURCE.json` records the pinned commit and byte hashes. Follow AGENTS.md's local-skill workflow and the Skills section above: read and apply the relevant SKILL.md files from this checkout before the work, not after. The ones that matter most here:

| Skill | Where it applies |
|---|---|
| `destination-driven-construction` | Roadmap levels; no MVP |
| `claim-provenance-discipline` | Every scientific claim; reading levels |
| `honest-degradation` | Three record states; storage that fails visibly |
| `validate-at-the-boundary` | Validating `Record` on entry |
| `falsifiable-testing` | Watch every test fail before trusting it, and fail again under a negative control |
| `discriminating-proof` | Prediction written before the run; one evidence level per claim; refuted results kept |
| `abductive-engineering` | A surprise gets rival explanations and the cheapest test that tells them apart |
| `decision-record-discipline` | Decisions D1–D14 with what they rest on and what reopens them |
| `writing-agents-md` | Every rule in AGENTS.md with its reason and its mechanism, or the statement that it has none |
| `secure-by-construction` | Health data: threat model before code |
| `surgical-patcher` | Edit by anchors; do not rewrite whole files |
| `llm-out-of-the-loop` | The copilot decides with explicit rules; a model, if there were one, only narrates |
| `readme-architecture`, `honest-technical-oratory` | README and presentation |

`terminal-first` and `working-on-main` are personal preferences of their author and do **not** apply here: this repo requires branches.

## Before calling something done

- [ ] No screen or export shows "not recorded" as "nothing new", or NA as zero. *(Central rule)*
- [ ] Every piece of data shows its origin: synthetic, ground analog or flight. *(Central rule; AGENTS.md)*
- [ ] Every new source has a reading level, and no author, year or figure came from memory. *(Mistakes 1 and 2)*
- [ ] If A01–A06 was touched, the change is in both files. *(Mistake 5)*
- [ ] `grep -rn "MVP"` found no MVP proposals. *(Mistake 4)*
- [ ] Everything added or changed is in English, identifiers and commit message included. *(AGENTS.md, Work and verification)*
- [ ] No clinical threshold was added and no value from the decisions table was "normalized".
- [ ] Every claim in the report carries an evidence level, and predictions were written before the run. *(AGENTS.md, Method)*
- [ ] The skills this task triggers were selected and read **before** the work, and the record says which ones and when. *(Skills section; mistake 7)*
- [ ] `python3 scripts/check_docs.py` returns `OK`, and the report says what that proves and what it does not. *(Verified commands)*
- [ ] `git status`, `git log` and `git branch --show-current` checked before reporting status. *(Git; mistake 6)*
- [ ] Commit and push only with authorization for this task, on a branch. *(Git)*
- [ ] If you built a module: `git diff --stat` shows only your owned paths and you did not touch `docs/CONTRACTS.md`. *(AGENTS.md, Building by modules)*
- [ ] The handoff log in `docs/AGENT_ROADMAP.md` reflects what was verified, not what was attempted.
