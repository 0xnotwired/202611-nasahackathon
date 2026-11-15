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
app/                           does not exist yet; the product goes there, one folder per module
```

## Where to pick up (state on 15/11/2026, commit after 1043795)

Nothing of the product exists. The plan, contracts 0.4, 25 work orders with their experiments, decisions D1–D14 and the delivery lists exist. In order:

1. **Gate G0** (orchestrator plus a person). Write `docs/THREAT_MODEL.md` before any code: local health data with no encryption (D7), mood as a sensitive self-report, the simulated link (D9), imported files as untrusted input. Then launch M00 with one builder and one reviewer (prompts in ORCHESTRATION_PLAN.md, "How to launch an agent"); M00 records G0-W1 to G0-W3. A person approves G0.
2. **F1, wave 1**: M01, M02 and M03 in parallel once G0 is approved; then the rest of the waves as the plan orders them.
3. **Inputs that only a person can bring**, and what they unblock:
   - one `*_CGM.csv` file from BUT CGM: its columns and unit are unknown, and M21's `importGlucose` must be corrected against it;
   - the text of the eight NLSP study cards: their citation fields are missing;
   - the organizers' answer on "already-made projects", dependencies and attribution-only datasets;
   - the demo procedure and its clinical source (F3 content), and [V1 4030] in NASA-STD-3001 (radiation limit in M10).

What an agent must not do while these are open: invent the BUT CGM columns or unit, write NLSP authors or years, add a dependency, copy items from a published questionnaire, put a threshold in a function, or download original NASA or PhysioNet files into the repository.

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

There is no build, lint or product test: no product code exists yet. The mockup is opened in a browser. Do not invent other commands.

`node --test` will be the test command once M00 creates `package.json`. On 14/11 it was verified that it runs an ES module with its test on Node 22 without installing anything. Nothing was verified in a browser.

## Git

Apply the `git-discipline` skill: a restore tag before each session (`git tag -a pre-session-<date>`), only history-adding operations (`commit`, `merge`, `revert`), never `rebase`, `squash` or `push --force`, and check `git status` and `git log` before stating a status.

- **Nobody commits directly to the default branch**: not the owner, not the team, not an agent. AGENTS.md requires it because this is a team repo. Work happens on branches and is proposed through PRs.
- **Write access is not permission to `git commit` or `git push`.** Every commit and every push needs an instruction from the user for that task. An authorization covers that action, not the rest of the session.
- The `english` branch was created on 15/11/2026 at the user's request, because the hackathon requires English. **It is the integration branch from now on.** The `claude` branch keeps the Spanish history up to that date.
- **Everything that lands in the repo is in English** (AGENTS.md, Work and verification): commit messages and PR descriptions included, even when the user writes in Spanish.
- Module branches are named `mod/mNN-name`. **Not `claude/...`**: Git answers `cannot lock ref` while the `claude` branch exists. Verified on 14/11.
- An agent's commits carry the prefix `docs(agent):`, `feat(agent):` or `fix(agent):` so they can be filtered, plus the co-author line given by the session.
- Every throwaway test file goes into `.gitignore` in the same action that creates it.

## Anna's skills

The user asks that the skills from `github.com/annatchijova/SKILLS` always be applied. They are not installed in this repo: they are read from a clone. The ones that matter most here:

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
- [ ] `python3 scripts/check_docs.py` returns `OK`, and the report says what that proves and what it does not. *(Verified commands)*
- [ ] `git status`, `git log` and `git branch --show-current` checked before reporting status. *(Git; mistake 6)*
- [ ] Commit and push only with authorization for this task, on a branch. *(Git)*
- [ ] If you built a module: `git diff --stat` shows only your owned paths and you did not touch `docs/CONTRACTS.md`. *(AGENTS.md, Building by modules)*
- [ ] The handoff log in `docs/AGENT_ROADMAP.md` reflects what was verified, not what was attempted.
