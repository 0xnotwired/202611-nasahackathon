"use client";
import { useState } from "react";
import type { Evaluation } from "../mission";
import { formatDate, formatTimestamp } from "../mission";
import type { DemoJournal } from "./use-demo-journal";

export function ObservationPanel({
  evaluation,
  evaluations,
  journal,
  update,
  memoryOnly = false,
}: {
  evaluation?: Evaluation;
  evaluations: Evaluation[];
  journal: DemoJournal;
  update: (patch: Partial<DemoJournal>) => void;
  memoryOnly?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [draftEvaluationId, setDraftEvaluationId] = useState<string | null>(
    null,
  );
  const target =
    evaluations.find((item) => item.id === draftEvaluationId) ?? evaluation;
  const [saved, setSaved] = useState(false);
  const previous = evaluations.find(
    (item) => item.id === journal.observation?.evaluationId,
  );
  return (
    <section className="observation-panel panel">
      <div className="panel-heading">
        <h2>Observación del usuario</h2>
        <p>
          {target
            ? `Vinculada a la evaluación del ${formatDate(target.recordedAt)}.`
            : "Seleccioná una evaluación para registrar contexto."}
        </p>
      </div>
      {journal.observation ? (
        <div className="saved-observation">
          <strong>Última observación guardada</strong>
          <p>{journal.observation.text}</p>
          <small>
            {previous
              ? `Evaluación: ${formatDate(previous.recordedAt)}`
              : `Evaluación: ${journal.observation.evaluationId}`}{" "}
            · {formatTimestamp(journal.observation.recordedAt)}
          </small>
        </div>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!target || !draft.trim()) return;
          update({
            observation: {
              text: draft.trim(),
              evaluationId: target.id,
              recordedAt: new Date().toISOString(),
            },
          });
          setDraft("");
          setDraftEvaluationId(null);
          setSaved(true);
        }}
      >
        <label htmlFor="evaluation-observation">
          Nueva observación
          <textarea
            id="evaluation-observation"
            name="evaluation-observation"
            rows={3}
            maxLength={2000}
            placeholder="Por ejemplo: condiciones durante la evaluación…"
            value={draft}
            onChange={(event) => {
              if (!draft && event.target.value)
                setDraftEvaluationId(evaluation?.id ?? null);
              if (!event.target.value) setDraftEvaluationId(null);
              setDraft(event.target.value);
              setSaved(false);
            }}
            disabled={!evaluation}
          />
        </label>
        <p className="field-help">
          Guardar reemplaza la última observación local. El texto sin guardar
          permanece mientras esta vista esté abierta.
        </p>
        <button
          type="submit"
          className="button secondary"
          disabled={!evaluation || !draft.trim()}
        >
          Guardar observación
        </button>
        <p className="save-feedback" role="status">
          {saved
            ? memoryOnly
              ? "Observación conservada durante esta visita."
              : "Observación guardada en este navegador."
            : ""}
        </p>
      </form>
    </section>
  );
}
