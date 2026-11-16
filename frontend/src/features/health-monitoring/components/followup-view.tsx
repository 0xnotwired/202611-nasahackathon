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
          <h1 id="content" tabIndex={-1}>
            Review
          </h1>
          <p>
            Local preparation of the selected history and the user&apos;s
            observations.
          </p>
        </div>
        <span className="state-label">
          {journal.prepared ? "Copy prepared · not sent" : "Local draft"}
        </span>
      </div>
      <div className="content-grid equal-columns">
        <section className="panel">
          <div className="panel-heading">
            <h2>Review context</h2>
            <p>{current.scope}</p>
          </div>
          <label htmlFor="review-question">
            Question for the specialist
            <textarea
              id="review-question"
              name="review-question"
              rows={5}
              maxLength={2000}
              placeholder="For example: review the comparability of the latest assessments…"
              value={journal.question}
              onChange={(event) => update({ question: event.target.value })}
            />
          </label>
          <p className="field-help">
            The draft is kept in this browser. Prepare creates a copy
            of the current period, reference and records.
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
              ? "Update prepared copy"
              : "Prepare summary"}
          </button>
          <p className="save-feedback" role="status">
            {journal.prepared
              ? outdated
                ? "The current context differs from the prepared copy."
                : "Copy prepared with the current context. It has not been sent."
              : ""}
          </p>
          {outdated ? (
            <p className="notice">
              The copy keeps its original records. Update it to
              include the changes in the period, the data or the observations.
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
                Download copy
              </button>
            ) : null}
          </div>
          {journal.prepared ? (
            <p className="snapshot-scope">
              Scope of the copy:{" "}
              {journal.prepared.scope ??
                "Not recorded by the previous version"}
            </p>
          ) : null}
          <pre>{journal.prepared?.text ?? current.text}</pre>
        </section>
      </div>
    </>
  );
}
