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
    ? `${formatDate(evaluations[0].recordedAt)} — ${formatDate(evaluations.at(-1)!.recordedAt)} · ${evaluations.length} visitas`
    : "Sin evaluaciones";
  const completed = mission.sessions.filter((item) =>
    mission.presentation?.transport === "api"
      ? item.completed
      : (journal.completed[item.id] ?? item.completed),
  );
  const text = [
    `Órbita · Revisión de ${astronaut.callsign} · ${astronaut.mission}`,
    "Copia preparada localmente. No enviada. Datos ficticios; validación médica pendiente.",
    `Proyección: ${mission.presentation?.version ?? projectionVersion} · transporte: ${mission.presentation?.transport ?? "demo local"}`,
    `Grupo de cálculo: ${context.group ?? "Todos los protocolos (sin mezcla para inferencia)"} · ${group.length} visitas incluidas · ${evaluations.length - group.length} fuera del grupo`,
    "Criterio de desempeño: no configurado. No determina aptitud ni mal desempeño aeróbico.",
    `Período: ${scope}`,
    `Referencia: ${reference ? `${formatDate(reference.recordedAt)} · ${reference.method}` : "No disponible"}`,
    `Evaluación seleccionada: ${context.evaluation || "No disponible"}`,
    "",
    "Evaluaciones del período:",
    ...evaluations.map(
      (item) =>
        `${item.id} · ${item.recordedAt} · ${item.value === null ? "Sin resultado" : `${item.value} ${item.unit}`} · ${item.method}`,
    ),
    `Cambio vs. referencia: ${comparison.difference === null ? comparison.reason : `${numberFormat.format(comparison.difference)} ${group.at(-1)?.unit} · descriptivo, sin relevancia clínica evaluada`}`,
    "",
    "Actividad (registro independiente del período de evaluaciones):",
    ...mission.sessions.map(
      (item) =>
        `${item.scheduledAt} · ${item.label} · ${item.durationMinutes} min · ${completed.some((session) => session.id === item.id) ? "Completada" : "Pendiente"}`,
    ),
    `Observación de actividad: ${journal.difficulty || "Sin observación registrada"}`,
    `Observación de evaluación: ${journal.observation ? `${journal.observation.text} · visita ${journal.observation.evaluationId} · guardada ${journal.observation.recordedAt}` : "Sin observación registrada"}`,
    `Borrador de observación sin confirmar: ${journal.observationDraft ? `${journal.observationDraft.text} · visita ${journal.observationDraft.evaluationId}` : "Sin borrador"}`,
    `Pregunta para revisión: ${journal.question || "Sin pregunta registrada"}`,
    "",
    "Anexo de datos y procedencia (valores sin redondeo):",
    historyCsv(evaluations),
  ].join("\n");
  return { text, scope };
}
