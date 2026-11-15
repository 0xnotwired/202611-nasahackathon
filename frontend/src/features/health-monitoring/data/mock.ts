import {
  astronautsResponseSchema,
  measurementsResponseSchema,
} from "../schemas.ts";

const meta = {
  contractVersion: "0.1",
  dataKind: "synthetic",
  clinicalValidation: "pending",
} as const;

// Valores ilustrativos para desarrollar UI. No son referencias clínicas.
const astronauts = [
  { id: "astro-01", callsign: "Vega", role: "Comandante", mission: "Órbita Demo" },
  { id: "astro-02", callsign: "Lyra", role: "Especialista de misión", mission: "Órbita Demo" },
  { id: "astro-03", callsign: "Atlas", role: "Ingeniería de vuelo", mission: "Órbita Demo" },
];

const metrics = [
  { code: "heart_rate", label: "Frecuencia cardíaca", unit: "lpm" },
  { code: "oxygen_saturation", label: "Saturación de oxígeno", unit: "%" },
  { code: "body_temperature", label: "Temperatura corporal", unit: "°C" },
  { code: "sleep_duration", label: "Duración del sueño", unit: "h" },
];

const measurements = [
  { id: "m-01", astronautId: "astro-01", metricCode: "heart_rate", value: 72, recordedAt: "2026-11-15T08:00:00Z", source: "simulator" },
  { id: "m-02", astronautId: "astro-01", metricCode: "oxygen_saturation", value: 98, recordedAt: "2026-11-15T08:00:00Z", source: "simulator" },
  { id: "m-03", astronautId: "astro-01", metricCode: "body_temperature", value: 36.6, recordedAt: "2026-11-15T08:00:00Z", source: "simulator" },
  { id: "m-04", astronautId: "astro-01", metricCode: "sleep_duration", value: 7.2, recordedAt: "2026-11-15T06:00:00Z", source: "simulator" },
  { id: "m-05", astronautId: "astro-01", metricCode: "heart_rate", value: 75, recordedAt: "2026-11-14T08:00:00Z", source: "simulator" },
  { id: "m-06", astronautId: "astro-02", metricCode: "heart_rate", value: 68, recordedAt: "2026-11-15T08:00:00Z", source: "simulator" },
  { id: "m-07", astronautId: "astro-02", metricCode: "oxygen_saturation", value: 97, recordedAt: "2026-11-15T08:00:00Z", source: "simulator" },
  { id: "m-08", astronautId: "astro-02", metricCode: "body_temperature", value: null, recordedAt: "2026-11-15T08:00:00Z", source: "simulator" },
  { id: "m-09", astronautId: "astro-02", metricCode: "sleep_duration", value: 6.8, recordedAt: "2026-11-15T06:00:00Z", source: "simulator" },
];

export function listMockAstronauts() {
  return astronautsResponseSchema.parse({ data: astronauts, meta });
}

// null = astronauta inexistente; data: [] = existente sin mediciones.
export function getMockMeasurements(astronautId: string) {
  if (!astronauts.some((astronaut) => astronaut.id === astronautId)) return null;

  return measurementsResponseSchema.parse({
    data: measurements
      .filter((measurement) => measurement.astronautId === astronautId)
      .toSorted((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt)),
    metrics,
    meta,
  });
}
