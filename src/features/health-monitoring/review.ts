import type { DemoMission } from "./mission.ts";
import { formatDate, numberFormat, compareEvaluations } from "./mission.ts";
import type { HistoryContext } from "./dashboard-state.ts";
import { periodEvaluations } from "./aerobic.ts";
import type { DemoJournal } from "./components/use-demo-journal.ts";

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
  const comparison = compareEvaluations(reference, evaluations.at(-1));
  const scope = evaluations.length
    ? `${formatDate(evaluations[0].recordedAt)} — ${formatDate(evaluations.at(-1)!.recordedAt)} · ${evaluations.length} visitas`
    : "Sin evaluaciones";
  const completed = mission.sessions.filter(
    (item) => journal.completed[item.id] ?? item.completed,
  );
  const text = [
    `Órbita · Revisión de ${astronaut.callsign} · ${astronaut.mission}`,
    "Copia preparada localmente. No enviada. Datos ficticios; validación médica pendiente.",
    `Período: ${scope}`,
    `Referencia: ${reference ? `${formatDate(reference.recordedAt)} · ${reference.method}` : "No disponible"}`,
    `Evaluación seleccionada: ${context.evaluation || "No disponible"}`,
    "",
    "Evaluaciones del período:",
    ...evaluations.map(
      (item) =>
        `${item.id} · ${item.recordedAt} · ${item.value === null ? "Sin resultado" : `${numberFormat.format(item.value)} ${item.unit}`} · ${item.method}`,
    ),
    `Cambio vs. referencia: ${comparison.difference === null ? comparison.reason : `${numberFormat.format(comparison.difference)} ${evaluations.at(-1)?.unit} · descriptivo, sin relevancia clínica evaluada`}`,
    "",
    "Actividad (registro independiente del período de evaluaciones):",
    ...mission.sessions.map(
      (item) =>
        `${item.scheduledAt} · ${item.label} · ${item.durationMinutes} min · ${completed.some((session) => session.id === item.id) ? "Completada" : "Pendiente"}`,
    ),
    `Observación de actividad: ${journal.difficulty || "Sin observación registrada"}`,
    `Observación de evaluación: ${journal.observation ? `${journal.observation.text} · visita ${journal.observation.evaluationId} · guardada ${journal.observation.recordedAt}` : "Sin observación registrada"}`,
    `Pregunta para revisión: ${journal.question || "Sin pregunta registrada"}`,
  ].join("\n");
  return { text, scope };
}
