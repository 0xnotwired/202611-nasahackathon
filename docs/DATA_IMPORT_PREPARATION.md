# Source-specific import preparation

## Implementation follow-up

The user explicitly advanced M21 after preparation: five CSV profiles now
have pure product adapters, and an isolated local workflow has persisted3861
records with custody checks, exact restart reads and duplicate-free reruns.
The remaining profiles stay staging-only/unsupported. See
[M21](experiments/M21.md) and [real import](experiments/REAL_IMPORT.md).
The preparation-stage observations below are historical where they say no
importer/database write existed. No later-phase gate or product view is implied.

This is a concrete preparation specification for14 acquired/catalog sources,
not implementation of F5/M21 or approval of F2/F5 gates. Source columns, unit
whitelists, clocks, namespaces, quality policies and bounded windows are in
[the machine-readable plan](data/import-plan-2026-11-15.json).

## How the boundaries are resolved

Known physical units retain source evidence; no automatic conversion is
requested for any profile. Unknown CRF, BMD and selected immunology units remain explicit blockers for
scientific interpretation. Exact-test MR080G gas/ventilation units have now
been corroborated against its unit-labelled companion summary; preserve BTPS.
Raw preservation does not resolve those missing provider facts. The remaining
exact evidence requests are in
[the technical record](data/technical-resolution-2026-11-15.json).

CRF month/day/year with minute clock and MR079G month/day/year date-only are
source-corroborated. NASA unknown zones/shifting stay unknown in schema2
source_time; no midnight/UTC offset is invented. MR035G ISO scan dates remain
date-only. BUT CGM retains participant-shifted clocks. Current source_time
supports calendar axes only: ACTES elapsed seconds and composite immunology
days stay in staging until a relative-axis contract exists. ITBA shifted UTC
and EDA matched ground dates need explicit processing provenance that must
survive a future adapter. No existing UTC-only interface is silently reused.

Profiles requiring aggregate tables, environmental indexes or omics arrays
stay out of ordinary individual health records. Group means/SE/counts do not
become individual measurements; chart labels do not become a numeric series.

## Concrete selection and quality rules

Only declared columns enter a future adapter; CRF free text is excluded.
Every output retains dataset/release/file SHA/member-or-sheet/row and source
subject/assay scope. Never join subjects by matching numeric IDs alone.
Source numeric zero stays zero; a documented missing marker yields
not_recorded without a value. Malformed rows get bounded rejection reasons,
not raw clinical content in logs. Unknown/invalid data never count as valid.
No interpolation, resampling, source normalization or inferred thresholds.

The plan proposes explicit selections: first288 glucose samples; one ACTES
test and300 source rows; bounded ITBA sample/event windows; first144 EDA UTC
timestamps and six variables, with up to78 separate GCR/SAA daily records.
These are proposed preview windows, not claims of uninterrupted coverage.
The current store permits10000 total scalar records and2048 per batch;
count each scalar output, disclose the requested window, and reject excess
rather than truncate silently. No product database was written.

PhysioNet use is provisional under the user's decision; licenses/notices and
citations remain required, and dataset identity permits exclusion if the
organizer declines. Synthetic examples stay distinct from real subjects.

## Evidence already completed and remaining work

All180 genetic raw files are downloaded, CRC-verified and inspected; raw
references match ISA exactly. See [genetic report](GENETIC_DATA_INSPECTION.md).
Physical-unit dictionaries remain external evidence gaps. The model safely
preserves unknown units/time, but this document cannot manufacture units.
Future adapters must demonstrate source-row equality and rejection behavior
before real app import. Relevant tests belong to their authorized module
work orders, not to a documentation-only preparation task.

Local honest-degradation and claim-provenance-discipline guide this boundary:
known, unresolved and unsupported remain distinct. Documentation/link/diff
checks and direct source-profile checks were run; no product code or
functional dependency changed. No commit, push or deployment included.

## Actual profile validation

[Preparation check results](data/import-preparation-checks-2026-11-15.json):
14 profiles structurally checked; eight actual tabular/JSON header sets and
all180 genetic member headers checked. Three archive sizes/SHA256 reverified;
ISA raw references match170/170 and10/10. Negative controls reject invented
columns and unsupported channel combinations. Initial strict assumptions
failed on actual files, exposing three GPR channel variants and optional
Agilent GeneName annotation. Profiles were corrected and checks passed.
No parser is claimed for the aggregate/protocol-relative profiles marked
staging-only, and no app records were imported.
