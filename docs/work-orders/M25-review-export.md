# Work order M25 — Review and export (the teammate's follow-up and export, brought into this app)

Phase F6 · wave 2 · level - · contracts version 0.22

**Goal.** Bring the useful part of the teammate's frontend (`frontend/`, see its INTEGRATION.md) into the single-file app: a review of one variable's recorded values prepared on the device for a specialist (his Follow-up and Evolution views), a CSV export with provenance (his "Export test and provenance"), and a theme the person chooses by hand (his theme control). It reads this app's records (schema 2), not his seed.

**Owned paths.** `app/export/`, `app/ui/review/`, and the record `docs/experiments/M25.md`. The theme control lives in `app/ui/base/` (M07's path; touched on the user's authorization).

**Depends on.** M01 Core, M06 Readings, M07 Base interface.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md` (export, review, services), `frontend/INTEGRATION.md`, `docs/METHOD.md`.

## Deliverables

- `app/export/index.js`: `recordsToCsv`, `csvCell`, `safeFileName`.
- View `app/ui/review/` (`model.js`, `view.js`): choose a variable, a period and one method; values with their state, origin and time; the change from a reference only when the two can be compared, otherwise the reason; a review text prepared locally and not sent; downloads of the series and of all the subject's records.
- Manual theme (automatic / light / dark) in the shell.

## Done when

- [ ] A difference is shown only between values that are comparable (same subject, variable, unit, method, origin and time basis); otherwise the screen says why.
- [ ] Methods are never put on one line; values outside the period, of other methods or without an established time are named, never dropped silently.
- [ ] The CSV carries state, unit, unit status, method, UTC time and the source clock, origin and source of every row; an absent state has no number and no unit; text that a spreadsheet reads as a formula is neutralised.
- [ ] Nothing is sent: the review text and the files are made on the device.
- [ ] No word of grading ("normal", "healthy", "improving", "worsening", "score") appears; no criterion is applied.
- [ ] The downloads work from `file://` under the package's content-security policy.
- [ ] Contrast was measured in the system schemes and with the manual theme chosen against them.
- [ ] Every test was seen failing against broken code before passing, and the report says how.

## Experiments

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M25-P1 | CSV of one recorded value | Fixed header, a byte-order mark, its number, unit, origin and method | Drop the byte-order mark |
| M25-P2 | CSV of not_recorded, confirmed_none and a real 0 | The first two have no number and no unit; the zero stays "0" | Write an absent state as 0 |
| M25-P3 | CSV of a record with a source clock and an unknown unit | Empty UTC time, the raw source time, calendar and scope; empty unit and `unknown` | — |
| M25-P4 | Cells starting with `=`, `+`, `-`, `@` | Text gets a leading apostrophe; numbers do not; quotes, commas and line breaks survive | Remove the neutralisation |
| M25-P5 | Empty, reordered, hostile and oversized lists | Nothing dropped or reordered; bad input refused | — |
| M25-P6 | File names from hostile text | Letters, digits, dashes and one `.csv` | Keep path characters |
| M25-P7 | No measurement recorded | "nothing was recorded", never "nothing new" | — |
| M25-P8 | Two comparable values | Descriptive difference with its unit; no forbidden word, no score key | — |
| M25-P9 | Two methods | One method per selection; the others counted as outside | Put all methods on one line |
| M25-P10 | Different unit, origin, or a not-recorded value | No difference; the reason is said | Bypass the comparability rule; compare different origins |
| M25-P11 | Period and a value with no established time | Period limits values; the rest is counted and named | Ignore the period; place the untimed value |
| M25-P12 | Exports with another subject present | Only this subject; a hostile selection exports nothing | Read every subject |
| M25-P13 | Hostile services | An error view model, never an exception | — |
