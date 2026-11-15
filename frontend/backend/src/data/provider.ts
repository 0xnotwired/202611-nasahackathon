import seed from "./seed.json" with { type: "json" };
import type {
  AstronautsResponse,
  MeasurementsResponse,
  MissionData,
  MissionResponse,
  ResponseMeta,
} from "../../../contracts/models.ts";

const meta: ResponseMeta = {
  contractVersion: "0.1",
  dataKind: "synthetic",
  clinicalValidation: "pending",
};

// Punto de extensión del backend: sustituir esta fuente por simulación/procesamiento.
// No importar fixtures, componentes ni configuración de /src (frontend).
export function listAstronauts(): AstronautsResponse {
  return structuredClone({ data: seed.astronauts, meta });
}

export function getMeasurements(id: string): MeasurementsResponse | null {
  if (!seed.astronauts.some((astronaut) => astronaut.id === id)) return null;
  return structuredClone({
    data: seed.measurements
      .filter((row) => row.astronautId === id)
      .map((row) => ({ ...row, source: "simulator" as const }))
      .toSorted((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt)),
    metrics: seed.metrics,
    meta,
  });
}

export function getMission(id: string): MissionResponse | null {
  if (!seed.astronauts.some((astronaut) => astronaut.id === id)) return null;
  const missions: Record<string, MissionData> = seed.missions;
  return structuredClone({
    data: missions[id] ?? { evaluations: [], sessions: [] },
    meta,
  });
}
