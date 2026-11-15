# Dataset review for Space Apps: astronaut health

Query run: 2026-11-14T15:30:14.906452+00:00

The eight full NLSP study cards were consulted through the public API used by the website, along with the human catalog and the metadata/file listings of OSD-51 and OSD-56. Small downloads from the eight NLSP studies were checked. Not all of their files, nor the bulk OSDR ZIPs, were downloaded or processed.

## Current decision — source uncertainty

Record schema2 now preserves dates without a known zone using `time:null`
and `source_time`: original text, canonical source value, precision,
`timezone:null`, calendar status and a source-clock scope. Date-only data
gets no invented midnight. BUT CGM retains its shifted calendar, with a
participant-specific scope; NASA calendar-shifting status remains unknown.
Unknown calendar or units prevent comparison; UTC-window queries on matching
unknown-time records fail explicitly. Legacy schema1 UTC records stay unchanged.
See [the contract](CONTRACTS.md) and [experiment](experiments/SOURCE_UNCERTAINTY.md).
This implements the model and storage, not M21 importers or product views.

| Sample | Verified units | Source-time preparation | Citation / reuse |
|---|---|---|---|
| CRF | Not confirmed for Pulse, SysBP, DiaBP, Resp Rate, Weight, Body Temp or Height | Preserve Date and Vitals Time; timezone and shifting unknown | Full DOI citation; CC0-1.0 |
| MR079G | ft-lb, explicit CSV column | Date-only; zone unknown; slash-date ordering still needs evidence | Full DOI citation; CC0-1.0 |
| BUT CGM | mmol/L, official-linked author companion | Local datetime, participant-shifted calendar; zone unknown | Full dataset/PhysioNet citations; CC BY4.0 |

CRF source review checked the exact CSV, experiment metadata, dataset
`7153409b-d8a3-5a23-b667-9df8a182dfdc` and file metadata. The parameter list
names variables without unit mappings, and the experiment lists no linked
documents. This does not establish kg/lb, °C/°F or any other physical unit.
The application can retain `unit:null, unit_status:"unknown"`; confirmation
still requires a dictionary/protocol tied to this file. No guesses from
numeric ranges, study location or another campaign are used.

The CRF Date column contains second components above12, consistent with
month/day ordering; the small MR079G sample does not disambiguate its slash
ordering. Preserve originals in staging until an import mapping is evidenced.
Canonical source-time validation cannot itself resolve ambiguous raw text.

Official DataCite DOI records verify CC0-1.0 and full citations for the two
NASA studies. BUT CGM is CC BY4.0. Earlier blocked-access and pending-rights
notes below are historical and superseded. See [readiness metadata](data/import-readiness-2026-11-15.json),
[use conditions](DATA_USE_AND_DELIVERY.md) and [delivery attributions](DATA_ATTRIBUTIONS.md).
Delivery can include the app, manifest and download links while leaving
original CSVs out. Published real charts/extracts still retain applicable
attribution duties. No external author contact was made.

## Unit and time follow-up — November 15, 2026

SOURCE: BUT CGM glucose is interpreted as **mmol/L** by the author-maintained
companion linked in the official PhysioNet Usage Notes. At pinned commit
`d5867dc9022715223ddbf11244b98db64109bcf0`, the CGM loader reads Timestamp
and Glycemia without a unit conversion; the controller labels that series
"Glucose level [mmol/l]" (lines 906, 928, 1156, 1201). The exact source URLs,
hashes and scope are in [the manifest](data/acquisition-2026-11-15.json).
This is author-source evidence, not a unit declaration inside the CSV or a
clinical validation. No companion code was incorporated; its interpolation,
aggregation and clinical display bands are not adopted.

RUN: Deeper official NASA file records publish __file_md5sum. Both originals
match: CRF 9c708f3e8d0a63dd71f878727aac4472; MR079G
bbb1110fba2c2cc3a5aa34a17a9aa131. Local SHA-256 hashes are retained separately.
Earlier notes about checksums being unestablished referred to the experiment
metadata; the file-level metadata now provides the additional evidence.

SOURCE: CRF experiment, dataset and file metadata reviewed do not establish
a per-variable unit mapping for this CSV. Do not fill it from catalog defaults,
plausible values or collection location. MR079G retains explicit ft-lb.

**Time policy:** preserve raw Date, Vitals Time and Timestamp strings plus
Test_Phase/BR_Day. No authoritative UTC offset was established; BUT CGM also
shifts calendar dates per participant. Do not append Z, choose a timezone from
location, infer original DST from shifted dates, or align subjects by their
shifted calendar dates. This earlier UTC-only restriction is superseded by schema2 preservation
above; UTC conversion still requires evidence. M21 remains unimplemented. CRF comments remain excluded from public imports.

Remaining external evidence: CRF's sample-specific unit dictionary and the
original timestamp/timezone conventions. They cannot be reconstructed
reliably from the current source files. Obtaining them requires additional
authoritative documentation; no author contact was made by this task.

## Current acquisition — November 15, 2026, after environment publication

RUN: Three original CSV samples are now present under ignored `data/originals/`.
The published network policy resolved the earlier CONNECT403 blocker. Files
were retrieved over verified HTTPS from official NASA/PhysioNet routes and
kept unchanged. The [current manifest](data/acquisition-2026-11-15.json)
records exact source/final URLs, retrieval times, byte counts, SHA-256,
headers and missingness. The historical blocked attempt below is retained.

| Sample | Local original | Data rows / columns | Verified format and remaining issues |
|---|---|---|---|
| CRF Daily Vitals | data/originals/CRF-daily-vitals.csv | 113 / 17 | Comma CSV; Subject, Date, Test_Phase, BR_Day, Vitals Time and measurement columns. Units are not stated in the CSV; obtain a per-variable dictionary. Exclude Comment and Bowel Movement Description from public imports. |
| MR079G muscle function | data/originals/MR079G-muscle-function.csv | 12 / 12 | Comma CSV; explicit Units values are ft-lb. Preserve source method/position and phase; source range columns are not universal clinical limits. |
| BUT CGM 1.0.0 | data/originals/but-cgm-1.0.0/101001_CGM.csv | 3,016 / 2 | UTF-8 BOM, semicolon delimiter, Timestamp and Glycemia; dot decimals and no missing cells in this sample. The CSV/README omit the unit; the linked author companion supports mmol/L. See the follow-up evidence above. |

RUN: BUT CGM CSV, README and license hashes match the publisher's
SHA256SUMS.txt. NASA file-level MD5s now match the originals; local SHA-256 hashes are also retained, as documented in the follow-up above. Both NASA metadata documents were preserved.
Their verified DOIs are CRF `10.83263/wjw1-ta27` and MR079G
`10.83263/bk5h-r757`. Public-availability statements are not an invented
license or a complete author/year citation. BUT CGM LICENSE.txt explicitly
states Creative Commons Attribution 4.0.

SOURCE: BUT CGM README says dates are participant-specifically shifted into
2100–2199 and cross-participant time relationships are not preserved. The
sample Timestamp format is `%Y-%m-%d %H:%M:%S`, with no UTC offset. NASA
sample dates/times likewise lack an established UTC interpretation. M21 must
resolve units/time policy before converting to the UTC Record contract;
appending Z or assigning the synthetic subject would invent information.

READ: These are acquired source samples, not implemented importers or
validated clinical data integration. No original records are versioned or
included in app/. No configuration was changed and nothing was published
by this acquisition. Browser/clinical capabilities are unchanged.

## F1 acquisition status — November 15, 2026

RUN: The current cloud checkout still has zero original dataset files. Fresh
bounded requests to official CRF/MR079G metadata, the BUT CGM card and its
public bucket listing failed at proxy CONNECT with 403. Current runtime
network policy is restricted/enforced with no custom dataset hosts. No
current-task headers, units, sample values or dataset checksums were verified.
Historical sample descriptions below remain inherited research evidence,
not files acquired by F1.

RUN: The additive network requirements were saved successfully in the cloud
environment draft: `nlsp.nasa.gov`, `physionet.org`, `www.physionet.org` and
`physionet-open.s3.amazonaws.com`; existing package-manager presets were
preserved. Saving the draft does not apply runtime policy. Review and save
in environment settings, then publish the environment; retry only after a
meaningful policy update. This is a network-policy blocker, not evidence
that credentials or paid access are needed.

The [acquisition manifest](data/F1-acquisition.json) and
[request evidence](data/F1-acquisition-attempts.json) preserve observed status
without original records or clinical comments. Next acquisition remains one
small CRF Daily Vitals sample, one adaptation sample and one `*_CGM.csv`.
Store originals unchanged under ignored `data/originals/`, record exact URLs,
bytes, retrieval time and SHA-256, then inspect column/unit dictionaries and
citation/license sources before implementing M21. M01–M05 fixtures are
explicitly synthetic and do not assert those unknown formats.

## Recommendation

Use CRF Daily Vitals as the first empirical base to reproduce measurements and visualize personal changes. Add strength, aerobic capacity and DXA as periodic assessments. Immunology requires a laboratory. Keep environmental and radiation data as separate context. OSD-51/56 allow molecular analysis, but do not by themselves train a validated predictor of daily clinical risk.

## NLSP inventory

The counts correspond to the tree returned by the API in this query; they are not subject counts or a guarantee of completeness.

### 1. Isokinetic Muscle Function (Flight Analog) — MR079G

[NASA card](https://nlsp.nasa.gov/explore/data/details/f97392b8-b9dd-5bae-af9e-dd76a33bf049?dataType=lsda_experiment) · [Metadata API](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/f97392b8-b9dd-5bae-af9e-dd76a33bf049/full)

Program: Ground. Declared status: Data preservation is complete.  All datasets are publicly available.

Available tree: 11 groups and 400 file entries.

Knee, ankle and trunk strength and endurance. CSV sample checked: 12 rows; includes Value, Units and the file's range limits. Those ranges must not be presented as universal medical limits.

### 2. Case Report Form — CRF

[NASA card](https://nlsp.nasa.gov/explore/data/details/eeb9bd34-bdd4-5115-b139-adf2c9927962?dataType=lsda_experiment) · [Metadata API](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/eeb9bd34-bdd4-5115-b139-adf2c9927962/full)

Program: Ground. Declared status: Data preservation is complete.  All datasets are publicly available.

Available tree: 25 groups and 301 file entries.

Best starting point for daily monitoring. CSV sample checked: 113 rows, 17 columns; 13 PRE_TEST, 89 IN_TEST and 11 POST_TEST. Pulse, systolic/diastolic blood pressure, respiration, weight and temperature are numeric in all 113 rows. Other fields contain NA. Campaign 3 Daily Vitals lists 23 files; Campaign 1 lists 4; CFT70 VITALS lists 3. These are file counts, not a validated census of participants.

### 3. Bone Densitometry Assessment (Flight Analog) — MR035G

[NASA card](https://nlsp.nasa.gov/explore/data/details/4469ebdc-0a65-55e8-bbff-3cf6b044c4c6?dataType=lsda_experiment) · [Metadata API](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/4469ebdc-0a65-55e8-bbff-3cf6b044c4c6/full)

Program: Ground. Declared status: Data preservation is complete.  All datasets are publicly available.

Available tree: 11 groups and 1063 file entries.

Bone mineral density and body composition by DXA. CSV checked: 10 rows with NET_AVG_BMD and before/after/follow-up time points. Point measurements, not a continuous sensor. Validate units in the documentation before integrating.

### 4. Bed Rest Standard Measures: General Immunity — BRSMImmune

[NASA card](https://nlsp.nasa.gov/explore/data/details/e21cc209-b6c4-5b47-b33b-6e31f51b784f?dataType=lsda_experiment) · [Metadata API](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/e21cc209-b6c4-5b47-b33b-6e31f51b784f/full)

Program: Ground. Declared status: Data preservation is complete.  All datasets are publicly available.

Available tree: 2 groups and 46 file entries.

Immune subpopulations and function. CSV checked: 30 rows, SUBJECT column and time points L-10, L-2, 28/45, 60/83, 90, R+5/14. It requires laboratory measurement and a unit dictionary per analyte; do not infer immunity from pulse.

### 5. Aerobic Capacity (Flight Analog) — MR080G

[NASA card](https://nlsp.nasa.gov/explore/data/details/07f12dd0-6725-582c-a4d2-618ed8b8c452?dataType=lsda_experiment) · [Metadata API](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/07f12dd0-6725-582c-a4d2-618ed8b8c452/full)

Program: Ground. Declared status: Data preservation is complete.  All datasets are publicly available.

Available tree: 10 groups and 1505 file entries.

Aerobic capacity, exercise response, HR, VO2, VCO2, RER. CSV checked: 4 rows by stage of a test. Keep separate from resting heart rate.

### 6. Radiation Measurements in Shuttle Crew Compartment — DTO 684

[NASA card](https://nlsp.nasa.gov/explore/data/details/b7b1eb07-f9e1-57a2-82d1-2970d49a6e94?dataType=lsda_experiment) · [Metadata API](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/b7b1eb07-f9e1-57a2-82d1-2970d49a6e94/full)

Program: Shuttle Program. Declared status: Data preservation is complete. All datasets are publicly available.

Available tree: 13 groups and 13 file entries.

Radiation on the Shuttle. There are 13 groups/files: 11 TIFF and 2 XLS. One TIFF and both XLS files were downloaded. Tables with neutron doses and dose rates by location; distinguish absorbed dose in µGy/day from equivalent dose in µSv/day. Part of the descriptive text has inconsistent units: prefer the tables and the original article. It is not an individual clinical series or Martian radiation.

### 7. The Effects of EVA and Long-Term Exposure to Microgravity on Pulmonary Function — 96-E044

[NASA card](https://nlsp.nasa.gov/explore/data/details/859f904d-7c4a-5994-baf9-47f2abc3013f?dataType=lsda_experiment) · [Metadata API](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/859f904d-7c4a-5994-baf9-47f2abc3013f/full)

Program: International Space Station (ISS). Declared status: Data preservation is complete. Privacy-protected datasets are available via data request. Remaining datasets are publicly available.

Available tree: 9 groups and 9 file entries.

Lung function of astronauts on the ISS, before/during/after and its relation to EVA. 9 public XLS files. Maximum Respiratory Pressures sample read: a table of means, uncertainties and number of measurements; not continuous individual records. The study warns that part of the protected data requires a request.

### 8. Toxicological Assessment of Airborne Volatile Organic Compounds — MSD007

[NASA card](https://nlsp.nasa.gov/explore/data/details/adbd971a-9c65-5388-acef-ac52d749a113?dataType=lsda_experiment) · [Metadata API](https://nlsp.nasa.gov/api/v1/data/lsda_experiment/adbd971a-9c65-5388-acef-ac52d749a113/full)

Program: Nasa-Mir. Declared status: Data preservation is complete. All datasets are publicly available.

Available tree: 64 groups and 68 file entries.

Air contaminants on Mir: CO2, CO, formaldehyde, organic compounds and toxicological indices. A CO2 XLS sample contains a chart, not a numeric table readable by cell. Another XLS table with contaminants and T-values for five samples was checked. These are environmental data from another mission, not paired with bed-rest subjects.

## OSDR

### OSD-51

[NASA card](https://osdr.nasa.gov/bio/repo/data/studies/OSD-51) · [Metadata](https://osdr.nasa.gov/osdr/data/osd/meta/51) · [Files](https://osdr.nasa.gov/osdr/data/osd/files/51)

Woman skeletal muscle transcriptome with bed rest and countermeasures. WISE-2005 study, ground-based, healthy women, three described groups of 8 participants: control, nutrition and exercise. Gene expression in soleus and vastus lateralis biopsies before/after 60 days of bed rest. The 340 sample records in the metadata include technical replicates; they do not represent 340 participants. Listing: 4 unrestricted files: ISA metadata, microarray annotation and two raw data ZIPs of ~206 and ~192 MB. Metadata and listing were checked, not the ZIP download or matrix quality.

### OSD-56

[NASA card](https://osdr.nasa.gov/bio/repo/data/studies/OSD-56) · [Metadata](https://osdr.nasa.gov/osdr/data/osd/meta/56) · [Files](https://osdr.nasa.gov/osdr/data/osd/files/56)

Gene expression profiling of human peripheral blood lymphocytes cultured in modeled microgravity. Human cell culture in a ground bioreactor versus a 1g control. mRNA microarray, 10 samples in the metadata; it does not imply 10 independent astronauts or donors. The article integrates miRNA/mRNA and the companion miRNA set is OSD-55. Listing: 2 unrestricted files, ISA metadata and a ~52.7 MB raw ZIP. Metadata and listing were checked, not the ZIP download or matrix quality.

## Complementary sources (search of 15/11/2026)

Found to calibrate the synthetic generator (M05), feed Habitat and extend the cases viewer (M21–M22). Only their public cards were read: **no file was downloaded or processed**. None provides individual astronaut data.

### Graded cycle ergometer test — ground

[PhysioNet card](https://physionet.org/content/actes-cycloergometer-exercise/) · DOI 10.13026/2qs3-kh43 · Open Data Commons Attribution v1.0 license, open access

Beat-to-beat intervals, VO2 and mechanical power during graded cycle ergometer tests, the same type of equipment as the ISS CEVIS. 18 athletes (10 men, 8 women), according to the card.

### Wearable during stress and structured exercise (ITBA) — ground

[PhysioNet card](https://www.physionet.org/content/wearable-device-dataset/) · DOI 10.13026/he0v-tf17 · Open Data Commons Attribution v1.0 license

Empatica E4 during stress sessions (36 volunteers), aerobic exercise (30) and anaerobic exercise (31) on a stationary bike; people aged 18 to 30. Raw files for temperature, electrodermal activity, pulse, accelerometer, intervals and heart rate. The authors document incomplete sessions and signal artifacts.

Proposed use: a real example of wearable data with gaps and artifacts. A heart rate derived from photoplethysmography during exercise is not equivalent to an electrocardiogram.

### Environmental Data App (OSDR) — flight, environment

[Application](https://visualization.osdr.nasa.gov/eda)

ISS cabin and ground control temperature, relative humidity and CO₂, plus radiation (galactic cosmic rays, South Atlantic Anomaly, total and cumulative dose). Missions listed: RR-1 to RR-28 (not all), APEX-03-1, APEX-03-2, APEX-04 and VEG-01C. Raw and summary data can be downloaded from the tables section.

Proposed use: Habitat with real flight environmental data. Limits: these are biology missions, not a crew member's; the data is from the cabin, not from a module assigned to a person. The page does not document formats, API or terms of use: verify them before integrating. Radiation is still subject to the rule on the unconfirmed 600 mSv limit.

### Blood sugar and mood: what was found (15/11/2026)

The challenge names blood sugar and mood among its example indicators. Searched on 15/11/2026; every item below is reading level S (search snippet or tool extraction) and goes into no presentation before the original is opened.

**Blood sugar in flight.** Continuous glucose monitors were worn by the crew of the commercial Axiom Mission 4 (2025) in the Suite Ride study, reported as the first continuous glucose monitoring of crew aboard the station; the sources are a company press release and news reports, not a paper. Bed rest analogs report reduced insulin sensitivity (for example a 28-day bed rest study in PMC2856785, and a 60-day bed rest study that used continuous glucose monitors). This supports glucose as an indicator affected by the gravity-fields hazard; it gives no threshold and none is taken from it.

**Blood sugar data.**
- *BUT CGM* (Brno University of Technology Continuous Glycaemia, ECG, Activity and Food Intake Database), PhysioNet, version 1.0.0, DOI 10.13026/hv8f-3w60. License read on its page: Creative Commons Attribution 4.0, open access. 60 healthy, mostly active adults, about ten days in free-living conditions, Dexcom G7 every 5 minutes, plus ECG, activity, sleep and a daily questionnaire (mental load, sleep quality, illness symptoms). Ground, not flight. Gaps are filled with NaN in the signal files. Candidate: usable, cite, origin = terrestrial (not an astronaut, not an analog). Page read on 15/11/2026: 60.5 GB uncompressed, one folder per participant measurement; the glucose file is `*_CGM.csv`, described as timestamp and glycaemia value, with no column headers or unit given on the page. **Download not done:** the session's network refused physionet.org and the PhysioNet open bucket on AWS. Only the `*_CGM.csv` files are needed, not the 60.5 GB. Until a real file is opened, the column names and the unit are unknown, and M21's experiment uses a hand-written file whose shape must be corrected against the real one.
- *CGMacros*, PhysioNet. License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0. **Ruled out**: a non-commercial clause is a restriction and not an OSI license.

**Mood in flight and analogs.** NASA's behavioral health work uses validated self-report instruments: an HRP Investigators' Workshop 2026 poster (NTRS 20260002661) lists the Profile of Mood States daily and the Beck Depression Inventory weekly in its isolation suite, and reports that positive affect declines over time in isolation. NASA's Cognition battery is preceded by an 18-item Alertness and Mood Survey. HERA standard measures collect weekly emotional and mental state questionnaires.
- **Instruments are not free to copy.** Validated questionnaires of this kind are generally published under copyright. Their items are not reproduced in Órbita, and Órbita computes no mood or depression score (R6). Not verified in this session which instruments, if any, are in the public domain.
- **Data.** NLSP has a "Standard Measures - HERA" collection (behavioral health and cortisol). An NTRS abstract (20220014080) says standard measures data are shared through data sharing agreements or retrospective access. Not open on that evidence; no open mood dataset found.

### Ruled out for now

- **Maximal treadmill tests, University of Malaga (PhysioNet, DOI 10.13026/7ezk-j442).** Ruled out on 15/11/2026: its license is the PhysioNet Contributor Review Health Data License 1.5.0, not an open data license, so it cannot be shown to be "freely and publicly available without restriction" as the 2026 Space Apps terms require for non-NASA material. The cycle ergometer set above covers the same use.
- **LSDA and LSAH.** They contain research and clinical astronaut data, but release it through a [formal request](https://lsda.jsc.nasa.gov/explore/lsdahome/datarequest) and a data use agreement. Not feasible within the hackathon timeframe.
- **Inspiration4 (SOMA, in OSDR).** Processed data is public and raw data is available on request with committee approval ([NASA](https://www.nasa.gov/osdr-latest-news-i4-mission-datasets/)). Mostly omics from four civilians on a three-day flight. Whether smartwatch data was published is not verified (see B18).

## Licenses and terms (checked 15/11/2026)

The [2026 Space Apps terms](https://www.spaceappschallenge.org/legal/) (updated August 7, 2026) require non-NASA material to be freely and publicly available without restriction, its license to be identified in the documentation, and every source to be cited, NASA's included.

| Source | Origin | Terms found | Status |
|---|---|---|---|
| NLSP studies (MR079G, CRF, MR035G, BRSMImmune, MR080G, DTO 684, MSD007) | NASA | Each card states that all datasets are publicly available. NLSP terms of use: anyone may view or download public content. No explicit license (data.gov: "No license information was provided") | Usable; cite each study |
| NLSP 96-E044 | NASA | Public files only; privacy-protected datasets require a data request | Usable for the public files; cite |
| OSDR (OSD-51, OSD-56) | NASA | AWS Open Data registry: no restrictions on use. Citation through each study's citation button | Usable; cite |
| Environmental Data App | NASA (OSDR) | Covered by OSDR; the OSDR FAQ gives its citation text | Usable; cite with the version |
| ACTES cycle ergometer | Third party (PhysioNet) | Open Data Commons Attribution v1.0, open access | Usable; attribution and license in the delivery |
| ITBA wearable | Third party (PhysioNet) | Open Data Commons Attribution v1.0, open access | Usable; attribution and license in the delivery |

Pending: CRF free-text clinical comments stay out of any public demo (see Integration limits). The terms forbid personally identifiable information in submissions.

## Integration limits

- Ground analog, cell culture, ISS, Shuttle and Mir are different contexts: keep them in every measurement and visualization.
- Do not merge records from different campaigns or missions as if they were one person. Validate identifiers, cohort and time of collection before any link.
- Keep Test_Phase together with BR_Day: the day number alone does not unambiguously indicate before/during/after.
- Keep identifiers as text, including leading zeros, and normalize NA without turning it into zero.
- Confirm units, calibration, protocol and replicates. Do not confuse number of measurements with participants.
- Measurements do not by themselves include diagnostic labels or validate clinical thresholds or therapeutic actions.
- There are free-text clinical comments in CRF: exclude them from a public demo unless their use is necessary and reviewed.
- A comparison with baseline shows deviation; it does not prove disease or cause.

## Local evidence

The JSON files keep the original responses. sample-downloads.json records the sources and results of the first downloads. CRF-sample.csv lets you inspect the vital signs sample. SHA256SUMS.json lets you check the integrity of the local artifacts.

Transfer note: the original files and samples mentioned under Local evidence were kept in the research workspace and are not included in this upload to the repository. The official URLs allow the sources to be consulted.
