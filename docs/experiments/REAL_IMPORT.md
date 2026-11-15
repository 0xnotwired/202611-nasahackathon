# Real-sample import and persistence experiment

User explicitly requested real import implementation and continued provisional
PhysioNet use. This is an authorized M21 advance, not closure of F2/F5 or
implementation of views. The orchestrator owns this integration experiment.

## Predictions before implementation

- RI-P1: Original acquired CRF/MR079G/MR035G/MR080G/BUT CGM text produces3861
  schema2 records, preserving numbers, missing states and source clocks.
- RI-P2: Local IndexedDB persists exact records after browser restart;
  repeated loading skips exact duplicates, never overwrites prior records.
- RI-P3: Check original sourceSHA before decoding; changed source fails before
  database write. Original bytes/newlines and BOM contribute to fingerprint.
- RI-P4: Dedicated real-data database/profile is distinct from synthetic data.
  Original source files are passed only to the loopback browser client;
  source directories are never exposed by the app HTTP server.
- RI-P5: Reject malformed imports before persistence; store batches are atomic
  individually, while a multi-batch run is resumable, not a single transaction.

## Runs and negative controls

RUN/BROWSER: python3 scripts/import-real-samples.py loaded791 CRF,12 MR079G,
10 MR035G,32 selected MR080G and3016 BUT CGM records (3861 total), with zero
rejected source rows. Excluded226 nonempty CRF comment cells were counted
without retaining their text. Each source SHA matches acquisition receipts
before decoding; raw BOM/newlines remain in importer fingerprints.

The isolated local database is orbita-real-samples in ignored
`data/local-import-profile/`, with its fixed loopback port and counts-only
report under ignored `data/imported/`. This is a dedicated development browser
profile, not an implemented user-facing selection/import screen. The HTTP
server only serves app/; source text is passed through local browser automation,
not published by the server. Origin port is persisted so reruns find the same
IndexedDB; a busy/unavailable saved port fails explicitly.

All source-derived records pass core validation and exact database readback.
After closing/relaunching Chromium, every expected record is re-parsed from
verified source and compared exactly. A repeated parent run and independent
reviewer run inserted0, skipped3861 exact duplicates and retained3861 records.
A source-coordinate guard rejects a replay with different IDs rather than
creating a duplicate measurement or overwriting old records.

Negative control: a disposable changed original-file copy failed custody
checking before any DB access. Parent reusable-contract mutations changing
origin and adding zero to missing records failed. Independent reviewer also
caught absence/origin mutations. Full Node suite:100 passed,0 failed,0 skipped.
G0 HTTP/module and G1 store/browser checks pass in Chromium156; inherited
managed-policy file-origin CORS control remains unverified.

The first2048-record attempt hit the store's20000-node snapshot guard before
any write;256-record batches respect both shape/resource and count bounds.
This is atomic per batch and resumable, not atomic across the entire run.
An early pre-review trial profile was retained under ignored
`data/imported/pre-review-trial/` before final participant-bound ID validation;
no prior user data was erased. Final isolated profile has only3861 records.

No original real rows or browser state are tracked. No clinical interpretation,
source-unit recovery, product views, external messages, commit or publication
is claimed. PhysioNet remains provisionally authorized by the user, not by an
unreceived organizer response.
No app frontend or clinical interpretation is implied by API/IndexedDB checks.
