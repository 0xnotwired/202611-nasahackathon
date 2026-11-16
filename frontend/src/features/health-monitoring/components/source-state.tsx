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
    "Invalid data source",
    "The selection must be local simulation or backend, with no duplicated parameters.",
  ],
  not_configured: [
    "Backend not configured",
    "No valid backend target is configured for this application yet. You can continue with the local simulation.",
  ],
  unavailable: [
    "Backend not available",
    "The read could not be completed. You can retry or go back to the local simulation.",
  ],
  timeout: [
    "The backend did not respond in time",
    "The read exceeded the time limit. Its data was not replaced by a simulation.",
  ],
  invalid_response: [
    "Incompatible data format",
    "The response does not allow the expected context to be verified. No values from that response are shown.",
  ],
  subject_not_found: [
    "Person not available in this source",
    "Select a person from this source's catalog. Identifiers do not carry over between sources.",
  ],
  empty: [
    "No crew available",
    "This source's catalog is empty. No fictional people were added to fill it.",
  ],
  research_pending: [
    "Research read not integrated",
    "The current API does not offer a reader for research tests. The real source requires restoration, verification and an agreed contract.",
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
    document.getElementById("content")?.focus();
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
                ? "Synthetic data · no records"
                : "Data not available"
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
          <h1 id="content" tabIndex={-1}>
            {title}
          </h1>
          <p>{description}</p>
          {mode === "api" && code === "empty" ? (
            <p>
              The contract declares synthetic data; the connection does not imply
              real data.
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
                View this source&apos;s catalog
              </Link>
            ) : null}
            <Link className="button secondary" href={mockHref}>
              Use local simulation
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
