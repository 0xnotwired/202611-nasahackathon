import assert from "node:assert/strict";
import test from "node:test";
import { getMockMeasurements, listMockAstronauts } from "../src/features/health-monitoring/data/mock.ts";
import { measurementsResponseSchema } from "../src/features/health-monitoring/schemas.ts";

test("cada astronauta recibe únicamente sus mediciones y un catálogo válido", () => {
  const astronauts = listMockAstronauts();
  assert.equal(astronauts.meta.dataKind, "synthetic");
  for (const astronaut of astronauts.data) {
    const response = getMockMeasurements(astronaut.id);
    assert.ok(response);
    assert.equal(response.meta.clinicalValidation, "pending");
    assert.ok(response.data.every((measurement) => measurement.astronautId === astronaut.id));
    const dates = response.data.map((measurement) => Date.parse(measurement.recordedAt));
    assert.deepEqual(dates, dates.toSorted((a, b) => b - a));
  }
});

test("distingue astronauta inexistente, historial vacío y valor faltante", () => {
  assert.equal(getMockMeasurements("inexistente"), null);
  assert.deepEqual(getMockMeasurements("astro-03")?.data, []);
  const missing = getMockMeasurements("astro-02")?.data.find((measurement) => measurement.metricCode === "body_temperature");
  assert.equal(missing?.value, null);
});

test("el contrato acepta cero sin confundirlo con un valor faltante", () => {
  const response = getMockMeasurements("astro-01")!;
  response.data[0].value = 0;
  assert.equal(measurementsResponseSchema.parse(response).data[0].value, 0);
});

test("el contrato rechaza fechas inválidas, números no finitos y métricas sin catálogo", () => {
  for (const patch of [
    { recordedAt: "ayer" },
    { value: Number.NaN },
    { value: Number.POSITIVE_INFINITY },
    { metricCode: "unknown_metric" },
  ]) {
    const response = getMockMeasurements("astro-01")!;
    Object.assign(response.data[0], patch);
    assert.equal(measurementsResponseSchema.safeParse(response).success, false);
  }
});

test("los cambios sobre una respuesta no alteran los mocks de otras consultas", () => {
  const response = getMockMeasurements("astro-01")!;
  const originalValue = response.data[0].value;
  response.data[0].value = -100;
  assert.equal(getMockMeasurements("astro-01")?.data[0].value, originalValue);
});
