# Órbita aerobic dashboard

Implementation based on [the interface research](aerobic-dashboard-research.md).

## Design direction

The panel organizes follow-up as a personal logbook. The trajectory is the
main content; the orbital illustration gives identity without representing a medical
state. Deep blue `#17354b`, background `#f3f6fa`, surfaces `#ffffff`, secondary
text `#52677d`, trajectory `#217b70` and dividers `#dce4ed`.
The dark version keeps contrast and tells protocols apart by shape and stroke.
There are no continuous animations, decorative ECGs or global health score.

## Available journey

- My perspective: summary, interactive evolution, visit card and explained reading.
- Aerobic history: the same explorer with the record open and access to other data.
- Exercise and follow-up: activity logging and local preparation of a review.
- Filters of 3, 6 and 12 months or full history, anchored to the latest visit of the
  available history. A three-month limit includes both ends: there can be
  four monthly visits. The effective period is always shown with dates.
- Reference chosen explicitly, kept when the period changes, even if it falls
  outside the window. The most recent visit can be selected.
- CSV export limited to the period; it includes unit, method, synthetic origin and
  pending validation. It does not export a diagnosis or a clinical trend.
- Accessible table with headers, keyboard scrolling and a collapsible explanation
  of the blocked comparisons.

## Data and integration

Components receive data from `data/service.ts`. The service enables the six
scenarios only in mock mode. In API mode the selector is hidden and the existing
responses are consumed without silently replacing them with fixtures.
`backend/`, `contracts/` and the set of dependencies are not modified.

The initial scenario is decline and recovery: thirteen visits from November 2025
to November 2026. The six profiles reproduce the design series of the CSV;
Lyra uses a fictional offset of two units to tell people apart.
Atlas keeps the empty state to verify the absence of data.

The values are invented; the mL/kg/min unit and the A/B protocols are from the demo.
They do not resolve the pending units or conditions of MR080G. The section
«From the dataset to your story» explains that separation within the panel itself.

## Calculations and representation

The trend is the slope of a line fitted to real days. An exploratory minimum
of three results and a matching unit and method are required. It is not a significance
test, diagnosis, stability threshold or prediction. A tiny slope
can have a mathematical direction without clinical relevance; the panel does not
call it improvement or worsening.

Missing values still occupy their visit, are excluded from the fit and never become
zero. Strokes break at missing values and at method/unit changes. New methods
use another symbol and stroke. Different units do not share the chart.
The visual reference is only drawn on segments of the same method and unit.
Activity is presented separately and keeps its own time scope.

## Reproducible verification

```bash
npm run check
npm run build
```

`tests/aerobic.test.ts` covers periods by date, recovery with a change of direction,
missing values, incompatible methods and units, repeated dates and export.

In this environment Turbopack hit a restriction when opening a port of its internal
process. The alternative build was verified with `npm run build -- --webpack`;
the bundler configured for development was not changed.
