import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  astronautsResponseSchema,
  measurementsResponseSchema,
  missionResponseSchema,
} from "../schemas.ts";
import { buildOpenApi } from "../openapi.ts";
import { handleRequest } from "../../backend/src/app.ts";

test("OpenAPI versionado coincide con los esquemas compartidos", () => {
  assert.deepEqual(
    JSON.parse(
      readFileSync(new URL("../openapi.json", import.meta.url), "utf8"),
    ),
    buildOpenApi(),
  );
});

test("los ejemplos de contrato son válidos", () => {
  for (const [file, schema] of [
    ["astronauts", astronautsResponseSchema],
    ["measurements", measurementsResponseSchema],
    ["mission", missionResponseSchema],
  ] as const) {
    assert.ok(
      schema.safeParse(
        JSON.parse(
          readFileSync(
            new URL(`../fixtures/${file}.json`, import.meta.url),
            "utf8",
          ),
        ),
      ).success,
    );
  }
});

test("todas las respuestas del backend son aceptadas por el frontend", async () => {
  const astronauts = astronautsResponseSchema.parse(
    await handleRequest(
      new Request("http://localhost/api/v1/astronauts"),
    ).json(),
  );
  for (const astronaut of astronauts.data) {
    const base = `http://localhost/api/v1/astronauts/${encodeURIComponent(astronaut.id)}`;
    const measurements = measurementsResponseSchema.parse(
      await handleRequest(new Request(`${base}/measurements`)).json(),
    );
    assert.ok(
      measurements.data.every((row) => row.astronautId === astronaut.id),
    );
    missionResponseSchema.parse(
      await handleRequest(new Request(`${base}/mission`)).json(),
    );
  }
});
