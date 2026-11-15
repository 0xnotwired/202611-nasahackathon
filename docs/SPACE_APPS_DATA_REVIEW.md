# Dataset review against Space Apps 2026 participant terms

Current implementation: [CURRENT_STATUS.md](CURRENT_STATUS.md). Source-specific
evidence and dated investigation history below retain their original scope.

Reviewed November15,2026. Basis: the full participant terms supplied by the
user in this chat, marked updated August7,2026. A live request to the legal
page was denied by the environment proxy; this review does not claim an
independent website revalidation or organizer approval. Scope: the14 dataset
sources in the current acquisition/catalog work, their selected artifacts,
and the current application's actual use. It is not a final-package review.

## User decision: provisional PhysioNet acceptance

The user has already asked the organization and explicitly instructed us to
assume acceptance of BUT CGM, ACTES and ITBA, retaining their attribution and
license requirements. Use them provisionally and keep them removable if the
organization rejects them. This supersedes the earlier project hold pending
interpretation below; it is a user-authorized project decision, not verified
organizer approval. No new message was sent on the user's behalf.

Keep these sources in separately identifiable acquisition/import records,
not irreversibly mixed into unrelated data. The current synthetic scenario
does not load their rows. Real imports retain origin/source IDs so
an affected dataset can be excluded before delivery if needed.

## Current finding and delivery scope

Eight NLSP studies have explicit source-specific CC0 declarations and public
sample access. Three PhysioNet datasets have verified reuse licenses with
conditions; those licenses alone do not conclusively settle the event's
"without restriction"/OSI wording. OSD-51/56 public records now have affirmative repository-level unrestricted-use
evidence for the NASA-managed AWS distribution; EDA policy applicability
remains open. Neither inherits NLSP CC0 simply because NASA hosts it.
See [the policy investigation](OSDR_EDA_USE_RESEARCH.md) for the scope.

The synthetic demo still generates original labeled records. A separate
user-authorized local M21 workflow now imports selected real rows without
bundling them in tracked sources or altering the synthetic scenario. Continue
the source-separated delivery scope with the
original Apache2.0 app, metadata-only provenance and complete source citations.
Real files remain outside Git and outside the proposed package. This is an
immediately usable delivery stance, not a change to the chosen product scope
or final approval of optional future real-data integrations. In particular,
BUT CGM remains the selected glucose research source; its real rows are not
silently incorporated into a submission while eligibility is unresolved.

## Terms-to-evidence mapping

| Requirement from the supplied terms | Verification and consequence |
|---|---|
| Original content is freely available or OSI open source | Original app has Apache2.0 LICENSE and no product dependencies. External data retain their own licenses; do not relabel them Apache2.0 |
| Non-NASA/non-partner materials are "freely and publicly available without restriction" or at least OSI open source | CC BY4.0 and ODC Attribution1.0 permit reuse under conditions. Data licenses are not automatically OSI-approved software licenses. Record event eligibility as conditional, rather than claiming automatic acceptance or automatic failure solely from attribution |
| NASA may "display, copy, combine, compile, distribute, and disseminate" the Solution; participants warrant sufficient rights | Preserve external notices and direct recipient licenses. CC BY/ODC are ordinarily compatible with sharing under their conditions, but cannot be relicensed as Apache or have attribution waived. NASA/partner origin does not erase third-party rights |
| "Any licenses applicable" must be identified; "cite every source" including free/open sources | DATASET_CITATIONS.md, DATA_ATTRIBUTIONS.md and RESOURCES_USED.md retain dataset, paper and platform references. Completed ACTES/ITBA requested references; ACTES publisher's unexpected Malaga reference is labeled as a citation, not a dataset import |
| No PII in submissions; no recognizable names, voices or likenesses of minors | No participant media is used. ACTES selected signal table has pseudonymous IDs, not observed names/voices/images, but study includes adolescents. Do not publish recognizable identities or join demographic/contact records. CRF free text and OSDR investigator contact fields stay outside delivery. This is not a claim that every original file was cleared |
| No proprietary/business-sensitive material or materials lacking requisite rights | Only public endpoints used, no private NASA records/DUA bypass. Public availability is evidence of access, not a blanket rights/consent finding |
| No export-controlled information | No export-control marking observed in selected public metadata/source notices; no independent ITAR/EAR classification or universal certification is inferred from a public URL. Do not add restricted records |
| NASA branding/endorsement and submissions | Cite NASA without implying endorsement; no NASA logo copied into product as part of acquisition. Source-site assets retained only as ignored research responses |

## Dataset findings

"Verified reuse" below is specific source evidence, not organizer endorsement
or a statement that scientific units/timestamps are complete.

| Dataset | License/access evidence | Current event/delivery disposition |
|---|---|---|
| CRF | CC0-1.0 in official DOI10.83263/wjw1-ta27; sample public | Verified reuse; scientific citation; exclude free-text comments; units still unknown |
| MR079G | CC0-1.0, DOI10.83263/bk5h-r757 | Verified reuse; preserve source context; slash-date ordering needs evidence |
| MR035G | CC0-1.0, DOI10.83263/7myc-5j86 | Verified reuse; BMD unit and calibration context need interpretation evidence |
| BRSMImmune | CC0-1.0, DOI10.83263/75we-ch31 | Verified reuse; analyte units and protocol time mapping pending |
| MR080G | CC0-1.0, DOI10.83263/w056-8t76 | Verified reuse; some unqualified column units pending |
| DTO684 | CC0-1.0, DOI10.83263/0d67-bk75 | Verified reuse; distinguish absorbed/equivalent dose and garbled header |
|96-E044 | CC0-1.0, DOI10.83263/7nhp-yt75, selected public file only | Verified reuse of public sample; grouped statistics, not individual records; protected files not accessed |
| MSD007 | CC0-1.0, DOI10.83263/xj28-wp80 | Verified reuse; chart-only CO2 and toxicity-index context preserved |
| BUT CGM1.0.0 | Publisher license/checksum CC BY4.0, DOI10.13026/hv8f-3w60 | Ordinary reuse conditions verified; event wording unresolved. Keep research citation and synthetic example; review before real rows become Solution Materials |
| ACTES1.0.0 | Publisher license/checksum ODC Attribution1.0, DOI10.13026/2qs3-kh43 | Same event interpretation issue; preserve database/output notices and requested paper citations; no recognizable minor identities/media |
| ITBA1.0.1 | Publisher license/checksum ODC Attribution1.0, DOI10.13026/he0v-tf17 | Same event interpretation issue; database license is not blanket clearance of independently copyrighted contents such as questionnaires |
| OSD-51 | Public metadata/listing; file entries restricted:false; DOI10.26030/3w73-jn41 has empty rightsList | NASA-managed OSDR AWS registry declares unrestricted reuse for its public data distribution, corroborated by NASA guide. Study-specific license fields empty; verify selected file distribution/notices; exclude investigator contacts |
| OSD-56 | Public metadata/listing; DOI10.26030/nc96-xp67 has empty rightsList | Same repository-level unrestricted-use evidence; public version2, restricted:false. Verify selected file distribution/notices; no CC0/CCBY grant inferred from empty fields |
| EDA RR-1 | Public NASA app/API and original JSON downloaded | Policy verification pending. Preserve ISS/ground rodent-environment context and matched ground dates, not personal exposure; citation by app/endpoint/access date until a prescribed citation is verified |

CGMacros remains excluded because its noncommercial restriction conflicts
with unrestricted reuse. Access-gated Malaga and protected human/LSDA records
remain excluded. Citing a reference requested by ACTES does not incorporate
Malaga data or authorize its use. Do not replace the missing event-eligibility
evidence with an assertion that all attribution licenses are accepted.

## Concrete corrections and retained evidence

RUN: A separate reviewer checked all8 NLSP rightsList declarations, verified
the three PhysioNet license files against publisherSHA256, inspected actual
app paths and executed the16-record synthetic scenario. No real dataset
loading was found; originals are untracked/ignored and the HTTP server is
confined to app/. The parent confirmed the new OSDR/EDA response hashes and
reviewed DOI records, API schemas and source-specific context. Documentation
checks pass. No product functionality changed; no new runtime tests were added.

Primary evidence manifests:

- [Original three samples](data/acquisition-2026-11-15.json)
- [CRF/MR079G license evidence](data/use-conditions-2026-11-15.json)
- [Eight additional sources](data/additional-acquisition-2026-11-15.json)
- [OSDR/EDA continuation](data/osdr-eda-acquisition-2026-11-15.json)

The independent review is reproduced in the findings above; its transient
log is /tmp/orbita-osdr-review/independent-terms-review.md. Source pages/code
were inspected only for evidence. No external application, viewer or notebook
implementation was copied into product code.

## Remaining actions before adding real data or submitting

The newly discovered official redirects need `science.nasa.gov` and
`genelab-shared-repo-prod.s3.amazonaws.com`. Their additive draft change is
saved, not active/published. After activation, retrieve the direct OSDR terms and
selected study files to finish file-distribution/notices and EDA applicability
checks. Repository-level unrestricted-use evidence for public OSDR AWS data
was meanwhile found; see [the follow-up](OSDR_EDA_USE_RESEARCH.md).

For the three PhysioNet datasets, resolve the organizer's interpretation
before depending on real rows in the submitted Solution, or keep the current
synthetic path that does not require those rows. No organizer/author was
contacted by this task. Technical parsing readiness is a separate issue.

M23 is still unimplemented: inspect the actual final archive, embedded data,
charts/screenshots, export files, notices and media before claiming final
compliance. .gitignore is not a packaging guarantee. Reopen this assessment
if scope/artifacts/licenses change or any real data is introduced. The audit
records verified facts and unresolved conditions; it does not label the
entire future submission compliant before those checks exist.

## User-authorized real import follow-up

M21 now imports selected CRF/MR079G/MR035G/MR080G/BUTCGM records, with3861
records persisted only in an ignored local real-data profile. PhysioNet
remains provisionally enabled under the user's explicit decision despite
no organizer response; it is removable by source identity if declined.
The earlier synthetic-only eligibility stance is superseded to this extent.
No actual raw rows/browser state are included in tracked delivery sources;
future real charts/exports retain citation/license requirements. No final
package/media clearance or clinical validation is claimed.
