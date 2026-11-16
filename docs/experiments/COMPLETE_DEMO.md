# Complete fictional case

Scope: additional selectable in-memory case using the existing seeded scenario API and contracts. No clinical criteria, real data or automatic real sharing. Original demo and personal store remain separate.

Skills read before implementation: local skill index, atomic-state-mutation and deterministic-core (detached deterministic fixtures and private initialization before exposure; no new clinical decision path). Existing git-discipline and honest-degradation guidance applies.

Prediction before implementation: seed 2 supplies at least 200 valid synthetic records, every catalog measurement and environmental variable, all three assessment variables and explicit gaps. Its ids never intersect seed 1. Browser source switching preserves each case's edits separately, keeps personal records empty, and shows a usable preloaded episode/procedure/task history. All eleven views render; research imports remain user-selected and separate. No public API or contract shape changes are needed.

Verification pending.

## Results

- RUN: the new seed-2 coverage test first failed on the missing history assertion against the original generator, then passed with the extended fixture. Seed 1 remains 16 records; seed 2 has 502. Every row validates, catalog variables are represented, absent values remain absent, and repeated generation is equal.
- BROWSER: `ORIGINAL_CASE_CONTROL=1 python3 tests/walkthrough/complete-case-browser.py` failed on the wrong-case assertion. The real run passed in Chromium 156: all eleven views, exported row count/provenance, completed/interrupted/blocked executions, episode history, edits isolated between sources, empty personal records, and reload reset. No page errors. An initial test incorrectly expected the empty personal export button to be disabled; inspected the existing contract/UI and corrected the test to check the explicit empty state instead (no product change for that assumption).
- RUN: final `npm test`: 436 passed, 0 failed, 0 skipped in this checkout.
- BROWSER: `g1-browser.py` passed actual IndexedDB round-trip/restart/isolation checks.
- RUN: documentation consistency and `git diff --check` passed; package generated 63 modules, 477089 bytes, hash prefix `a13d64acf52c35af`.
- LIMIT: `g6-browser.py` could not finish: managed Chromium blocked navigation to `file://` with ERR_BLOCKED_BY_ADMINISTRATOR. No new successful file-origin parity claim is made. Browser case coverage was over HTTP. No human/clinical evaluation or other browser engine was run.

Publication: the user asked to prepare this case for the existing Vercel deployment; publish through main using the established Git integration. Vercel production availability cannot be verified from this environment (its proxy previously rejected CONNECT to the deployed origin). The direct URL is `/?case=complete#/my-day`; without that parameter the original demo remains the default. No public contract signature/schema changes or real datasets were introduced.
