# Dataset use conditions and delivery

Reviewed November 15, 2026. Scope: acquired CRF, MR079G and BUT CGM samples.
Evidence: [legal review record](data/use-conditions-2026-11-15.json),
[acquisition manifest](data/acquisition-2026-11-15.json), and
[dataset citations](DATASET_CITATIONS.md).

## BUT CGM: verified conditions

SOURCE: The official PhysioNet version1.0.0 study page says anyone may access
the files subject to the specified CC BY4.0 license. The downloaded license
matches the publisher checksum list. Sections2–4 permit reproduction,
sharing/adaptation and database reuse under their stated conditions.

When sharing covered dataset material, retain supplied creator/copyright,
license and warranty-disclaimer notices, link to the source and license,
and identify changes. The study page requests both its dataset citation and
the standard PhysioNet citation. Do not imply author endorsement or impose
restrictions that prevent recipients exercising licensed rights. Privacy,
publicity, trademark and other rights are not all granted by this license.
These observations describe the reviewed license, not clinical validation.

## NASA CRF and MR079G: verified study-specific licenses

SOURCE: After the environment network update, the two official DataCite
records are reachable. Their rightsList entries explicitly declare Creative
Commons Zero v1.0 Universal (CC0-1.0):

- CRF: https://api.datacite.org/dois/10.83263/wjw1-ta27
- MR079G: https://api.datacite.org/dois/10.83263/bk5h-r757

The registry additionally supplies creators, publicationYear2026 and
publisher Ames Research Center. Original responses and SHA-256 hashes are
recorded in the legal-review JSON; complete citations are in the attribution
notice. This supersedes the earlier network-blocked evidence gap.

CC0 supports copying/reuse/redistribution within the rights the affirmer can
waive. Scientific attribution is still required by this project's provenance
and event requirements, even though CC0 itself has no copyright-attribution
condition. Do not infer endorsement, privacy clearance or identical rights
for every other NASA resource.

SOURCE: The general NASA media policy is now reachable and was read at
https://www.nasa.gov/nasa-brand-center/images-and-media/. It describes
educational/informational use, source acknowledgment, no endorsement and
third-party materials. It is not substituted for these specific study DOI
rights declarations.

## Concrete delivery scope

Include the original application, metadata-only provenance manifest,
[attributions](DATA_ATTRIBUTIONS.md), official study/DOI/download links and
clearly identified synthetic demonstration data. Keep real originals under
ignored data/originals/ and leave them out of the distributable package.

Excluding CSV files prevents bundling those originals; it does not exempt
copied/extracted material in real-data charts, screenshots, summaries,
exports or derived databases. Preserve attribution and applicable terms for
any such shared material. A public synthetic demo plus optional local file
selection avoids publishing the acquired NASA rows in the delivery itself;
it does not change the conditions governing a user's subsequent data use.

For BUT CGM sharing, include its full requested citations, CC BY4.0 link and
change notice. Preserve citations to NASA studies even when delivery only
links to their data. The application's own Apache2.0 license applies to its
original code; external datasets retain their own terms.

M23 is not implemented. These are delivery requirements, not a claim that a
packager was tested. .gitignore alone does not enforce package contents.
The future packaging check must inspect the produced archive/HTML and verify
that it contains no originals or embedded real source rows.

## Remaining preparation issues

The network/legal-identity blocker is resolved for the three acquired
samples. CRF's variable-unit dictionary and authoritative source-time/UTC
interpretation remain open technical questions. Resolving a license does
not establish measurement units or timestamp semantics. No environment
configuration or publication was changed by this verification.
