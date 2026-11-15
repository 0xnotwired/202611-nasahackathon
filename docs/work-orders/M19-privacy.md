# Work order M19 — Privacy

Phase F4 · wave 1 · level 3 · contracts version 0.4

**Goal.** Keep the session and the log of what the astronaut decided to share.

**Owned paths.** `app/privacy/`, and the record `docs/experiments/M19.md`. Nothing outside them.

**Depends on.** M01 Core, M04 Store. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M9), `docs/EXTENDED_RESEARCH_B.md` (B03), `docs/THREAT_MODEL.md`.

## Deliverables

- `createSession`, `logShared`, `sharedLog`.

## Done when

- [ ] With an active session, no operation asks to unlock again.
- [ ] Every sharing action leaves a `Shared` entry with what, with whom and when.
- [ ] The shared log cannot be edited or deleted.
- [ ] No text in the module says "encrypted", "secure" or "protected".
- [ ] Without an active session, sharing returns an error.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Experiments

Copy these predictions into `docs/experiments/M19.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M19-X1`, `M19-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M19-P1 | `logShared` with no active session | `ok: false`; `shared` is unchanged | Skip the session check (R8) |
| M19-P2 | `logShared` with an active session and an injected clock | One `Shared` entry with `what`, `with`, `channel`, and `time` equal to the injected time | Use the real clock |
| M19-P3 | Unlock once, then run two operations | `active()` stays `true`; no second unlock is requested | Ask to unlock on each operation |
| M19-P4 | Search the module's source and texts | None of "encrypted", "secure", "protected" | Add "secure" to a message |
| M19-P5 | `updateState("shared", id, …)` through the store | `ok: false` (R7) | —  (the control is M04's) |

## Out of scope

- Encryption, passwords, real authentication.
- Permissions between crew members.

**The costliest mistake.** Promising a protection that does not exist is worse than not promising it.

**Skills.** secure-by-construction, zero-trust-as-a-claim, honest-degradation.

Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
