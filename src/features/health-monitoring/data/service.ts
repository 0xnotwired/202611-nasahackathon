import "server-only";
import { ApiError, getJson } from "@/lib/api/client";
import { getDataConfig } from "@/lib/env";
import {
  astronautsResponseSchema,
  measurementsResponseSchema,
  missionResponseSchema,
} from "../schemas";
import { getMockMeasurements, listMockAstronauts } from "./mock";
import { getMockMission } from "./mission-mock";

export async function getMission(astronautId: string) {
  const config = getDataConfig();
  if (config.HEALTH_DATA_SOURCE === "mock") return getMockMission(astronautId);
  try {
    const response = await getJson(
      `${config.HEALTH_API_BASE_URL!.replace(/\/$/, "")}/astronauts/${encodeURIComponent(astronautId)}/mission`,
      missionResponseSchema,
    );
    return response.data;
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
