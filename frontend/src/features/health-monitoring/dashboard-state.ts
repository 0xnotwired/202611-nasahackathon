import type { Evaluation } from "./mission.ts";
import { periodEvaluations } from "./aerobic.ts";

export type HistoryPeriod = 0 | 3 | 6 | 12;
export type ScaleMode = "history" | "auto";
export type HistoryContext = {
  period: HistoryPeriod;
  reference: string;
  evaluation: string;
  scale: ScaleMode;
  group?: string;
};

export function resolveHistoryContext(
  params: Record<string, string | string[] | undefined>,
  evaluations: Evaluation[],
): HistoryContext {
  const period: HistoryPeriod =
    params.period === "0"
      ? 0
      : params.period === "3"
        ? 3
        : params.period === "6"
          ? 6
          : 12;
  const visible = periodEvaluations(evaluations, period);
  return {
    period,
    reference:
      typeof params.reference === "string" &&
      evaluations.some((item) => item.id === params.reference)
        ? params.reference
        : (evaluations[0]?.id ?? ""),
    evaluation:
      typeof params.evaluation === "string" &&
      visible.some((item) => item.id === params.evaluation)
        ? params.evaluation
        : (visible.at(-1)?.id ?? ""),
    scale: params.scale === "auto" ? "auto" : "history",
    ...(typeof params.group === "string" &&
    evaluations.some((item) => item.method === params.group)
      ? { group: params.group }
      : {}),
  };
}

export function historyQuery(context: HistoryContext) {
  const params = new URLSearchParams({
    period: String(context.period),
    scale: context.scale,
  });
  if (context.reference) params.set("reference", context.reference);
  if (context.evaluation) params.set("evaluation", context.evaluation);
  if (context.group) params.set("group", context.group);
  return params;
}

export function scaleDomain(evaluations: Evaluation[], unit: string) {
  const values = evaluations
    .filter(
      (item) =>
        item.unit === unit &&
        item.value !== null &&
        Number.isFinite(item.value),
    )
    .map((item) => item.value!);
  if (!values.length) return null;
  const low = Math.min(...values);
  const high = Math.max(...values);
  const padding = Math.max(1, (high - low) * 0.12);
  return { min: Math.floor(low - padding), max: Math.ceil(high + padding) };
}

export function latestValid(evaluations: Evaluation[]) {
  return evaluations
    .filter((item) => item.value !== null && Number.isFinite(item.value))
    .toSorted((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt))
    .at(-1);
}

export function ageLabel(recordedAt: string, asOf: string) {
  const elapsed = Date.parse(asOf) - Date.parse(recordedAt);
  if (!Number.isFinite(elapsed)) return "Age not available";
  if (elapsed < 0) return "Date after this query";
  const days = Math.floor(elapsed / 86_400_000);
  return days === 0
    ? "Recorded in the last 24 h"
    : `${days} ${days === 1 ? "day" : "days"} ago`;
}

export const viewNames = {
  summary: "Follow-up",
  evolution: "Assessments",
  exercise: "Activity",
  followup: "Review",
} as const;
export type DashboardView = keyof typeof viewNames;
