import assert from "node:assert/strict";
import test from "node:test";
import { compareEvaluations } from "../src/features/health-monitoring/mission.ts";
import { getMockMission } from "../src/features/health-monitoring/data/mission-mock.ts";
import { mission } from "./helpers.ts";

test("allows subtracting assessments of the same unit and method without interpreting them", () => {
  const [first, second] = mission("astro-01").evaluations;
  const result = compareEvaluations(first, second);
  assert.ok(Math.abs(result.difference! + 1.6) < 0.0001);
  assert.match(result.reason, /no clinical interpretation/);
});

test("blocks comparisons across a change of method, unit or missing data", () => {
  const [first, second, third] = mission("astro-01").evaluations;
  assert.equal(compareEvaluations(second, third).difference, null);
  assert.match(compareEvaluations(second, third).reason, /different protocols/); // the protocol is the method of the record
  assert.match(
    compareEvaluations(first, { ...second, unit: "other" }).reason,
    /units/,
  );
  assert.match(
    compareEvaluations(first, { ...second, value: null }).reason,
    /missing/,
  );
  assert.equal(compareEvaluations(undefined, first).difference, null);
});

test("the scenario without data invents no records, evaluations or sessions", () => {
  assert.deepEqual(getMockMission("astro-03"), { records: [], tasks: [] });
  assert.deepEqual(mission("astro-03").evaluations, []);
  const last = mission("astro-02").evaluations.at(-1);
  assert.equal(last?.value, null);
  assert.equal(last?.state, "not_recorded", "a missing visit is a record that was not recorded");
});

test("evidence comes from the record, not from assumptions about the transport", () => {
  const [first] = mission("astro-01").evaluations;
  assert.equal(first.evidence?.origin, "synthetic");
  assert.equal(first.evidence?.unitStatus, "known");
  assert.equal(first.evidence?.clock, "utc");
  assert.equal(first.evidence?.protocol, first.method);
  assert.equal(first.state, "recorded");
  const [record] = getMockMission("astro-01").records;
  assert.equal(first.id, record.id);
});
