import { Download } from "lucide-react";
import type { Astronaut } from "../schemas";
import type { DemoMission } from "../mission";
import { formatTimestamp } from "../mission";
import type { HistoryContext } from "../dashboard-state";
import { buildReview } from "../review";
import type { DemoJournal } from "./use-demo-journal";

export function FollowupView({
  astronaut,
  mission,
  journal,
  update,
  context,
}: {
  astronaut: Astronaut;
  mission: DemoMission;
  journal: DemoJournal;
  update: (patch: Partial<DemoJournal>) => void;
  context: HistoryContext;
}) {
  const current = buildReview(astronaut, mission, context, journal);
  const outdated =
    journal.prepared !== null && journal.prepared.text !== current.text;
  const download = () => {
    if (!journal.prepared) return;
    const url = URL.createObjectURL(
      new Blob(
        [
          `Preparado: ${formatTimestamp(journal.prepared.savedAt)}\n\n`,
          journal.prepared.text,
        ],
        { type: "text/plain;charset=utf-8" },
      ),
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
            Revisión
          </h1>
          <p>
            Preparación local del historial seleccionado y las observaciones del
            usuario.
          </p>
        </div>
        <span className="state-label">
          {journal.prepared ? "Copia preparada · no enviada" : "Borrador local"}
        </span>
      </div>
      <div className="content-grid equal-columns">
        <section className="panel">
          <div className="panel-heading">
            <h2>Contexto de la revisión</h2>
            <p>{current.scope}</p>
          </div>
          <label htmlFor="review-question">
            Pregunta para el especialista
            <textarea
              id="review-question"
              name="review-question"
              rows={5}
              maxLength={2000}
              placeholder="Por ejemplo: revisar la comparabilidad de las últimas evaluaciones…"
              value={journal.question}
              onChange={(event) => update({ question: event.target.value })}
            />
          </label>
          <p className="field-help">
            El borrador se conserva en este navegador. Preparar crea una copia
            del período, la referencia y los registros actuales.
          </p>
          <button
            className="button primary"
            type="button"
            onClick={() =>
              update({
                prepared: {
                  text: current.text,
                  savedAt: new Date().toISOString(),
                  scope: current.scope,
                },
              })
            }
          >
            {journal.prepared
              ? "Actualizar copia preparada"
              : "Preparar resumen"}
          </button>
          <p className="save-feedback" role="status">
            {journal.prepared
              ? outdated
                ? "El contexto actual difiere de la copia preparada."
                : "Copia preparada con el contexto actual. No se ha enviado."
              : ""}
          </p>
          {outdated ? (
            <p className="notice">
              La copia conserva sus registros originales. Actualizala para
              incluir los cambios del período, los datos o las observaciones.
            </p>
          ) : null}
        </section>
        <section className="panel review-preview">
          <div className="panel-heading inline-heading">
            <div>
              <h2>{journal.prepared ? "Copia preparada" : "Vista previa"}</h2>
              <p>
                {journal.prepared
                  ? formatTimestamp(journal.prepared.savedAt)
                  : current.scope}
              </p>
            </div>
            {journal.prepared ? (
              <button
                type="button"
                className="button secondary"
                onClick={download}
              >
                <Download size={16} aria-hidden="true" />
                Descargar copia
              </button>
            ) : null}
          </div>
          {journal.prepared ? (
            <p className="snapshot-scope">
              Alcance de la copia:{" "}
              {journal.prepared.scope ??
                "No registrado por la versión anterior"}
            </p>
          ) : null}
          <pre>{journal.prepared?.text ?? current.text}</pre>
        </section>
      </div>
    </>
  );
}
