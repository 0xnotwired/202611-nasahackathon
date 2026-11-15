import { z } from "zod";
import { ApiError } from "../../../lib/api/errors.ts";
import {
  astronautsResponseSchema,
  measurementsResponseSchema,
} from "../schemas.ts";
import { getMockMeasurements, listMockAstronauts } from "./mock.ts";
import { getMockMission } from "./mission-mock.ts";
import { legacyMissionSchema, projectMission } from "./mission-projection.ts";
import type { Scenario } from "../aerobic.ts";
import type { SourceContext, SourceFailure } from "./source-context.ts";

export type JsonReader = <T>(url: string, schema: z.ZodType<T>) => Promise<T>;

// Request-owned. Only service.ts supplies private configuration in the app.
export function createReader(context: SourceContext, readJson: JsonReader) {
  const mode = context.mode;
  const read = async <T>(path: string, schema: z.ZodType<T>) => {
    if (context.mode !== "api")
      throw new Error("Una lectura HTTP requiere fuente api.");
    return readJson(`${context.apiBaseUrl}${path}`, schema);
  };
  return {
    mode,
    async listAstronauts() {
      return mode === "mock"
        ? listMockAstronauts()
        : read("/astronauts", astronautsResponseSchema);
    },
    async getMission(id: string, scenario?: Scenario) {
      if (mode === "mock")
        return projectMission(getMockMission(id, scenario), id, mode, {
          contractVersion: "0.1",
          dataKind: "synthetic",
          clinicalValidation: "pending",
        });
      const response = await read(
        `/astronauts/${encodeURIComponent(id)}/mission`,
        legacyMissionSchema,
      );
      return projectMission(response.data, id, mode, response.meta);
    },
    async getMeasurements(id: string) {
      const response =
        mode === "mock"
          ? getMockMeasurements(id)
          : await read(
              `/astronauts/${encodeURIComponent(id)}/measurements`,
              measurementsResponseSchema,
            );
      if (!response) throw new ApiError(404);
      if (response.data.some((item) => item.astronautId !== id))
        throw new z.ZodError([
          {
            code: "custom",
            path: ["data"],
            message: "La respuesta contiene otra persona.",
          },
        ]);
      return response;
    },
  };
}
export type HealthDataReader = ReturnType<typeof createReader>;

export function classifyReadError(
  error: unknown,
  mode: "mock" | "api",
): SourceFailure {
  if (error instanceof ApiError && error.status === 404)
    return { code: "subject_not_found", mode };
  if (error instanceof z.ZodError || error instanceof SyntaxError)
    return { code: "invalid_response", mode };
  if (
    error instanceof Error &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  )
    return { code: "timeout", mode };
  if (error instanceof ApiError || error instanceof TypeError)
    return { code: "unavailable", mode };
  throw error;
}

export async function loadDashboard(
  reader: HealthDataReader,
  requestedId: string | undefined,
  scenario?: Scenario,
) {
  let catalogLoaded = false;
  try {
    const astronauts = await reader.listAstronauts();
    catalogLoaded = true;
    if (
      new Set(astronauts.data.map((item) => item.id)).size !==
      astronauts.data.length
    )
      return {
        status: "error",
        error: { code: "invalid_response", mode: reader.mode },
      } as const;
    const astronaut =
      requestedId === undefined
        ? astronauts.data[0]
        : astronauts.data.find((item) => item.id === requestedId);
    if (requestedId !== undefined && !astronaut)
      return {
        status: "error",
        error: { code: "subject_not_found", mode: reader.mode },
      } as const;
    if (!astronaut) return { status: "empty" } as const;
    const [measurements, mission] = await Promise.all([
      reader.getMeasurements(astronaut.id),
      reader.getMission(astronaut.id, scenario),
    ]);
    if (
      measurements.meta.dataKind !== astronauts.meta.dataKind ||
      mission.presentation?.meta.dataKind !== astronauts.meta.dataKind
    )
      return {
        status: "error",
        error: { code: "invalid_response", mode: reader.mode },
      } as const;
    return {
      status: "ready",
      astronauts: astronauts.data,
      astronaut,
      measurements,
      mission,
      origin: astronauts.meta.dataKind,
    } as const;
  } catch (error) {
    if (!catalogLoaded && error instanceof ApiError && error.status === 404)
      return {
        status: "error",
        error: { code: "unavailable", mode: reader.mode },
      } as const;
    return {
      status: "error",
      error: classifyReadError(error, reader.mode),
    } as const;
  }
}
