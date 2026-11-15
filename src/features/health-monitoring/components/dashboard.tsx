"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Info,
  LayoutDashboard,
  Orbit,
  ShieldCheck,
} from "lucide-react";
import type { Astronaut, MeasurementsResponse } from "../schemas";
import type { DemoMission } from "../mission";
import { ThemeControl } from "./theme-control";
import { useDemoJournal } from "./use-demo-journal";
import { SummaryView } from "./summary-view";
import { EvolutionView } from "./evolution-view";
import { ExerciseView } from "./exercise-view";
import { FollowupView } from "./followup-view";

export const viewNames = {
  resumen: "Resumen",
  evolucion: "Evolución física",
  ejercicio: "Ejercicio",
  seguimiento: "Seguimiento",
} as const;
export type DashboardView = keyof typeof viewNames;
const navigation = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "evolucion", label: "Evolución física", icon: ChartNoAxesCombined },
  { id: "ejercicio", label: "Ejercicio", icon: Dumbbell },
  { id: "seguimiento", label: "Seguimiento", icon: ClipboardList },
] as const;

export function Dashboard({
  astronauts,
  astronaut,
  measurements,
  mission,
  view,
  reference,
}: {
  astronauts: Astronaut[];
  astronaut: Astronaut;
  measurements: MeasurementsResponse;
  mission: DemoMission;
  view: DashboardView;
  reference: string;
}) {
  const router = useRouter();
  const { journal, update, memoryOnly } = useDemoJournal(astronaut.id);
  const initial = useRef(true);
  useEffect(() => {
    document.title = `${viewNames[view]} | Órbita`;
    if (initial.current) {
      initial.current = false;
      return;
    }
    document.getElementById("contenido")?.focus();
  }, [view]);

  const href = (target: string, id = astronaut.id, evaluation = reference) => {
    const params = new URLSearchParams({ view: target, astronaut: id });
    if (evaluation) params.set("reference", evaluation);
    return `/?${params}`;
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link
          className="brand"
          href={href("resumen")}
          aria-label="Órbita, resumen"
        >
          <span className="brand-mark">
            <Orbit size={29} aria-hidden="true" />
          </span>
          <span>
            Órbita<small>Tu salud, a bordo</small>
          </span>
        </Link>
        <p className="workspace-label">Tu espacio de seguimiento</p>
        <nav aria-label="Principal">
          {navigation.map((item) => (
            <Link
              href={href(item.id)}
              key={item.id}
              aria-current={view === item.id ? "page" : undefined}
            >
              <item.icon size={19} aria-hidden="true" />
              <span>{item.label}</span>
              <ChevronRight
                size={15}
                className="nav-chevron"
                aria-hidden="true"
              />
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div>
            <ShieldCheck size={20} aria-hidden="true" />
            <strong>Datos con contexto</strong>
          </div>
          <p>Mediciones y actividad para dar continuidad a tu seguimiento.</p>
          <span className="sidebar-demo">Prototipo con datos simulados</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <Orbit size={17} aria-hidden="true" />
            <span>
              Mi misión <span aria-hidden="true">/</span>{" "}
              <strong>{viewNames[view]}</strong>
            </span>
          </div>
          <div className="header-actions">
            <span className="demo-status">
              <span className="status-dot" />
              Demostración
            </span>
            <ThemeControl />
          </div>
        </header>
        <div className="crew-toolbar">
          <span className="crew-avatar" aria-hidden="true">
            {astronaut.callsign.slice(0, 1)}
          </span>
          <label htmlFor="astronaut-selector">
            Tripulante
            <select
              id="astronaut-selector"
              value={astronaut.id}
              onChange={(event) => router.push(href(view, event.target.value))}
            >
              {astronauts.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.callsign} · {person.role}
                </option>
              ))}
            </select>
          </label>
          <span className="mission-label">{astronaut.mission}</span>
        </div>
        <main className="dashboard-main">
          <div className="demo-banner">
            <Info size={17} aria-hidden="true" />
            <p>
              Datos y actividades ficticios. Prototipo pendiente de validación
              médica.
            </p>
            <span className="badge">Modo demo</span>
          </div>
          {memoryOnly ? (
            <p className="storage-notice" role="status">
              El navegador bloqueó el guardado. Tus cambios se conservan durante
              esta visita; descargá el resumen antes de salir.
            </p>
          ) : null}
          {view === "resumen" ? (
            <SummaryView
              astronaut={astronaut}
              mission={mission}
              journal={journal}
              href={href}
            />
          ) : view === "evolucion" ? (
            <EvolutionView
              astronaut={astronaut}
              mission={mission}
              measurements={measurements}
              reference={reference}
              onReference={(id) =>
                router.push(href(view, astronaut.id, id), { scroll: false })
              }
            />
          ) : view === "ejercicio" ? (
            <ExerciseView mission={mission} journal={journal} update={update} />
          ) : (
            <FollowupView
              astronaut={astronaut}
              mission={mission}
              journal={journal}
              update={update}
            />
          )}
        </main>
        <footer className="app-footer">
          <span>Órbita · NASA Space Apps 2026</span>
          <span>
            Observación, actividad y seguimiento{" "}
            <ArrowUpRight size={14} aria-hidden="true" />
          </span>
        </footer>
      </div>
    </div>
  );
}
