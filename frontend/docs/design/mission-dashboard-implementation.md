# Mission follow-up panel redesign

Implementation of the [redesign analysis](mission-dashboard-redesign-analysis.md).

## Composition

The header brings together the application identity, simulation mode and theme. The
next bar identifies crew member, mission and the cutoff date of the assessments. The
four views are Follow-up, Assessments, Activity and Review; they keep the previous
route identifiers to preserve existing links.

The orbital banner, slogans, commercial welcome and repeated calls to prepare a
review were removed. The summary presents result, reference and
availability. The chart and the inspector form the main area. Below them are
shown a single descriptive reading, recent assessments and an observation
linked to a visit.

The Assessments view offers the complete record of the period; Follow-up shows
the three most recent visits. Both share selection and filters. Activity
keeps its independent scope. Scenario configuration and provenance
are in secondary sections of the footer, with persistent identification of
simulation in the header.

## Context, scales and dates

`dashboard-state.ts` resolves period, reference, assessment and scale. Its state
is kept through `period`, `reference`, `evaluation` and `scale` in the URL,
in addition to the existing parameters for view, person and scenario. Links
between views keep that context. A selection that falls outside the window
resolves to the last visible visit, without modifying the reference.

The initial scale uses the full history of the represented unit and stays
the same when the window changes. The «Fit to period» option includes the visible
results and the reference of the same unit. Both show numeric limits;
they are not clinical ranges. The trend calculation did not change.

The chart keeps symbols by method from the full history, including
the selected point. The table and the date selector give access to the
visits when there is not enough room for separate interaction targets
in the chart. Results are not joined across missing values or method changes.

Dates include UTC. The header shows the last visit of the history;
the summary distinguishes the last valid result from a later visit without a value.
Age is calculated relative to the query date generated on the server.
No overdue, sync or connection states are assigned that the API does not provide.
Periods remain anchored to the last recorded visit and explain that scope.

## Observations and review copies

An observation is saved with the assessment ID and its record date. The
visit is fixed when writing begins: changing the chart selection does not
relocate the text. One last local observation is kept, without presenting a
history of notes that does not yet exist.

`review.ts` prepares the content of the period, reference, selected visit,
activity and observations. A prepared copy keeps text, date and scope.
If the data, the question or the context change, the interface indicates the difference;
it does not overwrite the copy or delete it. Updating the copy is an explicit action.
The download includes the preparation date. It is not sent to the specialist.

The previous storage key is kept and the new fields have default values,
so existing valid drafts remain available.
Old copies without scope are identified as such. If the browser blocks
storage, the draft stays in memory during the visit and that
limitation is indicated. Persisted timestamps are validated before formatting.

## Visual system and accessibility

The base styles were consolidated in `globals.css` and the follow-up styles in
`aerobic.css`, removing the overlap of rules from the previous design. The palette
uses grays and a selection blue; alternative methods add shape and stroke.
Mathematical direction does not receive a chromatic health rating.

Typography uses rem, unitless line height and tabular figures. The browser's root
size is not overridden. `text-scale` allows system enlargement in
compatible browsers; the others keep their usual zoom. Text panels
grow with the content. The table has its own scrolling, persistent headers and
identifier row, an accessible name and keyboard access.

The application uses native HTML controls, visible focus, link navigation,
selection states and an update indication. Titles are generated
through the Next.js metadata API. The light and dark themes share tokens.
No libraries or dependencies were added.

## Verification

```bash
npm run check
npm run build
```

`tests/dashboard-context.test.ts` verifies resolution and serialization of filters,
reference outside the period, invalid selection, scale, age, last visit
without a result and preservation of a prepared review when data or
context change. The previous tests still cover the descriptive calculations and the
read contracts.

The visual and interaction review uses an isolated browser context, without
modifying the user's browser drafts. The scope includes filters,
navigation and reload, export, observations, reviews, scenarios, themes,
narrow screens and text enlargement. The validation does not replace tests
with astronauts or specialists, nor does it certify suitability for space operations.

The backend, shared contracts and dependencies remain unchanged.
