# Work order M04 — Store

Phase F1 · wave 2 · level 0 · contracts version 0.3

**Goal.** Be the only door to persistence, with two implementations of the same contract: in memory and IndexedDB.

**Owned paths.** `app/store/`. Nothing outside them.

**Depends on.** M01 Core. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/TECHNICAL.md`.

## Deliverables

- `openStore` and the contract's `Store` object, in memory and in IndexedDB.
- A `schema_version` stamp on everything saved.

## Done when

- [ ] Both implementations pass the same contract suite (IndexedDB is checked in a browser and reported as such).
- [ ] `save` with an existing id fails: it does not overwrite.
- [ ] `records` and `shared` reject `updateState`.
- [ ] `saveBatch` with one invalid element saves none.
- [ ] An object with an unknown or higher `schema_version` is rejected with a clear message.
- [ ] `status()` says `persistent: false` and the reason when it is in memory.
- [ ] `list` never returns another subject's records if it was filtered by subject.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Sync, backup and encryption.
- Validating records on its own: it uses `core`.

**The costliest mistake.** Falling back to memory without saying so makes the astronaut believe their data was saved.

**Skills.** honest-degradation, atomic-state-mutation, versioned-schema-evolution, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
