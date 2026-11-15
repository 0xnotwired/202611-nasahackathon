# Technical source resolution

Source-specific evidence is required before physical conversion or scientific
interpretation. This report does not implement an importer or confirm units
from plausible ranges. See the [complete evidence record](data/technical-resolution-2026-11-15.json).

| Dataset | Confirmed units | Unresolved units |
|---|---|---|
| CRF | Not established | Pulse; SysBP; DiaBP; Resp Rate; Weight; Body Temp; Height |
| MR079G | Value: ft-lb (verbatim Units field) | None in selected columns |
| MR035G | Not established | NET_AVG_BMD |
| BRSMImmune | Not established | CD8+ CD69+ selected analyte values |
| MR080G | Same-test source headers establish HR bpm; VO2/VCO2 L/min; VE L/min BTPS; FEO2/FECO2%; normalized VO2 mL/kg/min; time min. RER is a dimensionless ratio, corroborated by source definition/value relation | None for the selected test; preserve gas conditions and exercise context |
| BUT_CGM | Glycemia: mmol/L (official-linked author companion source evidence) | None in selected columns |
| ACTES | time: s elapsed relative to effort-test start; RR: ms; VO2: mL/min; power: W | None in selected columns |
| ITBA | HR: bpm; TEMP: Celsius; IBI offset: s; IBI duration: s | None in selected columns |
| 96-E044 | maximum respiratory pressures: mmHg | None in selected columns |
| DTO684 | first workbook neutron absorbed dose rate: microGy/day; first workbook neutron equivalent dose rate: microSv/day | Second workbook garbled dose-rate header |
| MSD007 | CO2 metadata quantity: partial pressure mmHg | Toxicity-index numerical scale is not a measured concentration |

CRF dates are month/day/year (70/113 have second component above12) and
Vitals Time has minute precision. Zone and calendar-shift status stay unknown.
MR079G selected3/12/2009 is corroborated as2009-03-12 by same-subject/campaign
3/17/2009 control and matching filename suffixes. The additional5/24/2009
control is the same campaign but a different subject: it confirms format,
not identity. Parent independently verified these CSV fields and SHA256.
An unrelated MR080G control is not evidence for MR079G identity.

MR035G SCAN_DATE is ISO date-only. Relative/composite immunity labels are not
calendar instants. ACTES uses elapsed seconds. ITBA declares shifted UTC;
BUT CGM declares shifted participant calendars with unknown offset. Preserve
original strings/precision, never invent midnight or UTC for unknown zones.

Unresolved units remain explicit unknowns and are blocked for conversions,
clinical interpretation and comparisons. No authoritative dictionary was
found for the unresolved columns; physical units have not been invented.
Only verified unit mappings may be used scientifically. These are preparation
rules, not an implemented importer. Exact per-source dispositions are in JSON.

Genetic protocols document log2 ratios versus normalized log2 intensities,
and all180 raw quantitative files have now been structurally inspected.
Raw fluorescence and declared derived normalization are kept distinct. See [genetic inspection](GENETIC_DATA_INSPECTION.md).

No clinical thresholds, medical interpretations, dependencies or product
changes were added. Local claim-provenance-discipline was applied; parent
corrected a draft that overstated same-subject evidence for the second control.

## Unit dictionary investigation follow-up

The exact-test MR080G summary provides explicit unit-bearing headers. All
four selected rows match its identified test/stages and numerical fields;
VE is the same value rounded to one decimal. This is a source-linked unit
resolution, not inference from typical gas-analysis conventions. Six same-test
NASA PDF plots independently label oxygen consumption L/min and heart rate
bpm. Source URLs/hashes and row correspondence are recorded in
[data/unit-dictionary-followup-2026-11-15.json](data/unit-dictionary-followup-2026-11-15.json).
No value was converted or interpreted clinically.

CRF, MR035G and selected immunology scale/denominator remain unconfirmed.
Their original NASA-linked papers were identified (PMIDs19476163/19476166/19476168),
but fresh NTRS/PubMed requests were denied by proxy CONNECT403. The saved
additive draft includes ntrs.nasa.gov, pubmed.ncbi.nlm.nih.gov and
pmc.ncbi.nlm.nih.gov; it requires publication before direct source reading.
No provider message was sent and no unit was guessed.
