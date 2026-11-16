# Órbita — implementation and verification

[Project pitch and setup](../README.md) · [Contracts](CONTRACTS.md) · [Audit](AUDIT.md)

This document describes the integrated main application. [TECHNICAL.md](TECHNICAL.md) preserves the earlier proposed design and research; it is not a current implementation inventory.

## Implementation map

The main application is vanilla JavaScript using browser ES modules, native controls, SVG charts and IndexedDB. It has no runtime dependencies. Contract version: **0.22**; record schema: **2**, with legacy schema 1 readers; IndexedDB schema: **3**.

| Path | Responsibility |
|---|---|
| `app/contracts/`, `app/core/` | Public shapes, record validation and comparability. |
| `app/store/` | Memory and IndexedDB backends behind the store interface. |
| `app/mission/`, `app/catalogs/`, `app/scenario/` | Equipment/link configuration, sourced catalog entries and fictional fixtures. |
| `app/readings/` | Queries and descriptive views of recorded data. |
| `app/plan/`, `app/procedures/` | Task scheduling, completion, result linking and versioned procedure executions. |
| `app/episode/`, `app/copilot/`, `app/summary/` | Episode state, data-driven suggestions and structured summaries. |
| `app/privacy/`, `app/sync/` | Explicit sharing decisions and simulated transport. |
| `app/importers/`, `app/export/` | Source-specific CSV adapters and local export with provenance. |
| `app/ui/` | View models and DOM renderers; `base/start.js` composes services. |
| `scripts/package.mjs` | Packages the module graph into `dist/orbita.html`. |
| `frontend/` | Separate Next.js/Node edition with its own dependencies and data store. |

Modules use public entry points and the [contracts](CONTRACTS.md). Each view separates model computation from DOM rendering. The [module board](modules.csv) and [work orders](work-orders/) preserve ownership, dependencies and acceptance state.

## Data invariants

- A record distinguishes `recorded`, `confirmed_none` and `not_recorded`. An unmeasured value is never zero or a confirmation of no symptoms.
- Subject, origin, source, method, time and units travel with the record. Ground analogs, terrestrial observations and flight records are distinct.
- A source time with no established zone is preserved without inventing a UTC instant. Unknown units stay unknown and block unsupported interpretation.
- Comparisons require compatible records. A descriptive difference is not a clinical threshold or a causal claim.
- Task assignment, completion and an observed result are separate facts. Procedure executions retain the version they started with.
- Guidance is loaded as data with source, version and review status. The application cannot certify that a declared review actually happened. No clinical rule ships for real use.

The contracts define the exact fields, supported time representations, error results and permitted transitions. Research restrictions are recorded in [technical source resolution](DATA_TECHNICAL_RESOLUTION.md).

## Storage and trust boundaries

The fictional demo lives in memory. Personal records use local IndexedDB, after the person selects an origin. Imported research cases use a separate store; keeping a file on the device is opt-in. No clinical data server is part of the main application, and its ground panel is a local simulation.

Records are not encrypted by the application. Browser data can be cleared or unavailable, and the UI reports degraded persistence. There is no in-app repair path for a damaged stored record. CSV export is available, but no automatic backup or cross-device profile transfer is implemented.

Chromium's observed `file://` behavior shares storage between file pages; copying or moving the HTML is not a data-isolation mechanism. IndexedDB availability and file-origin behavior need checking in each deployment browser. Other browser engines and screen readers remain unverified.

The package embeds the application modules and applies a content-security policy. The current policy permits inline scripts; replacing that allowance with a hash-based policy remains open. A local package and a green test suite do not establish medical-device safety or comprehensive security. See the latest [G6 findings](experiments/G6.md).

Original datasets, imported artifacts and browser profiles are ignored by Git. Restore originals using [LOCAL_DATA_RESTORE.md](LOCAL_DATA_RESTORE.md), preserving custody hashes and citations. Never treat a cloned repository as an already populated personal database.

## Verification

For the main app, Node.js 22 and npm suffice; no root dependency installation is needed. Python 3 is needed for documentation checks.

```bash
npm test
python3 scripts/check_docs.py
npm run package
```

The main-branch baseline checked on November 16, 2026 reported 435 Node tests: 427 passed, 8 skipped, 0 failed in this environment. Skips do not constitute successful verification of the missing inputs. The documentation check passed and the package contained 63 modules.

Browser checks additionally need the **Python Playwright package** and a Chromium executable. Install development tooling in a virtual environment, then set `ORBITA_CHROMIUM` to an executable that exists on your machine:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install playwright
```

These activation commands use Bash; in Windows PowerShell use `.venv\Scripts\Activate.ps1` instead. Keep the development environment out of commits.

For example, in Bash with a system Chromium installed at `/usr/bin/chromium`:

```bash
source .venv/bin/activate
export ORBITA_CHROMIUM=/usr/bin/chromium
python3 tests/walkthrough/g6-browser.py
```

If Chromium is not installed, Playwright can install its development browser with `python -m playwright install chromium`; point `ORBITA_CHROMIUM` at that browser's actual executable. Operating-system libraries may also be required. A hard-coded path copied from another machine is not a browser installation.

After restoring originals, the complete gate runner repeats tests, browser walkthroughs and negative controls:

```bash
node scripts/run-gates.mjs
```

Missing source files or browser prerequisites cause gate steps to be skipped or fail; the runner treats skipped steps as failures. Negative controls temporarily alter code and restore it, so run them in an isolated checkout with no concurrent writers. Do not use a bare `node --test` at the repository root: the separate frontend's TypeScript tests have their own setup.

Evidence records distinguish **RUN**, **BROWSER**, **READ** and **SOURCE**. Historical measurements and controls have their recorded scope; they do not imply that every environment was retested. Later gates remain pending human acceptance, and G6-W4's volunteer study is not done.

## Further decisions

[HANDOFF.md section 4](HANDOFF.md#4-what-is-left-in-priority-order) lists recovery policy, package script policy, IndexedDB write cost, importer restrictions, backend integration, human studies and organizer decisions. [AUDIT.md](AUDIT.md) contains historical findings and later resolutions; read its addenda before treating an older finding as current.

The project has not demonstrated clinical effectiveness, deployment-scale performance or real communication with Earth. [Frontend integration](../frontend/INTEGRATION.md) explains why the server edition remains separate. Research and dataset licenses are documented in [RESOURCES_USED.md](RESOURCES_USED.md) and [DATA_ATTRIBUTIONS.md](DATA_ATTRIBUTIONS.md).
