import type { DemoMission } from "./mission.ts";
import { formatDate, numberFormat, compareEvaluations } from "./mission.ts";
import type { HistoryContext } from "./dashboard-state.ts";
import { periodEvaluations } from "./aerobic.ts";
import type { DemoJournal } from "./components/use-demo-journal.ts";
import { historyCsv } from "./aerobic.ts";
import { projectionVersion } from "./evidence.ts";

export function buildReview(
  astronaut: { id: string; callsign: string; mission: string },
  mission: DemoMission,
  context: HistoryContext,
  journal: DemoJournal,
) {
  const evaluations = periodEvaluations(mission.evaluations, context.period);
  const reference = mission.evaluations.find(
    (item) => item.id === context.reference,
  );
  const group = evaluations.filter(
    (item) => !context.group || item.method === context.group,
  );
  const comparison = compareEvaluations(reference, group.at(-1));
  const scope = evaluations.length
    ? `${formatDate(evaluations[0].recordedAt)} — ${formatDate(evaluations.at(-1)!.recordedAt)} · ${evaluations.length} visits`
    : "No assessments";
  const completed = mission.sessions.filter((item) =>
    mission.presentation?.transport === "api"
      ? item.completed
      : (journal.completed[item.id] ?? item.completed),
  );
  const text = [
    `Órbita · Review of ${astronaut.callsign} · ${astronaut.mission}`,
    "Copy prepared locally. Not sent. Fictional data; medical validation pending.",
    `Projection: ${mission.presentation?.version ?? projectionVersion} · transport: ${mission.presentation?.transport ?? "local demo"}`,
    `Calculation group: ${context.group ?? "All protocols (no mixing for inference)"} · ${group.length} visits included · ${evaluations.length - group.length} outside the group`,
    "Performance criterion: not configured. It does not determine fitness or poor aerobic performance.",
    `Period: ${scope}`,
    `Reference: ${reference ? `${formatDate(reference.recordedAt)} · ${reference.method}` : "Not available"}`,
    `Selected assessment: ${context.evaluation || "Not available"}`,
    "",
    "Assessments of the period:",
    ...evaluations.map(
      (item) =>
        `${item.id} · ${item.recordedAt} · ${item.value === null ? "No result" : `${item.value} ${item.unit}`} · ${item.method}`,
    ),
    `Change vs. reference: ${comparison.difference === null ? comparison.reason : `${numberFormat.format(comparison.difference)} ${group.at(-1)?.unit} · descriptive, clinical relevance not assessed`}`,
    "",
    "Activity (a record independent of the assessment period):",
    ...mission.sessions.map(
      (item) =>
        `${item.scheduledAt} · ${item.label} · ${item.durationMinutes} min · ${completed.some((session) => session.id === item.id) ? "Completed" : "Pending"}`,
    ),
    `Activity observation: ${journal.difficulty || "No observation recorded"}`,
    `Assessment observation: ${journal.observation ? `${journal.observation.text} · visit ${journal.observation.evaluationId} · saved ${journal.observation.recordedAt}` : "No observation recorded"}`,
    `Unconfirmed observation draft: ${journal.observationDraft ? `${journal.observationDraft.text} · visit ${journal.observationDraft.evaluationId}` : "No draft"}`,
    `Question for review: ${journal.question || "No question recorded"}`,
    "",
    "Data and provenance annex (unrounded values):",
    historyCsv(evaluations),
  ].join("\n");
  return { text, scope };
}
