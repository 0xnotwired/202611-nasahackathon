# Resources used (delivery list)

Status as of November 15, 2026. This is the list the event terms require at delivery: every resource used, open source ones included, with its license and a citation. It is **not** the reading list; that is [RESOURCES.md](RESOURCES.md), which records what was consulted for ideas.

Rules it answers to: the 2026 participant terms (https://www.spaceappschallenge.org/legal/, updated August 7, 2026, read on November 15, 2026) require non-NASA material to be freely available without restriction or open source under an OSI license, each license to be identified in the documentation, and every source to be cited, open source ones included. The user's decision of November 15, 2026 adds: no already-made project from other people, except dependencies approved by name (see [../AGENTS.md](../AGENTS.md)).

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
| Google Chrome for Testing | 153.0.8010.12 | the browser Playwright drove for experiment E00, screenshots and video | **Not open source.** Google Chrome terms of service apply | The installed `ABOUT` file says "See the Terms of Service at chrome://terms"; the bundled Widevine module's `LICENSE` says it is not open source software | Used only to test and record; not part of the Solution Materials. User decision of 2026-11-15: kept as a development tool, no further action. The tooling repository for Chrome for Testing is Apache-2.0 (secondary page), which is not the binary's license |
| FFmpeg | 6.1.1 (Ubuntu build) | encoding the demonstration video | LGPL-2.1+ with optional GPL-2+ parts | The installed copy's Debian `copyright` file; https://www.ffmpeg.org/legal.html says that if the GPL parts are used the GPL applies to all of FFmpeg | The installed build reports `--enable-gpl`, so the GPL applies to that binary. Decision of 2026-11-15: used only as a command-line tool to produce the video. The binary is not redistributed and not linked into anything of ours, and the video is data, not FFmpeg code. If it is ever distributed or linked, rebuild without `--enable-gpl` and follow its LGPL checklist |
| GitHub | n/a | hosting the repository | Service terms, no code used | n/a | |

## 3. Data

| Source | Origin | Terms found | Citation status |
|---|---|---|---|
| NLSP studies (MR079G, CRF, MR035G, BRSMImmune, MR080G, DTO 684, MSD007) | NASA | Each study card states its datasets are publicly available; NLSP terms of use allow viewing and downloading public content. No explicit license | Per-study citation strings not written yet |
| NLSP 96-E044 | NASA | Public files only | Not written yet |
| OSDR (OSD-51, OSD-56) | NASA | AWS Open Data registry: no restrictions on use | Use each study's citation button; not written yet |
| Environmental Data App | NASA (OSDR) | Covered by OSDR; the OSDR FAQ gives the citation text | Not written yet |
| ACTES cycle ergometer | PhysioNet | Open Data Commons Attribution v1.0 | Attribution and license go in the delivery |
| ITBA wearable | PhysioNet | Open Data Commons Attribution v1.0 | Attribution and license go in the delivery |

Details and integration limits: [DATASETS.md](DATASETS.md). The Málaga treadmill dataset was ruled out for its restricted license and is not used. Original NASA files and PDFs are not uploaded to this repository. The importer module M21 and the NASA cases view M22 must carry each citation on screen.

## 4. Concept references (nothing incorporated)

XState, Open mHealth, Open MCT, AMOS, LHC-Forms, CQL Execution and Medplum were read for ideas. No code, structure or text from them is in this repository, so their licenses were not examined. The literature (S01–S18, A01–A06, B01–B26) is in [ACADEMIC_BASE.md](ACADEMIC_BASE.md), [APPLIED_RESEARCH.md](APPLIED_RESEARCH.md) and [EXTENDED_RESEARCH_B.md](EXTENDED_RESEARCH_B.md), each with its reading level.

## 5. AI assistance

Claude (Anthropic), used through Claude Code, wrote the documentation and scripts in this repository and is the intended author of the product modules under the work orders. It is recorded in three places: the `Co-Authored-By` line of every commit, the handoff log in [AGENT_ROADMAP.md](AGENT_ROADMAP.md), and the module's experiment record. Nothing in this list claims a human review that those records do not show. Agents are forbidden to reproduce or transform code from other projects (AGENTS.md).

## 6. Open items

- **Other browsers:** Firefox and WebKit could not be downloaded in the session (the network allowlist answered 403 for the Playwright download hosts), so nothing is verified on them.
- **Dataset citations:** the per-study citation strings are not written.
- **Meeting rule:** the statement that already-made projects cannot be used is not in the written terms and its source is not verified.
- **Full texts:** the Python license text and the bundled-library licenses of Node.js and Playwright were not opened.
