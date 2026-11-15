import { z } from "zod";
import type {
  Astronaut,
  Measurement,
  Metric,
  AstronautsResponse,
  MeasurementsResponse,
  MissionResponse,
} from "./models.ts";
export type {
  Astronaut,
  Measurement,
  Metric,
  AstronautsResponse,
  MeasurementsResponse,
  MissionResponse,
} from "./models.ts";

// Contrato provisional de demostración; no contiene rangos clínicos.
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

export const measurementSchema: z.ZodType<Measurement> = z.object({
  id: z.string().min(1),
  astronautId: z.string().min(1),
  metricCode: z.string().min(1),
  value: z.number().finite().nullable(),
  recordedAt: z.iso.datetime(),
  source: z.enum(["simulator", "manual", "sensor"]),
});

const metaSchema = z.object({
  contractVersion: z.literal("0.1"),
  dataKind: z.literal("synthetic"),
  clinicalValidation: z.literal("pending"),
});

export const astronautsResponseSchema: z.ZodType<AstronautsResponse> = z.object(
  {
    data: z.array(astronautSchema),
    meta: metaSchema,
  },
);

export const measurementsResponseSchema: z.ZodType<MeasurementsResponse> = z
  .object({
    data: z.array(measurementSchema),
    metrics: z.array(metricSchema),
    meta: metaSchema,
  })
  .superRefine((response, context) => {
    const codes = new Set(response.metrics.map((metric) => metric.code));
    for (const [index, measurement] of response.data.entries()) {
      if (!codes.has(measurement.metricCode)) {
        context.addIssue({
          code: "custom",
          path: ["data", index, "metricCode"],
          message: "La medición debe referenciar una métrica del catálogo.",
        });
      }
    }
  });

export const missionResponseSchema: z.ZodType<MissionResponse> = z.object({
  data: z.object({
    evaluations: z.array(
      z.object({
        id: z.string().min(1),
        recordedAt: z.iso.datetime(),
        value: z.number().finite().nullable(),
        unit: z.string().min(1),
        method: z.string().min(1),
      }),
    ),
    sessions: z.array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        scheduledAt: z.iso.datetime(),
        durationMinutes: z.number().positive(),
        completed: z.boolean(),
      }),
    ),
  }),
  meta: metaSchema,
});
