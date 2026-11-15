"use client";

import Link from "next/link";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  sourceHref,
  switchSourceHref,
  type DataSourceMode,
  type SourceFailureCode,
  type Query,
} from "../data/source-context";
import { DataSourceControl } from "./data-source-control";
import { useSourceNavigation } from "./source-navigation";
import { ThemeControl } from "./theme-control";

const messages: Record<
  SourceFailureCode | "empty" | "research_pending",
  [string, string]
> = {
  invalid_source: [
    "Fuente de datos no válida",
    "La selección debe ser simulación local o backend, sin parámetros duplicados.",
  ],
  not_configured: [
    "Backend no configurado",
    "Todavía no hay un destino de backend válido configurado para esta aplicación. Podés continuar con la simulación local.",
  ],
  unavailable: [
    "Backend no disponible",
    "No se pudo completar la lectura. Podés reintentar o volver a la simulación local.",
  ],
  timeout: [
    "El backend no respondió a tiempo",
    "La lectura superó el tiempo de espera. No se reemplazaron sus datos por una simulación.",
  ],
  invalid_response: [
    "Formato de datos no compatible",
    "La respuesta no permite verificar el contexto esperado. No se presentan valores de esa respuesta.",
  ],
  subject_not_found: [
    "Persona no disponible en esta fuente",
    "Seleccioná una persona desde el catálogo de esta fuente. Los identificadores no se trasladan entre fuentes.",
  ],
  empty: [
    "Sin tripulación disponible",
    "El catálogo de esta fuente está vacío. No se añadieron personas ficticias para completarlo.",
  ],
  research_pending: [
    "Lectura de investigación no integrada",
    "La API actual no ofrece un lector de pruebas de investigación. La fuente real requiere restauración, verificación y un contrato acordado.",
  ],
};

export function SourceState({
  mode,
  code,
  params,
  path = "/",
}: {
  mode: DataSourceMode | null;
  code: keyof typeof messages;
  params: Query;
  path?: "/" | "/investigacion";
}) {
  const router = useRouter();
  const source = useSourceNavigation();
  const [retrying, startRetry] = useTransition();
  const pending = source.pending || retrying;
  useEffect(() => {
    document.getElementById("contenido")?.focus();
  }, [code, mode]);
  const [title, description] = messages[code];
  const mockHref = switchSourceHref(path, "mock", params);
  return (
    <div className="mission-app">
      <header className="mission-header">
        <Link href={sourceHref("/", mode ?? "mock")} className="mission-brand">
          Órbita
        </Link>
        <div className="header-controls">
          <DataSourceControl
            mode={mode}
            label={
              code === "empty"
                ? "Datos sintéticos · sin registros"
                : "Datos no disponibles"
            }
            targetHref={switchSourceHref(
              path,
              mode === "mock" ? "api" : "mock",
              params,
            )}
          />
          <ThemeControl />
        </div>
      </header>
      <main className="mission-main" aria-busy={pending} inert={pending}>
        <section className="panel source-state">
          <h1 id="contenido" tabIndex={-1}>
            {title}
          </h1>
          <p>{description}</p>
          {mode === "api" && code === "empty" ? (
            <p>
              El contrato 0.1 declara datos sintéticos; la conexión no implica
              datos reales.
            </p>
          ) : null}
          <div className="page-actions">
            {!(
              [
                "invalid_source",
                "not_configured",
                "empty",
                "research_pending",
                "subject_not_found",
              ] as string[]
            ).includes(code) ? (
              <button
                type="button"
                className="button primary"
                onClick={() => startRetry(() => router.refresh())}
              >
                {retrying ? "Reintentando…" : "Reintentar"}
              </button>
            ) : null}
            {code === "subject_not_found" && mode ? (
              <Link className="button primary" href={sourceHref("/", mode)}>
                Ver catálogo de esta fuente
              </Link>
            ) : null}
            <Link className="button secondary" href={mockHref}>
              Usar simulación local
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
