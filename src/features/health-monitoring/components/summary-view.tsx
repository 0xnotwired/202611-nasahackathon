import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  Dumbbell,
  Info,
} from "lucide-react";
import type { Astronaut } from "../schemas";
import type { DemoMission } from "../mission";
import { formatDate, numberFormat } from "../mission";
import { EvaluationChart } from "./evaluation-chart";
import type { DemoJournal } from "./use-demo-journal";

export function SummaryView({
  astronaut,
  mission,
  journal,
  href,
}: {
  astronaut: Astronaut;
  mission: DemoMission;
  journal: DemoJournal;
  href: (view: string) => string;
}) {
  const latest = mission.evaluations.at(-1);
  const completed = mission.sessions.filter(
    (session) => journal.completed[session.id] ?? session.completed,
  ).length;
  const next = mission.sessions.find(
    (session) => !(journal.completed[session.id] ?? session.completed),
  );
  return (
    <>
      <div className="dashboard-intro">
        <div>
          <span className="badge">Seguimiento de la misión</span>
          <h1 id="contenido" tabIndex={-1}>
            Hola, {astronaut.callsign}.<br />
            Tu misión, en perspectiva.
          </h1>
          <p>
            Lo que medís, lo que hacés y lo que queda por revisar. Un espacio
            para dar continuidad a tu seguimiento físico.
          </p>
          <Link className="button primary" href={href("evolucion")}>
            Ver mi evolución <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <aside className="mission-context">
          <div className="context-icon">
            <CalendarDays size={24} aria-hidden="true" />
          </div>
          <h2>Cada registro cuenta una parte.</h2>
          <p>
            Reuní tus evaluaciones y actividades para preparar la próxima
            conversación con el especialista.
          </p>
          <span className="context-status">
            <span className="status-dot" />
            {astronaut.mission} · escenario simulado
          </span>
        </aside>
      </div>
      <dl className="stats-strip">
        <div>
          <dt>Última evaluación aeróbica</dt>
          <dd>
            {latest?.value != null
              ? numberFormat.format(latest.value)
              : "Sin dato"}
          </dd>
          <dd className="stat-note">
            {latest
              ? `${latest.unit} · ${formatDate(latest.recordedAt)}`
              : "Sin evaluaciones disponibles"}
          </dd>
        </div>
        <div>
          <dt>Evaluaciones registradas</dt>
          <dd>{mission.evaluations.length}</dd>
          <dd className="stat-note">Historial individual simulado</dd>
        </div>
        <div>
          <dt>Sesiones completadas</dt>
          <dd>
            {completed}
            <span> / {mission.sessions.length}</span>
          </dd>
          <dd className="stat-note">Programa de demostración</dd>
        </div>
        <div>
          <dt>Revisión del especialista</dt>
          <dd className="stat-text">
            {journal.prepared ? "Preparada" : "Por preparar"}
          </dd>
          <dd className="stat-note">
            {journal.prepared
              ? "Guardada aquí, no enviada"
              : "Reuní el contexto de tu seguimiento"}
          </dd>
        </div>
      </dl>
      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Tu evolución física</h2>
              <p>Capacidad aeróbica · evaluaciones simuladas</p>
            </div>
            <Link className="text-link" href={href("evolucion")}>
              Ver detalle <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <EvaluationChart evaluations={mission.evaluations} />
          <details>
            <summary>Ver valores de las evaluaciones</summary>
            <ul className="evaluation-list">
              {mission.evaluations.map((evaluation) => (
                <li key={evaluation.id}>
                  <span>{formatDate(evaluation.recordedAt)}</span>
                  <strong>
                    {evaluation.value === null
                      ? "Sin dato"
                      : `${numberFormat.format(evaluation.value)} ${evaluation.unit}`}
                  </strong>
                </li>
              ))}
            </ul>
            {mission.evaluations.length === 0 ? (
              <p>Sin registros disponibles.</p>
            ) : null}
          </details>
        </section>
        <section className="panel next-session">
          <span className="badge">Tu próxima actividad</span>
          <div className="session-symbol">
            <Dumbbell size={28} aria-hidden="true" />
          </div>
          <h2>
            {next
              ? next.label
              : mission.sessions.length
                ? "Todo registrado"
                : "Sin sesiones disponibles"}
          </h2>
          <p>
            {next
              ? `${formatDate(next.scheduledAt)} · ${next.durationMinutes} minutos en el escenario demo.`
              : "Consultá tu registro de actividad y prepará el seguimiento."}
          </p>
          <div className="inline-note">
            <Info size={17} aria-hidden="true" />
            <p>
              El programa es ficticio. No es una indicación de ejercicio ni una
              recomendación médica.
            </p>
          </div>
          <Link className="button secondary" href={href("ejercicio")}>
            {next ? "Registrar actividad" : "Ver sesiones"}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </div>
      <div className="section-heading">
        <h2>Un seguimiento conectado</h2>
        <span>Medición, actividad y contexto</span>
      </div>
      <div className="journey-grid">
        {[
          {
            view: "evolucion",
            icon: ChartNoAxesCombined,
            title: "Entendé tu evolución",
            description:
              "Consultá tus evaluaciones y qué resultados se pueden comparar.",
            action: "Explorar evaluaciones",
          },
          {
            view: "ejercicio",
            icon: Dumbbell,
            title: "Registrá tu actividad",
            description:
              "Revisá las sesiones y dejá constancia de una dificultad o una observación.",
            action: "Ver mi programa",
          },
          {
            view: "seguimiento",
            icon: ClipboardList,
            title: "Prepará una revisión",
            description:
              "Reuní los registros y tu pregunta en un resumen para el especialista.",
            action: "Preparar seguimiento",
          },
        ].map((item) => (
          <section className="journey-card" key={item.view}>
            <item.icon size={22} aria-hidden="true" />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <Link className="text-link" href={href(item.view)}>
              {item.action}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </section>
        ))}
      </div>
    </>
  );
}
