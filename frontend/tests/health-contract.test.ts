import assert from "node:assert/strict";
import test from "node:test";
import { getMockMeasurements, listMockAstronauts } from "../src/features/health-monitoring/data/mock.ts";
import { measurementsResponseSchema } from "../src/features/health-monitoring/schemas.ts";

test("each astronaut receives only their own measurements and a valid catalog", () => {
  const astronauts = listMockAstronauts();
  assert.equal(astronauts.meta.dataKind, "synthetic");
  for (const astronaut of astronauts.data) {
    const response = getMockMeasurements(astronaut.id);
    assert.ok(response);
    assert.equal(response.meta.clinicalValidation, "pending");
    assert.ok(response.data.every((record) => record.subject === astronaut.id));
    assert.ok(response.data.every((record) => record.origin === "synthetic"));
    const times = response.data.map((record) => Date.parse(record.time as string));
    assert.deepEqual(times, times.toSorted((a, b) => b - a));
  }
});

test("tells an unknown astronaut, an empty history and a missing value apart", () => {
  assert.equal(getMockMeasurements("unknown"), null);
  assert.deepEqual(getMockMeasurements("astro-03")?.data, []);
  const missing = getMockMeasurements("astro-02")?.data.find((record) => record.variable === "temperature");
  assert.equal(missing?.state, "not_recorded");
  assert.equal(Object.hasOwn(missing!, "value"), false, "a value that was not recorded carries no number");
});

test("the contract accepts zero without confusing it with a missing value", () => {
  const response = getMockMeasurements("astro-01")!;
  response.data[0].value = 0;
  assert.equal(measurementsResponseSchema.parse(response).data[0].value, 0);
});

test("the contract rejects invalid dates, non-finite numbers and variables outside the catalog", () => {
  for (const patch of [
    { time: "yesterday" },
    { value: Number.NaN },
    { value: Number.POSITIVE_INFINITY },
    { variable: "unknown_metric" },
  ]) {
    const response = getMockMeasurements("astro-01")!;
    Object.assign(response.data[0], patch);
    assert.equal(measurementsResponseSchema.safeParse(response).success, false);
  }
});

test("changes to a response do not alter the mocks of other queries", () => {
  const response = getMockMeasurements("astro-01")!;
  const originalValue = response.data[0].value;
  response.data[0].value = -100;
  assert.equal(getMockMeasurements("astro-01")?.data[0].value, originalValue);
});
