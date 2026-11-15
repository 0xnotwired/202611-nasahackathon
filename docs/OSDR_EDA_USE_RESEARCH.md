# OSD-51, OSD-56 and EDA reuse investigation

Current implementation: [CURRENT_STATUS.md](CURRENT_STATUS.md). Source-specific
evidence and dated investigation history below retain their original scope.

Reviewed November15,2026. Applies to public OSD-51/56 version2 records and the
previously acquired EDA RR-1 API responses. Complements the
[event-specific review](SPACE_APPS_DATA_REVIEW.md). No original scientific
measurements were imported, no code reused, and no network configuration,
publication, commit or push performed by this investigation.

## Direct policy verification after publication

RUN/SOURCE: The official OSDR terms page now loads, including its
**Data Redistribution** section: NASA OSDR data and products acquired
through the website are distributed under the Science Mission Directorate
Science Information Policy. The following citation section explicitly says
the data are provided under NASA's open access policy and requests a
bibliographic citation for every OSDR dataset used, plus acknowledgment.

Sources: https://science.nasa.gov/reference/osdr-help-terms-and-conditions/
and https://science.nasa.gov/researchers/science-data/science-information-policy
Both original responses are retained and hashed. The SMD page confirms
public availability/open sharing; neither page is relabeled CC0.

This resolves the previous inability to read the repository policy directly.
EDA links these OSDR terms, so the evidence for applying repository policy
to its OSDR data/products is now affirmative, rather than inferred solely
from the separate AWS bucket. Preserve source-specific notices, scientific
context and attribution; no rights to unrelated third-party code/media or
protected records are inferred. Final delivery contents still need review.

Both OSD51/56 ISA metadata ZIPs now download and pass CRC checks (three
entries each). These are study metadata archives, not quantitative microarray
archives; no claim of complete measurement acquisition is made. One OSD51
annotation download still meets a blocked redirect. No new network draft was
written or environment published. The sections below preserve the earlier
investigation history and its then-current access limits.

Evidence: [published follow-up](data/osdr-published-followup-2026-11-15.json).

## New affirmative reuse evidence

The AWS Open Data Registry entry **NASA Space Biology Open Science Data
Repository (OSDR)** declares:

> ManagedBy: NASA
>
> License: There are no restrictions on the use of this data.

Source: [pinned registry entry](https://raw.githubusercontent.com/awslabs/open-data-registry/69cf82c80db1f4b7b16a5843436f58ae0181397f/datasets/nasa-osdr.yaml).
The declared distribution resource is `s3://nasa-osdr` in us-west-2, described
as biological research data from spaceflight and space-relevant experiments.
This is affirmative reuse evidence, not merely a successful public download.
It is a plain-language data-use declaration, not a CC0 or OSI license label.
The user-provided event terms have an unrestricted-availability branch as
well as an OSI-software-license branch; an OSI label is not the sole route.

NASA's own [AWS/OSDR guide](https://www.nasa.gov/reference/osdr-help-getting-started-with-aws-and-osdr-data/)
independently identifies the Registry of Open Data initiative and explains
anonymous listing/copying of this bucket. Its original content was read from
[NASA's public content API](https://www.nasa.gov/wp-json/wp/v2/reference/692224),
not from a search snippet. This corroborates the distribution relationship.

## What the study-specific records say

| Evidence field | OSD-51 | OSD-56 |
|---|---|---|
| Version |2 |2 |
| public |true |true |
| restricted |false |false |
| licenseName / licenseLink / licenseIdentifier | All empty | All empty |
| DOI |10.26030/3w73-jn41 |10.26030/nc96-xp67 |
| Upstream source | E-GEOD-14798 | E-GEOD-57408 |

Actual web-app records, which are a different endpoint from the ISA metadata:

- https://osdr.nasa.gov/geode-py/ws/repo/studies/OSD-51
- https://osdr.nasa.gov/geode-py/ws/repo/studies/OSD-56

The previous DOI records also have empty rightsList. These empty fields do
not prohibit reuse, and are not evidence of a specific CC0/CC BY grant.
Together with the registry, they establish that these are public studies
in a repository with an explicit unrestricted-use declaration for its AWS
data distribution. Public repository reuse has affirmative support; the
remaining scope check is tying the selected download distribution and any
file-specific notices to that declaration before bundling real files.

The study-download routes previously inspected redirect to
`genelab-shared-repo-prod.s3.amazonaws.com`, a different bucket from the one
named in the registry. This is not proof of different rights, but the registry
statement must not be silently expanded to every bucket, upstream article,
image, questionnaire or third-party attachment. Investigator contacts in
original metadata remain excluded from the delivery notices.

## A metadata trap that was ruled out

The official OSDR frontend source uses a CC BY1.0 URL as a fallback when
building Croissant metadata if both study license fields are empty. That is
an automatic formatter default, not an independent source-specific license
declaration. Because these two studies have empty license fields, do not
report generated CC BY1.0 as a confirmed license or convert the study to CC0.
Only static source inspection was performed; the generated export was not
executed. No frontend implementation was incorporated into the product.

## EDA is a separate scope question

The selected EDA RR-1 telemetry and radiation JSON are publicly accessible,
with no account or data-use agreement used. The app identifies NASA/OSDR and
links to OSDR terms. However, the AWS registry describes a particular omics/
biological data distribution; it does not explicitly identify the EDA API or
the RR-1 environmental JSON acquired from visualization.osdr.nasa.gov.

Therefore, there is no verified reason to call EDA prohibited, and also no
source-specific license or explicit EDA-policy applicability sufficient here
to mark its real data fully cleared for redistribution. A missing license
field is not a denial. Keep the source citation and synthetic delivery path
while checking the applicable policy. The application's underlying software
or third-party chart libraries are not being copied or redistributed.

## Remaining access and useful conclusion

The published environment still does not allow `science.nasa.gov` or
`genelab-shared-repo-prod.s3.amazonaws.com`. The official policy/FAQ routes
redirect to the former and selected file downloads to the latter. The
previously saved additive draft already requests both; this task does not
reapply it or publish. Direct policy retrieval and selected file/notices
verification can proceed after activation. No request for special NASA
permission is inferred from the network block.

For OSD-51/56, the investigation has progressed from missing policy evidence
to an explicit unrestricted-use statement with a known distribution scope.
For EDA, direct policy scope verification remains open. Recheck if policy,
artifact, study version or distribution changes. The current app's synthetic
records do not depend on resolving these real-data delivery questions.

Exact responses, failed probes, timestamps, hashes and scope-bound findings:
[data/osdr-eda-policy-2026-11-15.json](data/osdr-eda-policy-2026-11-15.json).
Original policy responses/app source remain in ignored data/originals/.
