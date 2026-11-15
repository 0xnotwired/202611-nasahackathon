# Órbita: academic extension and differentiating proposal

Date: November 14, 2026. Targeted review, complementary to [ACADEMIC_BASE.md](ACADEMIC_BASE.md). It is not a systematic review, a meta-analysis or a clinical validation. The following features are proposals for the integrated scope chosen by the user; they are not yet implemented in the mockup.

## Conclusion for the team

I recommend turning the copilot into an aid to **complete and follow up on care with the mission's real resources**. Its main unit would be an episode: what I feel, what we know, what is missing, which procedure I can perform, what happened and what remains pending. Health, adaptation and habitat would feed information into the same episode and the daily plan.

The defensible differentiator is the combination of executable procedures, checking of resources and data quality, and follow-up of the result. It is a value hypothesis we must evaluate against a dashboard; not a claim of a world first. AMOS and other NASA projects already research autonomous assistance and guided procedures.

## 1. Method and traceability

Questions: which human problems justify integrating the three domains? Which support allows action without full medical knowledge? Which results and limitations must be shown? How can usefulness be demonstrated without inventing clinical efficacy?

Human flight studies, relevant ground experiments and NASA documentation on decision support were searched. Main queries: `spaceflight autonomous medical decision support`, `High intensity training during spaceflight`, `Effects of exercise countermeasures multisystem`, `Incomplete recovery bone strength astronauts`, `spaceflight sleep deficiency Barger`, `carbon dioxide cognition astronaut-like`, `AMOS autonomous medical officer support`, and Space Apps evaluation criteria. Web search engine, followed by direct retrieval of texts from PMC, Nature and NTRS.

**Six full texts** were retrieved: five scientific articles (exercise, multisystem function, bone, sleep and CO₂) and an AMOS manuscript deposited as a preprint in NTRS. Relevant sections of methods, results, discussion and limitations were read; individual data and supplements were not reanalyzed. The downloaded responses, sizes and SHA-256 hashes are in the local file `scratch/spaceapps-health/research/ampliacion/downloads.json`; the downloads and extractions are kept in the research workspace and are not included in this repository. Retrieving a file does not mean reviewing every sentence.

The selection favors applicability to the product, free access and human evidence. It excludes commercial material, cellular results as a substitute for clinical status and promotional claims as proof of efficacy. There is selection and language bias, a single reviewer and no preregistered protocol or formal GRADE assessment. Completeness cannot be claimed, nor that these are the latest studies on every topic.

The provenance discipline of `SKILLS/claim-provenance-discipline` is kept: distinguish observed result, generalization limit, design proposal and pending test. Earlier HRP and standards evidence is inherited with its versions and pages from ACADEMIC_BASE.md; it is not presented as a new full verification.

## 2. Findings that change the design

### A01 — Guiding execution requires checking preparation and errors

**Source:** Ebert et al., *Autonomous Medical Officer Support (AMOS) Software Technology Demonstrations on the ISS*. NTRS 20240012964, 17-page manuscript, deposited as a preprint in 2024. Locators: Methods/Participants/Protocol; Results/Human Factors Observations/Software Use Pattern.

https://ntrs.nasa.gov/citations/20240012964

Two pairs took part on three occasions; the results of one pair were excluded due to a major deviation in the initial review of instructions. The work describes autonomous image acquisition, but also configuration and positioning problems. A restart left an incorrect setting that was not verified again. It does not demonstrate general diagnostic capability or Órbita's efficacy; selection and exclusion limit generalization.

**Incorporate:** explicit preparation, equipment/configuration check, short steps, pause and resume, an "I could not complete it" result, and review before repeating. Distinguish "instruction read", "step performed" and "usable measurement". Do not include ultrasound in the delivery without specific reviewed equipment and content.

**Pending test:** compare preparation omissions and errors with static instructions. If execution does not improve or excessive load is added, revise the flow.

### A02 — Completing exercise is not the same as keeping all capacities

**Source:** English et al., *High intensity training during spaceflight: results from the NASA Sprint Study*, 2020. DOI: 10.1038/s41526-020-00111-x. Methods/Subjects; Discussion/limitations.

https://pmc.ncbi.nlm.nih.gov/articles/PMC7434884/

It compared Sprint (9 astronauts) with standard care (17). Different measures declined in both groups. Participants chose their group; the standard regimen changed during the study and some postflight tests were done on different days. It is not a randomized trial or proof of equivalence of any routine.

**Incorporate:** separate assigned plan, activity actually performed and physical response. Record device, duration, load where applicable and difficulties. Show strength, endurance and aerobic capacity separately. The app does not by itself prescribe the article's training.

**Pending test:** the user must distinguish "I completed my task" from "my capacity improved"; do not color bone or muscle as healthy for completing a session.

### A03 — Individual variability matters more than a reassuring average

**Source:** Scott et al., *Effects of exercise countermeasures on multisystem function in long duration spaceflight astronauts*, 2023. DOI: 10.1038/s41526-023-00256-5. Abstract; Methods; Discussion/limitations.

https://pmc.ncbi.nlm.nih.gov/articles/PMC9898566/

Cohort of 46 astronauts: standard exercise did not prevent all deterioration and individual responses were heterogeneous. There was no no-exercise control; diet, medication and other exposures were not fully controlled. Estimates for future missions are projections, not observed events. It shares the ISS 2011–2017 period with Sprint: do not add both sizes as independent participants without checking for overlap.

**Incorporate:** personal comparisons with method, phase and date visible; keep results by system, with no invented global score. An observed change does not prove disease or the causal effect of a countermeasure.

**Pending test:** with incompatible protocols or devices, the system must warn about the difference instead of computing a seemingly homogeneous trend.

### A04 — Bone health needs history and explicit measurement limits

**Source:** Gabel et al., *Incomplete recovery of bone strength and trabecular microarchitecture at the distal tibia 1 year after return from long duration spaceflight*, 2022. DOI: 10.1038/s41598-022-13461-1. Results; Discussion/limitations; Methods.

https://www.nature.com/articles/s41598-022-13461-1

Follow-up of 17 astronauts (14 men, 3 women), with HR-pQCT, DXA and biomarkers. Nine did not fully recover total tibial density at 12 months according to the study's definition. The sample is small and the follow-up cannot prove lifelong irreversibility. The associations with exercise do not prove an individual causal prescription either.

**Incorporate:** history by region, method and date, with the next assessment according to the plan. DXA, HR-pQCT and body mass are not interchangeable. Do not draw a daily bone density curve from exercise or pulse, or attribute HR-pQCT to the MR035G dataset, which contains DXA.

**Pending test:** when only a preflight exam exists, show "last known assessment" and the absence of a current measurement.

### A05 — Recorded rest and estimated sleep are different things

**Source:** Barger et al., *Prevalence of sleep deficiency and use of hypnotic drugs in astronauts before, during, and after spaceflight*, 2014. DOI: 10.1016/S1474-4422(14)70122-X. Methods; Results; Discussion/limitations.

https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436/

Observational study with 64 Shuttle and 21 ISS astronauts; on the ISS it estimated 6.09 ± 0.67 hours of sleep during flight. Actigraphy does not measure sleep stages; the work did not directly measure operational errors or cognitive performance. The postflight period may also be influenced by recovery sleep. The study's mean is not a target or a medical threshold for Órbita.

**Incorporate:** time set aside for rest, reported or estimated duration, source, awakenings and personal perception. Integrate rest and plan tasks without turning a bad night into a diagnosis or operational incapacity.

**Pending test:** users must recognize which data they reported and which comes from a device; do not automatically recommend hypnotics.

### A06 — The environment provides context; it does not identify the cause by itself

**Main source:** Scully et al., *Effects of acute exposures to carbon dioxide on decision making and cognition in astronaut-like subjects*, 2019. DOI: 10.1038/s41526-019-0071-6. Abstract; Methods; Discussion.

https://pmc.ncbi.nlm.nih.gov/articles/PMC6584569/

Ground-based, double-blind crossover trial in 22 participants, with four CO₂ concentrations. It did not find a clear, general dose-response pattern in the tests evaluated. Acute exposure and a ground analog do not prove safety on long missions. By contrast, Law et al. (2014, PMID 24806559; abstract and NASA references located, full text not reviewed) reported an association between CO₂ and headaches on the ISS. These are different outcomes and designs: it is not a direct refutation between studies.

**Incorporate:** time, module, sensor, unit, exposure interval and coverage. Present coincidences and alternative explanations, never "CO₂ caused your fatigue". Do not convert ppm to partial pressure without a compatible total pressure, and do not mix µGy and µSv.

**Pending test:** data from another location or without temporal coincidence must not appear as confirmed personal exposure.

## 3. Proposed priority features

| Feature | Astronaut experience | Evidence that motivates it | Demonstrable scope |
|---|---|---|---|
| Care episode | Brings together symptom, context, action, result and follow-up | A01, A03, A05, A06 | A complete, persistent and exportable journey |
| Resource-aware procedure | Checks equipment, preparation and help needed | A01; NTRS 20240004905 | Two mission configurations; one task available and one blocked |
| Information status | Explains what we know and what is missing, with date and provenance | A03–A06; STD-3001 vol. 2 in the earlier base | Current, old, missing and non-comparable measurement |
| Countermeasure tracking | Distinguishes assigned, done and observed | A02–A04 | Recorded exercise/nutrition and periodic tests; no automatic adjustment |
| Contextual habitat | Places the episode in a compatible module and period | A06 | Identified synthetic environmental series and coverage status |
| Summary for medical support | Keeps changes, actions, difficulties and pending items | NASA operational need; design proposal | Reviewable export; no automatic sending |

The NASA operational background includes equipment, supply and communication constraints: https://ntrs.nasa.gov/citations/20240004905 . The 2025 CDS market presentation accepts solutions with or without AI: https://ntrs.nasa.gov/citations/20250000388 . Their public cards/abstracts were reviewed; they are not effectiveness trials of the product.

### The copilot's central card

1. **What you recorded:** the astronaut's observation, time and context.
2. **What we know:** relevant measurements with method and age.
3. **What is missing:** data, equipment or review needed.
4. **What you can do:** applicable procedure and its grounding.
5. **What happened:** result, difficulty or interruption.
6. **What comes next:** pending plan item or communication provided for by a reviewed guide.

The initial selection can be implemented with explicit rules written by the team. Generative AI and offline operation remain architecture options; neither is a condition for this journey to be useful.

## 4. Recommended integrated demo

Fully synthetic and labeled case: an astronaut records fatigue. My day shows recorded rest, an unfinished exercise task and environmental data from the module. Adaptation keeps an earlier physical test and an earlier bone exam, without inventing current values. The copilot asks for missing context and proposes a measurement task whose content must be reviewed.

The astronaut confirms equipment and preparation, performs the task and records the result or a difficulty. The episode updates My plan and My progress. Then we change the mission configuration: the equipment is missing. Órbita keeps the episode, explains the limitation and shows only a documented alternative or the need for support. It does not invent a diagnostic replacement.

The differentiating scene is showing that the help changes when resources or information quality change, and that care continues after a number is saved.

To demonstrate substantive use of NASA, add a separate, reproducible case with CRF and an adaptation case from MR079G/MR080G/MR035G, depending on verified files and units. Show provenance, phase and limits. Do not merge them as the same person without a verified correspondence. A bibliographic link alone is not data integration. There are still no verified paired real clinical and environmental series for the integrated episode.

## 5. Mapping to the challenge and evaluation

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

## 6. Proposed evaluation before extending features

**Hypothesis:** the guided journey improves execution and understanding compared with a metrics screen with static instructions. It is not proven.

Proposed formative test with 6–8 non-specialist volunteers, equivalent simulated cases and alternating order between interfaces. That size serves to detect usability problems, not to demonstrate clinical efficacy or represent astronauts. Evaluate: omitted steps, correct records, time to find the next step, recognition of missing data and ability to explain the limit of an interpretation. Also record perceived load and requests for help. Do not collect personal medical data for this test.

Minimum cases: full journey; missing equipment; environmental data from another module; old exam; incompatible unit; interrupted procedure; result that requires review according to an identified demo rule. Report real results, including failures, without inventing met percentage targets. Any error that presents missing data as normal or an impossible task as available must be fixed before presenting.

Separate three evaluations: software accuracy, understanding/usability and clinical content review. None replaces the others. Real care would require mission- and device-specific validation and the applicable framework, beyond what this hackathon demonstrates.

## 7. Scalability and scope limits

Technical proposal: our own core managing measurements, episodes, tasks and procedure executions. Add mission configurations with equipment and capabilities; procedures with identifier, version, evidence, prerequisites and review status; and our own data adapters with units and provenance. An execution keeps the version used even if the procedure changes later. This is extensible design, not measured performance or scalability.

All functional code must be written by the team, according to the user's instruction. AMOS and the repositories researched are conceptual inspiration; their code is not copied or adapted. Free access to articles does not authorize redistributing their figures or full texts in the app.

Postpone generative diagnoses, a universal health score, individual prediction from omics and new instrument tests without equipment or validation. This keeps the product integrated and focuses development on a verifiable experience.

**Status of this delivery:** documentary research and proposal, not a modification of the HTML. The current mockup still mainly covers the check-in. The access limits to the 2026 pages and the clinical and data gaps remain open.
