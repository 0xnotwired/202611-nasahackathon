import assert from "node:assert/strict";
import test from "node:test";
import { compareEvaluations } from "../src/features/health-monitoring/mission.ts";
import { getMockMission } from "../src/features/health-monitoring/data/mission-mock.ts";

test("permite restar evaluaciones de la misma unidad y método sin interpretarlas", () => {
  const [first, second] = getMockMission("astro-01").evaluations;
  const result = compareEvaluations(first, second);
  assert.ok(Math.abs(result.difference! + 1.6) < 0.0001);
  assert.match(result.reason, /sin interpretación clínica/);
});

test("bloquea comparaciones con cambio de método, unidad o datos faltantes", () => {
  const [first, second, third] = getMockMission("astro-01").evaluations;
  assert.equal(compareEvaluations(second, third).difference, null);
  assert.match(compareEvaluations(second, third).reason, /método/);
  assert.match(
    compareEvaluations(first, { ...second, unit: "otra" }).reason,
    /unidades/,
  );
  assert.match(
    compareEvaluations(first, { ...second, value: null }).reason,
    /Falta/,
  );
  assert.equal(compareEvaluations(undefined, first).difference, null);
});

test("el escenario sin datos no inventa evaluaciones ni sesiones", () => {
  assert.deepEqual(getMockMission("astro-03"), {
    evaluations: [],
    sessions: [],
  });
  assert.equal(getMockMission("astro-02").evaluations.at(-1)?.value, null);
});
