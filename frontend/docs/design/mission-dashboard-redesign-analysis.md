# Frontend analysis and redesign direction for in-mission follow-up

Date: November 15, 2026. Branch reviewed: `frontend`.
Status: design proposal; it does not modify the application or its calculations.

## 1. Conclusion

The functional base works for a longitudinal panel, but its composition presents
follow-up as a wellness product: welcome, promise, illustration,
cards and repeated calls to prepare a review. The measurement information
appears after that presentation.

The new direction must be **a personal aerobic follow-up station**:
identify the person, recognize the time scope of the data, inspect
the measurements, check comparability and record an observation.
The identity must come from that precision and from a consistent composition.

Sobriety does not mean reducing sizes, removing explanations or filling the screen
with figures. Nor is it enough to darken it. The astronaut must be able to read it and recover
the context in few actions, even after weeks without using a view.

## 2. Scope and evidence

The shell, the aerobic explorer, its chart, the descriptive calculations,
the styles, the local review draft and the previous research were reviewed. The preserved
desktop screenshot of the previous implementation was inspected and compared
with the current code. No new tests with users or physical measurements
of a mission device were carried out. The usability observations are grounded
hypotheses, pending validation.

`frontend-design`, `ui-ux-pro-max`, `web-design-guidelines` and the
`respect-os-text-scale` guide of Modern Web Guidance were consulted. The local results on
legibility contributed contrast and line spacing; they are not a spatial guide.

### Human factors references

The official record identifies NASA-STD-3001 Vol. 2, revision F, approved on 07/14/2026.
In §§10.4.2.1–10.4.2.4 it addresses simultaneous presentation of critical information,
color redundancy, consistent units and legibility under conditions of use.
They are references for design reasoning; this review does not demonstrate
compliance nor certify the prototype. The critical tasks and the applicable
requirements need a specific analysis of the system and the mission.

Sources: [official record](https://standards.nasa.gov/node/237),
[revision F, pp. 207–209](https://standards.nasa.gov/system/files/tmp/NASA-STD-3001%20Vol%202%20Rev%20F.pdf).

The [Human Integration Design Handbook, §10.6](https://www.nasa.gov/wp-content/uploads/2023/03/human-integration-design-handbook-revision-1.pdf)
proposes selecting information based on tasks and verifying the proposal
through usage scenarios. I would apply it here by separating personal consultation,
specialist review and dataset exploration.

## 3. Prioritized findings

The priorities indicate expected impact on the redesign, not clinical severity.

| Priority | Location | Finding | Proposed change |
| --- | --- | --- | --- |
| High | `aerobic-overview.tsx:90` | Expressive title and welcome, not specific to the task | Title «Aerobic follow-up» and person/date context |
| High | `aerobic-overview.tsx:112`, `aerobic.css:181` | Orbital banner, minimum 218 px, with no information needed to compare | Remove the banner and place the chart immediately after the compact summary |
| High | `aerobic-overview.tsx:274`, `aerobic-overview.tsx:382` | The direction is repeated and given great prominence | A single reading near the chart, with period, n and scope |
| High | `aerobic.ts:82` | Any slope other than numeric zero has a direction; there is no relevance threshold | Separate mathematical sign, magnitude and relevance not assessed; avoid the appearance of a verdict |
| High | `trajectory-chart.tsx:43` | The Y axis changes with window and reference | Stable inspection scale per person/indicator/unit, with an explicit automatic mode |
| High | `aerobic-overview.tsx:59` | The period is anchored to the last available visit | Show cutoff date and age separately; do not suggest currency through the «3 months» filter |
| High | `aerobic.css:1326` | 11 px axes and 11–12 px units/notes in the effective style layer | Increase legibility and use relative units; validate when enlarging text |
| Medium | `aerobic-overview.tsx:467` | The history is closed in the initial view | Show recent assessments and keep access to the full record |
| Medium | `dashboard.tsx:200` | The initial and history views mount the same explorer with small differences | One navigation with distinct tasks, without duplicating screens |
| Medium | `aerobic-overview.tsx:56`, `dashboard.tsx:202` | Window and selected visit are local state; switching views remounts the explorer | Keep period, reference and visit in the URL or shared navigation state |
| Medium | `dashboard.tsx:155` | The scenario selector shares context with the person selector | Secondary demonstration tool, separate and explicitly identified |
| Medium | `aerobic-overview.tsx:409`, `aerobic-overview.tsx:453` | Several equivalent invitations to prepare a review | One contextual «Prepare review» action |
| Medium | `use-demo-journal.ts:45`, `followup-view.tsx:123` | The prepared summary is a saved copy that may correspond to earlier data | Show preparation date and context of that copy; offer to regenerate it without losing the question |
| Medium | `trajectory-chart.tsx:188` | Selecting a point renders it as a circle, although its method was encoded as a square | Keep shape and method on selection; use a ring as additional emphasis |
| Low | `dashboard.tsx:112`, `dashboard.tsx:225` | Side slogan and hackathon closing compete with the operational content | Small brand; project information under «About» |

Locations relative to `src/features/health-monitoring/`:
[explorer](../../src/features/health-monitoring/components/aerobic-overview.tsx),
[shell](../../src/features/health-monitoring/components/dashboard.tsx),
[chart](../../src/features/health-monitoring/components/trajectory-chart.tsx),
[styles](../../src/features/health-monitoring/components/aerobic.css),
[calculations](../../src/features/health-monitoring/aerobic.ts),
[draft](../../src/features/health-monitoring/components/use-demo-journal.ts),
[review](../../src/features/health-monitoring/components/followup-view.tsx).

### What to keep

- Individual history, chosen reference and real dates.
- Differences between absence of a visit and a missing result.
- Chart breaks and blocking of calculations for different units or methods.
- Semantic table, native controls, keyboard navigation and empty states.
- Explicit simulated origin and separation of activity and aerobic capacity.
- Local preparation of the summary without claiming it was sent.
- Data service as boundary and separation between frontend, backend and contracts.

## 4. Tasks that should organize the interface

| Task | Astronaut's question | Information needed |
| --- | --- | --- |
| Follow-up consultation | What is the latest result and from when is it? | Value, unit, UTC date/time and method |
| Comparison | What changed with respect to the chosen visit? | Explicit reference, difference and reason for comparability |
| Longitudinal review | What happened over several months? | Chart, visits, gaps, segments and dates |
| Inspection | What supports this point or this reading? | Assessment card, available source and included IDs |
| Logging | What observation do I want to keep? | Note linked to the context and saved state |
| Review preparation | What information am I going to share? | Dated summary, scope and real export/sending state |

The screen is for periodic follow-up. A monthly measurement does not describe the state
at this instant. Comparison is not an alarm system either.

## 5. Proposed architecture

A compact identity and context bar, discreet navigation and left-aligned
content. The visual center of gravity is the chart with its inspection.

```text
Órbita / Aerobic follow-up              Crew member: Vega   [Simulation]
Data up to: UTC date/time              Saved: available state

Follow-up | Assessments | Activity | Review

Period [3 m] [6 m] [12 m] [All]         Reference [date / method]
Effective dates: start — end           [Export period]

Latest assessment       Change vs. reference        Available results
value + unit + date     difference / not comparable  n of N visits

Peak VO₂ evolution                       Selected assessment
[main chart by date]                     date / value / unit / method
[reference / methods / gaps]             [Previous] [Next]

Period reading: direction, magnitude and n. Relevance not assessed.
[Calculation detail]

Recent assessments / history             User observation
[table linked to the chart]              [Record observation]
```

This layout is a proposal, not an already implemented screen. «Saved» must
refer to the existing local draft; the system does not yet report sync.

On desktop, summary and chart must be visible in the first reference viewport of
1440 × 900 at standard scale. On mobile, order context, latest data,
comparison and chart; details and history keep explicit access. Do not hide
the date or the method to fit more figures.

### Navigation

- **Follow-up:** longitudinal summary and reading of the period.
- **Assessments:** record, selection and detail of an assessment.
- **Activity:** recorded sessions with their own time scope.
- **Review:** note, question and copy prepared for export.

The exploration of MR080G belongs to the research and provenance context.
It can stay in a secondary technical card. Judges can access that
explanation without the astronaut having to go through it on every consultation.

## 6. Proposed visual system

The following values are initial project decisions, not official colors
nor requirements of an agency.

| Function | Proposal |
| --- | --- |
| Work background | `#eef1f4` |
| Surface | `#ffffff` |
| Main text | `#1d2935` |
| Secondary text | `#475569` |
| Dividers | `#cbd5df` |
| Selection and main trajectory | `#245c86` |

- A local sans serif font, with clear shapes and system alternatives.
  Tabular figures for results; monospaced only where it makes reading IDs easier.
- Reference body of 1 rem; labels and metadata between 0.875 and 1 rem as a
  starting point. Section headings of approximately 1.125 rem.
  Validate on the target device; do not equate CSS pixels with physical size.
- Unitless line height. Containers that grow when text is enlarged. Root size
  respected; zoom available. Progressively evaluate `text-scale` with a fallback
  to normal zoom in browsers that do not support it.
- Discreet radii, approximately 4–6 px; separators to group functions.
  Shadows only when they express overlap. Reduce the icons that repeat text.
- Keep light/dark; both must keep hierarchy, contrast and symbols.
  A dark theme does not establish suitability for a mission.
- Color for selection, series and differentiated states. Every condition must have
  text or shape. Do not assign red to a decrease or green to an increase by default.
- No decorative planets, glow, ambient animation, gamification or aggregate health
  score. An anatomical representation would only make sense with a
  task and a datum that justify it.

## 7. Proposed language

| Current | Proposal |
| --- | --- |
| My perspective | Follow-up |
| Your capacity, in perspective | Aerobic follow-up |
| Your journey matters as much as the latest datum | Remove the block |
| Your aerobic trajectory | Peak VO₂ evolution |
| The reading of your data | Period summary |
| The record behind the trajectory | Assessments |
| A review with perspective | Review |
| Your story, connected | Remove the slogan |
| Explore history | View assessments |

Use explicit verbs: select reference, record observation, prepare
review and export period. The text can be clear and human without promises or
commercial motivation. Keep a consistent vocabulary in navigation, table,
export and draft.

## 8. Data reading and trust

### Currency

Separate assessment date, data cutoff date and summary preparation date. A last
visit without a result must not silently erase the last valid result:
present both concepts with their dates.

The age label can express elapsed time. Classifying a visit as overdue
requires an agreed calendar; do not invent one. Do not show
«Online», «Synced», «Nominal» or a mission day without data to back it up.

### Comparisons and scales

Keep reference, period and assessment when navigating and returning. Differentiate
the change against a fixed reference from the direction of the selected period.
For the chart, propose a stable initial scale based on the available compatible
history and an explicit auto-scale option. It does not imply always starting
at zero nor establishing a normal physiological range. An update that
requires expanding the range must be noticeable.

Separate the segments of different methods with specific marks and legend. Prevent
selection from removing the method's symbol. Nearby touch targets
require an overlap check; keep arrows and table as alternatives.

### Trends

Give a single reading of the period. Accompany it with number of results, dates and
calculation method. Prevent a tiny slope from looking like a relevant finding
because of its typographic size or color. Do not replace it with «Stable» using an
invented tolerance. The definition of stability, relevant change and uncertainty requires
agreement on data and medical judgment.

### Simulation and provenance

Keep a persistent identification of simulation and access to its limits.
Separate the scenario selector from the user context. Simplify the repeated
notices without hiding the fictional origin. The card of each result must show
only the provenance that is actually known.

## 9. Later implementation and scope limits

1. Reorganize hierarchy and texts: remove banner, slogans and duplicated actions;
   move chart and date forward. It requires no API changes.
2. Unify tokens, typography and surfaces. Consolidate the current rules of
   `globals.css` and `aerobic.css` before adding more overrides.
3. Resolve scale, selection, legends, preservation of context and access to the table.
   Keep the existing calculations until a separate change is specified and tested.
4. Differentiate last visit date, last result and review copy.
5. Evaluate with scenarios: recovery, small variation, decline, missing values,
   method change, empty history and old data.

No change of stack nor adding a chart library for aesthetic reasons is needed.
Next.js, Tailwind, existing components and SVG allow this direction.
A shadcn component would be useful if it solves a concrete interaction.

The simulation already allows demonstrating most of the redesign. Device,
versioned protocol, quality, sync, test calendar or mission
start date need fields agreed with the backend. Do not incorporate them as
apparent fields with invented values to give a feeling of completeness.

For a prolonged mission, real requirements for offline operation,
persistence, recovery, access and privacy remain pending. The current local draft
does not demonstrate those capabilities. They must be specified as later product work,
without blocking the visual redesign of the prototype.

## 10. Acceptance criteria for the next design

- The first desktop screen shows person, date, result, reference
  and chart; it contains no promotional block.
- Value, unit and date are read together, also with zoom and dark theme.
- There is a single period summary and a single main access to prepare a review.
- The user distinguishes «last visit without a result» from «last valid result».
- Changing the window keeps the reference and indicates which axis the chart is using.
- Returning from activity or review keeps the selected window and assessment.
- The reading can be verified with the table and a method change recognized without
  depending on color.
- A prepared copy keeps date/context and does not appear to update itself.
- At 320 CSS px and when enlarging text, all content remains available; the table
  can have its own scrolling when the structure requires it.
- It works with a keyboard, nearby controls do not block each other and the focus
  is not hidden by bars or panels.
- The evaluation with users records time, interpretation errors and actions
  needed to compare visits; it is not considered approved just for its appearance.

Device, reading distance, lighting, operating language and critical tasks
remain to be confirmed. These variables condition the final validation.

## Complementary references

- [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md):
  semantic controls, focus, tabular numbers and state preservation in the URL.
- Modern Web Guidance, `respect-os-text-scale`: relative typography and enlargement
  without loss of information; consulted locally, with no code changes.
- [Previous project research](../research/aerobic-dashboard-research.md).
