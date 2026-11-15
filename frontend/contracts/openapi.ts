import { z } from "zod";
import {
  astronautsResponseSchema,
  measurementsResponseSchema,
  missionResponseSchema,
} from "./schemas.ts";

export function buildOpenApi() {
  const schemas = {
    AstronautsResponse: astronautsResponseSchema,
    MeasurementsResponse: measurementsResponseSchema,
    MissionResponse: missionResponseSchema,
  };
  const response = (name: string) => ({
    description: "Datos sintéticos; validación médica pendiente.",
    content: {
      "application/json": { schema: { $ref: `#/components/schemas/${name}` } },
    },
  });
  const missing = {
    description: "Astronauta inexistente",
    content: {
      "application/json": { schema: { $ref: "#/components/schemas/Error" } },
    },
  };
  const astronautId = {
    name: "astronautId",
    in: "path",
    required: true,
    schema: { type: "string", minLength: 1 },
  };
  return {
    openapi: "3.1.0",
    info: {
      title: "Órbita API",
      version: "0.1",
      description:
        "Contrato compartido frontend/backend. Solo simulación y lectura; los borradores del usuario siguen en el navegador.",
    },
    servers: [{ url: "http://127.0.0.1:4000/api/v1" }],
    paths: {
      "/health": {
        get: {
          operationId: "health",
          responses: {
            "200": {
              description: "Estado técnico del proceso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["status", "service", "contractVersion"],
                    properties: {
                      status: { const: "ok" },
                      service: { type: "string" },
                      contractVersion: { const: "0.1" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/astronauts": {
        get: {
          operationId: "listAstronauts",
          responses: { "200": response("AstronautsResponse") },
        },
      },
      "/astronauts/{astronautId}/measurements": {
        get: {
          operationId: "getMeasurements",
          parameters: [astronautId],
          responses: {
            "200": response("MeasurementsResponse"),
            "404": missing,
          },
        },
      },
      "/astronauts/{astronautId}/mission": {
        get: {
          operationId: "getMission",
          parameters: [astronautId],
          responses: { "200": response("MissionResponse"), "404": missing },
        },
      },
    },
    components: {
      schemas: {
        ...Object.fromEntries(
          Object.entries(schemas).map(([name, schema]) => [
            name,
            z.toJSONSchema(schema),
          ]),
        ),
        Error: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["code", "message"],
              properties: {
                code: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  };
}
