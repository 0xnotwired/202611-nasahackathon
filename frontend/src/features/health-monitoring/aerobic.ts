import type { Evaluation } from "./mission.ts";
import { compareEvaluations } from "./mission.ts";
import { evidenceReason, projectionVersion } from "./evidence.ts";

export const scenarios = {
  recovery: "Descenso y recuperación",
  ascending: "Ascenso con oscilaciones",
  small_variation: "Variación pequeña",
  descending: "Descenso con oscilaciones",
  missing_visits: "Visitas sin resultado",
  method_change: "Cambio de método",
} as const;
export type Scenario = keyof typeof scenarios;
export function isScenario(value: unknown): value is Scenario {
  return typeof value === "string" && Object.hasOwn(scenarios, value);
}

export function periodEvaluations(evaluations: Evaluation[], months: number) {
  const sorted = evaluations.toSorted(
    (a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt),
  );
  const latest = sorted.at(-1);
  if (!latest || months === 0) return sorted;
  const end = new Date(latest.recordedAt);
  const day = end.getUTCDate();
  end.setUTCDate(1);
  end.setUTCMonth(end.getUTCMonth() - months);
  const lastDay = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0),
  ).getUTCDate();
  end.setUTCDate(Math.min(day, lastDay));
  return sorted.filter(
    (evaluation) => Date.parse(evaluation.recordedAt) >= end.getTime(),
  );
}

// Descripción matemática del período. No define estabilidad o relevancia clínica.
export function describePeriod(evaluations: Evaluation[]) {
  const valid = evaluations.filter(
    (item) => item.value !== null && Number.isFinite(item.value),
  );
  const first = valid[0];
  const last = valid.at(-1);
  const incompatible = valid.some(
    (item) =>
      item.method !== first?.method ||
      item.unit !== first?.unit ||
      !!evidenceReason(first?.evidence, item.evidence),
  );
  const contextReason = valid
    .map((item) => evidenceReason(first?.evidence, item.evidence))
    .find(Boolean);
  if (incompatible)
    return {
      label: "No comparable",
      slope: null,
      count: valid.length,
      reason:
        contextReason ??
        "El período contiene métodos o unidades diferentes. Revisá cada segmento por separado.",
    };
  const distinct = new Set(
    valid.map((item) => item.evidence?.assessmentId ?? item.id),
  ).size;
  if (distinct < 3 || !first || !last)
    return {
      label: "Datos insuficientes",
      slope: null,
      count: valid.length,
      reason:
        "La lectura exploratoria necesita al menos tres resultados comparables. Esta regla del demo no garantiza suficiencia estadística.",
    };
  const days = valid.map(
    (item) =>
      (Date.parse(item.recordedAt) - Date.parse(first.recordedAt)) / 86_400_000,
  );
  const meanX = days.reduce((a, b) => a + b, 0) / days.length;
  const meanY =
    valid.reduce((sum, item) => sum + item.value!, 0) / valid.length;
  const denominator = days.reduce((sum, day) => sum + (day - meanX) ** 2, 0);
  if (!denominator)
    return {
      label: "Datos insuficientes",
      slope: null,
      count: valid.length,
      reason: "Se necesitan fechas diferentes para describir la evolución.",
    };
  const slope =
    valid.reduce(
      (sum, item, index) => sum + (days[index] - meanX) * (item.value! - meanY),
      0,
    ) / denominator;
  // No hay umbral médico. Solo llamamos sin dirección al cero numérico.
  const label =
    Math.abs(slope) < 1e-10
      ? "Sin dirección neta"
      : slope > 0
        ? "Tendencia ascendente"
        : "Tendencia descendente";
  return {
    label,
    slope,
    count: valid.length,
    reason:
      "Dirección de una recta ajustada a las fechas y resultados disponibles. Describe el período; no evalúa relevancia clínica ni predice resultados.",
  };
}

export function comparisonTo(
  reference: Evaluation | undefined,
  current: Evaluation | undefined,
) {
  return compareEvaluations(reference, current);
}

export function csvCell(value: unknown) {
  const raw = String(value ?? "");
  // Quoting alone does not prevent spreadsheet formulas in source labels.
  const safe =
    typeof value === "string" && /^[\s]*[=+@\-\t\r\n]/.test(raw)
      ? `'${raw}`
      : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function historyCsv(evaluations: Evaluation[]) {
  return [
    [
      "id",
      "fecha_utc",
      "valor",
      "unidad",
      "metodo",
      "origen",
      "validacion_clinica",
      "estado",
      "cantidad",
      "papel",
      "sujeto_contextual",
      "prueba_id",
      "calendario",
      "precision",
      "zona",
      "dataset",
      "fuente",
      "registros_fuente",
      "verificacion_tecnica",
      "version_derivacion",
      "evidencia_json",
    ],
    ...evaluations.map((item) => [
      item.id,
      item.recordedAt,
      item.value,
      item.unit,
      item.method,
      item.evidence?.origin ?? "synthetic",
      item.evidence?.clinicalReview ?? "pending",
      item.value === null ? "not_recorded" : "recorded",
      item.evidence?.metric ?? "legacy_demo_unspecified",
      item.evidence?.role ?? "unknown",
      item.evidence?.subject,
      item.evidence?.assessmentId,
      item.evidence?.calendar ?? "unknown",
      "second",
      "UTC",
      item.evidence?.dataset,
      item.evidence?.source,
      JSON.stringify(item.evidence?.sourceRecordIds ?? []),
      item.evidence?.verification ?? "unverified",
      item.evidence?.derivationVersion ?? projectionVersion,
      JSON.stringify(item.evidence ?? null),
    ]),
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
}
