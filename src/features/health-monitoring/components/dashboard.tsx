"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { Orbit, FlaskConical } from "lucide-react";
import type { Astronaut, MeasurementsResponse } from "../schemas";
import type { DemoMission } from "../mission";
import { formatTimestamp } from "../mission";
import { scenarios, type Scenario } from "../aerobic";
import {
  historyQuery,
  viewNames,
  type DashboardView,
  ageLabel,
  type HistoryContext,
} from "../dashboard-state";
import { ThemeControl } from "./theme-control";
import { useDemoJournal } from "./use-demo-journal";
import { AerobicOverview } from "./aerobic-overview";
import { ExerciseView } from "./exercise-view";
import { FollowupView } from "./followup-view";
import { originLabels } from "../evidence";

export function Dashboard({
  astronauts,
  astronaut,
  measurements,
  mission,
  view,
  context,
  scenario,
  demoControls,
  asOf,
}: {
  astronauts: Astronaut[];
  astronaut: Astronaut;
  measurements: MeasurementsResponse;
  mission: DemoMission;
  view: DashboardView;
  context: HistoryContext;
  scenario: Scenario;
  demoControls: boolean;
  asOf: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { journal, update, memoryOnly } = useDemoJournal(astronaut.id);
  const previousView = useRef(view);
  useEffect(() => {
    if (previousView.current !== view) {
      previousView.current = view;
      document.getElementById("contenido")?.focus();
    }
  }, [view]);
  const href = (target: string, nextContext = context) => {
    const params = historyQuery(nextContext);
    params.set("view", target);
    params.set("astronaut", astronaut.id);
    if (demoControls) params.set("scenario", scenario);
    return `/?${params}`;
  };
  const change = (patch: Partial<HistoryContext>) =>
    startTransition(() =>
      router.replace(href(view, { ...context, ...patch }), { scroll: false }),
    );
  const latest = mission.evaluations
    .toSorted((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt))
    .at(-1);

  return (
    <div className="mission-app">
      <header className="mission-header">
        <div className="header-identity">
          <Link
            className="mission-brand"
            href={href("resumen")}
            aria-label="Órbita, seguimiento"
          >
            <Orbit size={25} aria-hidden="true" />
            <span>Órbita</span>
          </Link>
          <span className="application-name">
            Seguimiento de capacidad aeróbica
          </span>
        </div>
        <div className="header-controls">
          <span className="mode-label">
            <FlaskConical size={15} aria-hidden="true" />
            {
              originLabels[
                mission.evaluations[0]?.evidence?.origin ?? "synthetic"
              ]
            }
          </span>
          <ThemeControl />
        </div>
      </header>
      <div className="mission-contextbar">
        <label className="crew-control" htmlFor="astronaut-selector">
          <span>Tripulante</span>
          <select
            id="astronaut-selector"
            value={astronaut.id}
            onChange={(event) => {
              const params = historyQuery({
                ...context,
                reference: "",
                evaluation: "",
              });
              params.set("view", view);
              params.set("astronaut", event.target.value);
              if (demoControls) params.set("scenario", scenario);
              startTransition(() =>
                router.push(`/?${params}`, { scroll: false }),
              );
            }}
          >
            {astronauts.map((person) => (
              <option key={person.id} value={person.id}>
                {person.callsign} · {person.role}
              </option>
            ))}
          </select>
        </label>
        <div className="mission-context-item">
          <span>Misión</span>
          <strong>{astronaut.mission}</strong>
        </div>
        <div className="mission-context-item data-cutoff">
          <span>Evaluaciones hasta</span>
          <strong>
            {latest ? formatTimestamp(latest.recordedAt) : "Sin registros"}
          </strong>
          <small>
            {latest
              ? ageLabel(latest.recordedAt, asOf)
              : "Sin fecha de corte disponible"}
          </small>
        </div>
      </div>
      <div className="navigation-row">
        <nav className="mission-navigation" aria-label="Principal">
          {Object.entries(viewNames).map(([id, label]) => (
            <Link
              key={id}
              href={href(id)}
              aria-current={view === id ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <Link href="/investigacion">Investigación</Link>
        </nav>
        <span className="navigation-status" role="status">
          {pending ? "Actualizando vista…" : ""}
        </span>
      </div>
      <main className="mission-main" aria-busy={pending}>
        {memoryOnly ? (
          <p className="storage-notice" role="status">
            Guardado temporal: el navegador bloqueó el almacenamiento. Exportá
            la revisión antes de salir.
          </p>
        ) : null}
        {view === "resumen" || view === "evolucion" ? (
          <AerobicOverview
            astronaut={astronaut}
            mission={mission}
            journal={journal}
            update={update}
            measurements={measurements}
            context={context}
            onContext={change}
            href={href}
            expanded={view === "evolucion"}
            asOf={asOf}
            memoryOnly={memoryOnly}
          />
        ) : view === "ejercicio" ? (
          <ExerciseView mission={mission} journal={journal} update={update} />
        ) : (
          <FollowupView
            astronaut={astronaut}
            mission={mission}
            journal={journal}
            update={update}
            context={context}
          />
        )}
      </main>
      <footer className="mission-footer">
        <p>
          {
            originLabels[
              mission.evaluations[0]?.evidence?.origin ?? "synthetic"
            ]
          }{" "}
          · validación médica pendiente · seguimiento sin diagnóstico
        </p>
        <div className="footer-tools">
          {demoControls ? (
            <details className="demo-configuration">
              <summary>Configuración de demostración</summary>
              <label htmlFor="scenario-selector">
                Escenario de datos
                <select
                  id="scenario-selector"
                  value={scenario}
                  onChange={(event) => {
                    const params = historyQuery({
                      ...context,
                      reference: "",
                      evaluation: "",
                    });
                    params.set("view", view);
                    params.set("astronaut", astronaut.id);
                    params.set("scenario", event.target.value);
                    startTransition(() =>
                      router.push(`/?${params}`, { scroll: false }),
                    );
                  }}
                >
                  {Object.entries(scenarios).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <p>
                Perfiles ilustrativos para revisar el comportamiento del panel.
                No son modelos de respuesta fisiológica.
              </p>
            </details>
          ) : null}
          <details className="about-system">
            <summary>Procedencia y alcance</summary>
            <p>
              Órbita es un prototipo de NASA Space Apps 2026. Los valores y
              protocolos del historial son ficticios. Research aporta la
              estructura de visitas y comparabilidad; los registros PRE/POST de
              MR080G no forman un historial mensual individual.
            </p>
            <p>
              Los resúmenes y observaciones se conservan en este navegador. No
              se confirma sincronización ni envío a un especialista.
            </p>
            <a
              href="https://ntrs.nasa.gov/citations/20140003748"
              target="_blank"
              rel="noreferrer"
            >
              Referencia de investigación de NASA
            </a>
          </details>
        </div>
      </footer>
    </div>
  );
}
