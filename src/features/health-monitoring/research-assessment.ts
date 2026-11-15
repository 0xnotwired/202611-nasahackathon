import { z } from "zod";
import { csvCell } from "./aerobic.ts";
import { projectionVersion } from "./evidence.ts";

export const researchVariables = {
  relative_vo2: { label: "VO₂ relativo", unit: "mL/kg/min" },
  absolute_vo2: { label: "VO₂ absoluto", unit: "L/min" },
  vco2: { label: "VCO₂", unit: "L/min" },
  heart_rate: { label: "FC de etapa", unit: "bpm" },
  rer: { label: "RER", unit: "1" },
  ventilation: { label: "VE (BTPS)", unit: "L/min" },
  feo2: { label: "FEO₂", unit: "%" },
  feco2: { label: "FECO₂", unit: "%" },
} as const;
export type ResearchVariable = keyof typeof researchVariables;
export const variableOrder = Object.keys(
  researchVariables,
) as ResearchVariable[];
const readingSchema = z
  .strictObject({
    id: z.string().min(1),
    variable: z.enum(
      variableOrder as [ResearchVariable, ...ResearchVariable[]],
    ),
    state: z.enum(["recorded", "not_recorded", "confirmed_none"]),
    value: z.number().finite().nullable(),
    unit: z.string().min(1).nullable(),
    unitStatus: z.enum(["known", "unknown"]),
    sourceRow: z.string().min(1),
    sourceColumn: z.string().min(1),
  })
  .superRefine((item, ctx) => {
    if ((item.state === "recorded") !== (item.value !== null))
      ctx.addIssue({
        code: "custom",
        message:
          "El estado debe conservar la ausencia; nunca convertirla en cero.",
      });
    if (
      item.unitStatus === "known" &&
      item.unit !== researchVariables[item.variable].unit
    )
      ctx.addIssue({
        code: "custom",
        message: "La unidad no corresponde a la cantidad seleccionada.",
      });
    if (item.unitStatus === "unknown" && item.unit !== null)
      ctx.addIssue({
        code: "custom",
        message: "No atribuir unidades a un dato con unidad desconocida.",
      });
  });

// Frontend read-model proposal, not a new API contract or a replacement for M21.
export const researchAssessmentSchema = z
  .strictObject({
    id: z.string().min(1),
    subject: z.string().min(1),
    dataset: z.string().min(1),
    origin: z.enum(["synthetic", "ground_analog", "terrestrial", "flight"]),
    protocol: z.string().min(1),
    phase: z.string().min(1),
    sourceTime: z.strictObject({
      value: z.iso.date(),
      raw: z.string().min(1),
      precision: z.literal("date"),
      timezone: z.null(),
      calendar: z.enum(["original", "shifted", "unknown"]),
      scope: z.string().min(1),
    }),
    provenance: z.strictObject({
      source: z.string().min(1),
      citation: z.string().min(1),
      fileSha256: z
        .string()
        .regex(/^[a-f0-9]{64}$/)
        .nullable(),
      importProfile: z.string().min(1),
      release: z.string().min(1),
      verification: z.enum(["demo", "verified_import"]),
      clinicalReview: z.literal("pending"),
    }),
    stages: z
      .array(
        z.strictObject({
          id: z.string().min(1),
          label: z.string().min(1),
          role: z.enum(["stage", "source_reported_peak"]),
          readings: z.array(readingSchema).min(1),
        }),
      )
      .min(1),
  })
  .superRefine((assessment, ctx) => {
    const ids = assessment.stages.flatMap((stage) =>
      stage.readings.map((reading) => reading.id),
    );
    if (
      new Set(ids).size !== ids.length ||
      new Set(assessment.stages.map((stage) => stage.id)).size !==
        assessment.stages.length
    )
      ctx.addIssue({
        code: "custom",
        message:
          "IDs repetidos: la importación no puede duplicar etapas o registros.",
      });
    if (
      assessment.stages.filter((stage) => stage.role === "source_reported_peak")
        .length > 1
    )
      ctx.addIssue({
        code: "custom",
        message: "La selección de pico reportado debe ser inequívoca.",
      });
    for (const stage of assessment.stages)
      if (
        new Set(stage.readings.map((reading) => reading.variable)).size !==
        stage.readings.length
      )
        ctx.addIssue({
          code: "custom",
          message: "Una etapa no puede repetir la misma cantidad.",
        });
    if (!assessment.subject.startsWith(`${assessment.dataset}:`))
      ctx.addIssue({
        code: "custom",
        message: "La identidad debe estar contextualizada por dataset.",
      });
    if (
      assessment.origin !== "synthetic" &&
      (!assessment.provenance.fileSha256 ||
        assessment.provenance.verification !== "verified_import")
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Una fuente real exige custodia verificable antes de presentarse como importada.",
      });
    if (
      assessment.origin === "synthetic" &&
      assessment.provenance.verification !== "demo"
    )
      ctx.addIssue({
        code: "custom",
        message: "Una demostración no es una importación real verificada.",
      });
  });
export type ResearchAssessment = z.infer<typeof researchAssessmentSchema>;

export function projectResearchAssessment(input: unknown) {
  const assessment = researchAssessmentSchema.parse(input);
  const reportedPeak = assessment.stages.find(
    (stage) => stage.role === "source_reported_peak",
  );
  const peak = reportedPeak?.readings.find(
    (reading) => reading.variable === "relative_vo2",
  );
  return {
    assessment,
    reportedPeak,
    peak:
      peak?.state === "recorded" && peak.unitStatus === "known" ? peak : null,
    assessmentCount: 1,
    stageCount: assessment.stages.length,
    sourceRecordCount: assessment.stages.reduce(
      (count, stage) => count + stage.readings.length,
      0,
    ),
    capabilities: {
      longitudinal: false,
      utcAge: false,
      reasons: [
        "Solo hay una prueba; las etapas no son evaluaciones independientes.",
        "La fecha fuente tiene precisión de día y no define un instante UTC.",
        ...(assessment.sourceTime.calendar === "unknown"
          ? ["El calendario de origen no está confirmado."]
          : []),
      ],
    },
    version: projectionVersion,
  };
}
export type ResearchProjection = ReturnType<typeof projectResearchAssessment>;

export function researchCsv(projection: ResearchProjection) {
  const { assessment: a } = projection;
  return [
    [
      "prueba_id",
      "sujeto",
      "dataset",
      "origen",
      "protocolo",
      "fase",
      "etapa",
      "papel",
      "cantidad",
      "valor",
      "estado",
      "unidad",
      "estado_unidad",
      "fecha_fuente",
      "fecha_raw",
      "precision",
      "calendario",
      "zona",
      "ambito_temporal",
      "registro_id",
      "fila",
      "columna",
      "fuente",
      "cita",
      "sha256",
      "perfil_importacion",
      "release",
      "verificacion_tecnica",
      "revision_clinica",
      "version_derivacion",
    ],
    ...a.stages.flatMap((stage) =>
      stage.readings.map((r) => [
        a.id,
        a.subject,
        a.dataset,
        a.origin,
        a.protocol,
        a.phase,
        stage.label,
        stage.role,
        r.variable,
        r.value,
        r.state,
        r.unit,
        r.unitStatus,
        a.sourceTime.value,
        a.sourceTime.raw,
        a.sourceTime.precision,
        a.sourceTime.calendar,
        a.sourceTime.timezone,
        a.sourceTime.scope,
        r.id,
        r.sourceRow,
        r.sourceColumn,
        a.provenance.source,
        a.provenance.citation,
        a.provenance.fileSha256,
        a.provenance.importProfile,
        a.provenance.release,
        a.provenance.verification,
        a.provenance.clinicalReview,
        projection.version,
      ]),
    ),
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
}
