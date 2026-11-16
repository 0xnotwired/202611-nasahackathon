import type { Evaluation } from "./mission.ts";
import { compareEvaluations } from "./mission.ts";
import { evidenceReason, projectionVersion } from "./evidence.ts";

export const scenarios = {
  recovery: "Decline and recovery",
  ascending: "Rise with oscillations",
  small_variation: "Small variation",
  descending: "Decline with oscillations",
  missing_visits: "Visits without a result",
  method_change: "Change of method",
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

// Mathematical description of the period. It does not define stability or clinical relevance.
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
        "The period contains different methods or units. Review each segment separately.",
    };
  const distinct = new Set(
    valid.map((item) => item.evidence?.assessmentId ?? item.id),
  ).size;
  if (distinct < 3 || !first || !last)
    return {
      label: "Insufficient data",
      slope: null,
      count: valid.length,
      reason:
        "The exploratory reading needs at least three comparable results. This demo rule does not guarantee statistical sufficiency.",
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
      label: "Insufficient data",
      slope: null,
      count: valid.length,
      reason: "Different dates are needed to describe the evolution.",
    };
  const slope =
    valid.reduce(
      (sum, item, index) => sum + (days[index] - meanX) * (item.value! - meanY),
      0,
    ) / denominator;
  // There is no medical threshold. Only a numerical zero is called directionless.
  const label =
    Math.abs(slope) < 1e-10
      ? "No net direction"
      : slope > 0
        ? "Tendencia ascendente"
        : "Tendencia descendente";
  return {
    label,
    slope,
    count: valid.length,
    reason:
      "Direction of a line fitted to the available dates and results. It describes the period; it does not assess clinical relevance or predict results.",
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
      "date_utc",
      "value",
      "unit",
      "method",
      "origin",
      "clinical_review",
      "state",
      "quantity",
      "role",
      "contextual_subject",
      "assessment_id",
      "calendar",
      "precision",
      "zone",
      "dataset",
      "source",
      "source_records",
      "technical_verification",
      "derivation_version",
      "evidence_json",
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
