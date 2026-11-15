# Dataset review for Space Apps: astronaut health

Query run: 2026-11-14T15:30:14.906452+00:00

The eight full NLSP study cards were consulted through the public API used by the website, along with the human catalog and the metadata/file listings of OSD-51 and OSD-56. Small downloads from the eight NLSP studies were checked. Not all of their files, nor the bulk OSDR ZIPs, were downloaded or processed.

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

### Maximal treadmill tests, University of Malaga — ground

[PhysioNet card](https://physionet.org/content/treadmill-exercise-cardioresp/) · DOI 10.13026/7ezk-j442

992 graded maximal treadmill tests, with heart rate, VO2, VCO2, respiratory rate and ventilation breath by breath, plus treadmill speed. Amateur and professional athletes aged 10 to 63. Two files: `subject-info.csv` (one row per test, with age, height, weight, temperature and humidity) and the time series. VO2, VCO2 and VE are missing in 30 tests.

Proposed use: give realistic shapes to the generator's curves and replay tests in the cases viewer, labeled as ground data. **Athletes on the ground are not astronauts in flight.** License not read on the card: confirm it before redistributing files.

### Graded cycle ergometer test — ground

[PhysioNet card](https://physionet.org/content/actes-cycloergometer-exercise/) · DOI 10.13026/2qs3-kh43

Beat-to-beat intervals, VO2 and mechanical power during graded cycle ergometer tests, the same type of equipment as the ISS CEVIS. Sample size and license not verified.

### Wearable during stress and structured exercise (ITBA) — ground

[PhysioNet card](https://www.physionet.org/content/wearable-device-dataset/) · DOI 10.13026/he0v-tf17 · Open Data Commons Attribution v1.0 license

Empatica E4 during stress sessions (36 volunteers), aerobic exercise (30) and anaerobic exercise (31) on a stationary bike; people aged 18 to 30. Raw files for temperature, electrodermal activity, pulse, accelerometer, intervals and heart rate. The authors document incomplete sessions and signal artifacts.

Proposed use: a real example of wearable data with gaps and artifacts. A heart rate derived from photoplethysmography during exercise is not equivalent to an electrocardiogram.

### Environmental Data App (OSDR) — flight, environment

[Application](https://visualization.osdr.nasa.gov/eda)

ISS cabin and ground control temperature, relative humidity and CO₂, plus radiation (galactic cosmic rays, South Atlantic Anomaly, total and cumulative dose). Missions listed: RR-1 to RR-28 (not all), APEX-03-1, APEX-03-2, APEX-04 and VEG-01C. Raw and summary data can be downloaded from the tables section.

Proposed use: Habitat with real flight environmental data. Limits: these are biology missions, not a crew member's; the data is from the cabin, not from a module assigned to a person. The page does not document formats, API or terms of use: verify them before integrating. Radiation is still subject to the rule on the unconfirmed 600 mSv limit.

### Ruled out for now

- **LSDA and LSAH.** They contain research and clinical astronaut data, but release it through a [formal request](https://lsda.jsc.nasa.gov/explore/lsdahome/datarequest) and a data use agreement. Not feasible within the hackathon timeframe.
- **Inspiration4 (SOMA, in OSDR).** Processed data is public and raw data is available on request with committee approval ([NASA](https://www.nasa.gov/osdr-latest-news-i4-mission-datasets/)). Mostly omics from four civilians on a three-day flight. Whether smartwatch data was published is not verified (see B18).

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
