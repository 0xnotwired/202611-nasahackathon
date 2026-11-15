import { z } from "zod";
import type {
  MissionData,
  ResponseMeta,
} from "../../../../contracts/models.ts";
import type { DemoMission } from "../mission.ts";
import { projectionVersion } from "../evidence.ts";

// Reject undeclared evidence instead of stripping it into a synthetic v1 row.
export const legacyMissionSchema = z.strictObject({
  data: z.strictObject({
    evaluations: z.array(
      z.strictObject({
        id: z.string().min(1),
        recordedAt: z.iso.datetime(),
        value: z.number().finite().nullable(),
        unit: z.string().min(1),
        method: z.string().min(1),
      }),
    ),
    sessions: z.array(
      z.strictObject({
        id: z.string().min(1),
        label: z.string().min(1),
        scheduledAt: z.iso.datetime(),
        durationMinutes: z.number().positive(),
        completed: z.boolean(),
      }),
    ),
  }),
  meta: z.strictObject({
    contractVersion: z.literal("0.1"),
    dataKind: z.literal("synthetic"),
    clinicalValidation: z.literal("pending"),
  }),
});

export function projectMission(
  data: MissionData,
  subjectId: string,
  transport: "mock" | "api",
  meta: ResponseMeta,
): DemoMission {
  if (
    new Set(data.evaluations.map((item) => item.id)).size !==
    data.evaluations.length
  )
    throw new Error(
      "La respuesta contiene identificadores de evaluación duplicados.",
    );
  const dataset =
    transport === "mock" ? "orbita:authored-demo:1" : "orbita:http-demo:0.1";
  return {
    ...data,
    presentation: { transport, meta, version: projectionVersion },
    evaluations: data.evaluations.map((item) => ({
      ...item,
      evidence: {
        subject: `${dataset}:${subjectId}`,
        assessmentId: `${dataset}:${subjectId}:${item.id}`,
        metric: "vo2_peak_relative",
        role: "peak",
        origin: meta.dataKind,
        dataset,
        protocol: item.method,
        unitStatus: "known",
        clock: "utc",
        calendar: "original",
        timeScope: dataset,
        sourceRecordIds: [`${dataset}:${subjectId}:${item.id}`],
        source:
          transport === "mock"
            ? "Escenario escrito para Órbita; no procede de mediciones humanas."
            : "API de demostración 0.1. Cantidad e identidad por prueba no verificables en este contrato.",
        verification: transport === "mock" ? "demo" : "unverified",
        clinicalReview: meta.clinicalValidation,
        derivationVersion: projectionVersion,
      },
    })),
  };
}
