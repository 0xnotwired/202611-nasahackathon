# Inspiration for a personal aerobic follow-up panel

Consultation date: November 15, 2026.

## Main recommendation

Design a personal longitudinal panel: **what was measured, how it changed, against what
reference, how many observations support it and what we do not know yet**.
Combine Apple Health's synthesis, Polar Flow's organization of tests,
Intervals.icu's time review and the traceability of dataset viewers.

«Continuous follow-up» describes the continuity of the panel and the history. It does not
mean that peak VO₂ is measured continuously. Periodic tests, the signals
of a session and the daily activity log have different resolutions.
The interface must preserve that difference.

This delivery is research and design material: it does not change the application,
the backend, the active mocks or the shared contract.

## 1. Scope and review method

Seven external interface references, official documentation,
published screenshots and materials from the local Research repository were reviewed. Three
groups are distinguished: personal training applications, research platforms
with wearables and viewers of physiological datasets. Not all are open data
portals nor do they have public access to their authenticated panels.

The review allows evaluating documented patterns, not demonstrating usability,
accuracy of commercial algorithms or suitability for astronauts. No
accounts were created, devices connected or medical tests run. The reference
screenshots were consulted for inspiration; their assets or code are not incorporated.

## 2. Frontend references

### Apple Health · Cardio Fitness

**Verified:** its documentation shows a personal chart and filters for day,
week, month, six months and year. The measure it presents is a VO₂max estimate.
The documented estimate uses certain outdoor activities; it is not a method
that can be automatically transferred to the inside of a spacecraft.

**Take for Órbita:** one main measure, a period selector and access to the
full history. Place the measured/estimated origin next to the value.

**Adapt:** personal comparison is more appropriate for our first panel
than copying population categories by age/sex or its low-level notices.

Official source and screenshot: [Apple Support](https://support.apple.com/en-us/108790).

### Polar Flow · Tests

**Verified:** the manual groups tests in a follow-up section and allows
comparing results over the long term. It distinguishes types of tests and warns that
changes in weight/configuration affect the comparability of results.

**Take:** a visit is an explorable object: date, result, modality and
conditions. The test history must be independent of the training
calendar.

**Adapt:** do not turn its training recommendations, zones or protocols
for runners into instructions for the astronaut. The measurement context must be
confirmed for each comparison.

Source and screenshot: [Polar, Running Performance Test](https://support.polar.com/e_manuals/vantage-v2/polar-vantage-v2-user-manual-english/running-performance-test.htm).

In the official screenshot reviewed, the recent and the initial result are above
the chart; below, a table allows inspecting the visits. For Órbita I
would keep that hierarchy, but would show one main measure at a time to avoid
the density of several overlapping scales.

### Garmin Connect · Training Status

**Verified in indexed support documentation:** it relates trends in
capacity estimates, load and other data to show training states.
Direct extraction of its pages returned JavaScript-dependent content;
an authenticated panel or a current screenshot of its interface was not verified.

**Take:** present a synthetic state accompanied by the data that explain it.

**Adapt:** do not copy labels such as «productive», «detraining» or its
thresholds/algorithms. In Órbita, the initial state must describe the trend of the
indicator and the sufficiency of data, without rating health globally.

Source: [Garmin Support, Training Status](https://support.garmin.com/en-GB/?faq=VxKazDQ2mkAmDoQbJriEBA).

### TrainingPeaks · Athlete Home / Performance Insights

**Verified:** the documentation presents a daily summary and charts that can be queried
in 7, 30, 90 and 180-day windows; a day can be selected to review its value.

**Take:** combine a reading of today with an explicit time window and access
to the detail. Separate completed activity and assessment results in related
panels.

**Adapt:** its CTL/ATL/TSB metrics and categories are training models;
they are not interchangeable with a measurement of aerobic capacity. Do not adopt them as
the astronaut's health index.

Sources: [Performance Insights](https://help.trainingpeaks.com/hc/en-us/articles/41077784209165-Athlete-Home-Performance-Insights),
[Performance Management Chart](https://help.trainingpeaks.com/hc/en-us/articles/204071874-Performance-Management-Chart-PMC).

### Intervals.icu · Fitness / totals tables

**Verified:** a developer post shows configurable tables,
metric columns that can be plotted in charts, grouping, formats and selection
of seasons. The documentation includes screenshots, but downloading it returned 403;
the description is based on the developer's text, not on an account of our own.

**Take:** chart and table as two views of the same selection; mission period
in addition to the conventional calendar.

**Adapt:** the astronaut's panel should start with a few chosen measures.
Free configuration of many curves and formulas adds unnecessary load to the
first journey.

Source: [Intervals.icu, Configurable totals tables](https://forum.intervals.icu/t/configurable-totals-tables-for-fitness-data/123932).

### Fitabase · wearable data for research

**Verified:** its documentation separates resolutions of seconds, minutes, hours
and days. It publishes a heart rate zones view and documents data with
timestamps, activity and sync events. The published zones screenshot
is from 2020: it is used as a pattern, not as a guarantee of the current design.

**Take:** indicate resolution, acquisition date, coverage and provenance of
each series; distinguish measurement date from sync date.

**Adapt:** do not mix a seconds-level HR curve with a monthly assessment
as if they were the same type of observation, nor copy zones by age.

Sources: [Data Resolutions](https://www.fitabase.com/resources/knowledge-base/learn-about-fitbit-data/data-resolutions/),
[published zones view](https://www.fitabase.com/blog/post/hr-zones/).

### PhysioNet · LightWAVE

**Verified:** web viewer of physiological records and annotations, with selection
of dataset/record, time navigation, scale change and detail tables.

**Take:** select an observation and be able to inspect its source and the events
that accompany it. It is an especially useful reference for the detail view
of a session or for exploring a dataset.

**Adapt:** its technical density and the short scales of signals are not the main
structure for a personal monthly history. Do not present ECG or waveforms
merely as decoration of the aerobic panel.

Source: [LightWAVE documentation](https://physionet.org/static/lightwave/doc/about.html).

### Research/dashboard · the team's own reference

The local dashboard contributes visual identity, filters shared between charts and
tables, provenance and explanations of comparability. Its audience is the research
team. For the astronaut it is advisable to replace cohorts, histograms and evidence
matrices with a personal story, events and brief summaries.

Local references: `Research/dashboard/client/src/pages/Explore.tsx`,
`components/research.tsx` and `lib/analysis.ts`. Its source declares «source scale /
unit not confirmed» where applicable: that caution must be kept when reusing
the analyses.

## 3. What Research contributes to a simulated history

The report for the physician, the MR080G audit, the G1/G2 metadata diagnostics,
the conditioned longitudinal protocol and the physical comparability resolution
were reviewed. No individual data or clinical comments were copied.

### Relevant findings

- MR080G is the main aerobic source among the local materials. Its CFT70 set
  has **38 PRE, 37 POST1, 36 POST2 and 34 screening**: 111 scheduled tests
  and 34 selection tests. They are repeated records of a ground analog.
- The **58 distinct codes** are not equivalent to 58 people with complete follow-up:
  20 appear only in screening; 36 have PRE and both POST. The 73 technical pairs
  share references and are not 73 independent people.
- The global 2011–2014 range brings together different people. It is not a continuous
  multi-year follow-up of one astronaut nor does it justify filling in months between visits.
- In addition to VO2PK there are fields for HR, load, duration, gas exchange, perceived
  exertion and context. The medical report indicates that their units and definitions
  must be reviewed by column and session before using them.
- In the central tables, exact units, protocols per session
  and the relationship between absolute value, weight and relative result remain open. A similar
  protocol label does not prove equivalence.
- The conditioned G2 protocol allows PRE–POST differences on the source scale
  under declared assumptions. **It does not authorize percentages, imputation, pooling between
  studies or clinical interpretation**.

**What to reuse:** visit structure, method/role separations, missing values,
assessment history and relationship with activity as context.

**What not to do:** convert VO2PK to mL/kg/min by intuition, join people from
different sources, turn PRE/POST into nominal months or use historical percentages
as expected recovery rates.

### Specific external support for spaceflight

A NASA research summary describes peak tests on a cycle ergometer before,
during and after ISS missions, with approximately monthly assessments
during flight. It distinguishes peak VO₂ and submaximal responses, and its results are
modeled at group level. This supports the relevance of **showing periodic
visits and mission phases**, not a protocol for our user nor an individual curve
that we can copy.

Source: [NASA NTRS, Peak Oxygen Uptake during and after Long-duration Space Flight](https://ntrs.nasa.gov/citations/20140003748).

As a complementary reference to study the **structure of a session**,
the PhysioNet entry on AWS describes 992 maximal treadmill tests with breath-by-breath
signals. It is a ground population of athletes and not a monthly
history of astronauts. The entry declares a specific health-data
license; its records were not downloaded or redistributed.

Source: [Málaga test data registry](https://registry.opendata.aws/treadmill-exercise-cardioresp/).

## 4. Inferring results without diagnosis

The first version should produce **explainable descriptive summaries**, not
predictions of disease, operational fitness or automatic responses to exercise.

| Output | What it describes | What it does not allow claiming |
| --- | --- | --- |
| Latest result and age | A specific assessment, with its method and date | Physiological state at this moment |
| Absolute difference | Change between comparable assessments | Clinical importance of that change |
| Percentage difference | Relative change with confirmed unit/ratio scale and positive reference | Resolving an unknown unit or normalization |
| Period trend | Direction of comparable results over time | Cause of the change, prognosis or diagnosis |
| Observed variation | Dispersion of the visits that actually exist | Instrument error or the person's normal interval |
| Completed activity | Record of the sessions | That those sessions caused an improvement |

### Proposed comparability rule

Before calculating: same person, indicator, confirmed unit, method/protocol,
type of result measured/estimated and relevant conditions reviewed. Separate
absolute and weight-relative results. A change of device, algorithm or
normalization requires an explicit decision, not just equality of the text «VO₂».

If the check fails, return a state and its reason: **not comparable**, **missing
data** or **insufficient context**. Do not return zero as a blocked difference.

### Proposed trend for the demonstration

1. Select a period and compatible segment; sort by real date.
2. With one observation, show only the result. With two, allow a paired
   difference if they are comparable; do not present it as a consolidated trend.
3. With at least three, a descriptive slope with respect to real days can be explored.
   **Three is a technical rule proposed for the demo, not clinical sufficiency
   nor a statistical guarantee**. Show quantity, dates and dispersion.
4. For stability or stagnation, the expected variability and tolerance remain to be agreed.
   A slope close to zero does not demonstrate absence of relevant change. Without that
   agreement, use «small variation in this period; relevance not assessed».
5. If statistical intervals are shown, explain exactly what they estimate. Do not
   present a regression interval as instrument uncertainty nor give high
   confidence just for having three points.

Initial interface states: **rising**, **small variation**, **falling**
and **insufficient data/not comparable**. The words «improvement», «stagnation»
and «worsening» need an agreed definition for the indicator and the use.
Avoid a global indicator that claims «your health is better/worse».

Example text: «The result is higher than at the selected reference.
Comparison based on 4 assessments of the same protocol. The importance of the change
is not assessed». The figure, the period and n must come from the active data.

## 5. Proposed dashboard composition

```text
Astronaut / mission                Latest assessment: date / method
Period: 3 months | 6 months | 12 months | All   Reference: chosen visit

Latest result  Change vs reference  Trend and n  Coverage / age

AEROBIC EVOLUTION · main chart by date
Real points · compatible segments · gaps · annotated events
Select a point → assessment card and its conditions

Logged activity                 Assessment history
Sessions, duration, difficulties Date, result, unit, method, quality

WHAT THESE DATA SHOW
Descriptive summary + why it was calculated / why it was blocked
Record observation | Prepare review | Download history
```

- Give priority to the longitudinal chart and the personal context. Reserve technical
  detail for a card, without hiding method, date and simulated nature.
- Keep the same window and selection in charts, KPIs, table and summary.
- Use real days on the X axis. Show planned and completed visits as distinct
  concepts; a month without a visit does not contain an implicit measurement.
- The points are observations. A line, if used, is a visual aid between
  compatible visits; it does not represent a continuous measurement. Do not join across
  missing values or method changes, nor smooth until hiding them.
- Show the number of visits next to any average. Do not switch silently from mean to
  last value when changing the time scale.
- Show activity in another aligned time panel, without a misleading second scale
  or causal claims. Do not generate adherence if there is no assigned plan.
- Use text, shape and legend, in addition to color. Avoid green/red as clinical judgment.
- On mobile: latest data and its date, chart, explanation and next task; secondary
  filters and tables under explicit access. Do not reduce labels to illegible text.

## 6. Twelve-month synthetic history

`aerobic-history-scenarios.csv` is delivered: **78 rows, six scenarios and 13 nominal
visits per scenario**, from 11/15/2025 to 11/15/2026. The monthly periodicity
is a design decision to test navigation, not a prescription.

The values were chosen manually. They are not patients, NASA participants,
resampling of originals or estimates of response to flight. The unit
mL/kg/min is used only as the **declared unit of the fictional example**, not as the resolved
unit of the VO2PK field of MR080G. The DEMO-A/DEMO-B methods are fictional.

| Scenario | Interface purpose |
| --- | --- |
| Rise with oscillations | Show an increase without inventing a perfectly linear improvement |
| Variation around a reference | Avoid declaring stagnation from two similar visits |
| Fall with oscillations | Explain a drop in the result without diagnosing or attributing a cause |
| Fall and recovery | Show how the summary changes when selecting different windows |
| Visits without result | Show absence, coverage and graphic discontinuity |
| Method change | Avoid presenting a protocol jump as personal progress |

The figure `aerobic-history-scenarios.png` allows comparing those cases on the same
scale. It does not calculate diagnoses or assign clinical importance to the variations.
`generate_history_examples.py` reproduces the CSV and the figure without reading private data
from Research. It requires matplotlib; that dependency is not added to the application.

## 7. Minimum data to agree on with backend and the physician

`contracts/` is not modified yet. As an extension proposal, each assessment
should be able to express: person; instant/phase; indicator; value/unit;
measured/estimated; protocol and version; modality; device; mass
normalization context when applicable; availability/quality state;
provenance; and reason for non-comparability.

Derived results should preserve period, reference, included and
excluded IDs, n, calculation method, comparability policy and reason for the state.
That way the frontend explains the result and the backend can reproduce it.

Specific questions for the physician:

1. Which aerobic result will be followed and what does a favorable direction mean?
2. What conditions make two tests comparable and what changes force them apart?
3. Which reference to use and what variation prevents concluding stability or change?
4. What follow-up text can the astronaut read without inducing clinical decisions?
5. What actions should the panel offer when data are missing or there is a trend to review?

## 8. Criteria for evaluating the next design

- The user finds the recent result, its date and the method without opening help.
- They can locate a visit from months ago and check the summary against the table.
- They distinguish «this measure fell» from «I am clinically worse».
- They understand why a method change blocks the comparison.
- They do not interpret a gap as zero or as a normal measurement.
- Switching from 3 to 12 months recalculates results and explains the effective period.
- A correction or a new visit does not silently change the chosen reference.
- The user's observation and the summary are kept without claiming they were sent.

## 9. Evidence and limits of this research

The product references are based on their public documents/screenshots, not on
a clinical audit, comparative test with users or reverse engineering of their
models. Garmin has verification limited to the indexed support content.
Some images and the direct page of the Málaga dataset could not be retrieved
by the web reader; the resource's own entry on AWS is used to describe it.

The following were consulted in Research:

- `reports/aerobic-health-medical-team-brief.md`, especially §§3, 5, 6 and 11.
- `research/datasets/audits/mr080g-data-audit.md`.
- `reports/descriptive/metadata-diagnostics.json`.
- `research/evidence/physical-comparison-resolution.md`.
- `analysis/config/conditional_longitudinal_protocol.json`.
- `reports/selection/selected-demo-context.json`.
- The dashboard's exploration components.

The local counts were checked between the reports and the versioned
diagnostics; the audit of original files and the complete pipeline were not repeated. No
personal data were copied. The attached examples are separate from the
active mocks and do not prove physiological realism or the product's effectiveness.
