import type { DemoMission } from "../mission";

// Escenarios exclusivos del prototipo visual. No constituyen un programa médico.
export function getMockMission(astronautId: string): DemoMission {
  if (!["astro-01", "astro-02"].includes(astronautId))
    return { evaluations: [], sessions: [] };
  const offset = astronautId === "astro-02" ? 2 : 0;
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
