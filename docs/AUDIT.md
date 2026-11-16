# Audit of what is missing, by phase

Written 2026-11-16 by the builder agent at the user's request ("audita todo lo que nos falta por fases"). **It is a self-audit by the same agent that built most of it, so it is not the independent review the plan requires**; it lists what is open so that a person or a reviewer can decide. Every claim names how it was found.

## How it was done

Read: `modules.csv`, `FINAL_PROPOSAL.md` (acceptance criteria), `REQUIREMENTS.md` (challenge goals, D10–D14), the "Not verified" and "Refuted" sections of every record in `docs/experiments/`, and the current README. Checked in the code (grep or run): whether the main app can export, correct a record, create a task, link a result, show catalog sources, configure a freshness cutoff; what the demo configurations contain; whether "My records" can write. **Not done:** I did not re-open every checkbox of every work order (about 200); the records are the evidence for those.

## Verdict

F0–F6 each have code, tests, negative controls and a browser walk, and none of the gates is accepted by a person. The product is **a coherent honest demo, not yet a usable product**, for five reasons in the next section, plus a process debt (no independent review of most of it). Statuses on the board: M00–M05 and M21 `integrated`; every other module `pending`.

## P0: what stops it from being believable as a product

| # | Gap | Evidence | Decides |
|---|---|---|---|
| P0-1 | **Nothing real can be recorded.** "My records" is read-only: the origin of a real entry was never decided, so `writable` is `false` there. The only writable source is the synthetic demo, which lives in memory and resets on reload. Recovery of an episode "after closing the app" (a proposal criterion) cannot be shown with writable data | `app/ui/base/start.js` (`writable: isDemo`); M08 record | User: who is the origin of a person's own entry (a new origin value, or `user_entered` on a real subject) |
| P0-2 | **It gives no guidance.** The challenge asks for "guidance on treatments and health improvements"; the copilot ships no rule by design, so every card says "There is no reviewed guidance for this" | M17 record; `rules: []` in `start.js` | User + a clinician: reviewed rules, or clearly labelled non-clinical demo rules, or accept that the product only organizes data |
| P0-3 | **No export in the main app.** Two acceptance criteria name exports ("consistency between record, plan, history and export"; "separate synthetic, analog and flight data … in exports") | grep: no export code in `app/` | Agent: a CSV/JSON export per view with origin, state and version |
| P0-4 | **The follow-up of the result is missing.** `plan.linkResult` exists and is tested, but no view calls it, so assigned / done / result cannot be completed in the product | grep: no use in `app/ui`; M14, M15 records | Agent |
| P0-5 | **No independent review of M08–M20, M23, M24, the five gates G2–G6, or the frontend.** Reviews exist only for M00–M07, M21, M22. The plan makes this a gate condition | `## Replication` present only in those records | User: authorize a reviewer agent or a person |

## P1: acceptance criteria only partly met

| Criterion (FINAL_PROPOSAL) | State | Gap |
|---|---|---|
| Complete and recover an episode | Built | Recovery across a restart is unproven in the product (P0-1); no history of past episodes; a closed episode cannot be reopened; one open episode at a time |
| Distinguish current, **old**, missing, non-comparable | Partly | `old_after_days` has no source, so no value is ever called old by a rule |
| Attention criteria as mission data (D11) | Built, never visible | All four demo configurations have zero criteria, so the "within / outside a criterion" path is never seen. D11 allows a labelled "team demo" criterion |
| Configure the mission on two axes | Presets only | A person can choose one of four scenarios; they cannot define equipment or link. The `mission` module (M02) is imported by nothing at runtime |
| Catalog of observations **with their source** | Partly | The catalog carries `source_ids`; no view shows them |
| Show how many measurements support a baseline | Built | Wording unreviewed by a person |
| Radiation with the career limit | Hidden | The 600 mSv requirement is unconfirmed, so `career_limit` is behind a flag and never shown |
| Record, plan, history consistency | Built for what exists | A record cannot be **corrected** from any view (views hide superseded records but nothing writes `corrects`); a task cannot be **created** (tasks come only from the scenario); a marked task cannot be undone |
| Formative test with 6–8 volunteers | Not done | G6-W4; cannot be done by an agent |

## By phase

**F0 Foundation (M00, G0).** Built and accepted. Open: file-origin CORS control unverified; M02 `mission` has no runtime consumer; the contract suite pins behaviours of modules that now exist (two assertions had to be updated during F6: the `npm test` command and G0-W3's control).

**F1 Data core (M01–M05, G1).** Built, reviewed, accepted. Open: the store re-validates a whole collection on every write (slow with thousands of records); no encryption, backup or multi-tab safety (locks elsewhere are per process); IndexedDB schema v2 is a one-way upgrade (an older build cannot open a v2 profile); the catalog has no `oxygen_saturation` (the frontend needs it and no source exists); MR079G time zone unknown; CRF discarded; omics files acquired but unsupported.

**F2 Views (M06–M12, G2).** Built; M06 and M07 reviewed; M08–M12 not. Open: P0-3, P0-4 and the P1 rows above; no way to correct a record; M08 records only a measurement or "nothing new" (symptoms are in M20); M09's "repeat" is text only; M10 cannot know where the person is (a place is chosen by hand); the 30-day chart draws a dashed mark for every empty day (busy); a single dense day draws about 60,000 DOM nodes (M22 finding, M04 cost).

**F3 Plan (M13–M15, G3).** Built, not reviewed. Open: P0-4; a procedure version cannot be retired; the editor has no reordering or deletion; locks are per process; a task is marked once and cannot be undone; periodic exams are not modelled; "equipment and preparation checks" are text, not checklist state.

**F4 Episode, copilot, summary, privacy, sync, views (M16–M20, M24, G4).** Built, not reviewed. Open: P0-2; the summary text is neither stored nor transmitted (sharing sends record ids); M19's session is a flag with no meaning for the person (and says so); the ground panel shows one subject, so "a crew member who sent nothing" is only checked for the current one; in the demo the clock is fixed, so a delayed delivery never arrives there; the alert action ("mark the alert as issued") is a manual step that a person could skip; the help button opens an episode on variable `other`.

**F5 NASA cases (M21, M22, G5).** M21 integrated; M22 built with 24 browser checks and a G5 gate, `pending`. Open: no independent review of M22 after its later changes; only one participant file and one subject per adaptation file were compared with the viewer; large files block the main thread for seconds (lab measurement); PhysioNet use is provisional under the user's decision, not an organizer response; citations and licences were not re-read in this audit; original data is outside git.

**F5, second look with the skills (2026-11-16).** Skills read before the work: `claim-provenance-discipline`, `honest-degradation`, `validate-at-the-boundary` (full), `secure-by-construction` (Part 1 and the rules that follow; the rest not read). Scope of this audit: the code and records as they stand, plus the five real files on this machine; nothing was re-read at the source papers.
- RUN, closes a gap: every cell of the five real files (CRF 113 rows, MR079G 12, MR035G 10, MR080G 4, BUT CGM participant 101001 3,016) equals what the importer produced, compared with a separate reader: 0 mismatches, 108 empty CRF cells are `not_recorded` with no value, none became 0 (`tests/walkthrough/g5-realfiles.test.js`, with a negative control; it skips visibly where `data/originals` is absent). This replaces "only the first day of one file was compared" for the importer. The viewer-versus-importer comparison is still only the first day in the browser.
- Scope bound that the claim "real NASA data can be explored" must carry: three of the four viewer sources are **samples** (MR079G 12 rows, MR035G 10, MR080G 4); the MR080G importer accepts only one campaign, subject, date and test (`unsupported_profile` for anything else); BUT CGM is one participant. Other participants and the full studies were never loaded. Omics files are acquired and inspected but have no adapter.
- Mismatch with the roadmap: the roadmap and plan promise "a CRF case"; the viewer refuses CRF (M22-X1, on the user's earlier instruction) although the importer handles it and the file passes the row check. Either restate the goal or enable CRF with its unit and date caveats.
- Units, immune denominators and MR035G/CRF unit metadata stay unconfirmed; the importer keeps `unit_status: unknown` rather than guessing (correct per `honest-degradation`), so those values show "(unit unknown)".
- Capacity and cost: the importer refuses more than 10,000 records; the store re-validates a whole collection on each write (M04 finding from the M22 record, still unfixed): about 3.5 s of blocked main thread at 9,990 records in the earlier lab run (not re-measured here).
- The viewer is session-only by design; the persistent copy exists only through the development script, so a person using the app cannot keep an imported case.
- Provenance: citations and licences were not re-read in this look; PhysioNet use is provisional under the user's decision, not an organizer response; source dates stay in the file's own calendar with no zone (BUT CGM shifted, others unknown).
- Review and environments: no independent review of M22 after its later changes; one engine, no screen reader.


**F6 Closing (M23, G6).** `dist/orbita.html` builds deterministically and was compared with the served app in Chromium. Open: **W3's independent adversarial review and W4's volunteer test are not done**; other browsers unknown (blob modules under the policy, IndexedDB on `file://`); persistence after moving the file untested; no size or start-time budget; the packaged file excludes `frontend/`.

**The teammate's frontend (`frontend/`).** Incorporated, translated, moved onto our record model. Open: it is not connected to the main app's store; it needs a Node server (outside F6); `/investigacion` route name; keyboard and contrast unverified; its research notes have no reading levels; the proposal says functional packages are not to be incorporated (`FINAL_PROPOSAL.md`, operation section) and the user approved the dependencies verbally, so **that exception should be written down as a decision**; two of the four new workflows have never run on GitHub.

## Process debts (to disclose, not to hide)

- **Skills.** `CLAUDE.md` requires reading the applicable skills before each task. From M08 on, several records say the skills were read earlier in the session and not re-read for that task. That is a breach of mistake 7's rule, reported as such in each record.
- **Builder is reviewer.** For M08–M24 the author wrote the tests, the controls and the gate walks. Negative controls reduce that risk (every red was seen), but they do not replace another person's eyes. Several tests were green on the first run and were only trusted after a control.
- **Contracts 0.9–0.16** were changed by the builder under user authorization and have a consistency review only, no approval by the orchestrator's owner.
- **Documentation drift.** `README.md` still says later modules are placeholders and presents the HTML mockup as the way to try the product; `CLAUDE.md` and `AGENTS.md` carry older counts and statuses. Two UIs now exist (the vanilla app and the Next.js frontend) with no page saying which is which.
- **Statuses.** `modules.csv` was never moved off `pending`, deliberately, because that decision belongs to a person.

## Suggested order

1. **Decisions only the user can take (nothing else is blocked on code):** origin of a real entry (P0-1); guidance policy (P0-2); the exception for the frontend's dependencies; which UI is the product and which the prototype; whether the demo gets a labelled "team demo" attention criterion and freshness cutoff.
2. **Agent work that needs no decision:** export (P0-3), result linking (P0-4), record correction and task creation in the views, showing catalog sources, an `old_after_days` source in the demo configuration, README and status refresh.
3. **Review:** one independent reviewer over M08–M24 and G2–G6 with fresh context, using the records' "Not verified" lines as the checklist.
4. **Person-only:** the 6–8 volunteer test; acceptance of gates; moving module statuses.
5. **Cut line if time runs short** (the plan's own rule): name the layer reached, do not present F6 as tested with people, and say plainly that the demo gives no clinical guidance.

**F5 after the fixes (2026-11-16).** Done: CRF offered with caveats; unread columns named; whole-file viewer comparison for BUT CGM and row-by-row importer comparison for all five real files; a separate, opt-in persistent store for imported cases; the quadratic memory-store write; citations checked against the delivery attributions. Still open and why: MR080G accepts one combination only; CRF/MR035G units and immune denominators unconfirmed (no dictionary); omics has no adapter; 10,000-record bound; PhysioNet provisional; no second browser or screen reader; the IndexedDB backend still validates per write. Independent review of F5: see G5 addendum 2.
