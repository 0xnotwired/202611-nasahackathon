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
          <span className="badge">Mission follow-up</span>
          <h1 id="content" tabIndex={-1}>
            Hola, {astronaut.callsign}.<br />
            Your mission, in perspective.
          </h1>
          <p>
            What you measure, what you do and what is left to review. A space
            to keep your physical follow-up going.
          </p>
          <Link className="button primary" href={href("evolution")}>
            View my evolution <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <aside className="mission-context">
          <div className="context-icon">
            <CalendarDays size={24} aria-hidden="true" />
          </div>
          <h2>Every record tells a part.</h2>
          <p>
            Gather your assessments and activities to prepare the next
            conversation with the specialist.
          </p>
          <span className="context-status">
            <span className="status-dot" />
            {astronaut.mission} · simulated scenario
          </span>
        </aside>
      </div>
      <dl className="stats-strip">
        <div>
          <dt>Latest aerobic assessment</dt>
          <dd>
            {latest?.value != null
              ? numberFormat.format(latest.value)
              : "Not recorded"}
          </dd>
          <dd className="stat-note">
            {latest
              ? `${latest.unit} · ${formatDate(latest.recordedAt)}`
              : "No assessments available"}
          </dd>
        </div>
        <div>
          <dt>Recorded assessments</dt>
          <dd>{mission.evaluations.length}</dd>
          <dd className="stat-note">Simulated individual history</dd>
        </div>
        <div>
          <dt>Sesiones completadas</dt>
          <dd>
            {completed}
            <span> / {mission.sessions.length}</span>
          </dd>
          <dd className="stat-note">Demonstration program</dd>
        </div>
        <div>
          <dt>Specialist review</dt>
          <dd className="stat-text">
            {journal.prepared ? "Preparada" : "Por preparar"}
          </dd>
          <dd className="stat-note">
            {journal.prepared
              ? "Saved here, not sent"
              : "Gather the context of your follow-up"}
          </dd>
        </div>
      </dl>
      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Your physical evolution</h2>
              <p>Aerobic capacity · simulated assessments</p>
            </div>
            <Link className="text-link" href={href("evolution")}>
              View detail <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <EvaluationChart evaluations={mission.evaluations} />
          <details>
            <summary>View the assessment values</summary>
            <ul className="evaluation-list">
              {mission.evaluations.map((evaluation) => (
                <li key={evaluation.id}>
                  <span>{formatDate(evaluation.recordedAt)}</span>
                  <strong>
                    {evaluation.value === null
                      ? "Not recorded"
                      : `${numberFormat.format(evaluation.value)} ${evaluation.unit}`}
                  </strong>
                </li>
              ))}
            </ul>
            {mission.evaluations.length === 0 ? (
              <p>No records available.</p>
            ) : null}
          </details>
        </section>
        <section className="panel next-session">
          <span className="badge">Your next activity</span>
          <div className="session-symbol">
            <Dumbbell size={28} aria-hidden="true" />
          </div>
          <h2>
            {next
              ? next.label
              : mission.sessions.length
                ? "Todo registrado"
                : "No sessions available"}
          </h2>
          <p>
            {next
              ? `${formatDate(next.scheduledAt)} · ${next.durationMinutes} minutes in the demo scenario.`
              : "Check your activity log and prepare the follow-up."}
          </p>
          <div className="inline-note">
            <Info size={17} aria-hidden="true" />
            <p>
              The program is fictional. It is not an exercise indication or a
              medical recommendation.
            </p>
          </div>
          <Link className="button secondary" href={href("exercise")}>
            {next ? "Log activity" : "View sessions"}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </div>
      <div className="section-heading">
        <h2>Un seguimiento conectado</h2>
        <span>Measurement, activity and context</span>
      </div>
      <div className="journey-grid">
        {[
          {
            view: "evolution",
            icon: ChartNoAxesCombined,
            title: "Understand your evolution",
            description:
              "Check your assessments and which results can be compared.",
            action: "Explorar evaluaciones",
          },
          {
            view: "exercise",
            icon: Dumbbell,
            title: "Log your activity",
            description:
              "Review the sessions and note a difficulty or an observation.",
            action: "View my program",
          },
          {
            view: "followup",
            icon: ClipboardList,
            title: "Prepare a review",
            description:
              "Gather the records and your question in a summary for the specialist.",
            action: "Prepare follow-up",
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
