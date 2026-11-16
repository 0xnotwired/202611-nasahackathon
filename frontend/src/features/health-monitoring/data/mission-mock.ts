import type { MissionData, OrbitaRecord, PlanTask } from "../../../../contracts/models.ts";
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

// Scenarios exclusive to the visual prototype. They are not a medical program.
const ERGOMETER = "Cycle ergometer · demo protocol A";
const TREADMILL = "Treadmill · demo protocol B";

// An evaluation is an exam record; a missing visit is a record that was not recorded, with no number and no unit.
function evaluation(id: string, subject: string, value: number | null, time: string, method: string): OrbitaRecord {
  const base = {
    id, schema_version: 2, type: "exam", variable: "aerobic_capacity", method, time, origin: "synthetic", source: "simulator",
    mission_phase: "mission", subject,
  } as const;
  return value === null ? { ...base, state: "not_recorded" } : { ...base, state: "recorded", value, unit: "mL/kg/min" };
}
function session(id: string, subject: string, description: string, scheduledAt: string, minutes: number, done: boolean): PlanTask {
  return {
    id, schema_version: 2, subject, day: scheduledAt.slice(0, 10), description, assigned_by: "team_defined",
    completion: done ? "done" : "pending", result_ids: [], scheduled_at: scheduledAt, planned_minutes: minutes,
  };
}

export function getMockMission(
  astronautId: string,
  scenario?: Scenario,
): MissionData {
  if (!["astro-01", "astro-02"].includes(astronautId)) return { records: [], tasks: [] };
  const offset = astronautId === "astro-02" ? 2 : 0;
  const tasks = [
    session("session-01", astronautId, "Aerobic session", "2026-11-13T09:00:00Z", 30, true),
    session("session-02", astronautId, "Strength session", "2026-11-14T09:00:00Z", 25, true),
    session("session-03", astronautId, "Aerobic session", "2026-11-15T09:00:00Z", 30, false),
  ];
  if (scenario) {
    return {
      records: histories[scenario].map((value, index) =>
        evaluation(
          `${scenario}-${index.toString().padStart(2, "0")}`,
          astronautId,
          value === null ? null : Number((value + offset).toFixed(1)),
          new Date(Date.UTC(2025, 10 + index, 15, 8)).toISOString(),
          scenario === "method_change" && index >= 7 ? TREADMILL : ERGOMETER,
        ),
      ),
      tasks,
    };
  }
  return {
    records: [
      evaluation("eval-01", astronautId, 38.4 + offset, "2026-05-15T08:00:00Z", ERGOMETER),
      evaluation("eval-02", astronautId, 36.8 + offset, "2026-08-15T08:00:00Z", ERGOMETER),
      evaluation("eval-03", astronautId, astronautId === "astro-02" ? null : 37.2, "2026-11-15T08:00:00Z", TREADMILL),
    ],
    tasks,
  };
}
