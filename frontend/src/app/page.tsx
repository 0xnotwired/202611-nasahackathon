import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  resolveHistoryContext,
  viewNames,
  type DashboardView,
} from "@/features/health-monitoring/dashboard-state";
import { isScenario } from "@/features/health-monitoring/aerobic";
import {
  getHealthDataReader,
  loadDashboard,
} from "@/features/health-monitoring/data/service";
import { switchSourceHref } from "@/features/health-monitoring/data/source-context";
import { SourceState } from "@/features/health-monitoring/components/source-state";
import { Dashboard } from "@/features/health-monitoring/components/dashboard";

const views = new Set(Object.keys(viewNames));

export async function generateMetadata({
  searchParams,
}: PageProps<"/">): Promise<Metadata> {
  const params = await searchParams;
  const view =
    typeof params.view === "string" && views.has(params.view)
      ? (params.view as DashboardView)
      : "summary";
  return { title: `${viewNames[view]} | Órbita` };
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const source = getHealthDataReader(params.source);
  if (!source.ok)
    return (
      <SourceState
        mode={source.error.mode}
        code={source.error.code}
        params={params}
      />
    );
  const mode = source.reader.mode;
  const requestedId = params.astronaut;
  const view = params.view ?? "summary";
  if (typeof view !== "string" || !views.has(view)) notFound();
  if (requestedId !== undefined && typeof requestedId !== "string") notFound();
  const scenario = isScenario(params.scenario) ? params.scenario : "recovery";
  const loaded = await loadDashboard(
    source.reader,
    requestedId,
    mode === "mock" ? scenario : undefined,
  );
  if (loaded.status === "error")
    return <SourceState mode={mode} code={loaded.error.code} params={params} />;
  if (loaded.status === "empty")
    return <SourceState mode={mode} code="empty" params={params} />;
  const {
    astronauts,
    astronaut: selected,
    measurements,
    mission,
    origin,
  } = loaded;
  const context = resolveHistoryContext(params, mission.evaluations);
  return (
    <Dashboard
      key={`${mode}:${selected.id}`}
      astronauts={astronauts}
      astronaut={selected}
      measurements={measurements}
      mission={mission}
      view={view as DashboardView}
      context={context}
      asOf={new Date().toISOString()}
      scenario={scenario}
      demoControls={mode === "mock"}
      sourceMode={mode}
      origin={origin}
      switchHref={switchSourceHref(
        "/",
        mode === "mock" ? "api" : "mock",
        params,
      )}
    />
  );
}
