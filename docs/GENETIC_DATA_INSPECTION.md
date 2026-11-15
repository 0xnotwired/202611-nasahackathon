# Genetic measurement acquisition and inspection — completed

All three published raw quantitative ZIPs were downloaded from NASA's
original file routes after the raw-host network grant became active.
Advertised sizes match actual bytes; SHA256 custody hashes and ZIP CRC
checks were recorded. No publisher cryptographic checksum was advertised,
so local hashes are not represented as independent publisher checksums.

| Study/archive | Files inspected | Quantitative feature rows |
|---|---|---|
| GLDS-51_microarray_E-GEOD-14798.raw.1.zip | 88 | 2040192 |
| GLDS-51_microarray_E-GEOD-14798.raw.2.zip | 82 | 1901088 |
| GLDS-56_microarray_E-GEOD-57408.raw.1.zip | 10 | 450150 |

OSD-51 has170 GenePix GPR files; OSD-56 has10 Agilent feature-extraction
files. Every member was parsed for headers, row widths and selected numeric/
quality fields. Zero width mismatches and zero nonfinite/nonnumeric values
were observed in the selected inspected fields. This is structural validation,
not a claim that every measurement is usable. GPR flags include0,-50,-100;
Agilent positivity flags include0/1. Retain flags and control spots; do not
quietly drop flagged measurements or treat them as valid clinical readings.

Archive members match all170/10 distinct raw-file references in the ISA
assay metadata: zero missing references and zero unexpected files. OSD-51's
340 assay rows include two labels; they are not340 people. OSD-56 concerns
cultured lymphocytes, not astronaut clinical observations.

## Measured columns versus declared derived processing

GenePix source columns include two fluorescence channels, their backgrounds,
probe identifiers and Flags. Agilent columns include gProcessedSignal,
gMedianSignal, gBGSubSignal, positivity/saturation flags and control types.
Actual GPR channel-pair headers vary:633/532 in64 files,635/532 in89,
and633/543 in17. Profiles retain these variants without silently equating
wavelengths. GeneName is absent in five Agilent files; it is optional
annotation, not permission to invent a gene name or discard the probe.

These are scanner/feature-extraction outputs, not physical concentrations or
clinical thresholds. The presence of an instrument-processed signal does not
establish the study-wide normalization documented for separate derived data.

ISA protocols describe LOWESS-normalized log2 Cy3/Cy5 test/reference ratios
for OSD-51, and quantile-normalized log2-transformed intensities for OSD-56.
Those are **derived-file semantics**, not a declaration that all downloaded
raw archive columns already have those transformations. No normalization,
statistical test, clinical inference or extra logarithm was applied.

GPR files are not uniformly UTF8; cp1252 decoding was used for inspection
without changing original bytes. Raw instrument headers can include local
filesystem paths/personnel information; these prefixes are excluded from the
tracked receipts. No vendor source code was run and no ZIP paths extracted.
Original archives remain Git-ignored and outside the application.

## Delivery and reproducibility

- [Archive receipts, sizes, SHA256 and CRC](data/genetic-archive-downloads-2026-11-15.json)
- [Every-member inspection and exact ISA mapping](data/genetic-quantitative-inspection-2026-11-15.json)
- [Future source-specific preparation profiles](data/import-plan-2026-11-15.json)

The earlier [failed attempts](data/genetic-archive-attempt-2026-11-15.json)
are historical and superseded by this completed acquisition. Omics app adapters remain unimplemented; the separately implemented M21
CSV adapters do not load genomic arrays. no source measurements were inserted into the
health-record store. Bulk omics data do not fit that store's scalar capacity
and require a separate explicit future design. No commit/push or environment
publication was performed by the inspection or documentation closure.
