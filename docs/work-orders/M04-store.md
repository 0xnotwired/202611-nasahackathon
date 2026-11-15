# Work order M04 — Store

Phase F1 · wave 2 · level 0 · contracts version 0.3

**Goal.** Be the only door to persistence, with two implementations of the same contract: in memory and IndexedDB.

**Owned paths.** `app/store/`, and the record `docs/experiments/M04.md`. Nothing outside them.

**Depends on.** M01 Core. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md`, `docs/TECHNICAL.md`.

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

## Experiments

Copy these predictions into `docs/experiments/M04.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M04-X1`, `M04-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M04-P1 | `save` an object with id `r1`; `save` a different object with id `r1`; `get` it | The second `save` returns `ok: false`; `get` returns the first object, deep-equal | Make `save` overwrite (R7) |
| M04-P2 | `updateState("records", id, …)` and `updateState("shared", id, …)` | Both `ok: false`; the stored objects are unchanged | Allow `records` in `updateState` (R7) |
| M04-P3 | `saveBatch` of three objects, the second with an id that already exists | `ok: false`, and `list` shows none of the three | Save one by one without undoing: the first stays saved |
| M04-P4 | Read an object whose `schema_version` is `SCHEMA_VERSION + 1` | `ok: false` with a message that names the version; never returned as current | Skip the version check |
| M04-P5 | `openStore({ kind: "memory" })`, then `status()` | `kind` is `memory`, `persistent` is `false`, `reason` is not empty | Return `persistent: true` |
| M04-P6 | Records of subjects A and B saved; `list("records", { subject: "A" })` | Exactly A's ids | Drop the subject filter (R9) |
| M04-P7 | In a real browser: save, close the browser, reopen, `get`. Then the same in a private window | The same object comes back; in the private window either it works or `openStore` returns an error that reaches the screen. BROWSER level; if not run, the record says "not verified in a browser" | Read with a fresh profile: nothing comes back (E00-P4) |

## Out of scope

- Sync, backup and encryption.
- Validating records on its own: it uses `core`.

**The costliest mistake.** Falling back to memory without saying so makes the astronaut believe their data was saved.

**Skills.** honest-degradation, atomic-state-mutation, versioned-schema-evolution, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
