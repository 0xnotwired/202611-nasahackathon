# Work order M24 — Simulated sync and ground panel

Phase F4 · wave 3 · level 3 · contracts version 0.3

**Goal.** Show the path from the tablet to the medical team (decision D9, simulated option C): the astronaut chooses what to send, the delivery waits in a queue if there is no link, travels with a simulated delay and reaches a ground panel with its send and receive times.

**Owned paths.** `app/sync/`, `app/ui/ground/`. Nothing outside them.

**Depends on.** M07 Base interface, M18 Summary, M19 Privacy. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md` (`sync` section and `Delivery` shape), `docs/ORCHESTRATION_PLAN.md` (D9), `docs/EXTENDED_RESEARCH_B.md` (B03, B10, B11), `docs/THREAT_MODEL.md`.

## Deliverables

- `createLink`, `enqueue`, `advance`, `received`.
- View `app/ui/ground/` (`model.js` and `view.js`) with the medical team's panel and the link control: real time, delayed, no link.

## Done when

- [ ] Only something with a `Shared` entry logged by M19 can be enqueued.
- [ ] With `no_link`, the tablet keeps working and deliveries stay `queued`; none is lost.
- [ ] With `delayed`, a delivery goes through `in_transit` and arrives after the configured time, measured with the injected clock.
- [ ] The same delivery handed over twice appears only once in `received`.
- [ ] The panel shows creation, send and receive time, and the age of the data.
- [ ] A crew member who sent nothing appears as "nothing sent", never as "nothing new".
- [ ] Record states and origin travel intact: a "not recorded" arrives as "not recorded".
- [ ] The interface says "simulated sync" and shows no users, passwords or encryption.
- [ ] Every test was seen failing against broken code before passing, and the report says how.
- [ ] `git diff --stat` against the integration branch shows only owned paths.

## Out of scope

- Real server, network, authentication or encryption: they are a later level that reopens D7.
- Sending from the ground to the spacecraft (plan changes): it introduces conflicts and is left for that level.

**The costliest mistake.** A ground panel that looks like a real system, or that shows "all fine" for someone who sent nothing.

**Skills.** honest-degradation, secure-by-construction, validate-at-the-boundary, falsifiable-testing.

Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
