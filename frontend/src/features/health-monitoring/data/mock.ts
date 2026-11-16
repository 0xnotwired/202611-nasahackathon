import {
  astronautsResponseSchema,
  measurementsResponseSchema,
} from "../schemas.ts";
import type { OrbitaRecord } from "../../../../contracts/models.ts";

const meta = {
  contractVersion: "0.2",
  dataKind: "synthetic",
  clinicalValidation: "pending",
} as const;

// Illustrative values for developing the UI. They are not clinical references.
const astronauts = [
  { id: "astro-01", callsign: "Vega", role: "Commander", mission: "Órbita Demo" },
  { id: "astro-02", callsign: "Lyra", role: "Mission specialist", mission: "Órbita Demo" },
  { id: "astro-03", callsign: "Atlas", role: "Flight engineering", mission: "Órbita Demo" },
];

// Variable ids are the main app's catalog ids. `oxygen_saturation` is not in that catalog yet (it needs a source before it can be added).
const metrics = [
  { code: "pulse", label: "Pulse", unit: "bpm" },
  { code: "oxygen_saturation", label: "Oxygen saturation", unit: "%" },
  { code: "temperature", label: "Body temperature", unit: "°C" },
  { code: "sleep_hours", label: "Sleep duration", unit: "h" },
];
const unitOf = Object.fromEntries(metrics.map((metric) => [metric.code, metric.unit]));

// A missing value is a record that was not recorded: no number, no unit.
function measurement(id: string, subject: string, variable: string, value: number | null, time: string): OrbitaRecord {
  const base = {
    id, schema_version: 2, type: "measurement", variable, method: variable === "sleep_hours" ? "instrument_estimate" : "simulator", time,
    origin: "synthetic", source: "simulator", mission_phase: "mission", subject,
  } as const;
  return value === null ? { ...base, state: "not_recorded" } : { ...base, state: "recorded", value, unit: unitOf[variable] };
}

const records: OrbitaRecord[] = [
  measurement("m-01", "astro-01", "pulse", 72, "2026-11-15T08:00:00Z"),
  measurement("m-02", "astro-01", "oxygen_saturation", 98, "2026-11-15T08:00:00Z"),
  measurement("m-03", "astro-01", "temperature", 36.6, "2026-11-15T08:00:00Z"),
  measurement("m-04", "astro-01", "sleep_hours", 7.2, "2026-11-15T06:00:00Z"),
  measurement("m-05", "astro-01", "pulse", 75, "2026-11-14T08:00:00Z"),
  measurement("m-06", "astro-02", "pulse", 68, "2026-11-15T08:00:00Z"),
  measurement("m-07", "astro-02", "oxygen_saturation", 97, "2026-11-15T08:00:00Z"),
  measurement("m-08", "astro-02", "temperature", null, "2026-11-15T08:00:00Z"),
  measurement("m-09", "astro-02", "sleep_hours", 6.8, "2026-11-15T06:00:00Z"),
];

export function listMockAstronauts() {
  return astronautsResponseSchema.parse({ data: astronauts, meta });
}

// null = nonexistent astronaut; data: [] = existing one with no measurements.
export function getMockMeasurements(astronautId: string) {
  if (!astronauts.some((astronaut) => astronaut.id === astronautId)) return null;

  return measurementsResponseSchema.parse({
    data: records
      .filter((record) => record.subject === astronautId)
      .toSorted((a, b) => Date.parse(b.time as string) - Date.parse(a.time as string)),
    metrics,
    meta,
  });
}
