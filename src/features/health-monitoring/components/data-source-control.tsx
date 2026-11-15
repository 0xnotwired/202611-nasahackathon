"use client";

import { ArrowLeftRight } from "lucide-react";
import { sourceNames, type DataSourceMode } from "../data/source-context";
import { useSourceNavigation } from "./source-navigation";

export function DataSourceControl({
  mode,
  label,
  targetHref,
}: {
  mode: DataSourceMode | null;
  label: string;
  targetHref: string;
}) {
  const { pending, navigate } = useSourceNavigation();
  const target = mode === "mock" ? "backend" : "simulación local";
  const url = new URL(targetHref, "http://internal");
  return (
    <form
      className="source-form"
      action={url.pathname}
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        if (!pending) navigate(targetHref);
      }}
    >
      {[...url.searchParams].map(([name, value]) => (
        <input type="hidden" name={name} value={value} key={name} />
      ))}
      <button
        type="submit"
        className="data-source-button"
        disabled={pending}
        aria-busy={pending}
      >
        <ArrowLeftRight size={16} aria-hidden="true" />
        <span>
          <strong>{label}</strong>
          <small>Fuente: {mode ? sourceNames[mode] : "Sin determinar"}</small>
        </span>
        <span className="sr-only">Cambiar a {target}</span>
      </button>
      {pending ? (
        <span className="source-progress" aria-hidden="true">
          Cambiando fuente…
        </span>
      ) : null}
    </form>
  );
}
