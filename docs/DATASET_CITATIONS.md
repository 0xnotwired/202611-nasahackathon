# Dataset citations

Status as of November 15, 2026. One entry per dataset named in [DATASETS.md](DATASETS.md) and [RESOURCES_USED.md](RESOURCES_USED.md). The 2026 terms require every source to be cited, NASA's included.

**What each entry is worth.** Everything below comes from pages retrieved on November 15, 2026 through the fetch and search tools. The fetch tool answers with a short extraction of the page, not the page itself, so each PhysioNet entry must be checked against the page before delivery. Where a field was not retrieved it says so: no author, year or identifier is written from memory.

## PhysioNet (third party, Open Data Commons Attribution v1.0)

**ACTES cycle ergometer.** Chabert, C., Mongin, D., Hermand, E., Collado, A., & Hue, O. (2022). *Cardiorespiratory measurement from graded cycloergometer exercise testing* (version 1.0.0). PhysioNet. RRID:SCR_007345. https://doi.org/10.13026/2qs3-kh43

The dataset page also asks users to cite two more works. Not yet written, because their titles were not retrieved: the original publication by Mongin, D., García Romero, J., & Alvero Cruz, J. R. (2021), and the standard PhysioNet citation (Pollard et al., 2026).

**ITBA wearable.** Hongn, A., Bosch, F., Prado, L., & Bonomini, P. (2025). *Wearable Device Dataset from Induced Stress and Structured Exercise Sessions* (version 1.0.1). PhysioNet. https://doi.org/10.13026/he0v-tf17 (the page gives the full citation in PhysioNet format; the line above is rebuilt from the retrieved authors, year, title, version and DOI, so compare it with the page's own text).

The page also asks users to cite the original publication, *Wearable Physiological Signals under Acute Stress and Exercise Conditions* (Scientific Data, 2025), and the standard PhysioNet citation. Their authors and DOIs were not retrieved.

**BUT CGM (blood sugar).** Šaclová, L., Nemcova, A., Goldschmidt, T., Kralik, M., Chlíbková, D., Smital, L., Smisek, R., & Hubálek, J. (2026). *Brno University of Technology Continuous Glycaemia, ECG, Activity and Food Intake Database (BUT CGM)* (version 1.0.0). PhysioNet. RRID:SCR_007345. https://doi.org/10.13026/hv8f-3w60

Compared with the page on 15/11/2026 through the fetch tool, which returned the citation's elements (authors in order, year, title, version, publisher, RRID, DOI) but not the verbatim block, because of its quoting limit: the elements match the line above; punctuation was not compared. License on the page: Creative Commons Attribution 4.0 International Public License. Version 1.0.0, published November 2, 2026. The page lists no separate original publication to cite. It asks for the standard PhysioNet citation: Pollard, T., Moody, B. E., Lehman, L., Gow, B., Fernandes, C., Xie, C., Johnson, A., Mark, R. G., & Heldt, T. (2026). PhysioNet as a global platform for biomedical research. *Nature Health*. https://doi.org/10.1038/s44360-026-00096-z

That same standard PhysioNet citation (Pollard et al., 2026, title above) is the one the ACTES and ITBA pages ask for.

## NASA OSDR

**OSD-51** (accession GLDS-51). *Woman skeletal muscle transcriptome with bed rest and countermeasures.* National Aeronautics and Space Administration, Open Science Data Repository. Study page: https://genelab-data.ndc.nasa.gov/genelab/accession/GLDS-51. Catalog records give 2018-06-26 and 2021-05-21 as first issued dates, and the records disagree on the license field (one says no license information was provided, another a US public-domain label). Authors were not retrieved: use the citation button of the OSDR study card.

**OSD-56** (accession GLDS-56). *Gene expression profiling of human peripheral blood lymphocytes cultured in modeled microgravity.* National Aeronautics and Space Administration, Open Science Data Repository. Study page: https://genelab-data.ndc.nasa.gov/genelab/accession/GLDS-56. Same situation as OSD-51: the catalog records disagree on dates and on the license field, and authors were not retrieved. Use the citation button of the study card. The 2017 npj Microgravity paper that came up in the same search (DOI 10.1038/s41526-017-0028-6) is about Jurkat cells in parabolic flight and is **not** the article behind OSD-56.

**Environmental Data App.** Entry for the application: https://visualization.osdr.nasa.gov/eda. Associated NASA technical report: *The Environmental Data Application for Analysis of Space Telemetry Data*, NASA Technical Reports Server, https://ntrs.nasa.gov/citations/20240008072 (its record says Public Use Permitted). Authors and year were not retrieved; the OSDR FAQ gives the citation text and was not reached.

## NASA NLSP

Study titles and accession ids as recorded in [DATASETS.md](DATASETS.md), where each study's card and metadata links are. Their principal investigators, years and citation fields were **not retrieved**: `nlsp.nasa.gov` loads through JavaScript, and in this session the shell and the fetch tool were refused for it. Until they are filled, cite by title and card URL.

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

## To close

- Check the ACTES and ITBA entries against their pages; add the original publications they ask to cite. BUT CGM was checked by elements, not verbatim.
- Read the OSDR citation button for OSD-51, OSD-56 and the Environmental Data App.
- Fill the NLSP fields from each card's Metadata API when it is reachable, or ask the user for the page text.
- Importer M21 and view M22 must show the citation of whatever they display.

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
