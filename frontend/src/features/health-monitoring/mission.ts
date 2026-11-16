import type {
  Metric,
  OrbitaRecord,
  RecordOrigin,
  RecordState,
  ResponseMeta,
} from "../../../contracts/models.ts";
import { evidenceReason, type Evidence } from "./evidence.ts";

// Presentation types. The data is `OrbitaRecord` (the main app's schema 2); these are derived from it in data/mission-projection.ts.
export type Evaluation = {
  id: string;
  recordedAt: string;
  value: number | null;
  unit: string;
  method: string;
  // Absent only in hand-written examples; every projected evaluation says whether its value was recorded.
  state?: RecordState;
  origin?: RecordOrigin;
  evidence?: Evidence;
};
export type ExerciseSession = {
  id: string;
  label: string;
  scheduledAt: string;
  durationMinutes: number;
  // `completed` is true only for `done`; a pending or not-done session is not completed, and `completion` says which.
  completed: boolean;
  completion?: "pending" | "done" | "not_done";
};
export type Measurement = {
  id: string;
  metricCode: string;
  value: number | null;
  recordedAt: string;
  state: RecordState;
  origin: RecordOrigin;
  method: string;
};
export type MeasurementsView = {
  data: Measurement[];
  metrics: Metric[];
  meta: ResponseMeta;
};
export type DemoMission = {
  evaluations: Evaluation[];
  sessions: ExerciseSession[];
  presentation?: {
    transport: "mock" | "api";
    meta: ResponseMeta;
    version: string;
  };
};
export type { OrbitaRecord };

export function compareEvaluations(
  previous?: Evaluation,
  current?: Evaluation,
) {
  if (!previous || !current)
    return {
      difference: null,
      reason: "Two assessments are needed to compare.",
    };
  if (previous.value === null || current.value === null)
    return {
      difference: null,
      reason: "The result of an assessment is missing.",
    };
  if (!Number.isFinite(previous.value) || !Number.isFinite(current.value))
    return { difference: null, reason: "One of the results is not valid." };
  const reason = evidenceReason(previous.evidence, current.evidence);
  if (reason) return { difference: null, reason };
  if (
    previous.id === current.id ||
    (previous.evidence &&
      previous.evidence.assessmentId === current.evidence?.assessmentId)
  )
    return {
      difference: null,
      reason: "It is the same test; it does not represent a longitudinal change.",
    };
  if (previous.unit !== current.unit)
    return {
      difference: null,
      reason: "The units of the assessments are different.",
    };
  if (previous.method !== current.method)
    return {
      difference: null,
      reason:
        "The assessment method changed. We do not compute a difference between these tests.",
    };
  return {
    difference: current.value - previous.value,
    reason:
      "Same unit and method in the simulated scenario. The change is descriptive, with no clinical interpretation.",
  };
}

export const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatTimestamp(value: string) {
  return (
    new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "UTC",
    }).format(new Date(value)) + " UTC"
  );
}
