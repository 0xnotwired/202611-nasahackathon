import "server-only";
import { ApiError, getJson } from "@/lib/api/client";
import { getDataConfig } from "@/lib/env";
import {
  astronautsResponseSchema,
  measurementsResponseSchema,
} from "../schemas";
import { getMockMeasurements, listMockAstronauts } from "./mock";
import { getMockMission } from "./mission-mock";
import type { Scenario } from "../aerobic";
import { legacyMissionSchema, projectMission } from "./mission-projection";
import { getSyntheticResearchCase } from "./research-mock";

export async function getResearchCase(example: boolean) {
  // No endpoint is assumed and no local IndexedDB profile is read as server data.
  // Backend must supply a verified, agreed projection before enabling real cases.
  return example ? getSyntheticResearchCase() : null;
}

export async function getMission(astronautId: string, scenario?: Scenario) {
  const config = getDataConfig();
  if (config.HEALTH_DATA_SOURCE === "mock")
    return projectMission(
      getMockMission(astronautId, scenario),
      astronautId,
      "mock",
      {
        contractVersion: "0.1",
        dataKind: "synthetic",
        clinicalValidation: "pending",
      },
    );
  try {
    const response = await getJson(
      `${config.HEALTH_API_BASE_URL!.replace(/\/$/, "")}/astronauts/${encodeURIComponent(astronautId)}/mission`,
      legacyMissionSchema,
    );
    return projectMission(response.data, astronautId, "api", response.meta);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function listAstronauts() {
  const config = getDataConfig();
  if (config.HEALTH_DATA_SOURCE === "mock") return listMockAstronauts();

  return getJson(
    `${config.HEALTH_API_BASE_URL!.replace(/\/$/, "")}/astronauts`,
    astronautsResponseSchema,
  );
}

export async function getMeasurements(astronautId: string) {
  const config = getDataConfig();
  if (config.HEALTH_DATA_SOURCE === "mock")
    return getMockMeasurements(astronautId);

  try {
    const response = await getJson(
      `${config.HEALTH_API_BASE_URL!.replace(/\/$/, "")}/astronauts/${encodeURIComponent(astronautId)}/measurements`,
      measurementsResponseSchema,
    );
    if (
      response.data.some(
        (measurement) => measurement.astronautId !== astronautId,
      )
    ) {
      throw new Error("La API devolvió mediciones de otro astronauta.");
    }
    return response;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    // No ocultar fallos de integración con un reemplazo silencioso por mocks.
    throw error;
  }
}
