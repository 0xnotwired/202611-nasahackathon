import assert from "node:assert/strict";
import test from "node:test";
import {
  describePeriod,
  periodEvaluations,
  historyCsv,
} from "../src/features/health-monitoring/aerobic.ts";
import { getMockMission } from "../src/features/health-monitoring/data/mission-mock.ts";

const history = (scenario: Parameters<typeof getMockMission>[1]) =>
  getMockMission("astro-01", scenario).evaluations;

test("las ventanas usan fechas y el descenso con recuperación cambia de dirección", () => {
  const evaluations = history("recovery");
  const short = periodEvaluations(evaluations, 3);
  assert.equal(short.length, 4);
  assert.equal(short[0].recordedAt, "2026-08-15T08:00:00.000Z");
  assert.ok(describePeriod(evaluations.slice(0, 5)).slope! < 0);
  assert.ok(describePeriod(short).slope! > 0);
});

test("los faltantes conservan las visitas y no entran como cero en la tendencia", () => {
  const evaluations = history("missing_visits");
  assert.equal(evaluations.length, 13);
  assert.equal(evaluations.filter((item) => item.value === null).length, 3);
  assert.equal(describePeriod(evaluations).count, 10);
  assert.ok(describePeriod(evaluations).slope! > 0);
  assert.equal(describePeriod(evaluations.slice(0, 3)).slope, null);
});

test("un cambio de método bloquea la lectura conjunta, un segmento compatible sí se describe", () => {
  const evaluations = history("method_change");
  assert.equal(describePeriod(evaluations).label, "No comparable");
  assert.equal(describePeriod(evaluations).slope, null);
  assert.ok(describePeriod(evaluations.slice(7)).slope! > 0);
  assert.equal(
    describePeriod([
      { ...evaluations[0] },
      { ...evaluations[1], unit: "L/min" },
      evaluations[2],
    ]).slope,
    null,
  );
});

test("el export conserva ausencia, protocolo y origen sin incluir filas fuera de la ventana", () => {
  const evaluations = periodEvaluations(history("missing_visits"), 6);
  const csv = historyCsv(evaluations);
  assert.equal(csv.split("\r\n").length, evaluations.length + 1);
  assert.match(csv, /"","mL\/kg\/min"/);
  assert.match(csv, /"synthetic","pending"/);
  assert.doesNotMatch(csv, /2025-11-15/);
});

test("la ausencia de datos y las fechas repetidas no inventan tendencias", () => {
  assert.equal(describePeriod([]).label, "Datos insuficientes");
  const first = history("ascending")[0];
  assert.equal(describePeriod([first, first, first]).slope, null);
  assert.equal(periodEvaluations([], 3).length, 0);
});
