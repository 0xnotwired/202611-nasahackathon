import assert from "node:assert/strict";
import test from "node:test";
import { handleRequest } from "../src/app.ts";

const request = (path: string, method = "GET") =>
  handleRequest(new Request(`http://localhost/api/v1${path}`, { method }));

test("health y OpenAPI disponibles sin Next.js", async () => {
  assert.equal((await request("/health").json()).status, "ok");
  assert.equal((await request("/openapi.json").json()).openapi, "3.1.0");
});

test("no mezcla astronautas y distingue desconocido de historial vacío", async () => {
  const response = request("/astronauts/astro-01/measurements");
  const body = await response.json();
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.ok(body.data.length > 0);
  assert.ok(
    body.data.every(
      (row: { astronautId: string }) => row.astronautId === "astro-01",
    ),
  );
  assert.deepEqual(
    (await request("/astronauts/astro-03/measurements").json()).data,
    [],
  );
  assert.deepEqual(
    (await request("/astronauts/astro-03/mission").json()).data,
    { evaluations: [], sessions: [] },
  );
  for (const resource of ["measurements", "mission"]) {
    const missing = request(`/astronauts/desconocido/${resource}`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, "ASTRONAUT_NOT_FOUND");
  }
});

test("los escenarios conservan valores faltantes y cambio de método", async () => {
  const mission = (await request("/astronauts/astro-02/mission").json()).data;
  assert.equal(mission.evaluations.at(-1).value, null);
  assert.notEqual(
    mission.evaluations[0].method,
    mission.evaluations.at(-1).method,
  );
});

test("no acepta escrituras ni rutas fuera de la API", async () => {
  const blocked = request("/astronauts", "POST");
  assert.equal(blocked.status, 405);
  assert.equal(blocked.headers.get("Allow"), "GET, HEAD");
  assert.equal(request("/not-found").status, 404);
  assert.equal(request("/astronauts/%XX/mission").status, 400);
  assert.equal(await request("/astronauts", "HEAD").text(), "");
});
