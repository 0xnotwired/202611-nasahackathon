// Shared transport types, version 0.2. No imports from React, Next.js or the backend.
// The data model is the main app's schema 2 (docs/CONTRACTS.md in the repository root): one `OrbitaRecord` per value, with its own state,
// origin, unit status, method and time. Presentation types (an evaluation, a session) are derived from these in the frontend.
export type ResponseMeta = {
  contractVersion: "0.2";
  dataKind: "synthetic";
  clinicalValidation: "pending";
};
export type RecordState = "recorded" | "confirmed_none" | "not_recorded";
export type RecordOrigin =
  | "synthetic"
  | "ground_analog"
  | "terrestrial"
  | "flight"
  | "cell_culture";
export type SourceTime = {
  value: string;
  raw: string;
  precision: "date" | "minute" | "second";
  timezone: null;
  calendar: "original" | "shifted" | "unknown";
  scope: string;
};
export type OrbitaRecord = {
  id: string;
  schema_version: 2;
  type: "observation" | "measurement" | "action" | "environment" | "exam";
  state: RecordState;
  variable: string;
  value?: number;
  unit?: string | null;
  unit_status?: "known" | "unknown";
  method: string;
  time: string | null;
  source_time?: SourceTime;
  interval?: { from: string; to: string };
  origin: RecordOrigin;
  source: string;
  mission_phase: string;
  subject: string;
  place?: string;
  sensor?: string;
  corrects?: string;
  note?: string;
};
export type PlanTask = {
  id: string;
  schema_version: 2;
  subject: string;
  day: string;
  description: string;
  assigned_by: string;
  completion: "pending" | "done" | "not_done";
  result_ids: string[];
  procedure_id?: string;
  execution_id?: string;
  not_done_note?: { reason: string };
  scheduled_at?: string;
  planned_minutes?: number;
};
// A person in the demo directory. Presentation metadata, not part of the data model: the subject of a record is the `id`.
export type Astronaut = {
  id: string;
  callsign: string;
  role: string;
  mission: string;
};
export type Metric = { code: string; label: string; unit: string };
export type MissionData = { records: OrbitaRecord[]; tasks: PlanTask[] };
export type AstronautsResponse = { data: Astronaut[]; meta: ResponseMeta };
export type MeasurementsResponse = {
  data: OrbitaRecord[];
  metrics: Metric[];
  meta: ResponseMeta;
};
export type MissionResponse = { data: MissionData; meta: ResponseMeta };
