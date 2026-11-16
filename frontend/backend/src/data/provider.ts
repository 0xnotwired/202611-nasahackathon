import seed from "./seed.json" with { type: "json" };
import type {
  AstronautsResponse,
  MeasurementsResponse,
  MissionData,
  MissionResponse,
  OrbitaRecord,
  ResponseMeta,
} from "../../../contracts/models.ts";

const meta: ResponseMeta = {
  contractVersion: "0.2",
  dataKind: "synthetic",
  clinicalValidation: "pending",
};

// Backend extension point: replace this source with simulation or processing.
// Do not import fixtures, components or configuration from /src (the frontend).
// The seed holds records in the main app's schema 2; the contract tests validate every response against the shared schemas.
const measurements = seed.measurements as unknown as OrbitaRecord[];
const missions = seed.missions as unknown as Record<string, MissionData>;
const instant = (record: OrbitaRecord) =>
  record.time === null ? Number.NEGATIVE_INFINITY : Date.parse(record.time);

export function listAstronauts(): AstronautsResponse {
  return structuredClone({ data: seed.astronauts, meta });
}

export function getMeasurements(id: string): MeasurementsResponse | null {
  if (!seed.astronauts.some((astronaut) => astronaut.id === id)) return null;
  return structuredClone({
    data: measurements
      .filter((record) => record.subject === id)
      .toSorted((a, b) => instant(b) - instant(a)),
    metrics: seed.metrics,
    meta,
  });
}

export function getMission(id: string): MissionResponse | null {
  if (!seed.astronauts.some((astronaut) => astronaut.id === id)) return null;
  return structuredClone({
    data: missions[id] ?? { records: [], tasks: [] },
    meta,
  });
}
