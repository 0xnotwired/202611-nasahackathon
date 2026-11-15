import { Check, ClipboardList, Download } from "lucide-react";
import type { Astronaut } from "../schemas";
import type { DemoMission } from "../mission";
import { compareEvaluations, formatDate, numberFormat } from "../mission";
import type { DemoJournal } from "./use-demo-journal";

export function FollowupView({
  astronaut,
  mission,
  journal,
  update,
}: {
  astronaut: Astronaut;
  mission: DemoMission;
  journal: DemoJournal;
  update: (patch: Partial<DemoJournal>) => void;
}) {
  const completed = mission.sessions.filter(
    (session) => journal.completed[session.id] ?? session.completed,
  ).length;
  const comparison = compareEvaluations(
    mission.evaluations.at(-2),
    mission.evaluations.at(-1),
  );
  const text = [
    `Órbita · Revisión simulada de ${astronaut.callsign}`,
    "Estado: preparado, no enviado. Datos ficticios, sin validación clínica.",
    "",
    "Evaluaciones:",
    ...mission.evaluations.map(
      (evaluation) =>
        `${formatDate(evaluation.recordedAt)}: ${evaluation.value === null ? "Sin dato" : `${numberFormat.format(evaluation.value)} ${evaluation.unit}`} · ${evaluation.method}`,
    ),
    `Comparación más reciente: ${comparison.difference === null ? comparison.reason : `${numberFormat.format(comparison.difference)} · cambio descriptivo`}`,
    "",
    `Sesiones completadas: ${completed}/${mission.sessions.length}`,
    `Observación: ${journal.difficulty || "Sin observación registrada."}`,
    `Pregunta para el especialista: ${journal.question || "Sin pregunta registrada."}`,
  ].join("\n");

  const download = () => {
    if (!journal.prepared) return;
    const url = URL.createObjectURL(
      new Blob([journal.prepared.text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `orbita-revision-${astronaut.id}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <h1 id="contenido" tabIndex={-1}>
            Seguimiento
          </h1>
          <p>Reuní tus registros y prepará el contexto para una revisión.</p>
        </div>
        <span className="badge">
          {journal.prepared ? "Preparado, no enviado" : "Borrador local"}
        </span>
      </div>
      <div className="content-grid equal-columns">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Tu pregunta para el especialista</h2>
              <p>
                ¿Qué te gustaría revisar sobre tus evaluaciones o tu actividad?
              </p>
            </div>
          </div>
          <label htmlFor="review-question">
            Pregunta o contexto de la revisión
            <textarea
              id="review-question"
              rows={5}
              maxLength={2000}
              placeholder="Escribí una pregunta para acompañar tu resumen."
              value={journal.question}
              onChange={(event) =>
                update({ question: event.target.value, prepared: null })
              }
            />
          </label>
          <p className="field-help">
            El borrador se conserva en este navegador. Todavía no hay un
            servicio de envío.
          </p>
          <button
            className="button primary"
            type="button"
            onClick={() =>
              update({ prepared: { text, savedAt: new Date().toISOString() } })
            }
          >
            <ClipboardList size={17} aria-hidden="true" />
            Preparar resumen
          </button>
          {journal.prepared ? (
            <p className="saved-status" role="status">
              <Check size={17} aria-hidden="true" />
              Resumen preparado. No se ha enviado.
            </p>
          ) : null}
        </section>
        <section className="panel review-preview">
          <div className="panel-heading">
            <div>
              <h2>
                {journal.prepared
                  ? "Resumen preparado"
                  : "Vista previa del resumen"}
              </h2>
              <p>
                {astronaut.callsign} · {astronaut.mission}
              </p>
            </div>
          </div>
          <pre>{journal.prepared?.text ?? text}</pre>
          {journal.prepared ? (
            <>
              <p className="field-help">
                Guardado el {formatDate(journal.prepared.savedAt)} en este
                navegador.
              </p>
              <button
                className="button secondary"
                onClick={download}
                type="button"
              >
                <Download size={17} aria-hidden="true" />
                Descargar resumen
              </button>
            </>
          ) : (
            <p className="field-help">
              Preparar el resumen guarda una copia del contexto actual.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
