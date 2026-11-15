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
  return (
    <>
      <div className="page-heading">
        <div>
          <h1 id="contenido" tabIndex={-1}>
            Ejercicio
          </h1>
          <p>
            Registrá las sesiones realizadas y el contexto que quieras revisar.
          </p>
        </div>
        <span className="badge">Programa de demostración</span>
      </div>
      <div className="notice">
        <Dumbbell size={20} aria-hidden="true" />
        <p>
          Estas actividades y duraciones son ficticias. La aplicación no
          prescribe ni modifica programas de ejercicio.
        </p>
      </div>
      <div className="content-grid equal-columns">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Sesiones del programa</h2>
              <p>Marcá una sesión para dejar constancia de su realización.</p>
            </div>
          </div>
          <div className="session-list">
            {mission.sessions.map((session) => {
              const done = journal.completed[session.id] ?? session.completed;
              return (
                <label className="session-row" key={session.id}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(event) =>
                      update({
                        completed: {
                          ...journal.completed,
                          [session.id]: event.target.checked,
                        },
                        prepared: null,
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
                    {done ? "Completada" : "Pendiente"}
                  </span>
                </label>
              );
            })}
            {!mission.sessions.length ? (
              <p className="empty-state">
                Todavía no hay un programa de demostración para este astronauta.
              </p>
            ) : null}
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Cómo fue tu actividad</h2>
              <p>
                Una dificultad o una observación pueden aportar contexto al
                seguimiento.
              </p>
            </div>
          </div>
          <label htmlFor="difficulty">
            Observación del astronauta
            <textarea
              id="difficulty"
              rows={6}
              maxLength={2000}
              placeholder="Por ejemplo: tuve que interrumpir una sesión del escenario demo."
              value={journal.difficulty}
              onChange={(event) =>
                update({ difficulty: event.target.value, prepared: null })
              }
            />
          </label>
          <p className="field-help">
            Se conserva como borrador local mientras escribís. No se envía al
            especialista.
          </p>
        </section>
      </div>
    </>
  );
}
