"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { Orbit } from "lucide-react";
import type { Astronaut } from "../schemas";
import type { MeasurementsView } from "../mission";
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
import { originLabels, type Evidence } from "../evidence";
import { sourceHref, type DataSourceMode } from "../data/source-context";
import { DataSourceControl } from "./data-source-control";
import { useSourceNavigation } from "./source-navigation";

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
  sourceMode,
  origin,
  switchHref,
}: {
  astronauts: Astronaut[];
  astronaut: Astronaut;
  measurements: MeasurementsView;
  mission: DemoMission;
  view: DashboardView;
  context: HistoryContext;
  scenario: Scenario;
  demoControls: boolean;
  asOf: string;
  sourceMode: DataSourceMode;
  origin: Evidence["origin"];
  switchHref: string;
}) {
  const router = useRouter();
  const [localPending, startTransition] = useTransition();
  const sourceNavigation = useSourceNavigation();
  const pending = localPending || sourceNavigation.pending;
  const { journal, update, memoryOnly } = useDemoJournal(
    astronaut.id,
    sourceMode,
  );
  const previousView = useRef(view);
  useEffect(() => {
    if (previousView.current !== view) {
      previousView.current = view;
      document.getElementById("content")?.focus();
    }
  }, [view]);
  const href = (target: string, nextContext = context) => {
    const params = historyQuery(nextContext);
    params.set("view", target);
    params.set("astronaut", astronaut.id);
    if (demoControls) params.set("scenario", scenario);
    return sourceHref("/", sourceMode, params);
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
            href={href("summary")}
            aria-label="Órbita, follow-up"
          >
            <Orbit size={25} aria-hidden="true" />
            <span>Órbita</span>
          </Link>
          <span className="application-name">
            Aerobic capacity follow-up
          </span>
        </div>
        <div className="header-controls">
          <DataSourceControl
            mode={sourceMode}
            label={originLabels[origin]}
            targetHref={switchHref}
          />
          <ThemeControl />
        </div>
      </header>
      <div className="mission-contextbar">
        <label className="crew-control" htmlFor="astronaut-selector">
          <span>Crew member</span>
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
                router.push(sourceHref("/", sourceMode, params), {
                  scroll: false,
                }),
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
          <span>Mission</span>
          <strong>{astronaut.mission}</strong>
        </div>
        <div className="mission-context-item data-cutoff">
          <span>Assessments until</span>
          <strong>
            {latest ? formatTimestamp(latest.recordedAt) : "No records"}
          </strong>
          <small>
            {latest
              ? ageLabel(latest.recordedAt, asOf)
              : "No cutoff date available"}
          </small>
        </div>
      </div>
      <div className="navigation-row" inert={sourceNavigation.pending}>
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
          <Link href={sourceHref("/investigacion", sourceMode)}>
            Research
          </Link>
        </nav>
        <span className="navigation-status" role="status">
          {localPending ? "Actualizando vista…" : ""}
        </span>
      </div>
      <main className="mission-main" aria-busy={pending} inert={pending}>
        {memoryOnly ? (
          <p className="storage-notice" role="status">
            Temporary save: the browser blocked storage. Drafts
            will be lost when you change source or person, or reload.
            Export the review before leaving.
          </p>
        ) : null}
        {view === "summary" || view === "evolution" ? (
          <AerobicOverview
            astronaut={astronaut}
            mission={mission}
            journal={journal}
            update={update}
            measurements={measurements}
            context={context}
            onContext={change}
            href={href}
            expanded={view === "evolution"}
            asOf={asOf}
            memoryOnly={memoryOnly}
          />
        ) : view === "exercise" ? (
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
      <footer className="mission-footer" inert={sourceNavigation.pending}>
        <p>
          {originLabels[origin]} · medical validation pending · follow-up without
          diagnosis
        </p>
        <div className="footer-tools">
          {demoControls ? (
            <details className="demo-configuration">
              <summary>Demonstration settings</summary>
              <label htmlFor="scenario-selector">
                Data scenario
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
                      router.push(sourceHref("/", sourceMode, params), {
                        scroll: false,
                      }),
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
                Illustrative profiles to review the panel&apos;s behavior.
                They are not physiological response models.
              </p>
            </details>
          ) : null}
          <details className="about-system">
            <summary>Provenance and scope</summary>
            <p>
              Órbita is a NASA Space Apps 2026 prototype. The values and
              protocols in the history are fictional. Research provides the
              structure of visits and comparability; the PRE/POST records of
              MR080G do not form an individual monthly history.
            </p>
            <p>
              Summaries and observations are kept in this browser. Synchronization
              or sending to a specialist is not confirmed.
            </p>
            <a
              href="https://ntrs.nasa.gov/citations/20140003748"
              target="_blank"
              rel="noreferrer"
            >
              NASA research reference
            </a>
          </details>
        </div>
      </footer>
    </div>
  );
}
