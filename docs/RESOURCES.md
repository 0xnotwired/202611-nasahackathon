> Current restriction: these repositories are inspiration only. Do not incorporate, adapt or install their code as product functionality. Historical integration recommendations are superseded by the own-implementation instruction in ../AGENTS.md.

# Bibliography and repositories for the space health challenge

Selection consulted on November 14, 2026. Publisher pages, official documentation and repository READMEs were reviewed. Usage proposals and priorities are recommendations for this project. These libraries were not installed or run.

The later analysis of the books, standards, handbook and eight HRP reports is in [ACADEMIC_BASE.md](ACADEMIC_BASE.md), with page citations, evidence matrix and bibliography. It is a targeted review of relevant sections, not a full reading of every document or a systematic review.

## Free full books

The user's criterion: select only free resources. The two commercial titles from the earlier selection are excluded.

### Human Adaptation to Spaceflight: The Role of Food and Nutrition — 2nd edition, 2021

Official page: https://www.nasa.gov/directorates/esdmd/hhp/human-adaptation-to-spaceflight-the-role-of-food-and-nutrition/

Full PDF: https://www.nasa.gov/wp-content/uploads/2024/08/human-adaptation-2021-final-b.pdf

NASA offers this edition as a free download. It organizes adaptation and nutrition by physiological system, including bone, muscle and eye health, and covers ISS and ground analog data. Recommended first read among the free full books found. The full 135-page PDF, with facing printed pages, was downloaded and the sections on energy, fluids, bone, muscle, cardiovascular system, vision and immunity were analyzed; see ACADEMIC_BASE.md for citations and limits.

### Nutritional Biochemistry of Space Flight — Smith, Zwart, Kloeris and Heer, 2009

Full PDF hosted by NASA: https://www.nasa.gov/wp-content/uploads/2023/03/nutritional-biochemistry-of-space-flight.pdf

The full 220-page PDF was checked. It covers nutritional requirements, energy, vitamins, minerals, extravehicular activity and nutrient–drug interactions. A complementary read on fundamentals; given its date, check operational claims against more recent evidence.

Both titles are freely available to read; an open license to reuse all of their content is not assumed.

## Public handbooks and reports

### NASA Human Research Program — Evidence Reports

https://humanresearchroadmap.nasa.gov/Evidence/

Public collection of evidence reports and articles by risk. Useful to justify the choice of indicators and to distinguish evidence, uncertainty and gaps. Record the specific report and its date when extracting a claim. The collection also refers to a historical 2009 Evidence Book; prefer the most recent reports available for the specific question.

### NASA-STD-3001, volume 1: Crew Health

https://www.nasa.gov/reference/nasa-std-3001v1/

Public standard on crew health before, during and after the mission. Useful to ground which medical needs a solution must cover. It does not automatically turn an experimental project rule into a validated medical criterion.

### NASA-STD-3001, volume 2: Human Factors, Habitability, and Environmental Health

https://www.nasa.gov/reference/nasa-std-3001v2/

Public standard for systems the crew interacts with. A source to research interfaces, human factors and environmental conditions. Check the current revision on the official page before fixing specific requirements.

### Human Integration Design Handbook — NASA

https://www.nasa.gov/human-integration-design-handbook/

Public handbook complementing volume 2. The page offers revision 1 and related documents. Useful to ground interface and ergonomics decisions; check normative requirements against the current standard.

## Repositories

### nasa/OSDR_Tutorials — data and documentation

https://github.com/nasa/OSDR_Tutorials

Documentation: https://osdr-tutorials.readthedocs.io/en/latest/

High priority to explore OSDR, file access and APIs. It is a documentation and examples repository, not a monitoring application or an NLSP-specific client.

Two particularly useful guides:

- Environment: https://github.com/nasa/OSDR_Tutorials/blob/main/source/pages/guides/environmental_data_application.md
- Radiation: https://github.com/nasa/OSDR_Tutorials/blob/main/source/pages/guides/radlab_portal.md

The EDA guide describes ISS cabin temperature, humidity and CO2, ground controls and radiation linked to Rodent Research campaigns. That describes the collection context, not human clinical data. RadLab describes sensor series with time, spacecraft and module, and CSV/TSV/JSON export. It is a promising way to investigate environmental series beyond the historical files already reviewed; downloading from those APIs was not verified here.

### ebi-gene-expression-group/anatomogram — interactive body figure

https://github.com/ebi-gene-expression-group/anatomogram

React/SVG component from Expression Atlas, EMBL-EBI, with selection, highlighting and click events per tissue. A direct candidate to explore the human body by regions. Its original purpose is to show gene expression, so the meaning of the states would have to be adapted to our indicators.

The README declares Apache-2.0 code and CC BY 4.0 images. Keep attribution for the graphic resources. Compatibility of the package with a future React version was not verified; the SVGs can be evaluated separately.

### plotly/plotly.js — indicator progress

https://github.com/plotly/plotly.js

Standalone JavaScript library for interactive charts. A candidate to show measurements, trends and annotations of CRF phase changes. The README declares the MIT license. Offline operation requires bundling the resources in the application and avoiding runtime CDN dependencies.

### dexie/Dexie.js — local persistence

https://github.com/dexie/Dexie.js

A layer over IndexedDB to store records in the browser. Useful if a web application with local operation is chosen. Apache-2.0 license verified. Storing data locally does not by itself solve application caching, encryption, backup or recovery; those depend on the chosen architecture.

### neuropsychology/NeuroKit — physiological signal processing

https://github.com/neuropsychology/NeuroKit

Python package NeuroKit2 to process ECG, respiration, electrodermal activity and other signals; includes examples and simulation. The README declares the MIT license. Incorporate it if signals with adequate time resolution are obtained. A daily CRF pulse reading is not enough to compute beat-to-beat variability and is not equivalent to an ECG.

### MIT-LCP/wfdb-python — reading signals and annotations

https://github.com/MIT-LCP/wfdb-python

Python tools to read, write and analyze signals and annotations in WFDB format. Includes a demo notebook. MIT license verified. A candidate if PhysioNet data is explored; its format and population must be preserved and not labeled as astronaut data.

### OHIF/Viewers — medical images

https://github.com/OHIF/Viewers

Extensible web viewer with DICOMweb support, visualization and annotation of medical images. The README declares the MIT license. A candidate if the proposal incorporates DICOM images; it is not a requirement to present CSV and does not imply that our datasets contain diagnostic images. The master branch is described as development/beta; evaluate a stable release before integrating.

## Recommended exploration order

1. Evidence Reports and NASA-STD-3001 to ground what to monitor and how to communicate it.
2. Human Adaptation to Spaceflight (2021) to understand the physiological systems and nutrition.
3. CRF and its dictionaries/protocols to define the format of our measurements.
4. Anatomogram and Plotly to try out the visual journey.
5. Dexie if local browser persistence is chosen.
6. NeuroKit/WFDB if signals are incorporated; OHIF if images are incorporated.
7. Nutritional Biochemistry of Space Flight as a historical complementary reference, and NASA's public reports to research the chosen cases.

This list proposes resources according to the challenge goals; it is not a final selection of the stack or of the product's features.

## Resources listed by the challenge page (pasted by the user, November 15, 2026)

The user pasted the "NASA Data & Resources" and "Space Agency Partner Resources" lists from the challenge page. Each page was fetched on the same day; the fetch tool returns an extraction, not the page, so reading level is S for all of them and no figure below goes into the presentation before the original is opened. The challenge statement itself was not part of the paste.

| Page | What it gave | What it did not give |
|---|---|---|
| [Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/) | Five hazards: space radiation, isolation and confinement, distance from Earth, gravity fields, hostile/closed environments, each with a short summary and a link to a detail page | The detail pages |
| [Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/) | 17 named risks in three groups (11 physiology, 5 behavioral performance and human factors, 1 radiation) | Detail per risk; the page names none for monitoring |
| [Ongoing HRP Research in Space](https://www.nasa.gov/hrp/ongoing-hrp-research/) | 21 titles, among them Standard Measures and Artemis II Standard Measures | Dates and descriptions |
| [Monitoring Radiation for Astronaut Health](https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp) (CSA) | The Canadian Active Neutron Spectrometer and its predecessors, named | Any dose figure or limit: it does **not** settle the radiation-limit questions ([V1 4030], 600 mSv) |
| [Why Do We Conduct Science Experiments in Space?](https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp) (CSA) | A general overview of ISS human research | Monitoring procedures, protocols or data-sharing content |
