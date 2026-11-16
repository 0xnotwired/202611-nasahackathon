import assert from "node:assert/strict";
import test from "node:test";
import {
  ageLabel,
  historyQuery,
  latestValid,
  resolveHistoryContext,
  scaleDomain,
} from "../src/features/health-monitoring/dashboard-state.ts";
import { mission as projectedMission } from "./helpers.ts";
import { periodEvaluations } from "../src/features/health-monitoring/aerobic.ts";
import { buildReview } from "../src/features/health-monitoring/review.ts";
import type { DemoJournal } from "../src/features/health-monitoring/components/use-demo-journal.ts";

const mission = projectedMission("astro-01", "recovery");
const evaluations = mission.evaluations;
const journal: DemoJournal = {
  completed: {},
  difficulty: "",
  question: "",
  observation: null,
  prepared: null,
};
const astronaut = { id: "astro-01", callsign: "Vega", mission: "Órbita Demo" };

test("the context keeps a reference outside the period and survives the round trip through the URL", () => {
  const context = resolveHistoryContext(
    {
      period: "3",
      reference: evaluations[0].id,
      evaluation: evaluations[10].id,
      scale: "auto",
    },
    evaluations,
  );
  assert.equal(context.reference, evaluations[0].id);
  assert.equal(context.evaluation, evaluations[10].id);
  assert.deepEqual(
    resolveHistoryContext(
      Object.fromEntries(historyQuery(context)),
      evaluations,
    ),
    context,
  );
});

test("invalid parameters and visits outside the window resolve without losing the valid reference", () => {
  const context = resolveHistoryContext(
    {
      period: "3",
      reference: evaluations[0].id,
      evaluation: evaluations[1].id,
      scale: "invalid",
    },
    evaluations,
  );
  assert.equal(context.evaluation, evaluations.at(-1)!.id);
  assert.equal(context.scale, "history");
  assert.equal(
    resolveHistoryContext(
      { period: ["3", "6"], evaluation: "unknown", reference: "unknown" },
      evaluations,
    ).period,
    12,
  );
  assert.deepEqual(resolveHistoryContext({}, []), {
    period: 12,
    reference: "",
    evaluation: "",
    scale: "history",
  });
});

test("the history domain stays fixed between windows; auto-scale is explicit", () => {
  const short = periodEvaluations(evaluations, 3);
  const stable = scaleDomain(evaluations, "mL/kg/min")!;
  assert.deepEqual(stable, scaleDomain(evaluations, "mL/kg/min"));
  assert.notDeepEqual(stable, scaleDomain(short, "mL/kg/min"));
  assert.equal(scaleDomain(evaluations, "L/min"), null);
  assert.deepEqual(
    scaleDomain([{ ...evaluations[0], value: 0 }], "mL/kg/min"),
    { min: -1, max: 1 },
  );
});

test("a recent visit without a result does not erase the last valid value or become zero", () => {
  const modified = evaluations.map((item, index) =>
    index === evaluations.length - 1 ? { ...item, value: null } : item,
  );
  assert.equal(latestValid(modified)?.id, evaluations.at(-2)!.id);
  assert.equal(latestValid([]), undefined);
  assert.equal(
    ageLabel("2026-11-01T08:00:00Z", "2026-11-15T08:00:00Z"),
    "14 days ago",
  );
  assert.equal(
    ageLabel("2026-11-16T08:00:00Z", "2026-11-15T08:00:00Z"),
    "Date after this query",
  );
});

test("the review uses the active period and reference, and detects that a copy has an earlier context", () => {
  const context = resolveHistoryContext(
    { period: "3", reference: evaluations[0].id },
    evaluations,
  );
  const prepared = buildReview(astronaut, mission, context, journal);
  assert.match(prepared.text, /4 visits/);
  assert.match(prepared.text, /recovery-12/);
  assert.doesNotMatch(prepared.text, /recovery-00 · 2025/);
  const copy = {
    text: prepared.text,
    scope: prepared.scope,
    savedAt: "2026-11-15T09:00:00Z",
  };
  const stored = { ...journal, prepared: copy };
  assert.equal(
    buildReview(astronaut, mission, context, stored).text,
    copy.text,
  );
  assert.notEqual(
    buildReview(astronaut, mission, { ...context, period: 12 }, stored).text,
    copy.text,
  );
  const updatedMission = {
    ...mission,
    evaluations: mission.evaluations.map((item, index) =>
      index === 12 ? { ...item, value: 39.5 } : item,
    ),
  };
  assert.notEqual(
    buildReview(astronaut, updatedMission, context, stored).text,
    copy.text,
  );
  assert.notEqual(
    buildReview(astronaut, mission, context, {
      ...stored,
      question: "Review the method",
    }).text,
    copy.text,
  );
  assert.equal(stored.prepared.text, copy.text);
});
