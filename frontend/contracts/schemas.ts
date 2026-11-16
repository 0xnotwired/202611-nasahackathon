import { z } from "zod";
import type {
  Astronaut,
  Metric,
  OrbitaRecord,
  PlanTask,
  AstronautsResponse,
  MeasurementsResponse,
  MissionResponse,
} from "./models.ts";
export type {
  Astronaut,
  Metric,
  OrbitaRecord,
  PlanTask,
  AstronautsResponse,
  MeasurementsResponse,
  MissionResponse,
} from "./models.ts";

// Provisional demonstration contract; it contains no clinical ranges.
export const astronautSchema: z.ZodType<Astronaut> = z.object({
  id: z.string().min(1),
  callsign: z.string().min(1),
  role: z.string().min(1),
  mission: z.string().min(1),
});

export const metricSchema: z.ZodType<Metric> = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  unit: z.string().min(1),
});

const text = z.string().min(1);
// The rules of the main app's record validation: an absent state carries no value or unit; a recorded value is a finite number with a
// unit, or an unknown unit that is stated as such; a record without a UTC time carries the source's own time.
export const recordSchema: z.ZodType<OrbitaRecord> = z
  .strictObject({
    id: text,
    schema_version: z.literal(2),
    type: z.enum(["observation", "measurement", "action", "environment", "exam"]),
    state: z.enum(["recorded", "confirmed_none", "not_recorded"]),
    variable: text,
    value: z.number().finite().optional(),
    unit: z.string().min(1).nullable().optional(),
    unit_status: z.enum(["known", "unknown"]).optional(),
    method: text,
    time: z.iso.datetime().nullable(),
    source_time: z
      .strictObject({
        value: text,
        raw: text,
        precision: z.enum(["date", "minute", "second"]),
        timezone: z.null(),
        calendar: z.enum(["original", "shifted", "unknown"]),
        scope: text,
      })
      .optional(),
    interval: z.strictObject({ from: z.iso.datetime(), to: z.iso.datetime() }).optional(),
    origin: z.enum(["synthetic", "ground_analog", "terrestrial", "flight", "cell_culture"]),
    source: text,
    mission_phase: text,
    subject: text,
    place: text.optional(),
    sensor: text.optional(),
    corrects: text.optional(),
    note: z.string().optional(),
  })
  .superRefine((record, context) => {
    const issue = (path: string, message: string) => context.addIssue({ code: "custom", path: [path], message });
    if (record.state === "recorded") {
      if (record.value === undefined) issue("value", "A recorded value needs a number.");
      const unknownUnit = record.unit_status === "unknown";
      if (unknownUnit && record.unit !== null) issue("unit", "An unknown unit is stated as null, never guessed.");
      if (!unknownUnit && typeof record.unit !== "string") issue("unit", "A recorded value needs its unit.");
    } else {
      if (record.value !== undefined) issue("value", "A value that is not recorded carries no number.");
      if (record.unit !== undefined) issue("unit", "A value that is not recorded carries no unit.");
    }
    if (record.time === null && record.source_time === undefined) issue("time", "A record without a UTC time carries the source's own time.");
  });

export const taskSchema: z.ZodType<PlanTask> = z.strictObject({
  id: text,
  schema_version: z.literal(2),
  subject: text,
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: text,
  assigned_by: text,
  completion: z.enum(["pending", "done", "not_done"]),
  result_ids: z.array(text),
  procedure_id: text.optional(),
  execution_id: text.optional(),
  not_done_note: z.strictObject({ reason: text }).optional(),
  scheduled_at: z.iso.datetime().optional(),
  planned_minutes: z.number().positive().optional(),
});

const metaSchema = z.object({
  contractVersion: z.literal("0.2"),
  dataKind: z.literal("synthetic"),
  clinicalValidation: z.literal("pending"),
});

export const astronautsResponseSchema: z.ZodType<AstronautsResponse> = z.object(
  {
    data: z.array(astronautSchema),
    meta: metaSchema,
  },
);

// One record per origin: the response never mixes the origin of its records with the dataset's kind.
const originMatchesMeta = (records: OrbitaRecord[], context: z.RefinementCtx) => {
  for (const [index, record] of records.entries())
    if (record.origin !== "synthetic")
      context.addIssue({ code: "custom", path: ["data", index, "origin"], message: "The response declares synthetic data; a record says otherwise." });
};

export const measurementsResponseSchema: z.ZodType<MeasurementsResponse> = z
  .object({
    data: z.array(recordSchema),
    metrics: z.array(metricSchema),
    meta: metaSchema,
  })
  .superRefine((response, context) => {
    const codes = new Set(response.metrics.map((metric) => metric.code));
    for (const [index, record] of response.data.entries()) {
      if (record.type !== "measurement")
        context.addIssue({ code: "custom", path: ["data", index, "type"], message: "Only measurements are expected here." });
      if (!codes.has(record.variable))
        context.addIssue({ code: "custom", path: ["data", index, "variable"], message: "A measurement must reference a variable of the catalog." });
    }
    if (new Set(response.data.map((record) => record.id)).size !== response.data.length)
      context.addIssue({ code: "custom", path: ["data"], message: "Duplicate record identifiers." });
    originMatchesMeta(response.data, context);
  });

export const missionResponseSchema: z.ZodType<MissionResponse> = z
  .object({
    data: z.object({ records: z.array(recordSchema), tasks: z.array(taskSchema) }),
    meta: metaSchema,
  })
  .superRefine((response, context) => {
    if (new Set(response.data.records.map((record) => record.id)).size !== response.data.records.length)
      context.addIssue({ code: "custom", path: ["data", "records"], message: "Duplicate record identifiers." });
    for (const [index, record] of response.data.records.entries())
      if (record.type !== "exam")
        context.addIssue({ code: "custom", path: ["data", "records", index, "type"], message: "Only exams are expected here." });
    // The exercise plan is shown as sessions: each task says when it is planned and for how long. Neither is guessed.
    for (const [index, task] of response.data.tasks.entries())
      if (task.scheduled_at === undefined || task.planned_minutes === undefined)
        context.addIssue({ code: "custom", path: ["data", "tasks", index], message: "A task of this plan needs scheduled_at and planned_minutes." });
    originMatchesMeta(response.data.records, context);
  });
