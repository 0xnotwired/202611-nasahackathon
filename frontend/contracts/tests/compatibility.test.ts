import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  astronautsResponseSchema,
  measurementsResponseSchema,
  missionResponseSchema,
  recordSchema,
} from "../schemas.ts";
import { buildOpenApi } from "../openapi.ts";
import { handleRequest } from "../../backend/src/app.ts";

const fixture = (name: string) =>
  JSON.parse(readFileSync(new URL(`../fixtures/${name}.json`, import.meta.url), "utf8"));

test("the versioned OpenAPI matches the shared schemas", () => {
  assert.deepEqual(
    JSON.parse(readFileSync(new URL("../openapi.json", import.meta.url), "utf8")),
    buildOpenApi(),
  );
});

test("the contract examples are valid", () => {
  for (const [file, schema] of [
    ["astronauts", astronautsResponseSchema],
    ["measurements", measurementsResponseSchema],
    ["mission", missionResponseSchema],
  ] as const) assert.ok(schema.safeParse(fixture(file)).success, file);
});

test("every backend response is accepted by the frontend schemas", async () => {
  const astronauts = astronautsResponseSchema.parse(
    await handleRequest(new Request("http://localhost/api/v1/astronauts")).json(),
  );
  for (const astronaut of astronauts.data) {
    const base = `http://localhost/api/v1/astronauts/${encodeURIComponent(astronaut.id)}`;
    const measurements = measurementsResponseSchema.parse(
      await handleRequest(new Request(`${base}/measurements`)).json(),
    );
    assert.ok(measurements.data.every((record) => record.subject === astronaut.id));
    const mission = missionResponseSchema.parse(
      await handleRequest(new Request(`${base}/mission`)).json(),
    );
    assert.ok(mission.data.records.every((record) => record.subject === astronaut.id));
    assert.ok(mission.data.tasks.every((task) => task.subject === astronaut.id));
  }
});

// The record rules are the main app's: each of these must be refused, never repaired.
const good = fixture("mission").data.records[0];
test("the record schema refuses what the main app's records refuse", () => {
  assert.ok(recordSchema.safeParse(good).success);
  const without = (key: string) => { const copy = { ...good }; delete copy[key]; return copy; };
  for (const [name, record] of [
    ["a not-recorded value that carries a number", { ...good, state: "not_recorded" }],
    ["a recorded value with no number", without("value")],
    ["a recorded value with no unit", without("unit")],
    ["an unknown unit that is guessed", { ...good, unit_status: "unknown" }],
    ["a record with neither a UTC time nor the source's time", { ...good, time: null }],
    ["an unknown state", { ...good, state: "normal" }],
    ["an unknown origin", { ...good, origin: "simulated" }],
    ["an undeclared field", { ...good, score: 1 }],
  ] as const) assert.equal(recordSchema.safeParse(record).success, false, name);
  const absent = { ...good, state: "not_recorded" };
  delete absent.value;
  delete absent.unit;
  assert.ok(recordSchema.safeParse(absent).success, "a not-recorded value without number or unit is valid");
  assert.ok(recordSchema.safeParse({ ...good, unit: null, unit_status: "unknown" }).success, "an unknown unit stated as null is valid");
});

test("a response that mixes origins, types or duplicate ids is refused", () => {
  const mission = fixture("mission");
  const measurements = fixture("measurements");
  assert.equal(missionResponseSchema.safeParse({ ...mission, data: { ...mission.data, records: [{ ...good, origin: "flight" }] } }).success, false);
  assert.equal(missionResponseSchema.safeParse({ ...mission, data: { ...mission.data, records: [good, good] } }).success, false);
  assert.equal(missionResponseSchema.safeParse({ ...mission, data: { ...mission.data, records: [{ ...good, type: "measurement" }] } }).success, false);
  assert.equal(measurementsResponseSchema.safeParse({ ...measurements, data: [{ ...measurements.data[0], variable: "not_in_catalog" }] }).success, false);
});
