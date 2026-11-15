# Original-source unit investigation

Current implementation: [CURRENT_STATUS.md](CURRENT_STATUS.md). Source-specific
evidence and dated investigation history below retain their original scope.

Reviewed November15,2026. Scope: selected CRF DailyVitals, MR035G Heel
NET_AVG_BMD, and BRSMImmune CD8+CD69+ samples. This is research, not a product
importer change. Existing selected units remain unknown unless evidence binds
them to the exact export or explicitly supported scope.

## Result

No additional exact-export unit assignments are justified by the papers
successfully retrieved here. New primary-source evidence narrows the immune
scale question to its denominator/cohort/export mapping, but must not be
promoted to a confirmed unit for the entire selected file.

| Source/sample | New verified evidence | Remaining boundary |
|---|---|---|
| CRF DailyVitals | NASA March2008 Standard Measures Overview lists daily BP,HR,respiratory rate,temperature,body weight | It does not map the selected export columns to units/scales |
| MR035G Heel NET_AVG_BMD | Exact referenced2009 paper identified from NASA citation, not successfully retrieved as full text | No assignment of g/cm2 or any other scale from generic DXA convention |
| BRSMImmune CD8+CD69+ | Earlier NASA draft reports constitutive levels in percent;10 figure subjects overlap with selected30-subject CSV | Gating denominator and applicability to all30 subjects/export protocol remain unconfirmed |

## Requested final papers versus content actually read

NASA links these2009 publications: Meck/Dreyer/Warren (PMID19476163),
Spector/Smith/Sibonga (PMID19476166), and Crucian etal (PMID19476168).
PubMed and its citation-export query respond HTTP200 with hidden browser/
cookie-challenge HTML, not abstracts or articles. No challenge was bypassed.
Exact-title and PMID NTRS searches did not retrieve these final papers;
zero hits do not establish their absence from every archive.

A PMC identifier-converter path returned404; that is not evidence that no
PMC copy exists. No external author, provider or organizer was contacted.
No network setting was changed by this investigation.

## Primary documents successfully retrieved

### Immune assessment draft — NTRS20070024710

Crucian and colleagues, *Assessment of Immune Status, Latent Viral
Reactivation and Stress during Long Duration Bed Rest as an Analog for
Spaceflight*. The PDF labels itself DRAFT FINAL, REV20, June22,2007.
[Original NASA PDF](https://ntrs.nasa.gov/api/citations/20070024710/downloads/20070024710.pdf).

PDF page6 describes constitutive CD8+/CD69+ levels as “percent.” Page3
methods describe10 subjects in FAP studies2,3,4; Figure2B presents those
subjects individually. All10 pseudonymous identifiers are present among30
subjects in the acquired CSV, checked directly without publishing the roster.
This is evidence that the paper is relevant, not proof that all30 export rows
share a denominator, instrument scale or identical protocol. Neither an exact
percentage denominator nor an export dictionary was established. No normal
range or clinical criterion in the manuscript is adopted by the application.

### NASA Standard Measures Overview — NTRS20080013330

[Original NASA PDF](https://ntrs.nasa.gov/api/citations/20080013330/downloads/20080013330.pdf),
March2008. PDF page4 lists daily measurements but supplies no column-unit
mapping for Campaign3 DailyVitals. This source supports the measurement
scope, not missing CRF units.

### Cardiovascular adaptations — NTRS20080010634

[Original NASA PDF](https://ntrs.nasa.gov/api/citations/20080010634/downloads/20080010634.pdf).
PDF page26 labels a related study table Weight kg and Height m; methods use
Height cm in the body-surface-area formula. These representations illustrate
why units must follow their exact field/operation. They are not transferred
to the unqualified CRF Weight/Height fields by analogy or from plausible values.

## Required evidence to unblock interpretation

- CRF: Campaign3 DailyVitals form/data dictionary with each exported column,
  physical unit, scale and revision. Temperature and height particularly must
  not acquire Celsius/Fahrenheit or centimetres/metres from unrelated contexts.
- MR035G: Hologic export definition for selected Heel NET_AVG_BMD, including
  unit and averaging/calibration context. A generic DXA textbook is insufficient.
- Immunology: CD8+CD69+ gate denominator and percent/count scale tied to the
  selected campaigns, including unstimulated versus stimulated panel context.

Bounded NTRS search, 2026-11-15 (RUN, three queries to the public
`ntrs.nasa.gov/api/citations/search` endpoint): the full title phrase of the
CRF source paper (Meck, Dreyer and Warren 2009, PMID 19476163) returned 0
results; "Meck bed rest vital signs" returned 0; the control query "bed rest"
returned 754, so the endpoint works and the paper is simply not found there
under those terms. The NLSP experiment, dataset and file metadata were already
reviewed earlier (DATASETS.md). Even a copy of the paper would need to bind its
units to this exact export before the importer could use them. The next step
needs a person: request the Campaign3 DailyVitals data dictionary (units, scale,
revision) and the date-handling policy from the data provider through NLSP.

The safe importer disposition remains preservation with explicit unknown
units where supported; no conversion or scientific interpretation based on
these unresolved columns. This is a known evidence limit, not a completed
confirmation. The original PDFs/response HTML stay in ignored
`data/originals/papers/`; only bounded quotations and research metadata are
tracked. No source implementation was copied or executed.

## Reproducibility

[Response manifest and unit decisions](data/source-paper-units-2026-11-15.json)
records URLs, retrieval timestamps, byte sizes and SHA256. Every retained
artifact was rehashed before this report. PDF page numbers above are physical
PDF pages, not inferred journal pagination. Extraction used the preinstalled
pdftotext already cited in RESOURCES_USED.md. Local claim-provenance-discipline
was applied. No product change, dependency, commit, push or publication occurred.
