# Órbita: how a claim becomes a fact

Date: November 15, 2026. Maintained by the orchestrator. This is the working method for every agent that builds, reviews or integrates Órbita. [AGENTS.md](../AGENTS.md) states the rules; this document says how to follow them. What each layer and module must prove is in [IMPLEMENTATION_LAYERS.md](IMPLEMENTATION_LAYERS.md) and in the work orders.

It applies these skills from `github.com/annatchijova/SKILLS`: `falsifiable-testing`, `discriminating-proof`, `abductive-engineering`, `claim-provenance-discipline`, `decision-record-discipline` and `destination-driven-construction`.

## The idea

A module is a set of claims: "a missing value never becomes zero", "nothing leaves without an action". A claim that was only read, or only reported by whoever wrote the code, is a hypothesis. It becomes a fact when an experiment that could have come out the other way did not.

Three things already went wrong in this repository for lack of this:

- A figure read in an abstract (B03, "ten times more") was carried into the proposal and turned out to compare different cohorts.
- An article's sentence and its own figure contradicted each other (A03); only reading both caught it.
- The vision page had a bug that the code looked right for (`data-config` used for two things). Only looking at the rendered page showed it.

## The loop

Every module, and every gate, goes through these steps in this order.

1. **Claim.** The work order lists the module's experiments, each with an id (`M06-P1`). Add your own for anything the work order did not foresee.
2. **Prediction, before the run.** Copy the predictions into your record (`docs/experiments/MNN.md`) before writing implementation code. A prediction names exact values: "`total` is `null`", not "it handles empty data".
3. **Red.** Write the test and run it against the placeholder M00 left. It must fail, and fail on the assertion, not on an import error. A test never seen red is not evidence.
4. **Green.** Implement until it passes.
5. **Negative control.** For each prediction, break the code the way the work order says, watch the named test go red, and put the code back. If nothing goes red, the test is too weak: fix the test, not the record.
6. **Record.** Write what you ran and what you saw, including what was refuted and what you did not verify.

When something surprises you (a test passes that should fail, a value you did not expect), stop and write the surprise down. Propose at least two explanations, run first the cheapest test that tells them apart, and record the discarded explanation too.

## Evidence levels

Every claim in a record or a report carries exactly one level. A chain of claims has the level of its weakest link.

| Level | Meaning |
|---|---|
| **RUN** | The command ran in this session and the assertion decided the outcome |
| **BROWSER** | Seen in a real browser in this session; name the browser and version |
| **READ** | Checked by reading the code, with file and line. Not executed |
| **SOURCE** | Checked in a document retrieved in this session. Scientific sources also carry FT, AB or S |
| **ASSUMED** | Not checked. Another agent's report is ASSUMED until you rerun it |
| **REFUTED** | It ran and came out the other way. Recorded, never deleted |

The two directions of error do not weigh the same. Writing ASSUMED for something that was in fact fine costs a rerun and gets noticed. Writing RUN for something nobody ran is silent and spreads. When in doubt, write the lower level.

Node has no DOM. Anything that is drawn is BROWSER or it is "not verified in a browser".

## What counts as a test

A test must be able to fail. These do not count as evidence for a data rule (R1–R9):

- No assertion, or only "it did not throw".
- An existence check: `result` is not null, the list is not empty.
- An expected value computed with the code under test.
- An assertion on a mock's own return value.
- A test that is skipped, or that catches every error.

For R1–R9 the assertion is an exact value or an invariant over all valid inputs. Expected values are written by hand in the test or come from the contract. Test the empty case, the duplicate, the wrong type and the other subject, not only the normal path.

## Standing negative controls

Any module that touches one of these rules shows, in its record, that this breakage turns a test red.

| Rule | Break the code like this |
|---|---|
| R1 | Map `not_recorded` to `confirmed_none`, or drop the state on the way out |
| R2 | Replace a missing value with `0` before adding or averaging |
| R3 | Leave `method` out of the comparability check |
| R4 | Drop `origin` from the object or the label |
| R5 | Read the procedure's current version instead of the stored one |
| R7 | Allow `updateState` on `records` or `shared` |
| R8 | Share or enqueue from inside `generate` |
| R9 | Drop the `subject` filter from a query |

R6 (no clinical thresholds in code) has one partial mechanism since contracts 0.4: M06 tests that `attention` never returns `within` without a criterion in the configuration (mutation: return `within` when there is none). Everything else has no automatic check: the reviewer reads every module for numeric comparisons against measured values that do not come from `attention_criteria`, and reports it at level READ.

## The reviewer replicates

A review is an independent replication, not a reading of the builder's record.

1. Rerun everything. Until then, every line of the record is ASSUMED.
2. Reapply at least two of the listed negative controls.
3. Design at least two breakages that are **not** in the record and see whether any test notices. One that goes unnoticed is a finding.
4. Send one hostile input to each public function: empty, duplicate id, wrong type, another subject's data.
5. Check that the predictions section was written before the implementation, where the history allows it. If it cannot be told, say so.
6. Write the result in the record's `## Replication` section. Do not fix anything.

## The orchestrator at a gate

Following `destination-driven-construction`: first an adversarial review of the whole layer against the invariants of the layers below it, and only then the integrated walkthrough experiments in [IMPLEMENTATION_LAYERS.md](IMPLEMENTATION_LAYERS.md). The walkthroughs confirm a construction that was already reasoned; they are not the first moment anyone learns whether the pieces fit. Each walkthrough has its own negative control, and the orchestrator sees it red.

## When a prediction in the work order is wrong

The specification is a hypothesis too. If an experiment in your work order cannot be satisfied without breaking the contract or [AGENTS.md](../AGENTS.md), do not bend the code to it and do not delete it. Record it as REFUTED with what you saw, continue with what does not depend on it, and report it. The orchestrator fixes the work order.

## The experiment record

One file per module, `docs/experiments/MNN.md`. It belongs to the module's owned paths. The builder creates it; the reviewer adds the last section. The first example is [experiments/E00-foundation-probes.md](experiments/E00-foundation-probes.md).

```
# Experiment record MNN — <module name>

Builder, date, branch and commit.

## Predictions (written before the run)
| Id | Prediction | Falsifier | Negative control |
Every id from the work order, plus your own (MNN-X1, MNN-X2…).

## Runs
| Id | What was run | Observed | Result | Evidence level |
Result is Confirmed or Refuted.

## Negative controls
| For | Breakage applied | Test that went red | Reverted |

## Refuted and surprises
What came out the other way; each surprise with its rival explanations
and the test that told them apart. "Nothing" is a valid entry.

## Not verified
Browser included. "Nothing" is not a valid entry for a view.

## Replication
Reviewer, date, commit. What was rerun, the two new breakages and
whether a test noticed, hostile inputs, verdict.
```

## What the machine checks

`python3 scripts/check_docs.py` fails if:

- a work order has no experiment ids;
- a module marked `in_review` or `integrated` has no record, or its record lacks a section or one of the work order's experiment ids;
- a module marked `integrated` has no `## Replication` section.

It does **not** check that a prediction was written before the code, that a breakage was really applied, or that an evidence level is honest. Those rest on the reviewer.
