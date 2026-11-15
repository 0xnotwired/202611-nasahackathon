# Work order M24 — Simulated sync and ground panel

Phase F4 · wave 3 · level 3 · contracts version 0.4

**Goal.** Show the path from the tablet to the medical team (decision D9, simulated option C): the astronaut chooses what to send, the delivery waits in a queue if there is no link, travels with a simulated delay and reaches a ground panel with its send and receive times.

**Owned paths.** `app/sync/`, `app/ui/ground/`, and the record `docs/experiments/M24.md`. Nothing outside them.

**Depends on.** M07 Base interface, M18 Summary, M19 Privacy. They must be integrated before starting.

**Read first.** `CLAUDE.md`, `AGENTS.md`, `docs/CONTRACTS.md`, `docs/METHOD.md` (`sync` section and `Delivery` shape), `docs/ORCHESTRATION_PLAN.md` (D9), `docs/EXTENDED_RESEARCH_B.md` (B03, B10, B11), `docs/THREAT_MODEL.md`.

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

## Experiments

Copy these predictions into `docs/experiments/M24.md` **before** writing the implementation, see each test fail, then pass, then apply the negative control. Add your own as `M24-X1`, `M24-X2`… The standing controls for R1–R9 in METHOD.md also apply.

| Id | Do this | Prediction | Negative control: break it like this and a test must go red |
|---|---|---|---|
| M24-P1 | `enqueue` with a `sharedId` that does not exist | `ok: false`; no delivery is created | Skip the lookup (R8) |
| M24-P2 | Mode `no_link`: `enqueue` two, `advance` three times | Both deliveries exist and are `queued` | Drop deliveries when there is no link |
| M24-P3 | Mode `delayed` with 60 000 ms and an injected clock: `advance` at t, at t + 59 999 and at t + 60 000 | `in_transit`, still `in_transit`, then `received` with `received` equal to the clock | Use a real timer; or compare with `>` instead of `>=` |
| M24-P4 | Hand the same delivery to the ground twice | `received` lists it once | Append without checking the id |
| M24-P5 | Ground model for a subject who sent nothing | "nothing sent"; never "nothing new" | Show an empty row or "nothing new" (R1) |
| M24-P6 | Send a summary that contains a `not_recorded` entry and compare `what` on arrival | Deep-equal to what was sent | Rewrite states on arrival (R1) |
| M24-P7 | Search the view's texts | "simulated sync" is present; none of "password", "login", "encrypted" | Remove the label |

## Out of scope

- Real server, network, authentication or encryption: they are a later level that reopens D7.
- Sending from the ground to the spacecraft (plan changes): it introduces conflicts and is left for that level.

**The costliest mistake.** A ground panel that looks like a real system, or that shows "all fine" for someone who sent nothing.

**Skills.** honest-degradation, secure-by-construction, validate-at-the-boundary, falsifiable-testing.

Method and record format: [METHOD.md](../METHOD.md). Method and record format: [METHOD.md](../METHOD.md). Delivery report and review cycle: [ORCHESTRATION_PLAN.md](../ORCHESTRATION_PLAN.md). Interfaces: [CONTRACTS.md](../CONTRACTS.md).
