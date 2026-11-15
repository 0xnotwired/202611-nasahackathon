# Academic base for an astronaut health tool

Targeted documentary review for the Space Apps 2026 challenge. Date consulted: November 14, 2026.

## How to read this consolidated version

This document brings together the initial review of books, standards and HRP reports and the recent research on six full texts. The second part incorporates studies on exercise, bone, sleep and CO₂, the AMOS precedent, their sources and limitations, and proposals for Órbita. It does not represent a new search or a clinical validation.

The initial review keeps its identifiers S01–S18; the extension uses A01–A06. **A05 and S15 correspond to the same Barger study**, now reviewed in full text: they are not two independent pieces of evidence. The complementary matrices are [EVIDENCE_MATRIX.csv](EVIDENCE_MATRIX.csv) and [APPLIED_RESEARCH_MATRIX.csv](APPLIED_RESEARCH_MATRIX.csv).

The current scope integrates health, physical adaptation and habitat with procedures and follow-up. The [final proposal](FINAL_PROPOSAL.md) makes that scope concrete. The initial recommendations centered on the check-in should be read as background, not as a reduction of the chosen product.

The earlier PDF of the academic base corresponds to the initial review; it does not include this consolidation.

## 1. Conclusion and scope

The documentation supports a personal tracking tool that integrates measurements, mission context, progress, measurement instructions and traceable guidance. Preventive monitoring must cover nutrition, exercise, rest and psychosocial wellbeing in addition to vital signs [S03, PDF pp. 18–21]. Our product recommendation is to combine a guided check-in with a history and an accessible body representation; that combination is a design proposal, not a solution whose clinical efficacy has been demonstrated by these sources.

The scientific priority is to distinguish three things: what was measured, what interpretation that measurement allows and which action is supported for that situation. The available data allow tracking and observed changes to be demonstrated; they are not enough to validate automatic diagnoses, a global health score or personalized treatments.

13 unique PDFs were downloaded: two books, both volumes of NASA-STD-3001, the HIDH and eight thematic HRP reports. Reading was directed at abstracts, relevant sections, requirements and limitations. Each of the HIDH's 1,301 pages was not read in full, and this work is not presented as a systematic review or meta-analysis. In that first stage, abstracts of four original articles indexed in PubMed were also checked, without reviewing their full methods or reanalyzing data. The later extension reviews sections of six full texts, including the Barger study [S15/A05], as detailed in the second part.

References to "PDF p." count from the first page of the file, starting at 1. The 2021 book contains facing pages: one PDF page can correspond to two printed pages. Requirement identifiers allow the text to be located even if pagination changes.

## 2. How to use each class of source

| Class | What it provides | What it does not prove by itself |
|---|---|---|
| Original research | Measurements, associations and results in a specific population and protocol. | That the result is causal or generalizable to any astronaut and mission. |
| Books and HRP reports | Synthesis of knowledge, proposed mechanisms, risks and gaps. | A clinical validation of our software or of a new rule. |
| NASA-STD-3001 | Technical requirements and operating criteria for applicable programs. | That meeting isolated criteria amounts to certifying the whole application. |
| HIDH | Rationale and guidance for system and interface design. | Replacing the current normative review or evaluating the usability of our specific interface. |
| NLSP/OSDR datasets | Empirical material to explore and demonstrate features. | A diagnostic label or therapeutic threshold that the study does not contain. |

The nutrition report linked by HRP and the 2021 book have the same title, authors and core content. The extracted text matches exactly, ignoring spaces, on 130 of 135 pages. They are two distributions of the same work; they are not counted as independent corroboration.

## 3. Analysis of the six requested resource groups

### 3.1. Human Adaptation to Spaceflight, second edition, 2021 [S01]

Authors: Scott M. Smith, Sara R. Zwart, Grace L. Douglas and Martina Heer. It is the main synthesis to link nutrition with physiological systems. Passages on energy, fluids, bone, muscle, cardiovascular system, vision and immunity were reviewed.

**Energy and body mass.** The work gathers historical data on insufficient intake and explains its relation to changes in mass and function. It also describes missions in which intake and mass were maintained: loss is not a uniform fate. The associations involve diet, exercise and physiological adaptation, so an isolated change in mass does not identify its cause [S01, ch. 4, printed pp. 28–33; PDF pp. 21–23].

**Fluids.** Fluid redistribution and reduced plasma volume are distinguished from global dehydration. The simple explanation "microgravity causes diuresis and dehydration" is not confirmed by the flight experiments the work reviews. This does not rule out dehydration due to insufficient intake or losses; it prevents diagnosing it automatically from the mission phase [S01, ch. 5, printed pp. 51–53; PDF pp. 32–33].

**Bone and exercise.** Results vary by region, person, equipment and nutrition. The comparison between iRED and ARED is partly confounded by nutritional differences between cohorts. Preserving mineral density does not demonstrate normality of the whole microarchitecture or absence of fracture risk [S01, ch. 6, printed pp. 64–67; PDF pp. 39–40].

**Muscle and physical capacity.** The work distinguishes tissue loss and synthesis/breakdown processes, as well as mechanical and nutritional countermeasures. Efficacy depends on the stimulus and the context: an individual training program cannot be derived just from knowing body mass [S01, ch. 7, printed pp. 116–119; PDF pp. 65–66].

**Vision and immunity.** Nutritional and genetic associations with SANS do not establish a single cause. The immunology section combines human, ground and mechanistic evidence: that heterogeneity must accompany the explanations [S01, chs. 10–11; PDF pp. 83–85 and 93–95].

**Proposed application:** add intake/appetite, fluids and activity as check-in context; distinguish weight from mass and record the instrument compatible with the mission's gravity. Show explanations by system with sources and date. Recorded intake does not directly measure body composition, immunity or eye health.

### 3.2. Nutritional Biochemistry of Space Flight, 2009 [S02]

Work by Smith, Zwart, Kloeris and Heer. Its organization by nutrients complements the 2021 system-based approach. It acknowledges extrapolations from analogs and ground evidence; it reviews supplements and food–drug interactions [ch. IV, printed p. 17 / PDF 29; chs. XI–XII, printed pp. 123–126 / PDF 135–138].

**Value for the project:** keep diet, supplements and medication as documented context; do not turn a nutritional suggestion into an automatic prescription. Given its date, it serves as historical grounding and must be checked against the current standard and evidence. Its free access does not imply unrestricted permission to redistribute it.

### 3.3. NASA HRP Evidence Reports [S06–S13]

The collection is a living synthesis, but each file has its own date. Eight relevant risks were selected; the whole catalog was not reviewed. The dates below correspond to the public approval on the cover, not the file name or its download.

| Report | Version examined | Relevant result and limit |
|---|---|---|
| Cardiovascular [S06] | 15/12/2022 | Integrates orthostatic intolerance, arrhythmias and other cardiovascular risks. Blood pressure and pulse data help track changes, but do not replace ECG, imaging or vascular assessment. Limited extrapolation to long missions beyond LEO. |
| Muscle and aerobic capacity [S07] | 22/01/2023 | Highlights individual variability, the relation with exercise and differences in equipment. The conclusions acknowledge the absence of controlled studies of exercise efficacy in flight; do not present all the evidence as a randomized trial. |
| Fracture and bone changes [S08] | 18/07/2024 | Distinguishes density, biomechanical competence and applied loads. Points out limits to translating a percentage change in DXA into individual fragility. |
| Sleep, circadian rhythm and workload [S09] | 11/04/2016 | Separates sleep duration, circadian misalignment and workload. Its assessments of fatigue models date from 2016; they do not automatically describe their status in 2026. |
| Immunity [S10] | 01/06/2022 | Documents alterations in flight and distinguishes cellular assays, function and possible clinical consequences. Gaps remain on individual clinical relevance and appropriate analogs. |
| Medical capability [S11] | 08/05/2017 | Grounds medical history, on-board resources, decision support and training when ground support is limited. Its lists of future technologies are historical. |
| SANS [S12] | 07/04/2022 | Documents eye changes and mechanisms still under investigation. Specialized follow-up cannot be replaced by a facial photo or questions about vision. |
| Radiation carcinogenesis [S13] | 2026 | Synthesizes dosimetry, epidemiological evidence, animal models and risk estimation. It makes explicit the uncertainties of extrapolating between radiation types, dose rates and populations. |

**Location of the analysis:** S06, PDF pp. 8, 19–20 and 97–98; S07, PDF pp. 5–6, 37–38, 43–44 and 138; S08, PDF pp. 6–9; S09, PDF pp. 4–7; S10, PDF pp. 4–7; S11, PDF pp. 5, 32–36, 44–45 and 51–52; S12, PDF pp. 7, 42 and 50–51; S13, PDF pp. 10–11, 42–44 and 55.

**Consequence for the project:** organize measurements by what they actually observe. A daily pulse reading does not allow arrhythmias or thrombosis to be diagnosed; a questionnaire does not determine immune cells; a sensor dose rate is not by itself a personal probability of cancer. The system can show context and guide a documented assessment without claiming these capabilities.

### 3.4. NASA-STD-3001, volume 1, revision C [S03]

The official PDF consulted was approved on 15/09/2023. Its purpose is to define health requirements for the applicable programs; it is not a standalone diagnostic manual for an app.

Requirements [V1 3003] and [V1 3004] describe preventive monitoring and care adapted to individual needs, evidence, the medical team's judgment, mission architecture and resources. They include nutrition, physical capacity, rest, psychosocial wellbeing and environment [PDF pp. 18–21]. This allows us to justify that the product covers more than a vital signs dashboard.

Requirement [V1 3004] includes an electronic medical record with data protection; recording of encounters, exams, vital signs and trends; auxiliary tests; plans and results; private communication; and Earth-independent care capability [PDF pp. 20–21]. The performance sections differentiate systems and phases [PDF pp. 31–39].

**Proposed translation:** store time, method and context; show follow-up; record actions and results; allow explicit medical communication. A single score mixing all dimensions is not justified here. The standard's numeric limits are specific to their purpose and must not be turned into consumer alarms without review.

### 3.5. NASA-STD-3001, volume 2, revision F [S04]

Although the URL contains "2025/05", the cover of the downloaded file identifies revision F, approved on 14/07/2026. This difference confirms why we must cite the content and keep its hash.

| Requirement | PDF page | Relevant criterion for a future interface |
|---|---|---|
| [V2 10005] and [V2 10006] | 199 | Interface and terminology consistency. |
| [V2 10020] | 200 | Visual indication of old, missing, unavailable or unknown data. |
| [V2 10113] | 202 | Present task information without requiring mental arithmetic, memory or repetitive navigation. |
| [V2 10125] | 203 | Protection of private data, transmission and display. |
| [V2 10129] | 203 | Backup and restore of information. |
| [V2 10114] and [V2 10175] | 204 | Distinction and prioritization of alerts according to their operational meaning. |
| [V2 10045] | 212 | Additional cue when color conveys critical information. |
| [V2 10170] | 226 | Explanations, reasons and consequences of a decision aid's actions. |
| [V2 10171] | 227 | Notification when a situation exceeds that aid's capabilities. |

**Proposed translation:** three distinct states for absence of data, observed change and attention according to a reviewed rule; age of the measurement; text next to color; an explainable next step; visible limits of the aid. These states are our proposal, not a medical classification imposed by the standard. Distinguish "valid data" from "healthy person".

### 3.6. Human Integration Design Handbook, revision 1 [S05]

The cover identifies NASA/SP-2010-3407/REV1, approved on 05/06/2014. Sections of chapter 10 on interfaces, notifications, electronic procedures and information management were reviewed. It is useful historical grounding; for current requirements it is checked against S04.

Sections 10.1–10.2 consider simplicity, consistency, legibility and user control, and describe usability evaluation by effectiveness and efficiency [printed pp. 900–901 / PDF 905–906].

Section 10.9 warns about desensitization from frequent alerts. Section 10.10 proposes integrating relevant information and execution status into electronic procedures [printed pp. 1045 and 1054–1055 / PDF 1050 and 1059–1060].

Sections 10.12.3–10.12.7 deal with operation without ground support, data validity and availability, and backups. A questionable or old measurement must be identified; poor-quality information can harm the decision [printed pp. 1066–1068 / PDF 1071–1073].

**Proposed translation:** a check-in with instructions and data in the same view, preserved progress, recovery and local consultation. The body map must be evaluated by comparing it with a text list: this review provides no evidence that our body representation is superior by itself.

## 4. Spot check against original research

These checks are based on public abstracts of articles, not on a full evaluation of their methods. Their purpose is to show the population and the type of result behind some claims in the reviews.

- **Exercise and bone:** Smith et al. (2012) describe 13 ISS crew members: eight with iRED and five with ARED. Diet, densitometry and biochemical markers were measured. The result favors a combination of exercise and nutrition; the abstract does not allow the whole effect to be attributed to the device or turned into a universal prescription [S14].
- **Sleep:** Barger et al. (2014) conducted an observational study with actigraphy and diaries: 64 astronauts on Shuttle missions and 21 on the ISS. They found reduced sleep before and during flights. This justifies recording sleep and context, but does not validate our personal fatigue algorithm [S15].
- **Vascular assessment:** Marshall-Goebel et al. (2019) prospectively studied 11 ISS crew members using jugular ultrasound. The results document flow changes and a thrombotic event; the small sample and the specialized method prevent inferring thrombosis screening from everyday blood pressure and pulse [S16].
- **Sleep update:** Piltch et al. (early publication 2024; journal volume 2025) studied sleep architecture during long-duration flight. The work reinforces that duration, distribution of stages and measurement method are different dimensions; we must not assign REM/NREM stages to a self-report of hours [S17].

These articles offer results from specific cohorts. No new effect sizes were computed, the samples were not statistically combined and independence among all published datasets is not assumed.

## 5. Matrix: evidence, indicators and project data

The data sources were checked in the NLSP/OSDR review already saved. The implementation priority is a design judgment conditional on the user's choice.

| Domain | Useful measurement or context | Reviewed data available | Limit and proposal |
|---|---|---|---|
| Vital signs | Pulse, blood pressure, respiration and temperature; method, time and activity. | CRF Daily Vitals. | Tracking and contextual review; no automatic diagnosis. Proposed initial priority. |
| Nutrition | Body mass, intake, appetite and changes in eating pattern. | CRF includes weight and meal datasets; detailed calories not verified. | Do not compute energy deficit without sufficient composition and quantities. |
| Hydration | Intake, losses, symptoms and measurements according to protocol. | CRF water and urine datasets; coverage to be validated. | An incomplete balance does not by itself measure plasma volume or clinical dehydration. |
| Sleep and wellbeing | Duration, schedule, perceived rest and work context. | No corresponding series has been verified in the selected files. | Voluntary recording can be added; do not present it as real NASA data if it is not. |
| Physical function | Strength, endurance, VO2 and load tests. | MR079G and MR080G. | Respect protocol and effort; an exercise heart rate is not interpreted as resting. |
| Bone health | DXA, body region, device and phase. | MR035G; OSD-51 provides different molecular research. | Periodic assessment. Mass/pulse do not reconstruct bone density. |
| Immunity | Cellular and functional laboratory results. | BRSMImmune; OSD-56 is cell culture. | Do not synthesize "immunity 80%" from vital signs or gene expression without validation. |
| Vision | Symptoms and documented eye tests. | No diagnostic images were verified in the chosen datasets. | A questionnaire guides consultation; it does not identify SANS or replace OCT/fundoscopy. |
| Environment/radiation | Sensor, location, time, magnitude and unit. | MSD007 and DTO 684; RadLab/EDA pending verification for integration. | Do not mix missions or absorbed, equivalent and effective dose. Do not attribute causation without compatible data. |

A baseline must make explicit the person, period, phase, conditions and method. Comparing with it can show change; establishing a universal window or an attention threshold needs additional justification. A person's earlier normality does not rule out a dangerous result, and the absence of deviation does not prove health.

## 6. Design and evaluation recommendations

The following are inferences for our project, not results of trials of the future application:

1. **Separate quality and interpretation.** Show source, unit, time and availability before assigning clinical meaning. Verify it with cases of missing data, different phases and incompatible units. Grounding: S04 [V2 10020] and S05 §10.12.4.
2. **Connect indicator and action.** Each card must answer what changed, what is known, what is missing and what the supported next step is. Grounding: S03 [V1 3003/3004], S04 [V2 10170/10171].
3. **Organize preventive care.** The check-in can collect nutrition, fluids, exercise and rest, respecting workload and the need for each measurement. Grounding: S01, S03, S07 and S09. Not all exams must be done daily.
4. **Keep state and mission context.** Allow a procedure to be resumed and distinguish pending from completed. Evaluate local operation and restore if that architecture is adopted. Grounding: S05 §§10.10 and 10.12; S04 [V2 10129].
5. **Evaluate the interface with tasks.** Compare map and list by interpretation errors, time to locate a piece of data, understanding of missing information and ability to identify the next step. Grounding: S05 §10.2. Do not set invented target times before knowing users and tasks.
6. **Version rules and content.** Keep the condition of application, source/page, date, population, limitation, action, equipment and review status. This structure is a traceability proposal derived from the heterogeneity of the sources.

No software was implemented and no interface was tested during this review. There are no approved alert values, medication, doses, global health percentage or personalized exercise targets.

## 7. What can be claimed in the presentation

A defensible wording would be: "The proposal is grounded in NASA requirements for preventive monitoring and medical care and in reports on physiological adaptation. It presents measurements and progress with their provenance, explains their limits and guides the next step with traceable content. The demo data reviewed include ground analogs; the clinical efficacy of the system has not yet been evaluated".

It is not appropriate to claim that the app diagnoses SANS, predicts thrombosis, computes personal cancer risk or is certified by NASA. Selecting NASA information does not constitute approval of the app.

## 8. Limits, uncertainties and next academic steps

- A targeted review of selected sources, with partial reading and design questions. There is no PRISMA protocol, exhaustive search, formal bias assessment of each study or meta-analysis.
- The reports reuse bibliography and some cohorts. Several concordant references are not necessarily independent observations.
- A result from LEO, ground bed rest, cells or animals does not automatically generalize to partial gravity or interplanetary missions.
- The covers of the sleep and medical capability reports are old. Claims about technologies and models must be updated for each feature chosen; the spot check of articles does not complete that update.
- The books cover evidence and mechanisms, but do not by themselves contain a complete clinical protocol for each symptom. Specific guides must be identified and their application reviewed before turning guidance into operational rules.
- The earlier data analyses verified samples, not the integrity and coverage of all campaigns. The relations between subjects and sources must be checked.
- A resource that is free to read is not necessarily redistributable in full. Use brief quotations and keep links and attributions; do not copy the full books into the product.

The proposed priority of CRF would be reconsidered if its units, coverage or permissions do not allow the chosen case, or if the user decides to prioritize another domain. The usefulness of the body map would be reconsidered if task tests show more errors or navigation than a list. Each medical rule would be reconsidered in light of a more recent source or a clinical review incompatible with its assumption.

## 9. References

The PDF URLs include the version downloaded by content, not a guarantee that the server will not replace them. `research/source-registry.json` keeps hashes, download date, size and pages examined.

[S01] Smith, S. M., Zwart, S. R., Douglas, G. L., & Heer, M. (2021). *Human Adaptation to Spaceflight: The Role of Food and Nutrition* (2nd ed.). NASA. [Full PDF](https://www.nasa.gov/wp-content/uploads/2024/08/human-adaptation-2021-final-b.pdf).

[S02] Smith, S. M., Zwart, S. R., Kloeris, V., & Heer, M. (2009). *Nutritional Biochemistry of Space Flight*. Nova Science Publishers. [Full PDF hosted by NASA](https://www.nasa.gov/wp-content/uploads/2023/03/nutritional-biochemistry-of-space-flight.pdf).

[S03] NASA. (2023). *NASA-STD-3001, Volume 1: Crew Health*, revision C, approved September 15. [PDF](https://www.nasa.gov/wp-content/uploads/2023/11/nasa-std-3001-vol-1-rev-c-with-signature.pdf).

[S04] NASA. (2026). *NASA-STD-3001, Volume 2: Human Factors, Habitability, and Environmental Health*, revision F, approved July 14. [PDF](https://www.nasa.gov/wp-content/uploads/2025/05/nasa-std-3001-vol-2.pdf).

[S05] NASA. (2014). *Human Integration Design Handbook*, NASA/SP-2010-3407/REV1, revision 1, approved June 5. [PDF](https://www.nasa.gov/wp-content/uploads/2023/03/human-integration-design-handbook-revision-1.pdf).

[S06] NASA HRP. (2022). *Risk of Cardiovascular Adaptations Contributing to Adverse Mission Performance and Health Outcomes*. Approved December 15. [Report](https://humanresearchroadmap.nasa.gov/Evidence/reports/Cardio%20Risk%20EB%202022%20FINAL_4-3-2023.pdf).

[S07] NASA HRP. (2023). *Risk of Impaired Performance due to Reduced Muscle Mass, Strength & Endurance / Risk of Reduced Physical Performance Capabilities due to Reduced Aerobic Capacity*. Approved January 22; index file name dated 2024. [Report](https://humanresearchroadmap.nasa.gov/Evidence/reports/Evidence%20report%20aerobic%20and%20muscle_FINAL%204-3-2024.pdf).

[S08] NASA HRP. (2024). *Risk of Bone Fracture due to Spaceflight-induced Changes to Bone*. HRP-F07-ERFT.R2, approved July 18. [Report](https://humanresearchroadmap.nasa.gov/Evidence/reports/Bone%20Fracture%20Evidence%20Report_07-18-2024.pdf).

[S09] NASA HRP. (2016). *Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload*. Approved April 11. [Report](https://humanresearchroadmap.nasa.gov/Evidence/reports/Sleep.pdf).

[S10] Mehta, S., & Crucian, B. (2022). *Risk of Crew Adverse Health Event Due to Altered Immune Response*. NASA HRP, approved June 1. [Report](https://humanresearchroadmap.nasa.gov/Evidence/reports/IMMUNE%20EB%20Update%202021%20v02%20FINAL_6-15-22.pdf).

[S11] NASA HRP. (2017). *Risk of Adverse Health Outcomes and Decrements in Performance due to In-Flight Medical Conditions*. Approved May 8. [Report](https://humanresearchroadmap.nasa.gov/Evidence/reports/Medical.pdf).

[S12] NASA HRP. (2022). *Risk of Spaceflight Associated Neuro-ocular Syndrome (SANS)*. Approved April 7. [Report](https://humanresearchroadmap.nasa.gov/Evidence/reports/SANS%20EB%202022%20FINAL_8-15-22.pdf).

[S13] NASA HRP. (2026). *Risk of Ionizing Radiation Carcinogenesis*. [Report](https://humanresearchroadmap.nasa.gov/Evidence/reports/HRP-ER-CANCER-SR-20260811.pdf).

[S14] Smith, S. M., et al. (2012). Benefits for bone from resistance exercise and nutrition in long-duration spaceflight: Evidence from biochemistry and densitometry. *Journal of Bone and Mineral Research, 27*(9), 1896–1906. DOI: 10.1002/jbmr.1647. [Public abstract](https://pubmed.ncbi.nlm.nih.gov/22549960/).

[S15] Barger, L. K., et al. (2014). Prevalence of sleep deficiency and use of hypnotic drugs in astronauts before, during, and after spaceflight: An observational study. *The Lancet Neurology, 13*(9), 904–912. DOI: 10.1016/S1474-4422(14)70122-X. [Public abstract](https://pubmed.ncbi.nlm.nih.gov/25127232/).

[S16] Marshall-Goebel, K., et al. (2019). Assessment of jugular venous blood flow stasis and thrombosis during spaceflight. *JAMA Network Open, 2*(11), e1915011. DOI: 10.1001/jamanetworkopen.2019.15011. [Public abstract](https://pubmed.ncbi.nlm.nih.gov/31722025/).

[S17] Piltch, O., Flynn-Evans, E. E., Young, M., & Stickgold, R. (2025; e-published 2024). Changes to human sleep architecture during long-duration spaceflight. *Journal of Sleep Research, 34*(3), e14345. DOI: 10.1111/jsr.14345. [Public abstract](https://pubmed.ncbi.nlm.nih.gov/39523514/).

[S18] NASA HRP. (n.d.). *Human Research Roadmap: Evidence*. Index and explanation of the evidence categories. Consulted on November 14, 2026. [Official site](https://humanresearchroadmap.nasa.gov/Evidence/).

---

## Part two — Recent research and application to the product

Date: November 14, 2026. Extension of the initial review presented in the first part of this document. It is not a systematic review, a meta-analysis or a clinical validation. The following features are proposals for the integrated scope chosen by the user; they are not yet implemented in the mockup.

### Conclusion for the team

I recommend turning the copilot into an aid to **complete and follow up on care with the mission's real resources**. Its main unit would be an episode: what I feel, what we know, what is missing, which procedure I can perform, what happened and what remains pending. Health, adaptation and habitat would feed information into the same episode and the daily plan.

The defensible differentiator is the combination of executable procedures, checking of resources and data quality, and follow-up of the result. It is a value hypothesis we must evaluate against a dashboard; not a claim of a world first. AMOS and other NASA projects already research autonomous assistance and guided procedures.

### 1. Method and traceability

Questions: which human problems justify integrating the three domains? Which support allows action without full medical knowledge? Which results and limitations must be shown? How can usefulness be demonstrated without inventing clinical efficacy?

Human flight studies, relevant ground experiments and NASA documentation on decision support were searched. Main queries: `spaceflight autonomous medical decision support`, `High intensity training during spaceflight`, `Effects of exercise countermeasures multisystem`, `Incomplete recovery bone strength astronauts`, `spaceflight sleep deficiency Barger`, `carbon dioxide cognition astronaut-like`, `AMOS autonomous medical officer support`, and Space Apps evaluation criteria. Web search engine, followed by direct retrieval of texts from PMC, Nature and NTRS.

**Six full texts** were retrieved: five scientific articles (exercise, multisystem function, bone, sleep and CO₂) and an AMOS manuscript deposited as a preprint in NTRS. Relevant sections of methods, results, discussion and limitations were read; individual data and supplements were not reanalyzed. The downloaded responses, sizes and SHA-256 hashes are in the local file `scratch/spaceapps-health/research/ampliacion/downloads.json`; the downloads and extractions are kept in the research workspace and are not included in this repository. Retrieving a file does not mean reviewing every sentence.

The selection favors applicability to the product, free access and human evidence. It excludes commercial material, cellular results as a substitute for clinical status and promotional claims as proof of efficacy. There is selection and language bias, a single reviewer and no preregistered protocol or formal GRADE assessment. Completeness cannot be claimed, nor that these are the latest studies on every topic.

The provenance discipline of `SKILLS/claim-provenance-discipline` is kept: distinguish observed result, generalization limit, design proposal and pending test. Earlier HRP and standards evidence is inherited with its versions and pages from ACADEMIC_BASE.md; it is not presented as a new full verification.

### 2. Findings that change the design

#### A01 — Guiding execution requires checking preparation and errors

**Source:** Ebert et al., *Autonomous Medical Officer Support (AMOS) Software Technology Demonstrations on the ISS*. NTRS 20240012964, 17-page manuscript, deposited as a preprint in 2024. Locators: Methods/Participants/Protocol; Results/Human Factors Observations/Software Use Pattern.

https://ntrs.nasa.gov/citations/20240012964

Two pairs took part on three occasions; the results of one pair were excluded due to a major deviation in the initial review of instructions. The work describes autonomous image acquisition, but also configuration and positioning problems. A restart left an incorrect setting that was not verified again. It does not demonstrate general diagnostic capability or Órbita's efficacy; selection and exclusion limit generalization.

**Incorporate:** explicit preparation, equipment/configuration check, short steps, pause and resume, an "I could not complete it" result, and review before repeating. Distinguish "instruction read", "step performed" and "usable measurement". Do not include ultrasound in the delivery without specific reviewed equipment and content.

**Pending test:** compare preparation omissions and errors with static instructions. If execution does not improve or excessive load is added, revise the flow.

#### A02 — Completing exercise is not the same as keeping all capacities

**Source:** English et al., *High intensity training during spaceflight: results from the NASA Sprint Study*, 2020. DOI: 10.1038/s41526-020-00111-x. Methods/Subjects; Discussion/limitations.

https://pmc.ncbi.nlm.nih.gov/articles/PMC7434884/

It compared Sprint (9 astronauts) with standard care (17). Different measures declined in both groups. Participants chose their group; the standard regimen changed during the study and some postflight tests were done on different days. It is not a randomized trial or proof of equivalence of any routine.

**Incorporate:** separate assigned plan, activity actually performed and physical response. Record device, duration, load where applicable and difficulties. Show strength, endurance and aerobic capacity separately. The app does not by itself prescribe the article's training.

**Pending test:** the user must distinguish "I completed my task" from "my capacity improved"; do not color bone or muscle as healthy for completing a session.

#### A03 — Individual variability matters more than a reassuring average

**Source:** Scott et al., *Effects of exercise countermeasures on multisystem function in long duration spaceflight astronauts*, 2023. DOI: 10.1038/s41526-023-00256-5. Abstract; Methods; Discussion/limitations.

https://pmc.ncbi.nlm.nih.gov/articles/PMC9898566/

Cohort of 46 astronauts: standard exercise did not prevent all deterioration and individual responses were heterogeneous. There was no no-exercise control; diet, medication and other exposures were not fully controlled. Estimates for future missions are projections, not observed events. It shares the ISS 2011–2017 period with Sprint: do not add both sizes as independent participants without checking for overlap.

**Incorporate:** personal comparisons with method, phase and date visible; keep results by system, with no invented global score. An observed change does not prove disease or the causal effect of a countermeasure.

**Pending test:** with incompatible protocols or devices, the system must warn about the difference instead of computing a seemingly homogeneous trend.

#### A04 — Bone health needs history and explicit measurement limits

**Source:** Gabel et al., *Incomplete recovery of bone strength and trabecular microarchitecture at the distal tibia 1 year after return from long duration spaceflight*, 2022. DOI: 10.1038/s41598-022-13461-1. Results; Discussion/limitations; Methods.

https://www.nature.com/articles/s41598-022-13461-1

Follow-up of 17 astronauts (14 men, 3 women), with HR-pQCT, DXA and biomarkers. Nine did not fully recover total tibial density at 12 months according to the study's definition. The sample is small and the follow-up cannot prove lifelong irreversibility. The associations with exercise do not prove an individual causal prescription either.

**Incorporate:** history by region, method and date, with the next assessment according to the plan. DXA, HR-pQCT and body mass are not interchangeable. Do not draw a daily bone density curve from exercise or pulse, or attribute HR-pQCT to the MR035G dataset, which contains DXA.

**Pending test:** when only a preflight exam exists, show "last known assessment" and the absence of a current measurement.

#### A05 — Recorded rest and estimated sleep are different things

**Source:** Barger et al., *Prevalence of sleep deficiency and use of hypnotic drugs in astronauts before, during, and after spaceflight*, 2014. DOI: 10.1016/S1474-4422(14)70122-X. Methods; Results; Discussion/limitations.

https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436/

Observational study with 64 Shuttle and 21 ISS astronauts; on the ISS it estimated 6.09 ± 0.67 hours of sleep during flight. Actigraphy does not measure sleep stages; the work did not directly measure operational errors or cognitive performance. The postflight period may also be influenced by recovery sleep. The study's mean is not a target or a medical threshold for Órbita.

**Incorporate:** time set aside for rest, reported or estimated duration, source, awakenings and personal perception. Integrate rest and plan tasks without turning a bad night into a diagnosis or operational incapacity.

**Pending test:** users must recognize which data they reported and which comes from a device; do not automatically recommend hypnotics.

#### A06 — The environment provides context; it does not identify the cause by itself

**Main source:** Scully et al., *Effects of acute exposures to carbon dioxide on decision making and cognition in astronaut-like subjects*, 2019. DOI: 10.1038/s41526-019-0071-6. Abstract; Methods; Discussion.

https://pmc.ncbi.nlm.nih.gov/articles/PMC6584569/

Ground-based, double-blind crossover trial in 22 participants, with four CO₂ concentrations. It did not find a clear, general dose-response pattern in the tests evaluated. Acute exposure and a ground analog do not prove safety on long missions. By contrast, Law et al. (2014, PMID 24806559; abstract and NASA references located, full text not reviewed) reported an association between CO₂ and headaches on the ISS. These are different outcomes and designs: it is not a direct refutation between studies.

**Incorporate:** time, module, sensor, unit, exposure interval and coverage. Present coincidences and alternative explanations, never "CO₂ caused your fatigue". Do not convert ppm to partial pressure without a compatible total pressure, and do not mix µGy and µSv.

**Pending test:** data from another location or without temporal coincidence must not appear as confirmed personal exposure.

### 3. Proposed priority features

| Feature | Astronaut experience | Evidence that motivates it | Demonstrable scope |
|---|---|---|---|
| Care episode | Brings together symptom, context, action, result and follow-up | A01, A03, A05, A06 | A complete, persistent and exportable journey |
| Resource-aware procedure | Checks equipment, preparation and help needed | A01; NTRS 20240004905 | Two mission configurations; one task available and one blocked |
| Information status | Explains what we know and what is missing, with date and provenance | A03–A06; STD-3001 vol. 2 in the earlier base | Current, old, missing and non-comparable measurement |
| Countermeasure tracking | Distinguishes assigned, done and observed | A02–A04 | Recorded exercise/nutrition and periodic tests; no automatic adjustment |
| Contextual habitat | Places the episode in a compatible module and period | A06 | Identified synthetic environmental series and coverage status |
| Summary for medical support | Keeps changes, actions, difficulties and pending items | NASA operational need; design proposal | Reviewable export; no automatic sending |

The NASA operational background includes equipment, supply and communication constraints: https://ntrs.nasa.gov/citations/20240004905 . The 2025 CDS market presentation accepts solutions with or without AI: https://ntrs.nasa.gov/citations/20250000388 . Their public cards/abstracts were reviewed; they are not effectiveness trials of the product.

#### The copilot's central card

1. **What you recorded:** the astronaut's observation, time and context.
2. **What we know:** relevant measurements with method and age.
3. **What is missing:** data, equipment or review needed.
4. **What you can do:** applicable procedure and its grounding.
5. **What happened:** result, difficulty or interruption.
6. **What comes next:** pending plan item or communication provided for by a reviewed guide.

The initial selection can be implemented with explicit rules written by the team. Generative AI and offline operation remain architecture options; neither is a condition for this journey to be useful.

### 4. Recommended integrated demo

Fully synthetic and labeled case: an astronaut records fatigue. My day shows recorded rest, an unfinished exercise task and environmental data from the module. Adaptation keeps an earlier physical test and an earlier bone exam, without inventing current values. The copilot asks for missing context and proposes a measurement task whose content must be reviewed.

The astronaut confirms equipment and preparation, performs the task and records the result or a difficulty. The episode updates My plan and My progress. Then we change the mission configuration: the equipment is missing. Órbita keeps the episode, explains the limitation and shows only a documented alternative or the need for support. It does not invent a diagnostic replacement.

The differentiating scene is showing that the help changes when resources or information quality change, and that care continues after a number is saved.

To demonstrate substantive use of NASA, add a separate, reproducible case with CRF and an adaptation case from MR079G/MR080G/MR035G, depending on verified files and units. Show provenance, phase and limits. Do not merge them as the same person without a verified correspondence. A bibliographic link alone is not data integration. There are still no verified paired real clinical and environmental series for the integrated episode.

### 5. Mapping to the challenge and evaluation

The challenge goals come from the text provided by the user and kept in REQUIREMENTS.md. The 2026 page and its evaluation guide returned 502/503 errors during this review. The official **2025** guide could be opened; it covers impact, creativity, validity, relevance and presentation. It is used as a provisional reference, **without attributing its format, duration, eligibility or weighting requirements to 2026**.

Guide consulted: https://spaceapps-v2-staging.s3.amazonaws.com/media/documents/Final_Space_Apps_2025_Judging_Guidelines_for_web.pdf

| Goal or provisional dimension | How we would address it | Delivery evidence needed |
|---|---|---|
| Visual self-assessment | Understandable body, adaptation and environment information | The user identifies change, absence and next step |
| Guidance on care and improvements | Grounded procedure and follow-up of the assigned plan | Source, version, scope and review visible; storing symptoms is not enough |
| Impact | Helps complete tasks under constraints | Measurement of errors, omissions and time; without promising clinical benefits |
| Creativity | Help that is sensitive to resources and quality, with continuity of the episode | Show real changes in behavior in two scenarios |
| Validity | Evidence, limits and feasibility | Reproducible data, unit checks and content review |
| Relevance | NASA data and challenge questions integrated into the journey | Verifiable NASA case and explanation of its contribution |
| Presentation | A story from start to follow-up | Demo of features that actually run, with identified simulation |

Substantial open point: the articles justify needs and design, but do not automatically deliver complete operational clinical protocols. To cover treatment guidance responsibly we need to select specific procedures, review their applicability and set medical support criteria with a competent person. A dashboard with citations does not meet that requirement.

### 6. Proposed evaluation before extending features

**Hypothesis:** the guided journey improves execution and understanding compared with a metrics screen with static instructions. It is not proven.

Proposed formative test with 6–8 non-specialist volunteers, equivalent simulated cases and alternating order between interfaces. That size serves to detect usability problems, not to demonstrate clinical efficacy or represent astronauts. Evaluate: omitted steps, correct records, time to find the next step, recognition of missing data and ability to explain the limit of an interpretation. Also record perceived load and requests for help. Do not collect personal medical data for this test.

Minimum cases: full journey; missing equipment; environmental data from another module; old exam; incompatible unit; interrupted procedure; result that requires review according to an identified demo rule. Report real results, including failures, without inventing met percentage targets. Any error that presents missing data as normal or an impossible task as available must be fixed before presenting.

Separate three evaluations: software accuracy, understanding/usability and clinical content review. None replaces the others. Real care would require mission- and device-specific validation and the applicable framework, beyond what this hackathon demonstrates.

### 7. Scalability and scope limits

Technical proposal: our own core managing measurements, episodes, tasks and procedure executions. Add mission configurations with equipment and capabilities; procedures with identifier, version, evidence, prerequisites and review status; and our own data adapters with units and provenance. An execution keeps the version used even if the procedure changes later. This is extensible design, not measured performance or scalability.

All functional code must be written by the team, according to the user's instruction. AMOS and the repositories researched are conceptual inspiration; their code is not copied or adapted. Free access to articles does not authorize redistributing their figures or full texts in the app.

Postpone generative diagnoses, a universal health score, individual prediction from omics and new instrument tests without equipment or validation. This keeps the product integrated and focuses development on a verifiable experience.

**Status of this delivery:** documentary research and proposal, not a modification of the HTML. The current mockup still mainly covers the check-in. The access limits to the 2026 pages and the clinical and data gaps remain open.
