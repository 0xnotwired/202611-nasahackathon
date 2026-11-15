import type { DemoMission } from "../mission";
import type { Scenario } from "../aerobic";

const histories: Record<Scenario, (number | null)[]> = {
  ascending: [
    38.4, 38.8, 39.1, 38.9, 39.5, 39.8, 40.1, 40.0, 40.6, 40.8, 41.1, 41.3,
    41.5,
  ],
  small_variation: [
    38.4, 38.5, 38.2, 38.4, 38.6, 38.3, 38.4, 38.5, 38.3, 38.4, 38.2, 38.5,
    38.4,
  ],
  descending: [
    38.4, 38.1, 37.8, 37.9, 37.4, 37.0, 36.7, 36.9, 36.3, 36.0, 35.7, 35.8,
    35.4,
  ],
  recovery: [
    38.4, 38.1, 37.7, 37.2, 36.8, 36.9, 37.0, 37.4, 37.9, 38.3, 38.8, 39.0,
    39.1,
  ],
  missing_visits: [
    38.4,
    38.6,
    null,
    38.9,
    39.0,
    null,
    null,
    39.4,
    39.5,
    39.6,
    39.8,
    39.9,
    40.0,
  ],
  method_change: [
    38.4, 38.8, 39.1, 38.9, 39.5, 39.8, 40.1, 44.5, 44.7, 44.9, 45.0, 45.2,
    45.1,
  ],
};

// Escenarios exclusivos del prototipo visual. No constituyen un programa médico.
export function getMockMission(
  astronautId: string,
  scenario?: Scenario,
): DemoMission {
  if (!["astro-01", "astro-02"].includes(astronautId))
    return { evaluations: [], sessions: [] };
  const offset = astronautId === "astro-02" ? 2 : 0;
  if (scenario) {
    return {
      evaluations: histories[scenario].map((value, index) => ({
        id: `${scenario}-${index.toString().padStart(2, "0")}`,
        recordedAt: new Date(Date.UTC(2025, 10 + index, 15, 8)).toISOString(),
        value: value === null ? null : Number((value + offset).toFixed(1)),
        unit: "mL/kg/min",
        method:
          scenario === "method_change" && index >= 7
            ? "Cinta · protocolo demo B"
            : "Cicloergómetro · protocolo demo A",
      })),
      sessions: getMockMission(astronautId).sessions,
    };
  }
  return {
    evaluations: [
      {
        id: "eval-01",
        recordedAt: "2026-05-15T08:00:00Z",
        value: 38.4 + offset,
        unit: "mL/kg/min",
        method: "Cicloergómetro · protocolo demo A",
      },
      {
        id: "eval-02",
        recordedAt: "2026-08-15T08:00:00Z",
        value: 36.8 + offset,
        unit: "mL/kg/min",
        method: "Cicloergómetro · protocolo demo A",
      },
      {
        id: "eval-03",
        recordedAt: "2026-11-15T08:00:00Z",
        value: astronautId === "astro-02" ? null : 37.2,
        unit: "mL/kg/min",
        method: "Cinta · protocolo demo B",
      },
    ],
    sessions: [
      {
        id: "session-01",
        label: "Sesión aeróbica",
        scheduledAt: "2026-11-13T09:00:00Z",
        durationMinutes: 30,
        completed: true,
      },
      {
        id: "session-02",
        label: "Sesión de fuerza",
        scheduledAt: "2026-11-14T09:00:00Z",
        durationMinutes: 25,
        completed: true,
      },
      {
        id: "session-03",
        label: "Sesión aeróbica",
        scheduledAt: "2026-11-15T09:00:00Z",
        durationMinutes: 30,
        completed: false,
      },
    ],
  };
}
