# Work order M19 — Privacy

Phase F4 · wave 1 · level 3 · contracts version 0.3

**Goal.** Keep the session and the log of what the astronaut decided to share.

**Owned paths.** `app/privacy/`. Nothing outside them.

**Depends on.** M01 Core, M04 Store. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/PROPOSAL_IMPROVEMENTS.md` (M9), `docs/EXTENDED_RESEARCH_B.md` (B03), `docs/THREAT_MODEL.md`.

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

## Out of scope

- Encryption, passwords, real authentication.
- Permissions between crew members.

**The costliest mistake.** Promising a protection that does not exist is worse than not promising it.

**Skills.** secure-by-construction, zero-trust-as-a-claim, honest-degradation.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
