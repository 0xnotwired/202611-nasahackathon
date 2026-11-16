import { z } from "zod";
import { csvCell } from "./aerobic.ts";
import { projectionVersion } from "./evidence.ts";

export const researchVariables = {
  relative_vo2: { label: "VO₂ relativo", unit: "mL/kg/min" },
  absolute_vo2: { label: "VO₂ absoluto", unit: "L/min" },
  vco2: { label: "VCO₂", unit: "L/min" },
  heart_rate: { label: "Stage heart rate", unit: "bpm" },
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
          "The state must keep the absence; never turn it into zero.",
      });
    if (
      item.unitStatus === "known" &&
      item.unit !== researchVariables[item.variable].unit
    )
      ctx.addIssue({
        code: "custom",
        message: "The unit does not match the selected quantity.",
      });
    if (item.unitStatus === "unknown" && item.unit !== null)
      ctx.addIssue({
        code: "custom",
        message: "Do not attribute units to a value with an unknown unit.",
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
          "Repeated ids: an import cannot duplicate stages or records.",
      });
    if (
      assessment.stages.filter((stage) => stage.role === "source_reported_peak")
        .length > 1
    )
      ctx.addIssue({
        code: "custom",
        message: "The selection of the reported peak must be unambiguous.",
      });
    for (const stage of assessment.stages)
      if (
        new Set(stage.readings.map((reading) => reading.variable)).size !==
        stage.readings.length
      )
        ctx.addIssue({
          code: "custom",
          message: "A stage cannot repeat the same quantity.",
        });
    if (!assessment.subject.startsWith(`${assessment.dataset}:`))
      ctx.addIssue({
        code: "custom",
        message: "Identity must be contextualized by dataset.",
      });
    if (
      assessment.origin !== "synthetic" &&
      (!assessment.provenance.fileSha256 ||
        assessment.provenance.verification !== "verified_import")
    )
      ctx.addIssue({
        code: "custom",
        message:
          "A real source requires verifiable custody before it is presented as imported.",
      });
    if (
      assessment.origin === "synthetic" &&
      assessment.provenance.verification !== "demo"
    )
      ctx.addIssue({
        code: "custom",
        message: "A demonstration is not a verified real import.",
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
        "There is only one test; the stages are not independent assessments.",
        "The source date has day precision and does not define a UTC instant.",
        ...(assessment.sourceTime.calendar === "unknown"
          ? ["The source calendar is not confirmed."]
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
      "assessment_id",
      "subject",
      "dataset",
      "origin",
      "protocol",
      "phase",
      "stage",
      "role",
      "quantity",
      "value",
      "state",
      "unit",
      "unit_state",
      "source_date",
      "raw_date",
      "precision",
      "calendar",
      "zone",
      "time_scope",
      "record_id",
      "row",
      "column",
      "source",
      "citation",
      "sha256",
      "import_profile",
      "release",
      "technical_verification",
      "clinical_review",
      "derivation_version",
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
