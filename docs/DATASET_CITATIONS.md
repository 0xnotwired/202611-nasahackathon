# Dataset citations

Status as of November 15, 2026. One entry per dataset named in [DATASETS.md](DATASETS.md) and [RESOURCES_USED.md](RESOURCES_USED.md). The 2026 terms require every source to be cited, NASA's included.

**What each entry is worth.** Everything below comes from pages retrieved on November 15, 2026 through the fetch and search tools. The fetch tool answers with a short extraction of the page, not the page itself, so each PhysioNet entry must be checked against the page before delivery. Where a field was not retrieved it says so: no author, year or identifier is written from memory.

## PhysioNet (third party, Open Data Commons Attribution v1.0)

**ACTES cycle ergometer.** Chabert, C., Mongin, D., Hermand, E., Collado, A., & Hue, O. (2022). *Cardiorespiratory measurement from graded cycloergometer exercise testing* (version 1.0.0). PhysioNet. RRID:SCR_007345. https://doi.org/10.13026/2qs3-kh43

The dataset page also asks users to cite two more works. Not yet written, because their titles were not retrieved: the original publication by Mongin, D., García Romero, J., & Alvero Cruz, J. R. (2021), and the standard PhysioNet citation (Pollard et al., 2026).

**ITBA wearable.** Hongn, A., Bosch, F., Prado, L., & Bonomini, P. (2025). *Wearable Device Dataset from Induced Stress and Structured Exercise Sessions* (version 1.0.1). PhysioNet. https://doi.org/10.13026/he0v-tf17 (the page gives the full citation in PhysioNet format; the line above is rebuilt from the retrieved authors, year, title, version and DOI, so compare it with the page's own text).

The page also asks users to cite the original publication, *Wearable Physiological Signals under Acute Stress and Exercise Conditions* (Scientific Data, 2025), and the standard PhysioNet citation. Their authors and DOIs were not retrieved.

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

- Check each PhysioNet entry against its page; add the two further works each page asks to cite.
- Read the OSDR citation button for OSD-51, OSD-56 and the Environmental Data App.
- Fill the NLSP fields from each card's Metadata API when it is reachable, or ask the user for the page text.
- Importer M21 and view M22 must show the citation of whatever they display.
