# Órbita: third academic extension (series B)

Date: November 14, 2026. Complements [ACADEMIC_BASE.md](ACADEMIC_BASE.md) (S01–S18) and [APPLIED_RESEARCH.md](APPLIED_RESEARCH.md) (A01–A06). Targeted review; it is not a systematic review, a meta-analysis or a clinical validation. The proposals are not implemented.

## What this extension is for

Series S and A ground **what to measure and how to show it** (physical adaptation, sleep, CO₂, procedures). They left four gaps that this series covers:

1. **What actually happens to an astronaut in flight.** "I feel different" had no symptom epidemiology behind it.
2. **Why autonomy matters.** NASA's framework for Earth-independent medical operations and the effect of communication delay were missing.
3. **How a copilot can fail.** Evidence on automation bias and alert fatigue was missing.
4. **How to evaluate rigorously.** The 6–8 volunteer size had no cited backing; neither did the personal baseline or radiation as a career limit.

## Method and reading level

Web search engine on 14/11/2026, with queries by author, title and topic (in-flight symptoms, medication use, headache, low back pain, space motion sickness, Cognition battery, individual monitoring, EIMO, communication delay, automation bias, alert fatigue, usability sample size, radiation exposure limit, MSL RAD, SANS, Astroskin, SOMA). Full text retrieval was attempted; PMC blocked several downloads with a browser check.

Each source carries its **reading level**, which limits what can be claimed from it:

- **FT** — full text read in the methods, results and limitations sections.
- **AB** — public abstract (abstract, NTRS card or PubMed).
- **S** — snippet returned by the search engine or secondary source (press release, citing article). Verify in the original before using a figure in the presentation.

B01, B03, B06, B07 and B09 are FT: B01, B03 and B06 were read on 15/11/2026 from PDFs provided by the user (see "Full reading of 15/11" at the end). Everything else in sections 1–5 is AB or S: it serves to guide the design, not to cite figures without opening the original. Biases: a single AI-assisted reviewer, English language, free access, no formal risk-of-bias assessment. No source evaluates Órbita.

## 1. Which symptoms occur in flight

### B01 — The most recorded symptoms are common and undramatic · FT

Crucian et al. (2016), *Incidence of clinical symptoms during long-duration orbital spaceflight*, Int J Gen Med 9:383–391. DOI 10.2147/IJGM.S114188. https://pmc.ncbi.nlm.nih.gov/articles/PMC5098747

Retrospective review of medical records from 46 long ISS missions (41 astronauts; 34 men and 12 women; 20.57 flight-years), plus secondary sources (notes from private medical conferences, research surveys, debriefings). 70 events were tabulated: 3.40 per flight-year. Skin rashes 23 events (1.12 per flight-year) and congestion, rhinitis or sneezing 20 events (0.97). Eight crew members had no events.

Of the 70, 42 were "notable" (more than a week, recurrent or not responding to treatment), in 21 crew members (46%). **18 of those 42 occurred in the first month**; from month 2 to 6 they were evenly spread (Table 2). One crew member accumulated 9.

Two methodological decisions that matter for Órbita:
- Symptoms such as congestion, nausea, diarrhea or constipation **resolved within the first 30 days were excluded** as space adaptation symptoms. The rate does not include initial adaptation.
- Another 28 events that the evaluators did not link to immunity (gut complaints due to food, abrasions, eye irritation) were excluded.

**Limits the authors state:**
- It is not a standard epidemiological survey: it tabulates recorded symptoms, because a diagnosis is rarely confirmed in flight and treatment follows the presentation.
- The sources were not complete for every crew member; the authors present it as a **minimum** of the real incidence.
- It is a subjective report: with other criteria, the same records would give other numbers. An event without indication of recurrence was counted as new, which may raise the frequency.
- It only covers immune-related categories.

**Internal inconsistency:** the text says 7,058 flight days and the header of Table 1 says 7,508. 20.57 years are about 7,513 days, so the value in the text looks like a typo. Do not use either without clarifying it.

The comparison "25 times more than on the ground" for rashes sets in-flight incidence against the ground **prevalence** of persistent rashes in the general population. They are not the same measure: do not repeat that figure.

**Proposal:** the "I feel different" catalog includes skin and congestion, not just fatigue. Record the **observed symptom**, never a diagnosis, which is how flight medicine operates. Duration and response to what was done are part of the record: they are precisely what turns an event into a "notable" one in this study.

### B02 — Medication reflects the real problems: sleep, pain, congestion, allergy · AB

Wotring (2015), *Medication use by U.S. crewmembers on the International Space Station*, FASEB J 29:4417–4423. DOI 10.1096/fj.14-264838. NTRS manuscript: https://ntrs.nasa.gov/api/citations/20140017010/downloads/20140017010.pdf

Records from 24 crew members on 20 missions longer than 30 days, over 10 years. The most frequent uses were sleep, pain, congestion and allergy. Use was similar to that of ambulatory adults except for sleep aids, about ten times higher. The author suggests that operational changes (schedules, lighting, suits, exercise equipment) could prevent part of those uses.

**Limit:** retrospective, incomplete medical records (see B03); it does not evaluate drug efficacy in microgravity.

**Proposal:** the plan must be able to record **operational causes** next to the symptom (shift change, EVA, exercise session). Órbita does not recommend drugs.

### B03 — What is not asked does not get recorded · FT

Wotring and Smith (2020), *Dose Tracker application for collecting medication use data from International Space Station crew*, Aerosp Med Hum Perform 91(1):41–45. DOI 10.3357/AMHP.5392.2020. It replaces as a source the 2018 conference abstract (DOI 10.3389/conf.fphys.2018.26.00047), which is kept only as background.

iOS app to record medication with a short questionnaire per dose (name, dose, frequency, indication, perceived efficacy, adverse effects), preloaded with the ISS medical kit. 24 subjects were approved; **six completed the in-flight log and five the ground log**, because NASA ended the study early due to usability and software problems. The authors present it as an **observational case series**: the planned statistical analysis could not be done.

Results:
- 5,766 records, including **49 weeks with confirmed "no medication use"**.
- 20.6 records per subject per flight week (standard error 8.4) versus 15.6 on the ground (4.6).
- Variation between people was huge: from **1.2 to 54.7 records per week** in flight (Table I). The average is carried by two or three subjects.
- The most frequent indications were sleep and muscle or joint pain, linked to spacewalks and exercise equipment.

**What the article does not say:** that self-report captured ten times more than medical records **of the same people**. It compares 20.6 records per week with an earlier study (B02) of another cohort, which found 277 reports in 24 crew members, fewer than 12 per person over the whole mission. The difference in volume is real, but it mixes cohort, era and method. The earlier version of this document had read it as a direct comparison.

**Design lessons the authors state** (the most applicable to Órbita in the whole series):
- **Poorly designed security destroyed usability.** Multiple PINs and identifiers to log in, and updates with extra security steps, were the main complaints.
- NASA software rules prevented incorporating users' suggestions about icons and organization.
- Earlier tests in the HERA analog had low fidelity because medication is not allowed there; the authors say more testing before starting would have helped.
- **Privacy as a condition for participation:** the data was not shared with medical staff or with those who decide flight assignments. One crew member asked to share it with their physician, and it had to be approved case by case.
- Crew members used the app in unforeseen ways: documenting tolerance tests before flight, recording the suspension of medication required by another experiment and sharing data with their physician.

**Limits:** six subjects, no independent control group, ended early, unverified self-report.

**Proposals:**
1. **Three states in every record:** I recorded X, I confirmed there was nothing, I did not record. The 49 confirmed weeks are the direct precedent. It reinforces "NA is not zero" with flight evidence.
2. **The astronaut decides who sees what,** and sharing with medical support is an explicit, logged action, not a side effect of using the app.
3. **Data protection cannot cost a step per entry.** Unlock once per session, not per entry.
4. **The record accepts reasons the product did not foresee** (another experiment's protocol, a tolerance test) through a structured note, not a free-text clinical field.

### B04–B06 — The mission phase changes what is expected · AB / S

- **B04 Low back pain.** Kerstman et al. (2012), Aviat Space Environ Med 83:2–7, DOI 10.3357/ASEM.2876.2012. Retrospective: 52% (382/728); mild in 86%, moderate 11%, severe 3%. Stated limits: retrospective, missing data. [AB]
- **B05 Headache.** van Oosterhout et al. (2024), Neurology 102(7), DOI 10.1212/WNL.0000000000209224. Prospective, 24 astronauts (ESA, NASA, JAXA), 3,596 days; 22 had at least one episode. First week: 51 headaches in 21 astronauts, more intense and with migraine features; afterwards, predominantly tension-type. None in the three months after return. Self-report; association, not causation. [S: AAN press release]
- **B06 Space motion sickness.** Khalid et al. (2023), *Pharmacological and non-pharmacological countermeasures to Space Motion Sickness: a systematic review*, Front. Neural Circuits 17:1150233, DOI 10.3389/fncir.2023.1150233. [FT]
  - It affects about 70% of astronauts in the first 72 hours **of the outbound trip and also of the return** to gravity. The most destabilizing effects run from day 1 to 5 and reappear in the first 10 days after returning. Both figures are **second-hand citations** (Heer and Paloski 2006; Oman et al. 1986): verify in the original before presenting them.
  - Symptoms: nausea, dizziness, vertigo, fatigue, headache, vomiting, cold sweat, loss of appetite.
  - Review registered in PROSPERO: 3,207 abstracts, 23 studies included (17 pharmacological, 5 non-pharmacological, 1 comparing both). **No countermeasure proved superior.** The authors point to heterogeneous methods, lack of a standard evaluation protocol, small and almost exclusively male samples, reliance on self-report and unpublished agency data.
  - The most frequent adverse effect of promethazine was drowsiness.

**Proposal:** the **mission phase** (first days, cruise, pre-return, postflight) is context data the episode must keep. "Frequent in this phase according to [source]" can be shown as context. B01 and B06 agree that the first month concentrates events, and B06 adds that **the return is another risk phase**: postflight is not "end of mission" for the history.

B06 also confirms why Órbita does not recommend countermeasures: not even a systematic review could say which works best.

**Line that cannot be crossed:** frequent does not mean benign. The 3% of severe low back pain exists. The phase must never be used to reassure or to rule out a review.

## 2. Why autonomy matters

### B10 — NASA defines the problem as progressive independence from Earth · AB

- Russell et al. (2023), *The value of a spaceflight clinical decision support system for earth-independent medical operations*, npj Microgravity 9:46. DOI 10.1038/s41526-023-00284-1.
- *EIMO Concept of Operations*, NTRS 20250000009. https://ntrs.nasa.gov/citations/20250000009
- *Challenges in Communications for Exploration Class Missions*, NTRS 20250002660. https://ntrs.nasa.gov/citations/20250002660

Today medical expertise and decisions are on Earth. In deep exploration the crew will have to detect, diagnose, treat and prevent autonomously, with little prior medical training time. The ConOps proposes a **gradual** handover of decisions. The communications analysis identified 75 medical capabilities that produce data out of 635 in the IMPACT database, and concludes that relying on Earth to decide can mean delays of hours or days.

**Limit:** these are concept documents and a perspective article with "preliminary data"; they do not prove the efficacy of any system.

**Proposal:** Órbita's **mission configuration**, which today only covers equipment, should include the **communication mode** (real time, delayed, no link). With delayed communication, "Prepare summary" is an asynchronous, self-contained message, and the procedure cannot depend on a reply. This aligns the project's differentiator with the vocabulary NASA uses.

### B11 — Communication delay degrades joint work · AB / S

Kintz and Palinkas (2016), Aerosp Med Hum Perform 87(11):940–946, DOI 10.3357/AMHP.4626.2016. Feasibility study on the ISS about communication delays. A 2026 HRP presentation (Holden et al., NTRS 20260002621) summarizes adverse effects with delays of 50 seconds or more on wellbeing, cohesion and performance. [AB; exact sample size not verified in the original]

**Limit:** very small sample; the authors themselves warn that the effect may be underestimated in complex tasks.

**Proposal:** the summary for medical support must be understandable without back-and-forth: what happened, what was measured, with which method, what is missing and what is being asked.

## 3. How a copilot can fail

### B12 — Wrong advice drags the user along · AB

Goddard, Roudsari and Wyatt (online 2011; volume 2012), *Automation bias: a systematic review of frequency, effect mediators, and mitigators*, JAMIA 19(1):121–127. https://pmc.ncbi.nlm.nih.gov/articles/PMC3240751

Systematic review: 74 studies included out of 13,821 retrieved. Automation bias produces errors of **commission** (following incorrect advice) and **omission** (not noticing what the system did not warn about). A later article citing it (https://pmc.ncbi.nlm.nih.gov/articles/PMC7651899) summarizes that the meta-analysis found a 26% higher risk of commission error with incorrect support versus no support. Mediators: workload, complexity, time pressure, trust. Mitigators: training, user accountability, position of the advice on screen, updated confidence levels.

**Limit:** studies mostly with clinicians on the ground; the 26% figure comes from few studies and we take it from a source that cites it.

**Proposal:**
- Show **the data first** and the suggestion afterwards.
- Every suggestion carries its grounding and what was **not** assessed.
- The omission error is the most dangerous for Órbita: the copilot's silence must not be read as "all fine". Explicitly show "there is no reviewed rule for this".
- It matches NASA-STD-3001 [V2 10170/10171], already cited in S04.

### B13 — Repeating alerts makes them ignored · AB

Ancker et al. (2017), BMC Med Inform Decis Mak 17:36. DOI 10.1186/s12911-017-0430-8. https://pmc.ncbi.nlm.nih.gov/articles/PMC5387195

Retrospective cohort, 112 primary care clinicians, 2010–2013. Acceptance of a reminder fell 30% for each additional reminder in the same visit. There was no effect of workload itself, nor progressive desensitization to new alerts.

**Limit:** ground primary care, not crews.

**Proposal:** an episode groups its pending items into **one** alert. The same reminder is not repeated for the same situation. It completes the grounding of HIDH §10.9 (S05).

## 4. How to evaluate rigorously

### B14 — Five users are not enough; eight do not guarantee it either · AB / S

Faulkner (2003), *Beyond the five-user assumption*, Behav Res Methods Instrum Comput 35(3):379–383. DOI 10.3758/bf03195514.

Test with 60 participants and repeated sampling. Groups of 5 found on average 85% of the problems, but some only 55%. With 10, no group fell below 80%; with 20, below 95%. [figures taken from sources citing the article]

**Proposal:** keep the 6–8 formative test already in FINAL_PROPOSAL.md, but state that **it may leave an appreciable fraction of problems undetected**. If there is time, go up to 10. Two small rounds with fixes in between are better than a single one.

### B07 — Cognitive performance: stable on average, with a practice effect · FT

Dev et al. (2024), *Cognitive performance in ISS astronauts on 6-month low earth orbit missions*, Front. Physiol. 15:1451269. DOI 10.3389/fphys.2024.1451269.

25 astronauts, Cognition battery (10 subtests) at five time points: about 90 days before launch, 30 days after, 30 before return, and 10 and 30 days after landing. Overall speed and accuracy stable; slowing early in flight in processing speed, visual working memory and sustained attention. 11.8% of the in-flight and postflight scores fell 1.5 standard deviations or more below the prior mean.

**Limits the authors state:** small sample; practice-effect corrections may not fit; workload and other stressors were not measured; **the operational meaning** of the changes is unknown; clinical thresholds may not suit a high-performing population.

**Proposal:** if Órbita adds any repeated self-test, it must warn that **improving with repetition is expected** and not confuse it with recovery. The 1.5 SD is a descriptive criterion of the study: do not use it as an alarm.

### B08 — The Cognition battery · AB

Basner et al. (2015), Aerosp Med Hum Perform 86(11):942–952, PMID 26564759. Ten short tests designed for astronauts; practice effects and test-retest variability differ greatly between tests. Conceptual reference: Órbita does not reimplement it or copy its code.

### B09 — The baseline belongs to each person · FT

Zheng et al. (2023), *Time-resolved molecular measurements reveal changes in astronauts during spaceflight*, Front. Physiol. 14:1219221. DOI 10.3389/fphys.2023.1219221. https://pmc.ncbi.nlm.nih.gov/articles/PMC10376710

Retrospective longitudinal analysis of 27 astronauts (19 men, 8 women), mean flight of about 165 days, with blood and urine metabolites, immune profiles and physiological measures. Each person was compared with **their own** preflight value. Frequent changes: bone resorption markers (in 21 astronauts), urinary sodium and volume, serum minerals, vitamin D, immune cells. Several persisted after return.

**Limits:** small sample; uneven sampling and missing data, so it was averaged over eight windows; the effect of diet or landing was not fully separated; data not public in identifiable form (access by request to LSDA).

**Proposal:** it supports comparison **against one's own baseline**, which the project already proposes, and shows the cost of irregular sampling: Órbita must show how many measurements support each comparison. These are laboratory analyses; they are not derived from vital signs.

## 5. Habitat and senses: two concrete pieces

### B15 — Radiation: a career limit, not a daily alarm · AB / S

- NASA-STD-3001 vol. 1 [V1 4030]: the total career effective dose from flight radiation must be below 600 mSv, the same for every age and sex. [V1 4031]: protection against the reference solar event below 250 mSv. Technical brief OCHMO-TB-020: https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf
- National Academies (2021), *Space Radiation and Astronaut Health*, DOI 10.17226/26155: the limit is derived from the risk of radiation-induced cancer death for the most susceptible person in the model; chapter 4 covers how to communicate that risk.
- Zeitlin et al. (2013), Science 340:1080–1084, DOI 10.1126/science.1235989: the RAD detector measured about 1.8 mSv/day of galactic cosmic rays in cruise to Mars; a round trip would equal 0.66 ± 0.12 Sv with comparable shielding and propulsion.

**Limit:** the standard is a **program** requirement, not a personal clinical rule. RAD measured inside an uncrewed spacecraft, with its shielding and its moment in the solar cycle.

**Proposal:** in Habitat, show **cumulative** dose with unit and source, next to the career limit labeled "NASA program requirement". Do not compute a personal cancer probability (already excluded in S13). The Mars case explains in one line why it matters: the transit alone is already close to the limit. Verify that 600 mSv is still current in revision C of S03 before showing it.

### B16 — Vision: several tests with very different equipment · AB

Lee et al. (2020), *SANS: a review and an update*, npj Microgravity 6:7, DOI 10.1038/s41526-020-0097-9. On the ISS there is visual acuity, Amsler grid, ophthalmoscopy, tonometry, fundus photography, orbital ultrasound and OCT. A prospective cohort (Macias et al., Ocular Health study) followed 11 astronauts with quantitative imaging. [S]

**Proposal — candidate for the two-configuration demo:** a vision check is a good example of a resource-sensitive procedure, because the same concern admits tests with very different equipment. With OCT available the procedure is enabled; without it, it stays blocked and explains why.

**Line that cannot be crossed:** a simple test **is not equivalent** to OCT and does not identify SANS (already established in S12). Which test is a documented alternative to which is decided by a reviewed clinical source, not by the team.

### B17–B18 — Sensors and open data: leads, not decisions · AB / S

- **B17 Astroskin / Bio-Monitor (CSA).** Garment with sensors evaluated in the HERA analog (16 participants, 24-hour sessions; NTRS card 20190001996). According to the CSA chief medical officer, vital signs on the ISS are **not** recorded continuously but during exercise and spacewalks. [S] Consequence: Órbita's design of guided point measurements is realistic for current operations.
- **B18 SOMA / Inspiration4.** Overbey et al. (2024), Nature 632:1145–1154, DOI 10.1038/s41586-024-07639-y; *Molecular and physiological changes in the SpaceX Inspiration4 civilian crew* (2024), Nature 632:1155–1164, DOI 10.1038/s41586-024-07648-x. Civilian crew of four with smartwatches, portable ultrasound and cognitive tests; data hosted in OSDR. **Candidate to investigate** as a source of human flight data with wearables. Files, formats and permissions were not verified; four people on a short flight do not represent a long mission.

## 6. Aerobic capacity: what astronauts do and what is known

Added on 15/11/2026 to answer which exercises an astronaut does to maintain their aerobic capacity. A02, A03 and S07, which were already in the repository, were reread, and B19–B26 were added.

**How it was read.** The texts marked FT were retrieved in full, but they were read through an automated extraction tool, not page by page. Before stating a figure in the presentation, open the PDF and check it. This warning applies to the whole section.

### What they do: equipment and routines on the ISS

**US segment (NASA, ESA, CSA, JAXA).** Aerobic work is done on a treadmill (TVIS until 2009 or 2010, then T2) and on a cycle ergometer (CEVIS). Strength is trained separately with ARED. [A03, B22]

- **Time allotted.** 2.5 hours of physical training per day, 6 days a week, of which one hour is cardiovascular. That time includes changing, hygiene and setting up the equipment. Most crew members also trained on the seventh day. [B22, FT]
- **What 46 astronauts actually did (2011–2017).** About 600 minutes per week of aerobic and strength work combined. Median of 65 sessions on CEVIS and 84 on T2, of about 26–27 minutes each. [A03, FT]
- **Standard care (Sprint control group).** Continuous or interval exercise on CEVIS or T2, 6 days a week, typically 30 to 45 minutes per day. The cycle ergometer was prescribed by percentage of VO2peak and the treadmill by percentage of maximum heart rate. Intervals became routine around 2017. [A02, FT]
- **Sprint protocol.** Intervals 3 days a week, alternating sessions of 8 × 30 s, 6 × 2 min and 4 × 4 min, with mean peak heart rate above 90% of maximum. On another 3 days, 30 continuous minutes at 75% of VO2peak. [A02, FT]
- **The agencies prescribed differently.** NASA: treadmill 4 days and cycle ergometer 2 days a week (expeditions 1–20), with the treadmill self-selected. CSA: at least one interval session a week on each device. JAXA: about 3 treadmill and 3 cycle ergometer sessions a week, of 30 to 45 minutes, controlled by heart rate or the Borg scale. [B22, FT]
- **Treadmill load.** The runner is held by a harness. NASA started at about 60% of body weight with a target of 100%. None of the ESA astronauts reached 100%, and for most of them high loads proved intolerable. [B22, FT]

**Russian segment.** The routine is organized in a 4-day microcycle: 3 loading days and 1 day of active rest. Training is twice a day, about 2.5 hours in total, on the treadmill (TVIS, later BD-2) and on a cycle ergometer. The basis is interval training, not continuous running. One day combines walking or jogging with fast running at 12–14 km/h, another works more with the treadmill in passive mode and another does steady running in stretches of up to 4–6 minutes. [B23, FT]

### What is measured: four different methods

| Method | What it is | Source |
|---|---|---|
| Measured VO2peak | Test to maximum on a cycle ergometer with gas analysis | B20 (AB), S07 (S) |
| Aerobic capacity index | Estimate: the heart rate–VO2 relationship from three submaximal stages is extrapolated to the preflight maximum heart rate. **Not validated in flight** | B19 (FT) |
| Russian MO-3 tests | Monthly 11-minute treadmill locomotor test and a cycle ergometer test in three steps of 125, 150 and 175 W | B23 (FT) |
| MR080G ground analog | VO2, VCO2, RER and heart rate by stage, in an analog | [DATASETS.md](DATASETS.md) |

**They are not interchangeable.** A series that mixes measured VO2peak with the estimated index is not a trend. This is rule R3 of [CONTRACTS.md](CONTRACTS.md) applied to a concrete case.

### What is known: results

- **Standard exercise does not fully protect.** In 46 astronauts, VO2peak fell on average 7.4% ± 2.0% between before and after flight. There was no group without exercise, so how much it would have fallen without it is unknown. [A03, FT]
- **Sprint did not outperform standard care on VO2peak.** Both groups together fell 6.1%, with no group × time interaction. Participants chose their group, the sample was small, the control changed during the six years of the study and the postflight tests were done on different days (R+1 versus R+3). [A02, FT]
- **The drop is larger at the start.** The estimated index falls at the start of the flight and rises almost linearly over a typical mission. Five days after landing it is below preflight and at 30 days it recovers. Sample of 37 astronauts on missions of 48 to 219 days. [B19, FT]
- **Measured directly:** in 14 astronauts, VO2peak on flight day 15 was 17% lower than before (95% CI −22% to −13%). It rose during flight and recovered 30 days after return. [B20, AB]
- **Variation between people is huge.** In 11 astronauts, the change ranged from +5% to −30%. Time and intensity of aerobic exercise were independently associated with the change. [B21, AB]
- **The HRP evidence report** cites preliminary data from 47 crew members according to which only a minority responded well to the prescription. That data is unpublished and is collected in a synthesis document: **it does not go into the presentation.** [S07, S]
- **The Russian program** reports that the interval group kept its maximum running speed in flight and the aerobic group did not. The groups were small and most of the second group's postflight tests were incomplete. [B23, FT]

### Why in-flight exercise data has gaps

Three independent sources say so:

- **Unreliable heart rate.** Measuring heart rate during exercise on the ISS proved much harder than expected, due to electromagnetic interference, engineering constraints and few resources to fix failures. [B24, FT]
- **Incomplete data.** Not all cosmonauts used a heart rate monitor, and treadmill loads did not always reach the ground. [B23, FT] Intensity data were sparse and in-flight heart rate was often unreliable; the authors found no correlation between equipment use and change in the index. [B19, FT]
- **Equipment that fails and schedules that slip.** Repairs could take months or years, sessions were postponed due to schedule conflicts, and the prescription took days to update because of communication delay. [B22, FT]

### Exploration missions: less equipment

- **Orion.** The device chosen for Artemis is a flywheel (Orion Flywheel), which allows rowing as aerobic exercise and squats or deadlifts for strength. It takes up little volume, needs no power and **its efficacy has not yet been fully evaluated**. [B26, AB]
- **No treadmill.** The equipment planned for lunar transit, a lunar orbital station and Mars habitats does not include a treadmill. That running more and more intensely reduces aerobic loss is suggested but **not experimentally confirmed**. There is an ongoing study on exercising without a treadmill. [B25, AB]
- **What this implies.** The list of aerobic activities depends on the spacecraft. It is mission configuration, like the rest of the equipment.

### Errors found in the sources

- **Scott 2023 (A03) contradicts itself.** A sentence in Results says treadmill volume was *inversely* associated with VO2peak. Figure 3d shows a *positive* association for treadmill load volume, and the Discussion agrees with the figure. **Do not cite that association.**
- **Maximum T2 speed.** Sprint (A02) gives 19.3 km/h. The HRP report (S07) gives 5.5 m/s and 12.4 mph, which do not match that figure or fully match each other. **Do not cite the speed.**

### B19–B26: cards

- **B19 · FT.** Moore, Lynn and Feiveson (2015), *The First 10 Years of Aerobic Exercise Responses to Long-Duration ISS Flights*, Aerosp Med Hum Perform 86(12, suppl.):A78–A86, DOI 10.3357/AMHP.EC10.2015.
- **B20 · AB.** Moore et al. (2014), *Peak exercise oxygen uptake during and following long-duration spaceflight*, J Appl Physiol 117(3):231–238, DOI 10.1152/japplphysiol.01251.2013. The conference abstract in NTRS (20140003748) and the press release were read; not the article.
- **B21 · AB.** Downs et al., *Contributions of Astronauts Aerobic Exercise Intensity and Time on Change in VO2peak during Spaceflight*, conference abstract, NTRS 20140003747. Year not verified.
- **B22 · FT.** Loehr et al. (2015), *Physical Training for Long-Duration Spaceflight*, Aerosp Med Hum Perform 86(12, suppl.):A14–A23, DOI 10.3357/AMHP.EC03.2015. The tables came out jumbled in the extraction and the figures are missing.
- **B23 · FT.** Kozlovskaya et al. (2015), *Russian Countermeasure Systems for Adverse Effects of Microgravity on Long-Duration ISS Flights*, Aerosp Med Hum Perform 86(12, suppl.):A24–A31, DOI 10.3357/AMHP.EC04.2015.
- **B24 · FT.** Loerch (2015), *Exercise Countermeasures on ISS: Summary and Future Directions*, Aerosp Med Hum Perform 86(12, suppl.):A92–A93, DOI 10.3357/AMHP.EC12.2015. A short synthesis article, with no figures of its own.
- **B25 · AB.** Varanoske, Strock, Prejean and Marshall-Goebel, *Determining the Importance of In-Flight Treadmill Running Capabilities for Maintaining Astronaut Health and Performance*, presentation at the AsMA meeting of May 2024, NTRS 20230014911.
- **B26 · AB.** *Comparison of Orion Flywheel to Commercially Available Flywheel Device*, abstract in NTRS 20250000276. Complement: HRP poster on the flywheel's development, NTRS 20230001466 (S), which gives 30 minutes of exercise per crew member per day.

Rereadings: A02 (FT), A03 (FT) and S07 (S; about a third of the document read).

## What changes in the product

| # | Proposed change | Sources | Effort |
|---|---|---|---|
| 1 | Three states in every record: I recorded, I confirmed there was nothing, I did not record | B03 | Low; it is data model |
| 2 | Catalog of observations with skin, congestion, headache, back, sleep, nausea | B01, B02, B04–B06 | Low |
| 3 | Mission phase as episode context, without using it to reassure | B04–B06 | Low |
| 4 | Communication mode in the mission configuration; self-contained summary | B10, B11 | Medium |
| 5 | Data before suggestion; explicit "there is no reviewed rule" | B12 | Low; it is screen order and text |
| 6 | One alert per episode, no repetition | B13 | Low |
| 7 | Show how many measurements support each comparison with the baseline | B07, B09 | Medium |
| 8 | Cumulative dose against the career limit, labeled as a program requirement | B15 | Medium |
| 9 | Vision check as the procedure for the two-configuration demo | B16 | Depends on reviewed clinical content |
| 10 | State the expected coverage of the usability test | B14 | None; it is wording |
| 11 | Record each aerobic session with equipment, modality (continuous or intervals), duration, intensity and its measure (% max HR, % VO2peak, Borg, speed, power) and harness load | A02, B22, B23 | Medium; touches catalogs and contract |
| 12 | Store the method of each aerobic measurement (measured VO2peak, estimated index, Russian test, analog) and do not join methods in the same series | B19, B20, B23 | Low; it is rule R3 |
| 13 | Available aerobic equipment as part of the mission configuration (ISS versus Orion) | B25, B26 | Low |
| 14 | Compare activities only within the same person, with "associated with" and with missing heart rate as *not recorded* | A02, A03, B19, B21, B24 | Low; it is text and data model |

Changes 1, 5 and 6 are the cheapest and the ones that most improve the project's defense: they answer "how do you know your copilot does not make things worse?" with evidence.

## What does not change

- There are still no approved thresholds, diagnoses or treatments. No source in this series provides them.
- Symptom frequencies describe cohorts; they do not predict a person.
- None of these cohorts is joined with the datasets in DATASETS.md.
- All code is original. Cognition, Dose Tracker, Astroskin and AMOS are conceptual references.

## Verification pending before presenting

- Open the original of every source marked AB or S before stating a figure out loud. Priority: B05, B12, B14, B15. B01, B03 and B06 were already read in full on 15/11.
- Confirm [V1 4030] in revision C of NASA-STD-3001 vol. 1, which is already listed as S03.
- Check possible cohort overlap: B01, B02, B07 and B09 use ISS crews from nearby periods. Do not add their sizes as independent people.
- B18: verify in OSDR which wearable files exist and under which license.
- Section 6: check against the PDF every figure from B19, B22, B23 and A02–A03 before stating it; they were extracted with an automated tool. Open the B20 article (only the abstract was read). Do not cite the treadmill association in A03 or the maximum T2 speed.
- Check cohort overlap in section 6: A02, A03, B19, B20 and B21 are ISS crews from overlapping periods.

## AI use record

Search, reading and writing assisted by Claude (Anthropic) on 14/11/2026, at the user's request. The figures come from the abstracts and texts indicated; no data was generated. The matrices are in [RESEARCH_MATRIX_B.csv](RESEARCH_MATRIX_B.csv).

Section 6 (B19–B26) was searched for and written with Claude on 15/11/2026. The full texts were read through automated extraction; the figures must be checked against the originals before being presented.

The English translation of this document (15/11/2026) was also done with Claude; the Spanish original is kept on the `claude` branch.

## Full reading of 15/11/2026

The user provided three articles in PDF (one of them uploaded three times with identical content). They were read in full: methods, results, tables, discussion and limitations.

| Source | Before | After | What changed |
|---|---|---|---|
| B01 Crucian 2016 | AB | FT | Figures confirmed. Added the exclusion of the first 30 days, the concentration of notable events in month 1, the minimum character, a typo in flight days and a ground comparison better not repeated |
| B03 Dose Tracker | AB (conference abstract) | FT (peer-reviewed article, 2020) | **Correction:** the comparison "ten times more than medical records" is between different cohorts, not within the same people. Added the variation between subjects, the early end and design lessons on security and privacy |
| B06 Khalid 2023 | AB | FT | The 70% includes the return. The figure is second-hand. The review found no superior countermeasure |

The PDFs are not uploaded to the repository: B03 has no open license and the project rule is not to redistribute full texts.
