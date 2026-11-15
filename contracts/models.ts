// Tipos de transporte compartidos. Sin imports de React, Next.js o del backend.
export type ResponseMeta = {
  contractVersion: "0.1";
  dataKind: "synthetic";
  clinicalValidation: "pending";
};
export type Astronaut = {
  id: string;
  callsign: string;
  role: string;
  mission: string;
};
export type Metric = { code: string; label: string; unit: string };
export type Measurement = {
  id: string;
  astronautId: string;
  metricCode: string;
  value: number | null;
  recordedAt: string;
  source: "simulator" | "manual" | "sensor";
};
export type Evaluation = {
  id: string;
  recordedAt: string;
  value: number | null;
  unit: string;
  method: string;
};
export type ExerciseSession = {
  id: string;
  label: string;
  scheduledAt: string;
  durationMinutes: number;
  completed: boolean;
};
export type MissionData = {
  evaluations: Evaluation[];
  sessions: ExerciseSession[];
};
export type AstronautsResponse = { data: Astronaut[]; meta: ResponseMeta };
export type MeasurementsResponse = {
  data: Measurement[];
  metrics: Metric[];
  meta: ResponseMeta;
};
export type MissionResponse = { data: MissionData; meta: ResponseMeta };
