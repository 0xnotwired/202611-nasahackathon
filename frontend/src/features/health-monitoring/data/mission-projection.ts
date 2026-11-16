import { z } from "zod";
import type {
  MeasurementsResponse,
  MissionData,
  OrbitaRecord,
  ResponseMeta,
} from "../../../../contracts/models.ts";
import type {
  DemoMission,
  Evaluation,
  ExerciseSession,
  Measurement,
  MeasurementsView,
} from "../mission.ts";
import { projectionVersion, type Evidence } from "../evidence.ts";

const refuse = (message: string) =>
  new z.ZodError([{ code: "custom", path: [], message }]);

// A record is placed on a timeline only by its UTC time. One with only the source's own time is refused visibly, never given a made-up instant.
function placed(record: OrbitaRecord) {
  if (record.time === null)
    throw refuse(`Record ${record.id} has no UTC time and cannot be placed on this timeline.`);
  return record.time;
}

const metricOfUnit: Record<string, Evidence["metric"]> = {
  "mL/kg/min": "vo2_peak_relative",
  "L/min": "vo2_peak_absolute",
};
const evidenceOrigins = ["synthetic", "ground_analog", "terrestrial", "flight"] as const;

// The evidence of an evaluation comes from the record itself (its origin, unit status, clock and method), not from assumptions about the transport.
function evidenceOf(record: OrbitaRecord, dataset: string, transport: "mock" | "api", meta: ResponseMeta): Evidence {
  const origin = evidenceOrigins.find((item) => item === record.origin);
  if (!origin) throw refuse(`Record ${record.id} has origin ${record.origin}, which is not an evaluation of a person.`);
  const known = record.unit_status !== "unknown" && typeof record.unit === "string";
  return {
    subject: `${dataset}:${record.subject}`,
    assessmentId: `${dataset}:${record.subject}:${record.id}`,
    metric: (known && metricOfUnit[record.unit as string]) || "vo2_peak_relative",
    role: "peak",
    origin,
    dataset,
    protocol: record.method,
    unitStatus: known ? "known" : "unknown",
    clock: record.time === null ? "source_date" : "utc",
    calendar: record.source_time?.calendar ?? "original",
    timeScope: record.source_time?.scope ?? dataset,
    sourceRecordIds: [`${dataset}:${record.subject}:${record.id}`],
    source:
      transport === "mock"
        ? "Scenario written for Órbita; it does not come from human measurements."
        : "Demonstration API. Each value is a record with its own state, origin, unit and time.",
    verification: record.origin === "synthetic" ? "demo" : record.source === "imported" ? "verified_import" : "unverified",
    clinicalReview: meta.clinicalValidation,
    derivationVersion: projectionVersion,
  };
}

export function projectMission(
  data: MissionData,
  subjectId: string,
  transport: "mock" | "api",
  meta: ResponseMeta,
): DemoMission {
  if (new Set(data.records.map((record) => record.id)).size !== data.records.length)
    throw refuse("The response contains duplicate record identifiers.");
  if (data.records.some((record) => record.subject !== subjectId) || data.tasks.some((task) => task.subject !== subjectId))
    throw refuse("The response contains another person.");
  const dataset = transport === "mock" ? "orbita:authored-demo:2" : "orbita:http-demo:0.2";
  // A value that was not recorded has no unit of its own; it takes the unit of the recorded ones, and says so by having no number.
  const fallbackUnit = data.records.find((record) => record.state === "recorded" && typeof record.unit === "string")?.unit ?? "unit not stated";
  const evaluations: Evaluation[] = data.records.map((record) => ({
    id: record.id,
    recordedAt: placed(record),
    value: record.state === "recorded" ? (record.value as number) : null,
    unit: typeof record.unit === "string" ? record.unit : fallbackUnit,
    method: record.method,
    state: record.state,
    origin: record.origin,
    evidence: evidenceOf(record, dataset, transport, meta),
  }));
  const sessions: ExerciseSession[] = data.tasks.map((task) => {
    if (task.scheduled_at === undefined || task.planned_minutes === undefined)
      throw refuse(`Task ${task.id} needs scheduled_at and planned_minutes to be shown as a session.`);
    return {
      id: task.id,
      label: task.description,
      scheduledAt: task.scheduled_at,
      durationMinutes: task.planned_minutes,
      completed: task.completion === "done",
      completion: task.completion,
    };
  });
  return { evaluations, sessions, presentation: { transport, meta, version: projectionVersion } };
}

export function projectMeasurements(response: MeasurementsResponse): MeasurementsView {
  const data: Measurement[] = response.data.map((record) => ({
    id: record.id,
    metricCode: record.variable,
    value: record.state === "recorded" ? (record.value as number) : null,
    recordedAt: placed(record),
    state: record.state,
    origin: record.origin,
    method: record.method,
  }));
  return { ...response, data };
}
