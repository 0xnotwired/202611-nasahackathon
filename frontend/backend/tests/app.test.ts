import assert from "node:assert/strict";
import test from "node:test";
import { handleRequest } from "../src/app.ts";

const request = (path: string, method = "GET") =>
  handleRequest(new Request(`http://localhost/api/v1${path}`, { method }));

test("health and OpenAPI are available without Next.js", async () => {
  const health = await request("/health").json();
  assert.equal(health.status, "ok");
  assert.equal(health.contractVersion, "0.2");
  assert.equal((await request("/openapi.json").json()).openapi, "3.1.0");
});

test("does not mix astronauts and tells an unknown one from an empty history", async () => {
  const response = request("/astronauts/astro-01/measurements");
  const body = await response.json();
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.ok(body.data.length > 0);
  assert.ok(
    body.data.every((record: { subject: string }) => record.subject === "astro-01"),
  );
  assert.deepEqual(
    (await request("/astronauts/astro-03/measurements").json()).data,
    [],
  );
  assert.deepEqual(
    (await request("/astronauts/astro-03/mission").json()).data,
    { records: [], tasks: [] },
  );
  for (const resource of ["measurements", "mission"]) {
    const missing = request(`/astronauts/unknown/${resource}`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, "ASTRONAUT_NOT_FOUND");
  }
});

test("the scenarios keep missing values and the change of method, as records", async () => {
  const mission = (await request("/astronauts/astro-02/mission").json()).data;
  const last = mission.records.at(-1);
  assert.equal(last.state, "not_recorded");
  assert.equal(Object.hasOwn(last, "value"), false, "a value that is not recorded carries no number");
  assert.equal(Object.hasOwn(last, "unit"), false);
  assert.notEqual(mission.records[0].method, last.method);
  assert.ok(mission.records.every((record: { origin: string }) => record.origin === "synthetic"));
});

test("rejects writes and routes outside the API", async () => {
  const blocked = request("/astronauts", "POST");
  assert.equal(blocked.status, 405);
  assert.equal(blocked.headers.get("Allow"), "GET, HEAD");
  assert.equal(request("/not-found").status, 404);
  assert.equal(request("/astronauts/%XX/mission").status, 400);
  assert.equal(await request("/astronauts", "HEAD").text(), "");
});
