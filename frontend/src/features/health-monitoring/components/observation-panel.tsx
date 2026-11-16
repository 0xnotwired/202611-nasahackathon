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
  const draft = journal.observationDraft?.text ?? "";
  const draftEvaluationId = journal.observationDraft?.evaluationId ?? null;
  const target =
    evaluations.find((item) => item.id === draftEvaluationId) ?? evaluation;
  const [saved, setSaved] = useState(false);
  const previous = evaluations.find(
    (item) => item.id === journal.observation?.evaluationId,
  );
  return (
    <section className="observation-panel panel">
      <div className="panel-heading">
        <h2>User observation</h2>
        <p>
          {target
            ? `Linked to the assessment of ${formatDate(target.recordedAt)}.`
            : "Select an assessment to record context."}
        </p>
      </div>
      {journal.observation ? (
        <div className="saved-observation">
          <strong>Latest saved observation</strong>
          <p>{journal.observation.text}</p>
          <small>
            {previous
              ? `Assessment: ${formatDate(previous.recordedAt)}`
              : `Assessment: ${journal.observation.evaluationId}`}{" "}
            · {formatTimestamp(journal.observation.recordedAt)}
          </small>
        </div>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!target || !draft.trim()) return;
          update({
            observationDraft: null,
            observation: {
              text: draft.trim(),
              evaluationId: target.id,
              recordedAt: new Date().toISOString(),
            },
          });
          setSaved(true);
        }}
      >
        <label htmlFor="evaluation-observation">
          New observation
          <textarea
            id="evaluation-observation"
            name="evaluation-observation"
            rows={3}
            maxLength={2000}
            placeholder="For example: conditions during the assessment…"
            value={draft}
            onChange={(event) => {
              update({
                observationDraft: event.target.value
                  ? {
                      text: event.target.value,
                      evaluationId: draftEvaluationId ?? evaluation?.id ?? "",
                    }
                  : null,
              });
              setSaved(false);
            }}
            disabled={!evaluation}
          />
        </label>
        <p className="field-help">
          Saving replaces the latest local observation. The draft is kept
          in this browser, separated by source and person.
        </p>
        <button
          type="submit"
          className="button secondary"
          disabled={!evaluation || !draft.trim()}
        >
          Save observation
        </button>
        <p className="save-feedback" role="status">
          {saved
            ? memoryOnly
              ? "Observation kept during this visit."
              : "Observation saved in this browser."
            : ""}
        </p>
      </form>
    </section>
  );
}
