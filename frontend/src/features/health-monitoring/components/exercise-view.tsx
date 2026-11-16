import { Check, Clock3, Dumbbell } from "lucide-react";
import type { DemoMission } from "../mission";
import { formatDate } from "../mission";
import type { DemoJournal } from "./use-demo-journal";

export function ExerciseView({
  mission,
  journal,
  update,
}: {
  mission: DemoMission;
  journal: DemoJournal;
  update: (patch: Partial<DemoJournal>) => void;
}) {
  const readOnly = mission.presentation?.transport === "api";
  return (
    <>
      <div className="page-heading">
        <div>
          <h1 id="content" tabIndex={-1}>
            Activity
          </h1>
          <p>Record of sessions and activity observations.</p>
        </div>
        <span className="badge">
          {readOnly
            ? "Synthetic program from the backend · read-only"
            : "Demonstration program"}
        </span>
      </div>
      <div className="notice">
        <Dumbbell size={20} aria-hidden="true" />
        <p>
          These activities and durations are fictional. The application does not
          prescribe or modify exercise programs.
        </p>
      </div>
      <div className="content-grid equal-columns">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Session record</h2>
              <p>
                Record independent of the period selected in assessments.
              </p>
            </div>
          </div>
          <div className="session-list">
            {mission.sessions.map((session) => {
              const done = readOnly
                ? session.completed
                : (journal.completed[session.id] ?? session.completed);
              return (
                <label className="session-row" key={session.id}>
                  <input
                    type="checkbox"
                    checked={done}
                    disabled={readOnly}
                    onChange={(event) =>
                      update({
                        completed: {
                          ...journal.completed,
                          [session.id]: event.target.checked,
                        },
                      })
                    }
                  />
                  <span className="session-content">
                    <strong>{session.label}</strong>
                    <span>
                      {formatDate(session.scheduledAt)} ·{" "}
                      {session.durationMinutes} min
                    </span>
                  </span>
                  <span className={`session-state ${done ? "complete" : ""}`}>
                    {done ? (
                      <Check size={15} aria-hidden="true" />
                    ) : (
                      <Clock3 size={15} aria-hidden="true" />
                    )}
                    {done ? "Completed" : "Pending"}
                  </span>
                </label>
              );
            })}
            {!mission.sessions.length ? (
              <p className="empty-state">
                There is no demonstration program for this astronaut yet.
              </p>
            ) : null}
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Activity observation</h2>
              <p>
                A difficulty or an observation can add context to the
                follow-up.
              </p>
            </div>
          </div>
          <label htmlFor="difficulty">
            Astronaut observation
            <textarea
              id="difficulty"
              name="difficulty"
              rows={6}
              maxLength={2000}
              placeholder="For example: an interrupted session and the conditions observed…"
              value={journal.difficulty}
              onChange={(event) => update({ difficulty: event.target.value })}
            />
          </label>
          <p className="field-help">
            It is kept as a local draft while you type. It is not sent to the
            specialist.
          </p>
        </section>
      </div>
    </>
  );
}
