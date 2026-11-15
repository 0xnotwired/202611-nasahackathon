import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  resolveDataSource,
  switchSourceHref,
  sourceHref,
  journalKey,
} from "../src/features/health-monitoring/data/source-context.ts";
import {
  createReader,
  loadDashboard,
  type JsonReader,
} from "../src/features/health-monitoring/data/reader.ts";
import { ApiError } from "../src/lib/api/errors.ts";

const fixture = (name: string) =>
  JSON.parse(
    readFileSync(
      new URL(`../contracts/fixtures/${name}.json`, import.meta.url),
      "utf8",
    ),
  );
const apiContext = {
  mode: "api",
  apiBaseUrl: "http://localhost:4000/api/v1",
} as const;
const standard: JsonReader = async (url, schema) =>
  schema.parse(
    fixture(
      url.endsWith("/astronauts")
        ? "astronauts"
        : url.endsWith("/mission")
          ? "mission"
          : "measurements",
    ),
  );

test("la fuente se valida por petición y mock funciona aunque la configuración de API esté ausente o sea inválida", () => {
  assert.deepEqual(resolveDataSource(undefined, {}), {
    ok: true,
    context: { mode: "mock" },
  });
  for (const requested of [
    "real",
    "",
    ["mock", "api"],
    "https://external.test",
  ]) {
    const result = resolveDataSource(requested, {});
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, "invalid_source");
  }
  for (const apiBaseUrl of [
    undefined,
    "invalid",
    "file:///tmp/data",
    "ftp://host",
    "http://host?token=secret",
    "http://user:pass@host",
  ]) {
    assert.equal(resolveDataSource("api", { apiBaseUrl }).ok, false);
    assert.equal(
      resolveDataSource("mock", { defaultSource: "api", apiBaseUrl }).ok,
      true,
    );
  }
  assert.equal(
    resolveDataSource(undefined, {
      defaultSource: "api",
      apiBaseUrl: apiContext.apiBaseUrl,
    }).ok,
    true,
  );
});

test("cambiar fuente conserva preferencias, limpia identidades y nunca acepta destinos externos", () => {
  const href = switchSourceHref("/", "api", {
    view: "evolucion",
    period: "3",
    scale: "auto",
    astronaut: "astro-01",
    evaluation: "eval-1",
    reference: "eval-2",
    group: "cycle",
    scenario: "recovery",
  });
  const params = new URL(href, "http://internal").searchParams;
  assert.deepEqual(Object.fromEntries(params), {
    view: "evolucion",
    period: "3",
    scale: "auto",
    source: "api",
  });
  assert.equal(
    switchSourceHref("/investigacion", "api", { example: "synthetic" }),
    "/investigacion?source=api",
  );
  assert.equal(
    sourceHref("/", "api", new URLSearchParams({ scenario: "recovery" })),
    "/?source=api",
  );
  assert.equal(
    journalKey("astro-01", "mock"),
    "orbita-demo-journal-v1:astro-01",
  );
  assert.notEqual(
    journalKey("astro-01", "api"),
    journalKey("astro-01", "mock"),
  );
});

test("dos fuentes concurrentes no comparten proveedor y mock nunca realiza HTTP", async () => {
  const paths: string[] = [];
  const api = createReader(apiContext, async (url, schema) => {
    paths.push(url);
    return standard(url, schema);
  });
  const mock = createReader({ mode: "mock" }, async () => {
    throw new Error("Mock hizo HTTP");
  });
  const [demo, remote] = await Promise.all([
    loadDashboard(mock, undefined, "recovery"),
    loadDashboard(api, undefined),
  ]);
  assert.equal(demo.status, "ready");
  assert.equal(remote.status, "ready");
  if (demo.status === "ready" && remote.status === "ready") {
    assert.equal(demo.mission.evaluations.length, 13);
    assert.equal(remote.origin, "synthetic");
    assert.equal(remote.mission.presentation?.transport, "api");
    assert.notEqual(
      demo.mission.evaluations[0].evidence?.subject,
      remote.mission.evaluations[0].evidence?.subject,
    );
  }
  assert.equal(paths.length, 3);
  assert.ok(paths.every((url) => url.startsWith(apiContext.apiBaseUrl)));
});

test("catálogo vacío y persona ausente no generan reemplazos ficticios", async () => {
  const empty = createReader(apiContext, async (_url, schema) =>
    schema.parse({ ...fixture("astronauts"), data: [] }),
  );
  assert.deepEqual(await loadDashboard(empty, undefined), { status: "empty" });
  const missing = await loadDashboard(
    createReader(apiContext, standard),
    "unknown",
  );
  assert.equal(missing.status, "error");
  if (missing.status === "error")
    assert.equal(missing.error.code, "subject_not_found");
});

test("errores HTTP, timeout y formato son recuperables y no se convierten en mocks", async () => {
  for (const [error, code] of [
    [new ApiError(500), "unavailable"],
    [new TypeError("fetch failed"), "unavailable"],
    [new DOMException("timeout", "TimeoutError"), "timeout"],
    [new SyntaxError("invalid JSON"), "invalid_response"],
    [new ApiError(404), "unavailable"],
  ] as const) {
    const result = await loadDashboard(
      createReader(apiContext, async () => {
        throw error;
      }),
      undefined,
    );
    assert.equal(result.status, "error");
    if (result.status === "error") assert.equal(result.error.code, code);
  }
  const broken = await loadDashboard(
    createReader(apiContext, async (_url, schema) =>
      schema.parse({
        data: [],
        meta: { contractVersion: "2", dataKind: "real" },
      }),
    ),
    undefined,
  );
  assert.equal(broken.status, "error");
  if (broken.status === "error")
    assert.equal(broken.error.code, "invalid_response");
});

test("un fallo de misión nunca se completa con mock aunque catálogo y mediciones sean válidos", async () => {
  const result = await loadDashboard(
    createReader(apiContext, async (url, schema) => {
      if (url.endsWith("/mission")) throw new ApiError(503);
      return standard(url, schema);
    }),
    undefined,
  );
  assert.equal(result.status, "error");
});

test("la lectura rechaza mediciones de otra persona y evaluaciones duplicadas", async () => {
  for (const corrupt of ["measurements", "mission"]) {
    const result = await loadDashboard(
      createReader(apiContext, async (url, schema) => {
        if (url.endsWith(`/${corrupt}`)) {
          const payload = fixture(corrupt);
          if (corrupt === "mission")
            payload.data.evaluations.push(payload.data.evaluations[0]);
          else payload.data[0].astronautId = "someone-else";
          return schema.parse(payload);
        }
        return standard(url, schema);
      }),
      undefined,
    );
    assert.equal(result.status, "error");
    if (result.status === "error")
      assert.equal(result.error.code, "invalid_response");
  }
});
