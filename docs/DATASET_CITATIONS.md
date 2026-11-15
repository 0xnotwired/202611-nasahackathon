# Dataset citations

Current implementation: [CURRENT_STATUS.md](CURRENT_STATUS.md). Source-specific
evidence and dated investigation history below retain their original scope.

Status as of November 15, 2026. One entry per dataset named in [DATASETS.md](DATASETS.md) and [RESOURCES_USED.md](RESOURCES_USED.md). The 2026 terms require every source to be cited, NASA's included.

**Current evidence.** Original PhysioNet cards/licenses, NLSP DOI records and OSDR metadata/DOI records have now been read directly and hashed. The later verification sections supersede earlier extraction-only and missing-field notes. Reuse conditions and event eligibility are distinguished in [SPACE_APPS_DATA_REVIEW.md](SPACE_APPS_DATA_REVIEW.md).

## PhysioNet (third-party sources; distinct licenses below)

**ACTES cycle ergometer.** Chabert, C., Mongin, D., Hermand, E., Collado, A., & Hue, O. (2022). *Cardiorespiratory measurement from graded cycloergometer exercise testing* (version 1.0.0). PhysioNet. RRID:SCR_007345. https://doi.org/10.13026/2qs3-kh43

The requested publication by Mongin, García Romero and Alvero Cruz and platform reference are now recorded below, including the publisher's unexpected Malaga citation.

**ITBA wearable.** Hongn, A., Bosch, F., Prado, L., & Bonomini, P. (2025). *Wearable Device Dataset from Induced Stress and Structured Exercise Sessions* (version 1.0.1). PhysioNet. https://doi.org/10.13026/he0v-tf17 (verified against the complete publisher card in the additional acquisition).

The requested original paper, Wearable Physiological Signals under Acute Stress and Exercise Conditions, and platform reference are now complete below.

**BUT CGM (blood sugar).** Šaclová, L., Nemcova, A., Goldschmidt, T., Kralik, M., Chlíbková, D., Smital, L., Smisek, R., & Hubálek, J. (2026). *Brno University of Technology Continuous Glycaemia, ECG, Activity and Food Intake Database (BUT CGM)* (version 1.0.0). PhysioNet. RRID:SCR_007345. https://doi.org/10.13026/hv8f-3w60

Compared with the page on 15/11/2026 through the fetch tool, which returned the citation's elements (authors in order, year, title, version, publisher, RRID, DOI) but not the verbatim block, because of its quoting limit: the elements match the line above; punctuation was not compared. License on the page: Creative Commons Attribution 4.0 International Public License. Version 1.0.0, published November 2, 2026. The page lists no separate original publication to cite. It asks for the standard PhysioNet citation: Pollard, T., Moody, B. E., Lehman, L., Gow, B., Fernandes, C., Xie, C., Johnson, A., Mark, R. G., & Heldt, T. (2026). PhysioNet as a global platform for biomedical research. *Nature Health*. https://doi.org/10.1038/s44360-026-00096-z

That same standard PhysioNet citation (Pollard et al., 2026, title above) is the one the ACTES and ITBA pages ask for.

## NASA OSDR

**OSD-51** Chopard, Angele; Marini, Jean-Francois; Bihouee, Audrey; Jasmin, Bernard J; Lamirault, Guillaume; Leger, Jean J; Teusan, Raluca; Lecunff, Martine; Danger, Richard (2010). Woman skeletal muscle transcriptome with bed rest and countermeasures. [Dataset]. NASA GeneLab. https://doi.org/10.26030/3w73-jn41 Registered citation verified directly; rightsList is empty. Repository-level unrestricted-use evidence for the public OSDR AWS distribution is documented in OSDR_EDA_USE_RESEARCH.md; no study-specific CC0/CCBY identifier is asserted. Study metadata and upstream-source scope are in the OSDR/EDA acquisition manifest.

**OSD-56** Lanfranchi, Gerolamo; Girardi, Cristina; De Pitta, Cristiano; Casara, Silvia; Calura, Enrica; Romualdi, Chiara; Celotti, Lucia; Mognato, Maddalena (2014). Gene expression profiling of human peripheral blood lymphocytes cultured in modeled microgravity [Dataset]. NASA GeneLab. https://doi.org/10.26030/nc96-xp67 Registered citation verified directly; rightsList is empty. Repository-level unrestricted-use evidence for the public OSDR AWS distribution is documented in OSDR_EDA_USE_RESEARCH.md; no study-specific CC0/CCBY identifier is asserted. Study metadata and upstream-source scope are in the OSDR/EDA acquisition manifest.

**Environmental Data App.** Entry for the application: https://visualization.osdr.nasa.gov/eda. Associated NASA technical report: *The Environmental Data Application for Analysis of Space Telemetry Data*, NASA Technical Reports Server, https://ntrs.nasa.gov/citations/20240008072 (its record says Public Use Permitted). Authors and year were not retrieved; the OSDR FAQ gives the citation text and was not reached.

## NASA NLSP

Study titles and accession ids as recorded in [DATASETS.md](DATASETS.md), where each study's card and metadata links are. Complete registered creators, years, DOI and CC0 rights were subsequently retrieved through official DataCite records; use the verified registry sections below instead of title-only references.

| Study | Accession |
|---|---|
| Isokinetic Muscle Function (Flight Analog) | MR079G |
| Case Report Form | CRF |
| Bone Densitometry Assessment (Flight Analog) | MR035G |
| Bed Rest Standard Measures: General Immunity | BRSMImmune |
| Aerobic Capacity (Flight Analog) | MR080G |
| Radiation Measurements in Shuttle Crew Compartment | DTO 684 |
| The Effects of EVA and Long-Term Exposure to Microgravity on Pulmonary Function | 96-E044 |
| Toxicological Assessment of Airborne Volatile Organic Compounds | MSD007 |

## Remaining citation and use checks

ACTES/ITBA dataset, requested publication and platform references are retained
in the direct verification sections below. Eight NLSP registered citations
are complete. OSD-51/56 exact DOI identities are now verified, but their
reuse policy and EDA's prescribed repository reference still need checking.
Importer M21 and view M22 must display the citation of whatever they show.
Event eligibility and final-package checks are tracked separately in
[SPACE_APPS_DATA_REVIEW.md](SPACE_APPS_DATA_REVIEW.md).

## Acquisition follow-up — November 15, 2026

RUN: Current official full metadata for CRF and MR079G were fetched and kept
unchanged under ignored data/originals/. DOI elements verified directly in
those documents: CRF **10.83263/wjw1-ta27**, MR079G **10.83263/bk5h-r757**.
No complete author/year citation or explicit NASA license is claimed by this
follow-up. BUT CGM 1.0.0 official README, CC BY4.0 LICENSE and publisher
SHA256SUMS were retrieved; CSV/README/license checksums match the published
list. See [the acquisition manifest](data/acquisition-2026-11-15.json).

SOURCE follow-up: the official PhysioNet page links the BioSig-BUT companion.
At commit d5867dc9022715223ddbf11244b98db64109bcf0, its viewer labels the
CGM series mmol/l, while the loader reads Glycemia without a unit conversion.
This establishes the author's unit interpretation; the original CSV omits it.
Pinned source URLs and hashes are in the acquisition manifest. No external
application code was incorporated into Órbita. Official NASA file-level
metadata additionally supplies matching MD5 checksums for both original CSVs.

## Verified minimum references for the acquired samples

These title-led references use only directly verified source elements. A PI
list is not substituted for dataset creators, and DOI registration date is
not substituted for publication year. Complete registry metadata is still
blocked by CONNECT403 to api.datacite.org; the references remain usable
identifiers without inventing missing bibliographic fields.

- Case Report Form (CRF). NASA Life Sciences Portal / Life Sciences Data Archive. https://doi.org/10.83263/wjw1-ta27. Accessed November 15, 2026.
- Isokinetic Muscle Function (Flight Analog) (MR079G). NASA Life Sciences Portal / Life Sciences Data Archive. https://doi.org/10.83263/bk5h-r757. Accessed November 15, 2026.

BUT CGM retains the author/year/version citation above and the downloaded
CC BY4.0 license. Reuse requires attribution, license linkage, retained
notices and identifying changes. Official availability of NASA files is
verified; an explicit redistribution grant is not established by that fact.
See [readiness decisions](data/import-readiness-2026-11-15.json).

## Direct license/citation verification follow-up

The complete official BUT CGM1.0.0 HTML page and downloaded CC BY4.0 license
were read directly for this review. Both the dataset citation and the
requested standard PhysioNet citation match the prepared
[delivery notice](DATA_ATTRIBUTIONS.md). See [use conditions](DATA_USE_AND_DELIVERY.md)
for precise scope and the unverified NASA-policy access; earlier fetch-tool
quoting limits do not describe this later direct-page verification.

## Verified NASA DOI registry follow-up

SOURCE: Both official DataCite records now declare CC0-1.0, publisher Ames
Research Center and publication year2026. Creator names below follow the
registry, including its spelling; this supersedes earlier incomplete
creator/year/rights notes.

- Meck, Janice Fritsch- Yelle; Bridgeford, Jeffrey S.; Paloski, William H.; Cromwell, Ronita L. (2026). Case Report Form [Dataset]. Ames Research Center. https://doi.org/10.83263/wjw1-ta27 License: CC0-1.0.
- Moore, Alan D., Jr.; Lee, Stuart M. C.; Ciaozzo, Vince J.; Baldwin, Kenneth M.; Ploutz- Snyder, Lori (2026). Isokinetic Muscle Function (Flight Analog) [Dataset]. Ames Research Center. https://doi.org/10.83263/bk5h-r757 License: CC0-1.0.

Evidence: [legal review](data/use-conditions-2026-11-15.json). Attribution
remains part of project/source provenance; CC0 itself does not impose an
attribution condition. No endorsement or universal NASA-license claim is made.

## Additional samples — primary-source verification, November15

The following supersedes incomplete title-only references for these studies.
NASA creators are preserved verbatim as registered (including role labels),
not inferred from investigators or file staff. Registry response hashes and
exact artifacts are in [the additional manifest](data/additional-acquisition-2026-11-15.json).

- Principal Investigator: Sibonga, Jean D.; Technical Assistant to Principal Investigator: Evans, Harlan (2026). Bone Densitometry Assessment (Flight Analog) [Dataset]. Ames Research Center. https://doi.org/10.83263/7myc-5j86
  Rights source: https://api.datacite.org/dois/10.83263/7myc-5j86; CC0-1.0.
- Co-Investigator: Crucian, Brian E.; Principal Investigator: Sams, Clarence F. (2026). Bed Rest Standard Measures: General Immunity [Dataset]. Ames Research Center. https://doi.org/10.83263/75we-ch31
  Rights source: https://api.datacite.org/dois/10.83263/75we-ch31; CC0-1.0.
- Principal Investigator: Moore, Alan D., Jr.; Technical Assistant to Principal Investigator: Wilson, Cassie A.; Principal Investigator: Ploutz- Snyder, Lori; Technical Assistant to Principal Investigator: Everett-Downs, Meghan (2026). Aerobic Capacity (Flight Analog) [Dataset]. Ames Research Center. https://doi.org/10.83263/w056-8t76
  Rights source: https://api.datacite.org/dois/10.83263/w056-8t76; CC0-1.0.
- Principal Investigator: Badhwar, Gautam (2026). Radiation Measurements in Shuttle Crew Compartment [Dataset]. Ames Research Center. https://doi.org/10.83263/0d67-bk75
  Rights source: https://api.datacite.org/dois/10.83263/0d67-bk75; CC0-1.0.
- Co-Investigator: Darquenne, Chantal; Co-Investigator: Elliott, Ann; Co-Investigator: Paiva, Manuel; Co-Investigator: Prisk, G.; Principal Investigator: West, John (2026). The Effects of EVA and Long-Term Exposure to Microgravity on Pulmonary Function [Dataset]. Ames Research Center. https://doi.org/10.83263/7nhp-yt75
  Rights source: https://api.datacite.org/dois/10.83263/7nhp-yt75; CC0-1.0.
- Co-Investigator: Beck, Steve; Co-Investigator: Boyd, John; Co-Investigator: Covington, Phillip; Co-Investigator: Limero, Thomas; Co-Investigator: Lind, Debra; Co-Investigator: Martin, Mildred; Co-Investigator: Matney, Marilyn; Co-Investigator: Yang, Lily; Principal Investigator: James, John (2026). Toxicological Assessment of Airborne Volatile Organic Compounds [Dataset]. Ames Research Center. https://doi.org/10.83263/xj28-wp80
  Rights source: https://api.datacite.org/dois/10.83263/xj28-wp80; CC0-1.0.
- Chabert, C., Mongin, D., Hermand, E., Collado, A., & Hue, O. (2022). Cardiorespiratory measurement from graded cycloergometer exercise testing (version 1.0.0). PhysioNet . RRID:SCR_007345. https://doi.org/10.13026/2qs3-kh43
  Rights: ODC Attribution1.0, original license file and official versioned card inspected.
- Hongn, A., Bosch, F., Prado, L., & Bonomini, P. (2025). Wearable Device Dataset from Induced Stress and Structured Exercise Sessions (version 1.0.1). PhysioNet . RRID:SCR_007345. https://doi.org/10.13026/he0v-tf17
  Rights: ODC Attribution1.0, original license file and official versioned card inspected.

The PhysioNet cards also request the current platform citation: Pollard, T.,
Moody, B. E., Lehman, L., Gow, B., Fernandes, C., Xie, C., Johnson, A.,
Mark, R. G., & Heldt, T. (2026). PhysioNet as a global platform for biomedical
research. Nature Health. https://doi.org/10.1038/s44360-026-00096-z
Card retrieval hashes are in the manifest. Keep previously requested
Goldberger2000 citations for earlier datasets; the card-specific references
are not replaced by one blanket citation.

## Requested publication citations verified from complete PhysioNet cards

ITBA's additional requested citation: Hongn, A., Bosch, F., Prado, L. E.,
Ferrández, J.M., & Bonomini, M. P. (2025). Wearable Physiological Signals
under Acute Stress and Exercise Conditions. Scientific Data,12(1).
https://doi.org/10.1038/s41597-025-04845-9
This is the publisher's citation, not a claim of independent full-paper review.

ACTES's additional-citation block unexpectedly requests: Mongin, D.,
García Romero, J., & Alvero Cruz, J. R. (2021). Treadmill Maximal Exercise
Tests from the Exercise Physiology and Human Performance Lab of the
University of Malaga (version1.0.1). PhysioNet.
https://doi.org/10.13026/7ezk-j442
It additionally links https://www.medrxiv.org/content/10.1101/2021.09.23.21263943v1.full
This apparent citation/context mismatch is retained as a publisher request,
not silently corrected or represented as ACTES data identity. Malaga data
remain excluded; citing a request neither imports nor licenses that dataset.

Sources: exact versioned card HTML, hashes in
[data/additional-acquisition-2026-11-15.json](data/additional-acquisition-2026-11-15.json).
No external paper/code implementation was copied into the app.

## OSDR/EDA direct verification after publication

The following registered dataset identities supersede the earlier catalog
date/creator gaps. Their DOI rightsList entries are empty; do not assign CC0.

- Chopard, Angele; Marini, Jean-Francois; Bihouee, Audrey; Jasmin, Bernard J; Lamirault, Guillaume; Leger, Jean J; Teusan, Raluca; Lecunff, Martine; Danger, Richard (2010). Woman skeletal muscle transcriptome with bed rest and countermeasures. [Dataset]. NASA GeneLab. https://doi.org/10.26030/3w73-jn41
- Lanfranchi, Gerolamo; Girardi, Cristina; De Pitta, Cristiano; Casara, Silvia; Calura, Enrica; Romualdi, Chiara; Celotti, Lucia; Mognato, Maddalena (2014). Gene expression profiling of human peripheral blood lymphocytes cultured in modeled microgravity [Dataset]. NASA GeneLab. https://doi.org/10.26030/nc96-xp67

EDA source-led citation: NASA Open Science Data Repository. Environmental
Data App, RR-1 (Rodent Research1 / SpaceX-4), accessed November15,2026.
https://visualization.osdr.nasa.gov/eda/
Telemetry: https://visualization.osdr.nasa.gov/eda/api/missions/RR-1/telemetry_data/
Radiation: https://visualization.osdr.nasa.gov/eda/api/missions/RR-1/radiation_data/
This identifies the actual source without inventing a version, author list
or prescribed repository citation. Applicable policy/prescribed citation
remain pending through the redirected NASA policy host.

Provenance and exact registry/API response hashes:
[data/osdr-eda-acquisition-2026-11-15.json](data/osdr-eda-acquisition-2026-11-15.json).
OSDR investigator address/email/phone fields are not copied into these notices.

OSDR repository-policy reference: NASA Space Biology Open Science Data
Repository (OSDR), Registry of Open Data on AWS; ManagedBy NASA. Pinned
entry69cf82c80db1f4b7b16a5843436f58ae0181397f, accessed November15,2026:
https://raw.githubusercontent.com/awslabs/open-data-registry/69cf82c80db1f4b7b16a5843436f58ae0181397f/datasets/nasa-osdr.yaml
Corroborating NASA guide: Getting Started with AWS and OSDR Data,
https://www.nasa.gov/wp-json/wp/v2/reference/692224
These source references preserve policy scope; they do not replace study citations.
