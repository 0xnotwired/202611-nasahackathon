# Resources used (delivery list)

Current implementation: [CURRENT_STATUS.md](CURRENT_STATUS.md). Source-specific
evidence and dated investigation history below retain their original scope.

Status as of November 15, 2026. This is the list the event terms require at delivery: every resource used, open source ones included, with its license and a citation. It is **not** the reading list; that is [RESOURCES.md](RESOURCES.md), which records what was consulted for ideas.

Rules it answers to: the 2026 participant terms (https://www.spaceappschallenge.org/legal/, updated August 7, 2026; read on November 15, 2026, and the full text was supplied by the user the same day) require non-NASA material to be freely available without restriction or open source under an OSI license, each license to be identified in the documentation, and every source to be cited, open source ones included. The user's decision of November 15, 2026 adds: no already-made project from other people, except dependencies approved by name (see [../AGENTS.md](../AGENTS.md)).

How to read the "License source" columns: it says what was actually read in this repository's sessions. Nothing here comes from memory. OSI approval of each license name was not checked against opensource.org in this session.

**Keeping it true:** whoever adds a tool, dataset or dependency adds its row in the same commit. A row that cannot say where its license statement was read does not go in.

## 1. Product dependencies

None (decision D2). The product is the team's own code, licensed under Apache-2.0 (see [../LICENSE](../LICENSE)). Browser features (IndexedDB, SVG, ES modules) are the platform, not third-party code.

## 2. Development tools (not distributed inside the product)

| Tool | Version seen | Used for | License | License source | Note |
|---|---|---|---|---|---|
| Node.js | 22.23.4 | `node --test`, local HTTP server in probes | MIT | The installed copy's `LICENSE` begins with the MIT permission text; it also lists bundled libraries under other licenses, not reviewed | Secondary pages agree |
| Python | 3.13.18 | `scripts/check_docs.py` | Python Software Foundation License | Copyright notice printed by the interpreter; the license text was not opened | |
| Git | 2.43.0 | version control | GPL-2 (some files BSD-3-Clause) | The installed copy's Debian `copyright` file | |
| Playwright (npm and Python packages) | 1.63.0 | browser probes, screenshots, video capture | Apache-2.0 | The installed package's `LICENSE`; it states the code derives partly from Puppeteer (Apache-2.0) | Older Debian packaging lists BSD-3-Clause, MPL-2.0 and OFL-1.1 parts; bundled parts of 1.63.0 not reviewed |
| Chromium |156.0.8078.79, preinstalled Debian build | Real-source importer/IndexedDB and G0/G1 browser verification | BSD-3-clause for Chromium authors; bundled components retain separate licenses | Read installed /usr/share/doc/chromium/copyright primary Files:* entry; complete bundled license inventory not audited | Development-only executable, no browser binary shipped with product |
| Google Chrome for Testing | 153.0.8010.12 | the browser Playwright drove for experiment E00, screenshots and video | **Not open source.** Google Chrome terms of service apply | The installed `ABOUT` file says "See the Terms of Service at chrome://terms"; the bundled Widevine module's `LICENSE` says it is not open source software | Used only to test and record; not part of the Solution Materials. User decision of 2026-11-15: kept as a development tool, no further action. The tooling repository for Chrome for Testing is Apache-2.0 (secondary page), which is not the binary's license |
| FFmpeg | 6.1.1 (Ubuntu build) | encoding the demonstration video | LGPL-2.1+ with optional GPL-2+ parts | The installed copy's Debian `copyright` file; https://www.ffmpeg.org/legal.html says that if the GPL parts are used the GPL applies to all of FFmpeg | The installed build reports `--enable-gpl`, so the GPL applies to that binary. Decision of 2026-11-15: used only as a command-line tool to produce the video. The binary is not redistributed and not linked into anything of ours, and the video is data, not FFmpeg code. If it is ever distributed or linked, rebuild without `--enable-gpl` and follow its LGPL checklist |
| xlrd |2.0.1 (preinstalled Python tooling) | Inspect public legacy XLS sample cells only; no macro execution or product import | BSD-style, two retained notices | Read installed xlrd-2.0.1.dist-info/LICENSE (Machin/Lingfo and earlier Giffin/Khan notices) | Development inspection only, not installed or shipped as an application dependency |
| pdftotext (Poppler) |25.03.0, preinstalled | Extract same-test NASA PDF axis labels for unit verification | Poppler GPL-2 or GPL-3; portions under other licenses | Installed /usr/share/doc/poppler-utils/copyright and pdftotext version notice inspected | Development research only; no binary/package installed, linked or distributed with product |
| GitHub | n/a | hosting the repository | Service terms, no code used | n/a | |
| annatchijova/SKILLS | Commit 92b4ff0ec30752ba1595615d881116d676485421 | User-requested local agent methodology; 199 SKILL.md files plus companion references/scripts, outside the product | Apache-2.0; bundled red-team attribution under MIT | Read upstream LICENSE and red-team/LICENSE.claude-red in the retrieved repository; both retained verbatim under .agents/skills/ | Explicit user authorization on 2026-11-15. Source URL and SHA-256 manifest: ../.agents/SKILLS_SOURCE.json. No product import or automatic helper execution |

## 3. Data

| Source | Origin | Terms found | Citation status |
|---|---|---|---|
| Eight NLSP studies including96-E044 public sample | NASA | CC0-1.0 read in individual DataCite rightsList, original responses retained | Full registered citations in DATASET_CITATIONS.md; source reuse verified, protected records excluded |
| OSD-51/56 | Agency/partner/university research hosted by NASA | Pinned NASA-managed AWS OSDR registry declares no restrictions; corroborated by NASA guide. Per-study license fields empty | Repository evidence verified for covered public distribution; selected download/notices scope still needs checking |
| EDA RR-1 | NASA application/environment source | API data acquired; policy scope not independently established | App/mission/endpoint/access-date reference; prescribed policy/citation pending |
| ACTES1.0.0 | PhysioNet third party | ODC Attribution1.0 read in original LICENSE and official card | Dataset, requested original-publication and platform citations retained; event interpretation conditional |
| BUT CGM1.0.0 | PhysioNet third party | CC BY4.0 read in original LICENSE and official card | Dataset/platform references verified; event interpretation conditional |
| ITBA1.0.1 | PhysioNet third party | ODC Attribution1.0 read in original LICENSE and official card | Dataset, requested original-publication and platform citations retained; event interpretation conditional |

Data licenses permit reuse on their own terms; they are not automatically
OSI-approved software licenses. The event's non-NASA "without restriction"
branch cannot be conclusively accepted or rejected solely because attribution
is required. See [the event-specific review](SPACE_APPS_DATA_REVIEW.md).
Actual application delivery uses original synthetic records and does not
require these real source rows. Conditional third-party integrations remain
research choices pending event eligibility, not silently approved materials.

## 4. Concept references (nothing incorporated)

XState, Open mHealth, Open MCT, AMOS, LHC-Forms, CQL Execution and Medplum were read for ideas. No code, structure or text from them is in this repository, so their licenses were not examined. The five pages listed by the challenge (NASA Human Research Program hazards, risks and ongoing research; two CSA articles) are described in [RESOURCES.md](RESOURCES.md); they were read, and nothing from them is in the product. The literature (S01–S18, A01–A06, B01–B26) is in [ACADEMIC_BASE.md](ACADEMIC_BASE.md), [APPLIED_RESEARCH.md](APPLIED_RESEARCH.md) and [EXTENDED_RESEARCH_B.md](EXTENDED_RESEARCH_B.md), each with its reading level.

## 5. AI assistance

Claude (Anthropic), used through Claude Code, wrote the documentation and scripts in this repository and is the intended author of the product modules under the work orders. It is recorded in three places: the `Co-Authored-By` line of every commit, the handoff log in [AGENT_ROADMAP.md](AGENT_ROADMAP.md), and the module's experiment record. Nothing in this list claims a human review that those records do not show. Agents are forbidden to reproduce or transform code from other projects (AGENTS.md).

OpenAI Codex also authored M00–M05 and the G0/G1 walkthroughs in the
cloud session on November 15, 2026, with a separate Codex agent performing
independent review. No outside product implementation or library was incorporated. The user separately authorized the verbatim development-skill snapshot under .agents/skills/; its attribution is listed above.
AI provenance and the controls are recorded in the M00/G0 experiment records,
the handoff log and the integration commit's Co-Authored-By line. Existing
development tools were reused; no dependency was installed.

## 6. Other obligations in the terms that touch the delivery

From the full text supplied on 2026-11-15: the participant is responsible for the Solution and its Solution Materials not containing export-controlled information (ITAR, EAR); solutions that promote commercial services or products are not accepted; no personally identifiable information, and no recognizable names, voices or likenesses of people under 18; a submitted video must be the participant's own work and must not contain third-party material that infringes rights, with written consent from anyone featured. The text says nothing about already-made projects.

## 7. Open items

- **Other browsers:** Firefox and WebKit could not be downloaded in the session (the network allowlist answered 403 for the Playwright download hosts), so nothing is verified on them.
- **Dataset citations:** written in [DATASET_CITATIONS.md](DATASET_CITATIONS.md) for PhysioNet, partly for OSDR and the Environmental Data App; the NLSP fields are missing because the site was not reachable.
- **Meeting rule:** the statement that already-made projects cannot be used is not in the written terms and its source is not verified.
- **Full texts:** the Python license text and the bundled-library licenses of Node.js and Playwright were not opened.

## Additional acquisition verification — November15

The [additional manifest](data/additional-acquisition-2026-11-15.json)
supersedes the incomplete rights/citation statuses above for MR035G,
BRSMImmune, MR080G, DTO684,96-E044 and MSD007: their individual DOI records
explicitly declare CC0-1.0. CRF/MR079G CC0 verification is recorded separately.
ACTES1.0.0 and ITBA1.0.1 original license files and official cards were read
and declare ODC Attribution1.0, including public-output notice requirements.
No PhysioNet research notebooks/code were downloaded or incorporated.
OSDR/EDA access is currently blocked; no new download verification claimed.

OSDR policy investigation sources: the NASA-managed AWS Open Data Registry
entry pinned at69cf82c80db1f4b7b16a5843436f58ae0181397f, NASA AWS guide
(reference692224 public content API), public OSD51/56 version2 web-app
records, and static frontend inspection to reject a generated license
fallback. These were research references, not product implementation or
packages. Exact source URLs and hashes are in
[data/osdr-eda-policy-2026-11-15.json](data/osdr-eda-policy-2026-11-15.json).
The registry's plain-language unrestricted-use statement is not relabeled
as CC0/CCBY or extended to all EDA/third-party assets.
