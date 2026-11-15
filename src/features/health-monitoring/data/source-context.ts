import { z } from "zod";

export type DataSourceMode = "mock" | "api";
export type SourceContext =
  | { mode: "mock" }
  | { mode: "api"; apiBaseUrl: string };
export type SourceFailureCode =
  | "invalid_source"
  | "not_configured"
  | "unavailable"
  | "timeout"
  | "invalid_response"
  | "subject_not_found";
export type SourceFailure = {
  code: SourceFailureCode;
  mode: DataSourceMode | null;
};
export type SourceResolution =
  | { ok: true; context: SourceContext }
  | { ok: false; error: SourceFailure };
export type Query = Record<string, string | string[] | undefined>;

export function resolveDataSource(
  requested: Query[string],
  config: { defaultSource?: string; apiBaseUrl?: string },
): SourceResolution {
  const mode = requested ?? config.defaultSource ?? "mock";
  if (mode !== "mock" && mode !== "api")
    return { ok: false, error: { code: "invalid_source", mode: null } };
  if (mode === "mock") return { ok: true, context: { mode } };
  const parsed = z.url({ protocol: /^https?$/ }).safeParse(config.apiBaseUrl);
  if (!parsed.success)
    return { ok: false, error: { code: "not_configured", mode } };
  const url = new URL(parsed.data);
  if (url.username || url.password || url.search || url.hash)
    return { ok: false, error: { code: "not_configured", mode } };
  return {
    ok: true,
    context: { mode, apiBaseUrl: parsed.data.replace(/\/$/, "") },
  };
}

export function sourceHref(
  path: "/" | "/investigacion",
  mode: DataSourceMode,
  params = new URLSearchParams(),
) {
  const next = new URLSearchParams(params);
  next.set("source", mode);
  if (mode === "api") {
    next.delete("scenario");
    next.delete("example");
  }
  return `${path}?${next}`;
}

export function switchSourceHref(
  path: "/" | "/investigacion",
  target: DataSourceMode,
  query: Query,
) {
  const next = new URLSearchParams();
  if (path === "/") {
    if (
      typeof query.view === "string" &&
      ["resumen", "evolucion", "ejercicio", "seguimiento"].includes(query.view)
    )
      next.set("view", query.view);
    if (
      typeof query.period === "string" &&
      ["0", "3", "6", "12"].includes(query.period)
    )
      next.set("period", query.period);
    if (query.scale === "auto" || query.scale === "history")
      next.set("scale", query.scale);
  }
  return sourceHref(path, target, next);
}

export function journalKey(astronautId: string, mode: DataSourceMode) {
  return mode === "mock"
    ? `orbita-demo-journal-v1:${astronautId}`
    : `orbita-api-demo-0.1-journal-v1:${astronautId}`;
}
export const sourceNames = {
  mock: "Simulación local",
  api: "Backend",
} as const;
