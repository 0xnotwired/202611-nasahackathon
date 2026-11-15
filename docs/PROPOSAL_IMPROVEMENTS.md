# Órbita: what to improve from the original proposal

Date: November 14, 2026. Review of [FINAL_PROPOSAL.md](FINAL_PROPOSAL.md) against the third academic extension ([EXTENDED_RESEARCH_B.md](EXTENDED_RESEARCH_B.md), sources B01–B18). Requested by the user. Everything below is a **proposal by the assistant**; it becomes a decision when the user or the team confirms it.

## Verdict

The original proposal is solid where it is hardest: it does not invent clinical content, keeps cohorts separate and distinguishes what is implemented from what is pending. Its weak point is elsewhere: it describes **how the product behaves**, but leaves unspecified four things that a judge, or an agent implementing it, will ask about.

| # | Gap in the original proposal | Why it matters | Improvement |
|---|---|---|---|
| 1 | "I feel different" does not say which observations it offers | The only example is fatigue; there is no evidence of what happens in flight | Catalog grounded in B01, B02, B04–B06 |
| 2 | "Missing data" is a single state | It mixes "nothing happened" with "I didn't write it down" | Three record states (B03) |
| 3 | The mission configuration only covers equipment | NASA's autonomy argument is delayed communication | Communication mode (B10, B11) |
| 4 | It does not say how it keeps the copilot from inducing errors | It is the most predictable objection to any health "copilot" | Presentation rules (B12, B13) |
| 5 | Habitat names radiation without saying what it is compared against | A bare dose number communicates nothing | Cumulative dose against a program limit (B15) |
| 6 | The two-configuration demo has no chosen procedure | Without a concrete procedure there is no demo | Candidate: vision check (B16) |
| 7 | The 6–8 volunteer test has no backing or stated limit | An evaluator may read it as validation | State the expected coverage (B14) |
| 8 | There is no data model | Six screens "share records" without defining the record | See [AGENT_ROADMAP.md](AGENT_ROADMAP.md) |
| 9 | It does not consider who sees the data or how much protecting it costs | A flight study was shut down because of the usability of its security | Low-cost privacy (B03, M9) |

## Improvements, one by one

### M1 — Catalog of observations with evidence

**Before:** the astronaut "records a symptom".
**After:** they choose from a short catalog whose origin is visible: skin, congestion, headache, back pain, sleep, nausea or dizziness, fatigue, vision, and "other".

Each entry carries the source that justifies its presence. The catalog records the **observed symptom**, never a diagnosis: that is how flight medicine operates according to B01, where a diagnosis is rarely confirmed on board.

**Limit:** B01 only covers immune-related categories; fatigue and vision come in through S09 and S12, not B01. The list is a design choice, not a validated clinical instrument.

### M2 — Three record states

**Before:** present or absent.
**After:**

| State | Meaning | Text on screen |
|---|---|---|
| Recorded | There is a value or observation | The value, with method and time |
| Confirmed nothing new | The astronaut stated nothing happened | "Nothing new, confirmed on [date]" |
| Not recorded | Nobody wrote anything down | "Not recorded" |

It is the cheapest and best-grounded improvement: in B03 (a peer-reviewed article, read in full), crew members recorded **49 weeks of confirmed "no medication use"**. Without that explicit record, those weeks would have been indistinguishable from weeks in which nobody wrote anything down.

**Hard rule:** "not recorded" is never shown or exported as "nothing new". When in doubt, "not recorded" wins: the opposite error presents as healthy someone about whom nothing is known.

### M3 — Communication mode in the mission configuration

**Before:** the mission is configured by equipment present or absent.
**After:** two independent axes.

- **Equipment:** which instruments are available.
- **Communication:** real time, delayed or no link.

With delayed communication, "Prepare summary" produces a message that can be understood without back-and-forth: what happened, what was measured and how, what is missing, what is being asked. With "no link", the summary is saved as pending to send and the screen says so.

This aligns Órbita with NASA's vocabulary (Earth-independent medical operations, B10) without promising diagnostic autonomy. The two-configuration demo gains a second axis without duplicating work.

**Limit:** B10 are concept documents. They do not prove that such a system improves outcomes.

### M4 — Rules so the copilot does not induce errors

1. **Data before suggestion.** The card first shows what was recorded and what is missing; the suggestion comes after.
2. **Explicit silence.** If there is no reviewed rule for a situation, the card says "There is no reviewed guidance for this". The copilot's silence must not be read as "all fine": that is the omission error described in B12.
3. **Every suggestion declares what it did not assess.**
4. **One alert per episode.** Pending items are grouped; the same reminder is not repeated (B13).

**Limit:** B12 and B13 study clinicians on the ground. They are the best evidence available, not evidence in crews.

### M5 — Radiation with a reference

**Before:** Habitat shows radiation "according to available data".
**After:** the mission's **cumulative** dose, with unit, sensor and coverage, next to a single reference value labeled "career limit, NASA program requirement" (B15).

No personal cancer probability is computed and the value is not colored as a health state. The limit is a program limit, not an individual clinical rule.

**Blocker before showing it:** confirm requirement [V1 4030] in revision C of NASA-STD-3001 vol. 1 (S03). The 600 mSv value was read in a technical brief, not in the standard.

### M6 — Candidate procedure for the demo

The original proposal asks for "a relevant measurement procedure" without choosing it. Without that choice the demo cannot be built.

**Candidate:** vision check. On the ISS, tests with very different equipment coexist (B16), so the same reason for consultation behaves visibly differently depending on the equipment.

**Second, simpler candidate:** vital signs measurement with blood pressure and ECG equipment, whose demo data already exists in CRF Daily Vitals.

**What the team cannot decide:** which test is a documented alternative to which. A simple test is not equivalent to OCT (S12). Until there is a reviewed clinical source, the procedure without equipment is shown as **blocked with a reason**, with no alternative.

### M7 — Evaluation with its limits stated

Keep the 6–8 volunteer formative test and add one line: with groups of that size an appreciable fraction of problems may go undetected (B14). Prefer two small rounds with fixes in between.

Add a test case the original proposal did not have: **the user must distinguish "not recorded" from "nothing new"**.

### M9 — Privacy that does not cost a step per entry

**Origin:** full reading of B03 on 15/11/2026. It is the most direct design lesson in the series, and the original proposal did not have it.

Dose Tracker was ended early due to usability problems, and the main complaint was the multiple PINs and identifiers needed to log in. At the same time, privacy was a condition for participating: the data did not reach those who decide flight assignments.

**After:**
- The astronaut decides who sees each part of their history. Sharing with medical support is an explicit action, with a log of what was shared and when.
- Unlocking happens once per session, not per entry.
- A record accepts reasons the product did not foresee (another experiment's protocol, a tolerance test) through a structured note; no free-text clinical field is enabled.

**Limit:** a single study of six people, and its software had other problems besides security. It is a precedent, not a measurement of how much each step costs.

### M8 — Repeated self-tests

If any test the astronaut repeats is added, the screen warns that improving with practice is expected (B07, B08). No statistical deviation is used as an alarm.

## Corrections to the existing documentation

Findings from the reading, independent of series B:

- **The word "MVP" appeared in APPLIED_RESEARCH.md and in ACADEMIC_BASE.md** (finding A01: "Do not include ultrasound in the MVP"). The project is built in levels, without an MVP. Corrected in this delivery to "in the delivery".
- **APPLIED_RESEARCH.md is duplicated** inside the second part of ACADEMIC_BASE.md. Two copies diverge over time. Nothing was deleted: it is flagged for the team to decide which one is the source.
- **REFERENCES.bib does not include A01–A06 or B01–B18.** Pending; the CSV matrices do have them.
- **The official challenge text is still unverified.** The site blocks automated reading. REQUIREMENTS.md keeps the version provided by the user.

## What does not change

- No thresholds, diagnoses, treatments or global score.
- No merging of cohorts and no presenting ground analogs as astronauts.
- Original code; no third-party functional dependencies.
- Health, adaptation and habitat remain core scope.

## Evidence level of this document

B01, B03, B06, B07 and B09 were read in full text; the rest are abstracts or snippets. Improvements M1–M8 are design decisions reasoned from that evidence; none was tested with users or reviewed by clinical staff.
