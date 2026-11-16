# Hackathon README refresh — 2026-11-16

Scope: documentation only, based on main bb57090 and the challenge text supplied by the user. No module acceptance or product behavior changes.

Before editing: read the local skill index and the bodies of `readme-architecture` and `git-discipline`. Applied on 2026-11-16: problem and observable journey before architecture; claims bounded by implementation; a working branch from origin/main. Repository English-only instructions take precedence over the skill's Spanish companion suggestion.

Prediction before verification: the revised README's relative links resolve, its setup commands serve the actual app and produce the standalone HTML, and it distinguishes the fictional demo, personal records, imported cases and simulated sync. The documentation checker should remain green. No new product tests are needed for this documentation change.

## Verification

- READ: inspected README, root package scripts, local server, gate runner, current contracts/status/handoff and frontend integration. The user-supplied challenge text is the source for the challenge mapping; its live web page was not independently rechecked.
- RUN: `python3 scripts/check_docs.py` passed; relative links resolved. `git diff --check` passed.
- RUN: `npm run package` generated 63 modules, 470512 bytes, hash prefix `81a1b28ae3e1eed8`.
- RUN: launched `scripts/serve.mjs` with an available `PORT` and fetched its root: HTTP 200 with the application HTML. Server stopped after the check.
- RUN (baseline, earlier in this review session, same main bb57090): Node suite reported 435 tests, 427 passed, 8 skipped, 0 failed. This documentation change did not require repeating product tests.

No browser walkthrough, screen-reader test, frontend dependency installation or Mermaid renderer was run for this documentation edit. The Mermaid diagram describes inspected module boundaries; the static documentation checker does not validate its rendering. No acceptance status, contract, runtime code or dataset changed. Changes were prepared on `docs/hackathon-readme`. The user subsequently authorized committing and pushing the complete documentation update to main; Git history records publication.

## Submission fields and pitch follow-up

Read `honest-technical-oratory` before writing the spoken scripts. Continued to apply `readme-architecture` to the submission fields. Prediction: Summary will meet the requested 50–200 words; Project Details will cover behavior, benefits, intended impact, tools, creativity and team considerations; both scripts will preserve the distinction between implemented workflows and clinical validation.

Added Summary (149 whitespace-separated words), Project Details, an English pitch and a Spanish adaptation explicitly requested by the user (an authorized exception to the default repository language). Scripts include approximate timing, screen directions, a fictional demo and bounded answers to jury questions. They are linked from the README.

RUN: documentation checker and `git diff --check` passed after these edits. READ: checked all requested submission topics against the headings and text. No timed rehearsal, new browser run or human audience evaluation was performed. The three-minute duration is a target, not a measurement.

## Hosted demo link

The user supplied `https://hackathon-nasa-orbita.vercel.app/#/adaptation` as the deployed application and authorized the README update and push to main. Added the link prominently, in the walkthrough and as a no-install option. Existing storage and simulated-communication boundaries remain explicit.

Prediction before verification: relative documentation links and whitespace checks should pass; a request to the hosted origin would establish HTTP reachability only, not browser behavior. RUN: the environment's proxy rejected the HTTPS CONNECT request with HTTP 403, before reaching the site. This is not evidence that the Vercel deployment itself returns 403. Live availability and behavior could not be independently verified here; the deployment link is user-provided.
