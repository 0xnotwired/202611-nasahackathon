import assert from "node:assert/strict";
import test from "node:test";
import { getMockMission } from "../src/features/health-monitoring/data/mission-mock.ts";
import {
  projectMission,
  legacyMissionSchema,
} from "../src/features/health-monitoring/data/mission-projection.ts";
import { compareEvaluations } from "../src/features/health-monitoring/mission.ts";
import {
  describePeriod,
  historyCsv,
  csvCell,
} from "../src/features/health-monitoring/aerobic.ts";
import { buildReview } from "../src/features/health-monitoring/review.ts";
import {
  resolveHistoryContext,
  historyQuery,
} from "../src/features/health-monitoring/dashboard-state.ts";
import { getSyntheticResearchCase } from "../src/features/health-monitoring/data/research-mock.ts";
import {
  projectResearchAssessment,
  researchCsv,
} from "../src/features/health-monitoring/research-assessment.ts";

const meta = {
  contractVersion: "0.1",
  dataKind: "synthetic",
  clinicalValidation: "pending",
} as const;
const raw = getMockMission("astro-01", "recovery");
const mission = projectMission(raw, "astro-01", "mock", meta);
const [a, b] = mission.evaluations;

test("la frontera 0.1 rechaza procedencia desconocida sin degradarla silenciosamente a sintética", () => {
  assert.ok(legacyMissionSchema.safeParse({ data: raw, meta }).success);
  const data = {
    ...raw,
    evaluations: [
      {
        ...raw.evaluations[0],
        origin: "ground_analog",
        sourceRecordIds: ["source-1"],
      },
    ],
  };
  assert.equal(legacyMissionSchema.safeParse({ data, meta }).success, false);
  assert.equal(
    legacyMissionSchema.safeParse({
      data: raw,
      meta: { ...meta, contractVersion: "2" },
    }).success,
    false,
  );
  assert.throws(
    () =>
      projectMission(
        { ...raw, evaluations: [raw.evaluations[0], raw.evaluations[0]] },
        "astro-01",
        "mock",
        meta,
      ),
    /duplicados/,
  );
});

test("la procedencia limita diferencias y tendencias aun con valores, unidades y métodos iguales", () => {
  assert.notEqual(compareEvaluations(a, b).difference, null);
  for (const patch of [
    { subject: "other-study:astro-01" },
    { dataset: "other-study" },
    { role: "stage" as const },
    { metric: "vo2_stage_relative" as const },
    { unitStatus: "unknown" as const },
    { calendar: "unknown" as const },
    { clock: "source_date" as const },
    { timeScope: "other-scope" },
    { origin: "ground_analog" as const },
    { protocol: "another-protocol" },
  ]) {
    const modified = { ...b, evidence: { ...b.evidence!, ...patch } };
    assert.equal(
      compareEvaluations(a, modified).difference,
      null,
      JSON.stringify(patch),
    );
    assert.equal(
      describePeriod([a, modified, mission.evaluations[2]]).slope,
      null,
    );
  }
  assert.equal(compareEvaluations(a, a).difference, null);
  const api = projectMission(raw, "astro-01", "api", meta);
  assert.match(
    compareEvaluations(...api.evaluations.slice(0, 2)).reason,
    /no permite verificar/,
  );
  assert.equal(describePeriod(api.evaluations).slope, null);
});

test("el grupo viaja por URL, conserva excluidos y cambia el contexto de la revisión", () => {
  const mixed = projectMission(
    getMockMission("astro-01", "method_change"),
    "astro-01",
    "mock",
    meta,
  );
  const method = mixed.evaluations[7].method;
  const context = resolveHistoryContext({ group: method }, mixed.evaluations);
  assert.equal(context.group, method);
  assert.deepEqual(
    resolveHistoryContext(
      Object.fromEntries(historyQuery(context)),
      mixed.evaluations,
    ),
    context,
  );
  const group = mixed.evaluations.filter(
    (item) => item.method === context.group,
  );
  assert.equal(group.length, 6);
  assert.ok(describePeriod(group).slope! > 0);
  const journal = {
    completed: {},
    difficulty: "",
    question: "",
    observation: null,
    prepared: null,
  };
  const person = { id: "astro-01", callsign: "Vega", mission: "demo" };
  const first = buildReview(person, mixed, context, journal).text;
  assert.match(first, /7 fuera del grupo/);
  assert.match(first, /method_change-00/); // Excluded records remain in the export annex.
  const changed = {
    ...mixed,
    evaluations: mixed.evaluations.map((item) => ({
      ...item,
      evidence: { ...item.evidence!, source: "Source revision 2" },
    })),
  };
  assert.notEqual(buildReview(person, changed, context, journal).text, first);
});

test("cuatro etapas y 32 escalares producen una prueba y un pico explícito, sin tendencia ni edad UTC", () => {
  const p = getSyntheticResearchCase();
  assert.equal(p.assessmentCount, 1);
  assert.equal(p.stageCount, 4);
  assert.equal(p.sourceRecordCount, 32);
  assert.equal(p.peak?.value, 40);
  assert.equal(p.reportedPeak?.label, "Peak AVG");
  assert.equal(p.capabilities.longitudinal, false);
  assert.equal(p.capabilities.utcAge, false);
  const changed = structuredClone(p.assessment);
  changed.stages[0].readings[0].value = 90; // Never select Math.max as the reported peak.
  assert.equal(projectResearchAssessment(changed).peak?.value, 40);
  const csv = researchCsv(p);
  assert.equal(csv.split("\r\n").length, 33);
  assert.match(csv, /"2026-01-15","01\/15\/2026","date","unknown",""/);
  assert.doesNotMatch(csv, /2026-01-15T00/);
  assert.match(csv, /"synthetic"/);
  assert.match(csv, /orbita:stage-demo:1:row-3:col-0/);
});

test("el caso de etapas conserva cero, ausencias y unidades desconocidas sin inventar pico disponible", () => {
  for (const state of ["not_recorded", "confirmed_none"] as const) {
    const input = structuredClone(getSyntheticResearchCase().assessment);
    const peak = input.stages[3].readings[0];
    peak.value = null;
    peak.state = state;
    const p = projectResearchAssessment(input);
    assert.equal(p.peak, null);
    assert.match(researchCsv(p), new RegExp(`"","${state}"`));
  }
  const input = structuredClone(getSyntheticResearchCase().assessment);
  input.stages[3].readings[0].value = 0;
  assert.equal(projectResearchAssessment(input).peak?.value, 0);
  input.stages[3].readings[0].unitStatus = "unknown";
  input.stages[3].readings[0].unit = null;
  assert.equal(projectResearchAssessment(input).peak, null);
});

test("el lector de investigación rechaza identidad ambigua, duplicación, unidades incorrectas y fuentes reales sin custodia", () => {
  const original = getSyntheticResearchCase().assessment;
  const wrongSubject = { ...original, dataset: "other-study" };
  assert.throws(() => projectResearchAssessment(wrongSubject));
  assert.throws(() =>
    projectResearchAssessment({ ...original, origin: "ground_analog" }),
  );
  const duplicate = structuredClone(original);
  duplicate.stages[1].readings[0].id = duplicate.stages[0].readings[0].id;
  assert.throws(() => projectResearchAssessment(duplicate));
  const wrongUnit = structuredClone(original);
  wrongUnit.stages[3].readings[0].unit = "L/min";
  assert.throws(() => projectResearchAssessment(wrongUnit));
  const missing = structuredClone(original);
  missing.stages[3].readings[0].state = "not_recorded";
  assert.throws(() => projectResearchAssessment(missing));
});

test("el export conserva valor original y evidencia sin ejecutar fórmulas de etiquetas externas", () => {
  const value = 39.123456789;
  const csv = historyCsv([{ ...a, value }]);
  assert.match(csv, /39\.123456789/);
  assert.match(csv, /aerobic-presentation\/1/);
  assert.match(csv, /orbita:authored-demo:1:astro-01/);
  assert.match(csvCell('=WEBSERVICE("example")'), /^"'/);
  assert.equal(csvCell(-3), '"-3"');
});
